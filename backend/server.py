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
    password_plain: Optional[str] = None  # Senha em texto plano (apenas para admin)
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
        # Para compatibilidade, vamos buscar também pelo user_id se não achar pelo id
        user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return parse_from_mongo(user)

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
    try:
        # Verificar se admin já existe
        admin_exists = await db.users.find_one({"email": "adm@adm.com"})
        if not admin_exists:
            admin_user = {
                "id": "admin-user-default",
                "name": "Administrador",
                "email": "adm@adm.com",
                "password_hash": hash_password("adm123"),
                "password_plain": "adm123",  # Senha em texto plano para admin ver
                "role": "admin",
                "referral_code": "ADMIN123",
                "referred_by": None,
                "balance": 0.0,
                "total_earnings": 0.0,
                "referral_earnings": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(admin_user)
            print("✅ Usuário admin padrão criado: adm@adm.com / adm123")
        
        # Verificar se mod já existe  
        mod_exists = await db.users.find_one({"email": "mod@mod.com"})
        if not mod_exists:
            mod_user = {
                "id": "mod-user-default",
                "name": "Moderador",
                "email": "mod@mod.com", 
                "password_hash": hash_password("mod123"),
                "password_plain": "mod123",  # Senha em texto plano para admin ver
                "role": "mod",
                "referral_code": "MOD123",
                "referred_by": None,
                "balance": 0.0,
                "total_earnings": 0.0,
                "referral_earnings": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(mod_user)
            print("✅ Usuário mod padrão criado: mod@mod.com / mod123")
    except Exception as e:
        print(f"Erro ao criar usuários padrão: {e}")

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
        password_plain=user_data.password,  # Salvar senha em texto plano para admin ver
        referred_by=referrer["id"] if referrer else None
    )
    
    user_dict = user.dict()
    user_dict = prepare_for_mongo(user_dict)
    
    await db.users.insert_one(user_dict)
    
    # Processar bônus de referência se código foi usado
    if referrer:
        referral_bonus = 0.50  # R$ 0,50 por cada novo usuário referenciado
        
        print(f"🔍 DEBUG: Processando bônus de referência...")
        print(f"🔍 DEBUG: Referenciador encontrado: {referrer['name']} (ID: {referrer['id']})")
        print(f"🔍 DEBUG: Saldo atual do referenciador: {referrer.get('balance', 0)}")
        print(f"🔍 DEBUG: Earnings atuais do referenciador: {referrer.get('referral_earnings', 0)}")
        
        # Atualizar saldo e earnings do referenciador
        update_result = await db.users.update_one(
            {"id": referrer["id"]},
            {
                "$inc": {
                    "balance": referral_bonus,
                    "referral_earnings": referral_bonus
                }
            }
        )
        
        print(f"🔍 DEBUG: Resultado da atualização: {update_result.modified_count} documentos modificados")
        
        # Verificar se foi atualizado
        updated_referrer = await db.users.find_one({"id": referrer["id"]})
        if updated_referrer:
            print(f"🔍 DEBUG: Saldo após atualização: {updated_referrer.get('balance', 0)}")
            print(f"🔍 DEBUG: Earnings após atualização: {updated_referrer.get('referral_earnings', 0)}")
        
        print(f"🎉 Bônus de referência: {referrer['name']} ganhou R$ {referral_bonus:.2f} por indicar {user.name}")
    
    # Retornar dados do usuário (sem senha)
    user_response = user.dict()
    del user_response['password_hash']
    return user_response

@app.post("/api/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    # Verificar se usuário está banido
    if user.get("status") == "banned":
        raise HTTPException(status_code=403, detail="Conta banida. Entre em contato com o suporte.")
    
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
            "role": user.get("role", "user"),  # Default to 'user' if no role
            "balance": user.get("balance", 0),
            "total_earnings": user.get("total_earnings", 0),
            "referral_earnings": user.get("referral_earnings", 0),
            "created_at": user.get("created_at", datetime.now(timezone.utc)).strftime("%Y-%m-%d %H:%M:%S") if isinstance(user.get("created_at"), datetime) else str(user.get("created_at", "N/A"))[:19],
            "status": user.get("status", "active")  # Check if user is banned
        })
    
    return users_formatted

@app.post("/api/admin/users/ban")
async def ban_user(user_management: UserManagement, admin_user_id: str):
    """Banir/Desbanir um usuário (admin e mod)"""
    await require_admin_or_mod(admin_user_id)
    
    # Verificar se usuário existe
    target_user = await db.users.find_one({"id": user_management.user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Não permitir banir outros admins
    if target_user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Não é possível banir administradores")
    
    if user_management.action == "ban":
        # Banir usuário
        await db.users.update_one(
            {"id": user_management.user_id},
            {"$set": {"status": "banned", "banned_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"message": f"Usuário {target_user['name']} foi banido com sucesso"}
    elif user_management.action == "unban":
        # Desbanir usuário
        await db.users.update_one(
            {"id": user_management.user_id},
            {"$set": {"status": "active"}, "$unset": {"banned_at": ""}}
        )
        return {"message": f"Usuário {target_user['name']} foi desbanido com sucesso"}
    else:
        raise HTTPException(status_code=400, detail="Ação inválida")

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

@app.delete("/api/bots/{bot_id}")
async def delete_bot(bot_id: str):
    """Deletar um bot"""
    bot = await db.bots.find_one({"id": bot_id})
    if not bot:
        raise HTTPException(status_code=404, detail="Bot não encontrado")
    
    # Deletar bot e dados relacionados
    await db.bots.delete_one({"id": bot_id})
    await db.orders.delete_many({"bot_id": bot_id})
    await db.chat_messages.delete_many({"bot_id": bot_id})
    
    return {"message": f"Bot {bot.get('bot_name', 'Unnamed')} deletado com sucesso"}

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
        business_name = bot_config.get('business_info', {}).get('name', 'Nossa empresa')
        user_message_lower = user_message.lower().strip()
        products = bot_config.get('products', [])
        
        # Função para buscar produtos por palavras-chave
        def search_products_by_keywords(message_lower, products_list):
            found_products = []
            words = [word for word in message_lower.split() if len(word) > 2]  # Ignorar palavras muito pequenas
            
            for product in products_list:
                product_name_lower = product.get('name', '').lower()
                product_desc_lower = product.get('description', '').lower()
                product_category_lower = product.get('category', '').lower()
                
                # Combinar todos os textos do produto
                product_text = f"{product_name_lower} {product_desc_lower} {product_category_lower}"
                
                # Verifica se alguma palavra da mensagem está no produto
                match_count = 0
                for word in words:
                    if word in product_text:
                        match_count += 1
                
                # Se encontrou pelo menos uma palavra, adicionar o produto
                if match_count > 0 and product not in found_products:
                    found_products.append(product)
            
            return found_products
        
        # Função para formatar lista de produtos encontrados
        def format_products_response(found_products, search_term=""):
            if not found_products:
                if search_term:
                    return f"Não encontrei produtos relacionados a '{search_term}' em nosso catálogo no momento. 😕\n\nMas temos outros produtos incríveis! Digite 'catálogo' para ver tudo que temos disponível."
                else:
                    return "Não temos produtos cadastrados ainda, mas em breve teremos novidades! 🚀"
            
            response = f"🛍️ **Produtos encontrados** ({len(found_products)} {'item' if len(found_products) == 1 else 'itens'}):\n\n"
            
            for i, product in enumerate(found_products[:10], 1):  # Máximo 10 produtos por resposta
                name = product.get('name', 'Produto sem nome')
                price = product.get('price', 0)
                description = product.get('description', 'Sem descrição')
                category = product.get('category', 'Geral')
                
                response += f"**{i}. {name}**\n"
                response += f"💰 R$ {price:.2f}\n"
                response += f"📂 Categoria: {category}\n"
                response += f"📝 {description[:100]}{'...' if len(description) > 100 else ''}\n\n"
            
            if len(found_products) > 10:
                response += f"... e mais {len(found_products) - 10} produtos!\n"
            
            response += "💬 Interessou em algum? Me fale qual produto você quer saber mais!"
            return response
        
        # PRIMEIRA PRIORIDADE: Buscar produtos específicos em qualquer mensagem
        found_products = search_products_by_keywords(user_message_lower, products)
        
        # Se encontrou produtos específicos, verificar se é realmente uma busca de produtos
        if found_products:
            product_keywords = ['qual', 'quais', 'tem', 'disponivel', 'disponível', 'vende', 'produto', 'produtos', 
                              'quero', 'procuro', 'interesse', 'comprar', 'venda', 'preço', 'valor']
            
            # Se tem palavras-chave de busca OU encontrou mais de 2 produtos, mostrar os produtos
            if any(keyword in user_message_lower for keyword in product_keywords) or len(found_products) >= 2:
                return format_products_response(found_products)
        
        # Verificar se é uma pergunta geral sobre produtos disponíveis
        general_product_keywords = ['qual', 'quais', 'tem', 'disponivel', 'disponível', 'vende', 'produto', 'produtos']
        if any(keyword in user_message_lower for keyword in general_product_keywords):
            # Se não encontrou produtos específicos mas tem produtos, mostrar sugestão
            if products and not found_products:
                return f"Temos {len(products)} produtos incríveis disponíveis! 🛍️\n\nMe diga o que você está procurando especificamente (ex: carros, eletrônicos) ou digite 'catálogo' para ver tudo!"
            elif not products:
                return "Ainda não temos produtos cadastrados, mas em breve teremos novidades! 🚀"
        
        # Respostas inteligentes baseadas em palavras-chave
        if any(word in user_message_lower for word in ['oi', 'olá', 'hello', 'hi']):
            product_count = len(products)
            greeting = f"Olá! Sou o assistente virtual do {business_name}. Como posso ajudar você hoje? 😊"
            if product_count > 0:
                greeting += f"\n\n🛍️ Temos {product_count} produtos disponíveis! Me diga o que você está procurando."
            return greeting
        
        elif any(word in user_message_lower for word in ['preço', 'valor', 'quanto custa', 'precos']):
            # Buscar produtos mencionados na mensagem para mostrar preços específicos
            found_products = search_products_by_keywords(user_message_lower, products)
            
            if found_products:
                response = f"💰 **Preços dos produtos encontrados:**\n\n"
                for product in found_products[:5]:  # Máximo 5 produtos
                    name = product.get('name', 'Produto')
                    price = product.get('price', 0)
                    response += f"• **{name}**: R$ {price:.2f}\n"
                response += f"\n💬 Interessou em algum? Me fale qual você quer saber mais detalhes!"
                return response
            elif products:
                # Mostrar faixa de preços geral
                prices = [p.get('price', 0) for p in products if p.get('price', 0) > 0]
                if prices:
                    min_price = min(prices)
                    max_price = max(prices)
                    return f"💰 Nossos produtos variam de R$ {min_price:.2f} a R$ {max_price:.2f}!\n\nTemos {len(products)} produtos disponíveis. Me diga o que você está procurando para te mostrar os preços específicos! 🛍️"
                else:
                    return "Temos ótimos produtos com preços competitivos! Me diga o que você está procurando para te dar os valores exatos."
            else:
                return "Para informações sobre preços, entre em contato conosco! Estamos sempre prontos para fazer o melhor orçamento."
        
        elif any(word in user_message_lower for word in ['produto', 'catálogo', 'loja', 'vender', 'catalogo']):
            # Primeiro tentar buscar produtos específicos
            if found_products:
                return format_products_response(found_products)
            # Se não achou específicos, mostrar catálogo completo  
            elif products:
                return format_products_response(products)
            else:
                return "Ainda não temos produtos cadastrados, mas em breve teremos um catálogo incrível! 🚀\n\nFique ligado nas nossas novidades!"
        
        elif any(word in user_message_lower for word in ['horário', 'funcionamento', 'horario']):
            return f"O {business_name} funciona 24h através deste chat automático! Para atendimento personalizado, nosso horário é de segunda a sexta, das 8h às 18h."
        
        elif any(word in user_message_lower for word in ['contato', 'telefone', 'whatsapp']):
            return "Você já está no nosso canal de atendimento principal! Para outros contatos, verifique nosso site ou redes sociais."
        
        elif any(word in user_message_lower for word in ['entrega', 'frete', 'envio']):
            return "Fazemos entregas para todo o Brasil! Os prazos e valores variam conforme sua região. Que cidade você está?"
        
        elif any(word in user_message_lower for word in ['pagamento', 'pagar', 'cartão', 'pix']):
            return "Aceitamos diversas formas de pagamento: PIX, cartão de crédito, débito e transferência bancária. Qual você prefere?"
        
        elif any(word in user_message_lower for word in ['obrigado', 'obrigada', 'valeu', 'thanks']):
            return f"Por nada! Foi um prazer ajudar. Se precisar de mais alguma coisa, estarei aqui! 😊 - {business_name}"
        
        elif any(word in user_message_lower for word in ['tchau', 'bye', 'até', 'falou']):
            return f"Até logo! Volte sempre que precisar. Obrigado por escolher o {business_name}! 👋"
        
        elif any(word in user_message_lower for word in ['categoria', 'tipo', 'tipos', 'categorias']):
            if products:
                # Extrair categorias únicas
                categories = list(set([p.get('category', 'Geral') for p in products if p.get('category')]))
                if categories:
                    response = f"📂 **Nossas categorias disponíveis:**\n\n"
                    for i, category in enumerate(categories, 1):
                        # Contar produtos por categoria
                        count = len([p for p in products if p.get('category') == category])
                        response += f"{i}. **{category}** ({count} {'produto' if count == 1 else 'produtos'})\n"
                    response += f"\n💬 Me diga qual categoria te interessa para ver os produtos!"
                    return response
                else:
                    return f"Temos {len(products)} produtos organizados em diferentes tipos! Me diga o que você está procurando."
            else:
                return "Ainda não temos categorias de produtos definidas, mas em breve teremos!"
        
        elif any(word in user_message_lower for word in ['quantidade', 'quantos', 'quantas', 'estoque']):
            if products:
                total_products = len(products)
                categories = len(set([p.get('category', 'Geral') for p in products if p.get('category')]))
                response = f"📊 **Nosso estoque atual:**\n\n"
                response += f"🛍️ Total de produtos: {total_products}\n"
                response += f"📂 Categorias: {categories}\n\n"
                
                # Mostrar top 3 produtos por preço
                sorted_products = sorted(products, key=lambda x: x.get('price', 0), reverse=True)[:3]
                if sorted_products:
                    response += f"⭐ **Destaques:**\n"
                    for product in sorted_products:
                        name = product.get('name', 'Produto')
                        price = product.get('price', 0)
                        response += f"• {name} - R$ {price:.2f}\n"
                
                response += f"\n💬 Me diga o que você está procurando!"
                return response
            else:
                return "Ainda não temos produtos em estoque, mas em breve teremos muitas opções! 🚀"
        
        elif '?' in user_message:
            # Tentar buscar produtos relacionados à pergunta
            found_products = search_products_by_keywords(user_message_lower, products)
            if found_products:
                return f"Sobre sua pergunta, encontrei estes produtos que podem ajudar:\n\n" + format_products_response(found_products)
            else:
                return f"Ótima pergunta! No {business_name} estamos sempre prontos para esclarecer suas dúvidas. Pode me dar mais detalhes sobre o que você gostaria de saber?"
        
        else:
            # Tentar buscar produtos relacionados à mensagem genérica
            found_products = search_products_by_keywords(user_message_lower, products)
            if found_products:
                return f"Interessante! Encontrei alguns produtos que podem te interessar:\n\n" + format_products_response(found_products)
            
            # Resposta genérica inteligente
            responses = [
                f"Entendi! No {business_name} queremos sempre oferecer o melhor atendimento. Como posso ajudar você com isso?",
                "Interessante! Me conte mais detalhes para eu poder ajudar você da melhor forma.",
                f"Obrigado por entrar em contato com o {business_name}! Pode explicar melhor o que você precisa?",
                "Perfeito! Estou aqui para ajudar. Que tipo de informação você está procurando?",
            ]
            
            if products:
                responses.append(f"Ótimo! No {business_name} temos {len(products)} produtos disponíveis. Me diga o que você está procurando!")
                responses.append("Que interessante! Temos vários produtos que podem te ajudar. Me fale mais sobre o que você precisa.")
            
            import random
            return random.choice(responses)
        
    except Exception as e:
        print(f"Erro na IA: {e}")
        business_name = bot_config.get('business_info', {}).get('name', 'Nossa empresa')
        return f"Desculpe, tive um pequeno problema técnico. Mas estou aqui para ajudar você! Como posso ser útil hoje no {business_name}?"

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

@app.get("/api/referrals/{user_id}")
async def get_user_referrals(user_id: str):
    """Buscar usuários que usaram o código de referência de um usuário específico"""
    # Buscar usuário principal
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Buscar usuários que foram referenciados por este usuário
    referred_users = await db.users.find({"referred_by": user_id}).to_list(length=None)
    
    referrals = []
    total_earnings = 0.0
    
    for referred_user in referred_users:
        referred_user = parse_from_mongo(referred_user)
        
        # Calcular data de registro formatada
        created_date = "N/A"
        if referred_user.get("created_at"):
            if isinstance(referred_user["created_at"], datetime):
                created_date = referred_user["created_at"].strftime("%d/%m/%Y")
            else:
                try:
                    date_obj = datetime.fromisoformat(str(referred_user["created_at"]).replace('Z', '+00:00'))
                    created_date = date_obj.strftime("%d/%m/%Y")
                except:
                    created_date = str(referred_user["created_at"])[:10]
        
        referrals.append({
            "id": referred_user["id"],
            "name": referred_user["name"],
            "email": referred_user["email"],
            "created_at": created_date,
            "status": referred_user.get("status", "active"),
            "earnings": 0.50  # R$ 0,50 por cada referência
        })
        
        total_earnings += 0.50
    
    return {
        "referral_code": user.get("referral_code", "N/A"),
        "total_referrals": len(referrals),
        "total_earnings": total_earnings,
        "referrals": referrals,
        "user_referral_earnings": user.get("referral_earnings", 0.0)
    }

@app.get("/api/user/{user_id}/status")
async def check_user_status(user_id: str):
    """Verificar status atual do usuário"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {
        "id": user["id"],
        "status": user.get("status", "active"),
        "role": user.get("role", "user")
    }

@app.post("/api/debug/test-referral-bonus")
async def test_referral_bonus(test_data: dict):
    """Endpoint de teste para verificar sistema de referência"""
    user_id = test_data.get("user_id")
    bonus = test_data.get("bonus", 0.50)
    
    # Buscar usuário
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    print(f"🔍 DEBUG TEST: Usuário antes: {user['name']}")
    print(f"🔍 DEBUG TEST: Saldo antes: {user.get('balance', 0)}")
    print(f"🔍 DEBUG TEST: Referral earnings antes: {user.get('referral_earnings', 0)}")
    
    # Atualizar
    result = await db.users.update_one(
        {"id": user_id},
        {
            "$inc": {
                "balance": bonus,
                "referral_earnings": bonus
            }
        }
    )
    
    # Verificar após
    updated_user = await db.users.find_one({"id": user_id})
    print(f"🔍 DEBUG TEST: Saldo depois: {updated_user.get('balance', 0)}")
    print(f"🔍 DEBUG TEST: Referral earnings depois: {updated_user.get('referral_earnings', 0)}")
    
    return {
        "message": f"Bônus de teste aplicado: R$ {bonus:.2f}",
        "user": updated_user['name'],
        "old_balance": user.get('balance', 0),
        "new_balance": updated_user.get('balance', 0),
        "modified_count": result.modified_count
    }

@app.get("/api/user/{user_id}/profile")
async def get_user_profile(user_id: str):
    """Buscar dados completos do usuário incluindo saldo"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "balance": user.get("balance", 0.0),
        "referral_earnings": user.get("referral_earnings", 0.0),
        "referral_code": user.get("referral_code", ""),
        "status": user.get("status", "active"),
        "role": user.get("role", "user"),
        "created_at": user.get("created_at", datetime.now(timezone.utc)).strftime("%Y-%m-%d %H:%M:%S") if isinstance(user.get("created_at"), datetime) else str(user.get("created_at", "N/A"))[:19]
    }

@app.post("/api/admin/reset-balances")
async def reset_all_balances(admin_user_id: str):
    """Zerar saldo de todos os usuários (apenas admin)"""
    await require_admin(admin_user_id)
    
    try:
        # Atualizar todos os usuários para saldo zero
        result = await db.users.update_many(
            {},  # Filtro vazio = todos os usuários
            {
                "$set": {
                    "balance": 0.0,
                    "total_earnings": 0.0,
                    "referral_earnings": 0.0
                }
            }
        )
        
        return {
            "message": f"Saldos zerados com sucesso. {result.modified_count} usuários afetados.",
            "modified_count": result.modified_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao zerar saldos: {str(e)}")

@app.post("/api/admin/users/create")
async def create_user(user_data: UserRegister, admin_user_id: str):
    """Criar novo usuário (apenas admin)"""
    await require_admin(admin_user_id)
    
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
        password_plain=user_data.password,  # Salvar senha em texto plano para admin ver
        referred_by=referrer["id"] if referrer else None
    )
    
    user_dict = user.dict()
    user_dict = prepare_for_mongo(user_dict)
    
    await db.users.insert_one(user_dict)
    
    # Retornar dados do usuário (sem senha)
    user_response = user.dict()
    del user_response['password_hash']
    return user_response

@app.put("/api/admin/users/{user_id}/balance")
async def update_user_balance(user_id: str, balance_data: dict, admin_user_id: str):
    """Atualizar saldo do usuário (apenas admin)"""
    await require_admin(admin_user_id)
    
    print(f"🔧 DEBUG: Tentando atualizar saldo do usuário {user_id} para {balance_data}")
    
    # Verificar se usuário existe
    target_user = await db.users.find_one({"id": user_id})
    if not target_user:
        print(f"❌ DEBUG: Usuário {user_id} não encontrado")
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    print(f"✅ DEBUG: Usuário encontrado: {target_user['name']}, saldo atual: {target_user.get('balance', 0)}")
    
    new_balance = float(balance_data.get("balance", 0))
    if new_balance < 0:
        raise HTTPException(status_code=400, detail="Saldo não pode ser negativo")
    
    print(f"🔧 DEBUG: Novo saldo será: {new_balance}")
    
    # Atualizar saldo
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"balance": new_balance}}
    )
    
    print(f"🔧 DEBUG: Resultado da atualização: {result.modified_count} documentos modificados")
    
    # Verificar se realmente foi atualizado
    updated_user = await db.users.find_one({"id": user_id})
    print(f"✅ DEBUG: Saldo após atualização: {updated_user.get('balance', 'N/A')}")
    
    return {"message": f"Saldo do usuário {target_user['name']} atualizado para R$ {new_balance:.2f}"}

@app.get("/api/admin/users/with-passwords")
async def list_users_with_passwords(admin_user_id: str):
    """Listar todos os usuários com senhas visíveis (apenas admin)"""
    await require_admin(admin_user_id)
    
    users = await db.users.find({}).to_list(length=None)
    users_formatted = []
    
    for user in users:
        user = parse_from_mongo(user)
        users_formatted.append({
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "password_original": user.get("password_plain", "***não disponível***"),  # Senha em texto plano se disponível
            "role": user.get("role", "user"),
            "balance": user.get("balance", 0),
            "total_earnings": user.get("total_earnings", 0),
            "referral_earnings": user.get("referral_earnings", 0),
            "referral_code": user.get("referral_code", "N/A"),
            "status": user.get("status", "active"),
            "created_at": user.get("created_at", datetime.now(timezone.utc)).strftime("%Y-%m-%d %H:%M:%S") if isinstance(user.get("created_at"), datetime) else str(user.get("created_at", "N/A"))[:19]
        })
    
    return users_formatted

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Porta do Railway ou padrão 8000
    port = int(os.environ.get("PORT", 8000))
    
    # Host para produção
    host = "0.0.0.0" if os.environ.get("RAILWAY_ENVIRONMENT") else "127.0.0.1"
    
    uvicorn.run(app, host=host, port=port)