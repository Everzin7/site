from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import os
from datetime import datetime, timezone, timedelta
import json
import csv
import io
from dotenv import load_dotenv
import hashlib
import secrets
import string
import random

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

# Evento de startup para criar usuários padrão
@app.on_event("startup")
async def startup_event():
    await create_default_users()

# Modelos Pydantic
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    password_hash: str
    referral_code: str = Field(default_factory=lambda: secrets.token_urlsafe(8))
    referred_by: Optional[str] = None
    balance: float = 0.0
    total_earnings: float = 0.0
    referral_earnings: float = 0.0
    role: str = "user"  # user, mod, admin
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    referralCode: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

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
    status: str = "draft"  # draft, pending_payment, active, inactive
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    bot_id: str
    message: str
    sender: str  # 'user' or 'bot'
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    bot_id: str
    amount: float
    status: str = "pending"  # pending, paid, cancelled
    payment_method: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DashboardStats(BaseModel):
    totalBots: int
    activeBots: int
    totalEarnings: float
    referralEarnings: float
    monthlyStats: List[Dict[str, Any]]

class Giftcard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    amount: float
    status: str = "active"  # active, redeemed
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    redeemed_by: Optional[str] = None
    redeemed_at: Optional[datetime] = None

class GiftcardCreate(BaseModel):
    amount: float

class GiftcardRedeem(BaseModel):
    code: str

class AdminStats(BaseModel):
    totalUsers: int
    totalDeposits: Dict[str, float]
    recentUsers: List[Dict[str, Any]]

class UserManagement(BaseModel):
    user_id: str
    action: str  # ban, delete, promote, demote

# Funções auxiliares
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hashlib.sha256(password.encode()).hexdigest() == password_hash

def generate_giftcard_code() -> str:
    """Gera código giftcard de 16 dígitos alfanuméricos maiúsculos (formato XXXX-XXXX-XXXX-XXXX)"""
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(chars, k=16))
    return '-'.join([code[i:i+4] for i in range(0, 16, 4)])

def prepare_for_mongo(data):
    if isinstance(data.get('created_at'), datetime):
        data['created_at'] = data['created_at'].isoformat()
    if isinstance(data.get('updated_at'), datetime):
        data['updated_at'] = data['updated_at'].isoformat()
    if isinstance(data.get('redeemed_at'), datetime):
        data['redeemed_at'] = data['redeemed_at'].isoformat()
    return data

def parse_from_mongo(item):
    # Remove MongoDB's _id field if present
    if '_id' in item:
        del item['_id']
    
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    if isinstance(item.get('updated_at'), str):
        item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    if isinstance(item.get('redeemed_at'), str):
        item['redeemed_at'] = datetime.fromisoformat(item['redeemed_at'])
    if isinstance(item.get('banned_at'), str):
        item['banned_at'] = datetime.fromisoformat(item['banned_at'])
    return item

# Funções de autorização
async def get_current_user(user_id: str) -> Dict:
    """Busca usuário atual por ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

async def require_admin_or_mod(user_id: str) -> Dict:
    """Requer que o usuário seja admin ou mod"""
    user = await get_current_user(user_id)
    if user.get("role") not in ["admin", "mod"]:
        raise HTTPException(status_code=403, detail="Acesso negado: privilégios administrativos necessários")
    return user

async def require_admin(user_id: str) -> Dict:
    """Requer que o usuário seja admin"""
    user = await get_current_user(user_id)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado: apenas administradores")
    return user

# Função para criar usuários padrão
async def create_default_users():
    """Cria usuários admin e mod padrão se não existirem"""
    # Verificar se admin já existe
    admin_exists = await db.users.find_one({"email": "adm@ever.com"})
    if not admin_exists:
        admin_user = User(
            name="Administrador",
            email="adm@ever.com",
            password_hash=hash_password("everto1n"),
            role="admin"
        )
        admin_dict = admin_user.dict()
        admin_dict = prepare_for_mongo(admin_dict)
        await db.users.insert_one(admin_dict)
        print("✅ Usuário admin padrão criado: adm@ever.com / everto1n")
    
    # Verificar se mod já existe  
    mod_exists = await db.users.find_one({"email": "mod@ever.com"})
    if not mod_exists:
        mod_user = User(
            name="Moderador",
            email="mod@ever.com", 
            password_hash=hash_password("mod123"),
            role="mod"
        )
        mod_dict = mod_user.dict()
        mod_dict = prepare_for_mongo(mod_dict)
        await db.users.insert_one(mod_dict)
        print("✅ Usuário mod padrão criado: mod@ever.com / mod123")

# Endpoints de Autenticação
@app.post("/api/auth/register")
async def register_user(user_data: UserRegister):
    # Verificar se email já existe
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Verificar código de referência se fornecido
    referrer = None
    if user_data.referralCode:
        referrer = await db.users.find_one({"referral_code": user_data.referralCode})
        if not referrer:
            raise HTTPException(status_code=400, detail="Código de referência inválido")
    
    # Criar usuário
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        referred_by=referrer["id"] if referrer else None
    )
    
    user_dict = user.dict()
    user_dict = prepare_for_mongo(user_dict)
    
    await db.users.insert_one(user_dict)
    
    # Retornar dados do usuário (sem senha)
    user_response = user.dict()
    del user_response['password_hash']
    return user_response

@app.post("/api/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    # Retornar dados do usuário (sem senha)
    user_response = parse_from_mongo(user)
    del user_response['password_hash']
    return user_response

# Endpoints Administrativos
@app.get("/api/admin/stats")
async def get_admin_stats(admin_user_id: str):
    """Buscar estatísticas administrativas (apenas admins)"""
    await require_admin(admin_user_id)
    
    # Contar total de usuários
    total_users = await db.users.count_documents({})
    
    # Calcular depósitos por período (simulado - pode ser implementado com transações reais)
    # Para demo, usamos valores simulados baseados em estatísticas
    now = datetime.now(timezone.utc)
    
    # Buscar usuários recentes
    recent_users = await db.users.find({}).sort("created_at", -1).limit(10).to_list(length=None)
    recent_users_formatted = []
    
    for user in recent_users:
        user = parse_from_mongo(user)
        recent_users_formatted.append({
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user"),  # Default to 'user' if no role
            "created_at": user.get("created_at", datetime.now(timezone.utc)).strftime("%Y-%m-%d") if isinstance(user.get("created_at"), datetime) else str(user.get("created_at", "N/A"))[:10],
            "status": "active"  # Por enquanto todos são ativos
        })
    
    # Estatísticas simuladas de depósitos (podem ser implementadas com transações reais)
    return AdminStats(
        totalUsers=total_users,
        totalDeposits={
            "last7days": 15430.50,
            "last14days": 28960.80,
            "last28days": 52840.20
        },
        recentUsers=recent_users_formatted
    )

@app.get("/api/admin/users")
async def list_all_users(admin_user_id: str):
    """Listar todos os usuários (apenas admins)"""
    await require_admin(admin_user_id)
    
    users = await db.users.find({}).to_list(length=None)
    users_formatted = []
    
    for user in users:
        user = parse_from_mongo(user)
        users_formatted.append({
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "balance": user.get("balance", 0),
            "total_earnings": user.get("total_earnings", 0),
            "referral_earnings": user.get("referral_earnings", 0),
            "created_at": user["created_at"].strftime("%Y-%m-%d %H:%M:%S"),
            "status": "active"
        })
    
    return users_formatted

@app.post("/api/admin/users/ban")
async def ban_user(user_management: UserManagement, admin_user_id: str):
    """Banir um usuário (admin e mod)"""
    await require_admin_or_mod(admin_user_id)
    
    # Verificar se usuário existe
    target_user = await db.users.find_one({"id": user_management.user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Não permitir banir outros admins
    if target_user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Não é possível banir administradores")
    
    # Atualizar status do usuário (adicione campo banned se necessário)
    await db.users.update_one(
        {"id": user_management.user_id},
        {"$set": {"status": "banned", "banned_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": f"Usuário {target_user['name']} foi banido com sucesso"}

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: str, admin_user_id: str):
    """Deletar um usuário (apenas admins)"""
    await require_admin(admin_user_id)
    
    # Verificar se usuário existe
    target_user = await db.users.find_one({"id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Não permitir deletar outros admins
    if target_user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Não é possível deletar administradores")
    
    # Deletar usuário e seus dados relacionados
    await db.users.delete_one({"id": user_id})
    await db.bots.delete_many({"user_id": user_id})
    await db.orders.delete_many({"user_id": user_id})
    await db.chat_messages.delete_many({"bot_id": {"$in": []}})  # Deletar mensagens dos bots do usuário
    
    return {"message": f"Usuário {target_user['name']} foi deletado com sucesso"}

# Endpoints de Giftcards
@app.post("/api/admin/giftcards", response_model=Giftcard)
async def create_giftcard(giftcard_data: GiftcardCreate, admin_user_id: str):
    """Criar um novo giftcard (apenas admins)"""
    admin_user = await require_admin(admin_user_id)
    
    if giftcard_data.amount < 1:
        raise HTTPException(status_code=400, detail="Valor mínimo para giftcard é R$ 1,00")
    
    # Criar giftcard
    giftcard = Giftcard(
        code=generate_giftcard_code(),
        amount=giftcard_data.amount,
        created_by=admin_user["name"]
    )
    
    giftcard_dict = giftcard.dict()
    giftcard_dict = prepare_for_mongo(giftcard_dict)
    
    await db.giftcards.insert_one(giftcard_dict)
    
    return giftcard

@app.get("/api/admin/giftcards", response_model=List[Giftcard])
async def list_giftcards(admin_user_id: str):
    """Listar todos os giftcards (apenas admins)"""
    await require_admin(admin_user_id)
    
    giftcards = await db.giftcards.find({}).sort("created_at", -1).to_list(length=None)
    
    for giftcard in giftcards:
        giftcard = parse_from_mongo(giftcard)
    
    return [Giftcard(**giftcard) for giftcard in giftcards]

@app.post("/api/giftcards/redeem")
async def redeem_giftcard(redeem_data: GiftcardRedeem, user_id: str):
    """Resgatar um giftcard"""
    user = await get_current_user(user_id)
    
    # Buscar giftcard
    giftcard = await db.giftcards.find_one({
        "code": redeem_data.code.upper(),
        "status": "active"
    })
    
    if not giftcard:
        raise HTTPException(status_code=404, detail="Giftcard inválido ou já utilizado")
    
    # Marcar giftcard como resgatado
    await db.giftcards.update_one(
        {"id": giftcard["id"]},
        {
            "$set": {
                "status": "redeemed",
                "redeemed_by": user["name"],
                "redeemed_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Adicionar saldo ao usuário
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"balance": giftcard["amount"]}}
    )
    
    return {
        "message": f"Giftcard resgatado com sucesso! R$ {giftcard['amount']:.2f} adicionados ao saldo",
        "amount": giftcard["amount"],
        "code": giftcard["code"]
    }

# Endpoints do Dashboard
@app.get("/api/dashboard/{user_id}", response_model=DashboardStats)
async def get_dashboard_stats(user_id: str):
    # Buscar bots do usuário
    user_bots = await db.bots.find({"user_id": user_id}).to_list(length=None)
    
    # Calcular estatísticas
    total_bots = len(user_bots)
    active_bots = len([bot for bot in user_bots if bot.get("status") == "active"])
    
    # Buscar dados do usuário
    user = await db.users.find_one({"id": user_id})
    total_earnings = user.get("total_earnings", 0) if user else 0
    referral_earnings = user.get("referral_earnings", 0) if user else 0
    
    # Gerar estatísticas mensais fictícias para demonstração
    monthly_stats = [
        {"month": "Jan", "value": 65},
        {"month": "Fev", "value": 45},
        {"month": "Mar", "value": 78},
        {"month": "Abr", "value": 52},
        {"month": "Mai", "value": 89},
        {"month": "Jun", "value": 67},
        {"month": "Jul", "value": 95},
    ]
    
    return DashboardStats(
        totalBots=total_bots,
        activeBots=active_bots,
        totalEarnings=total_earnings,
        referralEarnings=referral_earnings,
        monthlyStats=monthly_stats
    )

# Endpoints de Health Check
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "WhatsApp Bot Builder API is running"}

# Bot Configuration Endpoints
@app.post("/api/bots", response_model=BotConfig)
async def create_bot(bot_config: BotConfig):
    bot_dict = bot_config.dict()
    bot_dict = prepare_for_mongo(bot_dict)
    
    result = await db.bots.insert_one(bot_dict)
    return bot_config

@app.get("/api/bots/{bot_id}", response_model=BotConfig)
async def get_bot(bot_id: str):
    bot = await db.bots.find_one({"id": bot_id})
    if not bot:
        raise HTTPException(status_code=404, detail="Bot não encontrado")
    
    bot = parse_from_mongo(bot)
    return BotConfig(**bot)

@app.put("/api/bots/{bot_id}", response_model=BotConfig)
async def update_bot(bot_id: str, bot_config: BotConfig):
    bot_config.updated_at = datetime.now(timezone.utc)
    bot_dict = bot_config.dict()
    bot_dict = prepare_for_mongo(bot_dict)
    
    await db.bots.update_one({"id": bot_id}, {"$set": bot_dict})
    return bot_config

@app.get("/api/bots", response_model=List[BotConfig])
async def list_bots(user_id: Optional[str] = None):
    filter_query = {}
    if user_id:
        filter_query["user_id"] = user_id
    
    bots = await db.bots.find(filter_query).to_list(length=None)
    for bot in bots:
        bot = parse_from_mongo(bot)
    
    return [BotConfig(**bot) for bot in bots]

# Product Management Endpoints
@app.post("/api/bots/{bot_id}/products", response_model=Product)
async def add_product(bot_id: str, product: Product):
    bot = await db.bots.find_one({"id": bot_id})
    if not bot:
        raise HTTPException(status_code=404, detail="Bot não encontrado")
    
    product_dict = product.dict()
    product_dict = prepare_for_mongo(product_dict)
    
    await db.bots.update_one(
        {"id": bot_id},
        {"$push": {"products": product_dict}}
    )
    
    return product

@app.post("/api/bots/{bot_id}/products/import-csv")
async def import_products_csv(bot_id: str, file: UploadFile = File(...)):
    bot = await db.bots.find_one({"id": bot_id})
    if not bot:
        raise HTTPException(status_code=404, detail="Bot não encontrado")
    
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
            product_dict = prepare_for_mongo(product_dict)
            products.append(product_dict)
        except Exception as e:
            continue
    
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
    
    bot = await db.bots.find_one({"id": bot_id})
    if not bot:
        raise HTTPException(status_code=404, detail="Bot não encontrado")
    
    user_chat_message = ChatMessage(
        session_id=session_id,
        bot_id=bot_id,
        message=user_message,
        sender="user"
    )
    
    user_message_dict = user_chat_message.dict()
    user_message_dict = prepare_for_mongo(user_message_dict)
    await db.chat_messages.insert_one(user_message_dict)
    
    bot_response = await process_bot_response(bot, user_message, session_id)
    
    bot_chat_message = ChatMessage(
        session_id=session_id,
        bot_id=bot_id,
        message=bot_response,
        sender="bot"
    )
    
    bot_message_dict = bot_chat_message.dict()
    bot_message_dict = prepare_for_mongo(bot_message_dict)
    await db.chat_messages.insert_one(bot_message_dict)
    
    return {
        "session_id": session_id,
        "bot_response": bot_response,
        "user_message": user_message
    }

async def process_bot_response(bot_config, user_message, session_id):
    chat_history = await db.chat_messages.find({"session_id": session_id}).to_list(length=None)
    
    if len(chat_history) <= 1:
        response = bot_config.get('welcome_message', 'Olá! Como posso ajudar você?')
        
        buttons = bot_config.get('buttons', [])
        if buttons:
            response += "\n\nEscolha uma opção:"
            for i, button in enumerate(buttons, 1):
                response += f"\n{i}. {button['text']}"
        
        return response
    
    buttons = bot_config.get('buttons', [])
    for i, button in enumerate(buttons, 1):
        if user_message.strip() == str(i) or user_message.lower().strip() == button['text'].lower().strip():
            if button['action'] == 'show_catalog':
                return generate_catalog_response(bot_config.get('products', []))
            elif button['action'] == 'custom_message':
                return button.get('response_message', 'Obrigado pelo contato!')
            elif button['action'] == 'redirect':
                return f"Acesse: {button.get('redirect_url', '#')}"
    
    if bot_config.get('ai_enabled', True):
        return await generate_ai_response(user_message, bot_config, session_id)
    
    return "Desculpe, não entendi. Digite um número das opções ou tente novamente."

def generate_catalog_response(products):
    if not products:
        return "Desculpe, não temos produtos disponíveis no momento."
    
    response = "🛍️ **Nosso Catálogo:**\n\n"
    for product in products[:10]:
        response += f"📦 **{product['name']}**\n"
        response += f"💰 R$ {product['price']:.2f}\n"
        response += f"📝 {product['description']}\n\n"
    
    if len(products) > 10:
        response += f"... e mais {len(products) - 10} produtos!"
    
    return response

async def generate_ai_response(user_message, bot_config, session_id):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        business_name = bot_config.get('business_info', {}).get('name', 'Nossa empresa')
        system_message = f"""Você é um assistente virtual do {business_name}. 
        Seja prestativo, cordial e profissional. 
        Responda em português do Brasil.
        Se perguntarem sobre produtos, mencione que temos um catálogo disponível.
        Mantenha as respostas concisas e úteis."""
        
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_msg = UserMessage(text=user_message)
        response = await chat.send_message(user_msg)
        
        return response
        
    except Exception as e:
        print(f"Erro na IA: {e}")
        return "Desculpe, estou com dificuldades técnicas. Tente novamente em alguns instantes."

@app.get("/api/chat/{session_id}/history", response_model=List[ChatMessage])
async def get_chat_history(session_id: str):
    messages = await db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(length=None)
    
    for message in messages:
        message = parse_from_mongo(message)
    
    return [ChatMessage(**message) for message in messages]

# Endpoints de Pagamento e Pedidos
@app.post("/api/orders", response_model=Order)
async def create_order(order: Order):
    order_dict = order.dict()
    order_dict = prepare_for_mongo(order_dict)
    
    await db.orders.insert_one(order_dict)
    return order

@app.get("/api/orders/{user_id}", response_model=List[Order])
async def get_user_orders(user_id: str):
    orders = await db.orders.find({"user_id": user_id}).to_list(length=None)
    for order in orders:
        order = parse_from_mongo(order)
    
    return [Order(**order) for order in orders]

# Endpoint para processar pagamento (placeholder)
@app.post("/api/payment/process")
async def process_payment(payment_data: dict):
    # Aqui você integraria com a API de pagamento escolhida
    order_id = payment_data.get("order_id")
    payment_method = payment_data.get("payment_method")
    
    # Simular processamento bem-sucedido
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": "paid", "payment_method": payment_method}}
    )
    
    # Ativar o bot
    order = await db.orders.find_one({"id": order_id})
    if order:
        await db.bots.update_one(
            {"id": order["bot_id"]},
            {"$set": {"status": "active"}}
        )
    
    return {"status": "success", "message": "Pagamento processado com sucesso"}

# Endpoint para sistema de referência
@app.post("/api/referral/reward")
async def process_referral_reward(referral_data: dict):
    user_id = referral_data.get("user_id")
    amount = referral_data.get("amount")
    
    # Buscar usuário que fez a recarga
    user = await db.users.find_one({"id": user_id})
    if not user or not user.get("referred_by"):
        return {"message": "Usuário não tem referenciador"}
    
    # Se recarga >= R$ 50, dar 10% para quem indicou
    if amount >= 50:
        referral_bonus = amount * 0.10
        
        # Atualizar saldo do referenciador
        await db.users.update_one(
            {"id": user["referred_by"]},
            {
                "$inc": {
                    "balance": referral_bonus,
                    "referral_earnings": referral_bonus
                }
            }
        )
        
        return {"status": "success", "bonus": referral_bonus}
    
    return {"message": "Recarga insuficiente para bônus"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)