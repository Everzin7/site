from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import os
from datetime import datetime, timezone
import json
import csv
import io
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Inicializar FastAPI
app = FastAPI(title="WhatsApp Bot Builder API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar MongoDB
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client.whatsapp_bot_builder

# Modelos Pydantic
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BotButton(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    action: str  # 'show_catalog', 'custom_message', 'redirect'
    response_message: Optional[str] = None
    redirect_url: Optional[str] = None

class BotConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    bot_name: str
    welcome_message: str
    buttons: List[BotButton] = []
    products: List[Product] = []
    business_info: Dict[str, Any] = {}
    ai_enabled: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    bot_id: str
    message: str
    sender: str  # 'user' or 'bot'
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AIResponse(BaseModel):
    message: str
    session_id: str

# Endpoints da API

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "WhatsApp Bot Builder API is running"}

# Bot Configuration Endpoints
@app.post("/api/bots", response_model=BotConfig)
async def create_bot(bot_config: BotConfig):
    bot_dict = bot_config.dict()
    bot_dict['created_at'] = bot_dict['created_at'].isoformat()
    bot_dict['updated_at'] = bot_dict['updated_at'].isoformat()
    
    result = await db.bots.insert_one(bot_dict)
    return bot_config

@app.get("/api/bots/{bot_id}", response_model=BotConfig)
async def get_bot(bot_id: str):
    bot = await db.bots.find_one({"id": bot_id})
    if not bot:
        raise HTTPException(status_code=404, detail="Bot não encontrado")
    
    # Converter strings ISO para datetime
    if isinstance(bot.get('created_at'), str):
        bot['created_at'] = datetime.fromisoformat(bot['created_at'])
    if isinstance(bot.get('updated_at'), str):
        bot['updated_at'] = datetime.fromisoformat(bot['updated_at'])
    
    return BotConfig(**bot)

@app.put("/api/bots/{bot_id}", response_model=BotConfig)
async def update_bot(bot_id: str, bot_config: BotConfig):
    bot_config.updated_at = datetime.now(timezone.utc)
    bot_dict = bot_config.dict()
    bot_dict['created_at'] = bot_dict['created_at'].isoformat()
    bot_dict['updated_at'] = bot_dict['updated_at'].isoformat()
    
    await db.bots.update_one({"id": bot_id}, {"$set": bot_dict})
    return bot_config

@app.get("/api/bots", response_model=List[BotConfig])
async def list_bots(user_id: Optional[str] = None):
    filter_query = {}
    if user_id:
        filter_query["user_id"] = user_id
    
    bots = await db.bots.find(filter_query).to_list(length=None)
    for bot in bots:
        if isinstance(bot.get('created_at'), str):
            bot['created_at'] = datetime.fromisoformat(bot['created_at'])
        if isinstance(bot.get('updated_at'), str):
            bot['updated_at'] = datetime.fromisoformat(bot['updated_at'])
    
    return [BotConfig(**bot) for bot in bots]

# Product Management Endpoints
@app.post("/api/bots/{bot_id}/products", response_model=Product)
async def add_product(bot_id: str, product: Product):
    # Verificar se o bot existe
    bot = await db.bots.find_one({"id": bot_id})
    if not bot:
        raise HTTPException(status_code=404, detail="Bot não encontrado")
    
    product_dict = product.dict()
    product_dict['created_at'] = product_dict['created_at'].isoformat()
    
    # Adicionar produto à lista de produtos do bot
    await db.bots.update_one(
        {"id": bot_id},
        {"$push": {"products": product_dict}}
    )
    
    return product

@app.post("/api/bots/{bot_id}/products/import-csv")
async def import_products_csv(bot_id: str, file: UploadFile = File(...)):
    # Verificar se o bot existe
    bot = await db.bots.find_one({"id": bot_id})
    if not bot:
        raise HTTPException(status_code=404, detail="Bot não encontrado")
    
    # Ler arquivo CSV
    content = await file.read()
    csv_content = content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(csv_content))
    
    products = []
    for row in csv_reader:
        try:
            product = Product(
                name=row.get('name', ''),
                description=row.get('description', ''),
                price=float(row.get('price', 0)),
                image_url=row.get('image_url', ''),
                category=row.get('category', '')
            )
            product_dict = product.dict()
            product_dict['created_at'] = product_dict['created_at'].isoformat()
            products.append(product_dict)
        except Exception as e:
            continue
    
    # Adicionar produtos ao bot
    await db.bots.update_one(
        {"id": bot_id},
        {"$push": {"products": {"$each": products}}}
    )
    
    return {"message": f"{len(products)} produtos importados com sucesso"}

# Chat Simulation Endpoints
@app.post("/api/chat/simulate")
async def simulate_chat(message_data: dict):
    bot_id = message_data.get("bot_id")
    session_id = message_data.get("session_id", str(uuid.uuid4()))
    user_message = message_data.get("message")
    
    # Buscar configuração do bot
    bot = await db.bots.find_one({"id": bot_id})
    if not bot:
        raise HTTPException(status_code=404, detail="Bot não encontrado")
    
    # Salvar mensagem do usuário
    user_chat_message = ChatMessage(
        session_id=session_id,
        bot_id=bot_id,
        message=user_message,
        sender="user"
    )
    
    user_message_dict = user_chat_message.dict()
    user_message_dict['timestamp'] = user_message_dict['timestamp'].isoformat()
    await db.chat_messages.insert_one(user_message_dict)
    
    # Processar resposta do bot
    bot_response = await process_bot_response(bot, user_message, session_id)
    
    # Salvar resposta do bot
    bot_chat_message = ChatMessage(
        session_id=session_id,
        bot_id=bot_id,
        message=bot_response,
        sender="bot"
    )
    
    bot_message_dict = bot_chat_message.dict()
    bot_message_dict['timestamp'] = bot_message_dict['timestamp'].isoformat()
    await db.chat_messages.insert_one(bot_message_dict)
    
    return {
        "session_id": session_id,
        "bot_response": bot_response,
        "user_message": user_message
    }

async def process_bot_response(bot_config, user_message, session_id):
    # Se é a primeira mensagem, retornar mensagem de boas-vindas
    chat_history = await db.chat_messages.find({"session_id": session_id}).to_list(length=None)
    
    if len(chat_history) <= 1:  # Primeira mensagem
        response = bot_config.get('welcome_message', 'Olá! Como posso ajudar você?')
        
        # Adicionar botões se existirem
        buttons = bot_config.get('buttons', [])
        if buttons:
            response += "\n\nEscolha uma opção:"
            for i, button in enumerate(buttons, 1):
                response += f"\n{i}. {button['text']}"
        
        return response
    
    # Verificar se a mensagem corresponde a um botão
    buttons = bot_config.get('buttons', [])
    for i, button in enumerate(buttons, 1):
        if user_message.strip() == str(i) or user_message.lower().strip() == button['text'].lower().strip():
            if button['action'] == 'show_catalog':
                return generate_catalog_response(bot_config.get('products', []))
            elif button['action'] == 'custom_message':
                return button.get('response_message', 'Obrigado pelo contato!')
            elif button['action'] == 'redirect':
                return f"Acesse: {button.get('redirect_url', '#')}"
    
    # Se IA estiver habilitada, usar Gemini para resposta inteligente
    if bot_config.get('ai_enabled', True):
        return await generate_ai_response(user_message, bot_config, session_id)
    
    # Resposta padrão
    return "Desculpe, não entendi. Digite um número das opções ou tente novamente."

def generate_catalog_response(products):
    if not products:
        return "Desculpe, não temos produtos disponíveis no momento."
    
    response = "🛍️ **Nosso Catálogo:**\n\n"
    for product in products[:10]:  # Limitar a 10 produtos
        response += f"📦 **{product['name']}**\n"
        response += f"💰 R$ {product['price']:.2f}\n"
        response += f"📝 {product['description']}\n\n"
    
    if len(products) > 10:
        response += f"... e mais {len(products) - 10} produtos!"
    
    return response

async def generate_ai_response(user_message, bot_config, session_id):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Configurar sistema de mensagem baseado no bot
        business_name = bot_config.get('business_info', {}).get('name', 'Nossa empresa')
        system_message = f"""Você é um assistente virtual do {business_name}. 
        Seja prestativo, cordial e profissional. 
        Responda em português do Brasil.
        Se perguntarem sobre produtos, mencione que temos um catálogo disponível.
        Mantenha as respostas concisas e úteis."""
        
        # Inicializar chat com Gemini
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Criar mensagem do usuário
        user_msg = UserMessage(text=user_message)
        
        # Enviar mensagem e obter resposta
        response = await chat.send_message(user_msg)
        
        return response
        
    except Exception as e:
        print(f"Erro na IA: {e}")
        return "Desculpe, estou com dificuldades técnicas. Tente novamente em alguns instantes."

# Endpoint para histórico de chat
@app.get("/api/chat/{session_id}/history", response_model=List[ChatMessage])
async def get_chat_history(session_id: str):
    messages = await db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(length=None)
    
    for message in messages:
        if isinstance(message.get('timestamp'), str):
            message['timestamp'] = datetime.fromisoformat(message['timestamp'])
    
    return [ChatMessage(**message) for message in messages]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)