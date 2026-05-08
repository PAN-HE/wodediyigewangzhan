from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import shutil
from datetime import datetime
import json

app = FastAPI(title="蔡司三坐标网站", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据存储（演示用，实际应使用数据库）
UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 产品数据模型
class Product(BaseModel):
    id: int
    name: str
    model: str
    description: str
    price: float
    image: str
    specifications: dict

# 用户数据模型
class User(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    company: str
    phone: str

# 订单数据模型
class Order(BaseModel):
    id: Optional[int] = None
    user_email: str
    product_id: int
    quantity: int
    total_price: float
    status: str = "待处理"
    created_at: Optional[str] = None

# 示例产品数据
PRODUCTS = [
    {
        "id": 1,
        "name": "ZEISS O-INSPECT",
        "model": "O-INSPECT",
        "description": "光学三坐标测量机，适用于精密零件检测",
        "price": 450000,
        "image": "/static/images/o-inspect.jpg",
        "specifications": {
            "测量范围": "700×700×500mm",
            "精度等级": "±1.5µm",
            "应用领域": "汽车、航空航天、医疗器械"
        }
    },
    {
        "id": 2,
        "name": "ZEISS ACCURA",
        "model": "ACCURA",
        "description": "手触式三坐标测量机，操作灵活精准",
        "price": 380000,
        "image": "/static/images/accura.jpg",
        "specifications": {
            "测量范围": "750×750×700mm",
            "精度等级": "±2µm",
            "应用领域": "模具、夹具、冲压件"
        }
    }
]

USERS = []
ORDERS = []

# ==================== API 端点 ====================

# 1. 产品管理
@app.get("/api/products", response_model=List[dict])
async def get_products():
    """获取所有产品列表"""
    return PRODUCTS

@app.get("/api/products/{product_id}", response_model=dict)
async def get_product(product_id: int):
    """获取单个产品详情"""
    for product in PRODUCTS:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="产品不存在")

# 2. 用户管理
@app.post("/api/users/register")
async def register_user(user: User):
    """用户注册"""
    # 检查邮箱是否已存在
    for existing_user in USERS:
        if existing_user["email"] == user.email:
            raise HTTPException(status_code=400, detail="邮箱已被注册")
    
    new_user = {
        "id": len(USERS) + 1,
        "username": user.username,
        "email": user.email,
        "company": user.company,
        "phone": user.phone,
        "created_at": datetime.now().isoformat()
    }
    USERS.append(new_user)
    return {"message": "注册成功", "user": new_user}

@app.post("/api/users/login")
async def login_user(email: str, password: str):
    """用户登录"""
    for user in USERS:
        if user["email"] == email:
            return {"message": "登录成功", "user_id": user["id"], "email": user["email"]}
    raise HTTPException(status_code=401, detail="邮箱或密码错误")

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    """获取用户信息"""
    for user in USERS:
        if user["id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="用户不存在")

# 3. 订单管理
@app.post("/api/orders")
async def create_order(order: Order):
    """创建订单"""
    new_order = {
        "id": len(ORDERS) + 1,
        "user_email": order.user_email,
        "product_id": order.product_id,
        "quantity": order.quantity,
        "total_price": order.total_price,
        "status": "待处理",
        "created_at": datetime.now().isoformat()
    }
    ORDERS.append(new_order)
    return {"message": "订单创建成功", "order": new_order}

@app.get("/api/orders")
async def get_orders():
    """获取所有订单"""
    return ORDERS

@app.get("/api/orders/{order_id}")
async def get_order(order_id: int):
    """获取单个订单"""
    for order in ORDERS:
        if order["id"] == order_id:
            return order
    raise HTTPException(status_code=404, detail="订单不存在")

# 4. 文件上传/下载
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传文件（测量数据、图纸等）"""
    try:
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {
            "message": "文件上传成功",
            "filename": file.filename,
            "file_url": f"/api/download/{file.filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """下载文件"""
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="文件不存在")

# 5. 数据分析
@app.get("/api/analytics")
async def get_analytics():
    """获取数据分析统计"""
    return {
        "total_users": len(USERS),
        "total_orders": len(ORDERS),
        "total_sales": sum(order["total_price"] for order in ORDERS),
        "orders_by_status": {
            "待处理": sum(1 for order in ORDERS if order["status"] == "待处理"),
            "处理中": sum(1 for order in ORDERS if order["status"] == "处理中"),
            "已完成": sum(1 for order in ORDERS if order["status"] == "已完成")
        },
        "popular_products": [
            {
                "product_id": product["id"],
                "name": product["name"],
                "orders": sum(1 for order in ORDERS if order["product_id"] == product["id"])
            }
            for product in PRODUCTS
        ]
    }

# 健康检查
@app.get("/api/health")
async def health_check():
    """健康检查端点"""
    return {"status": "API服务正常运行"}

# 静态文件挂载
import os.path
static_path = os.path.join(os.path.dirname(__file__), "../frontend/static")
app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.get("/")
async def root():
    """主页"""
    return FileResponse("../frontend/templates/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
