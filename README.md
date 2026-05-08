# 蔡司三坐标测量机网站

一个现代化的蔡司三坐标测量机电商网站，具有产品展示、用户管理、订单处理和文件上传等功能。

## 项目特性

✨ **核心功能：**
- 🏭 产品展示和详情查看
- 👤 用户注册和登录
- 🛒 购物车和在线下单
- 📁 文件上传和下载（技术文档、测量数据）
- 📊 数据分析和统计
- 📞 在线客服和留言

## 项目结构

```
CMM_Website/
├── backend/
│   └── main.py                  # FastAPI 应用主文件
├── frontend/
│   ├── templates/
│   │   └── index.html          # 主页 HTML
│   └── static/
│       ├── css/
│       │   └── style.css       # 样式表
│       └── js/
│           └── main.js         # JavaScript 交互
├── uploads/                     # 文件上传目录
├── requirements.txt             # Python 依赖
└── README.md                    # 项目文档
```

## 技术栈

- **后端：** FastAPI + Python 3.8+
- **前端：** HTML5 + CSS3 + JavaScript (Vanilla)
- **数据存储：** 内存存储（可扩展为数据库）
- **服务器：** Uvicorn

## 安装和运行

### 环境要求
- Python 3.8 或更高版本
- pip 包管理器

### 安装步骤

1. **克隆或下载项目**
```bash
cd CMM_Website
```

2. **创建虚拟环境（可选但推荐）**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **运行 FastAPI 服务器**
```bash
python backend/main.py
```

或使用以下命令：
```bash
uvicorn backend.main:app --reload
```

5. **访问网站**
打开浏览器，访问: `http://localhost:8000`

## API 端点

### 产品管理
- `GET /api/products` - 获取所有产品
- `GET /api/products/{product_id}` - 获取产品详情

### 用户管理
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/{user_id}` - 获取用户信息

### 订单管理
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取所有订单
- `GET /api/orders/{order_id}` - 获取订单详情

### 文件管理
- `POST /api/upload` - 上传文件
- `GET /api/download/{filename}` - 下载文件

### 数据分析
- `GET /api/analytics` - 获取数据统计

### 其他
- `GET /api/health` - 健康检查

## 功能说明

### 产品展示
首页展示蔡司三坐标测量机的产品列表，用户可以点击"查看详情"了解产品规格和价格。

### 用户管理
- **注册：** 新用户可以输入用户名、邮箱、公司名称和电话进行注册
- **登录：** 已注册用户使用邮箱和密码登录
- **会话保存：** 用户登录信息保存在浏览器本地存储

### 购物车
- 点击"加入购物车"添加产品
- 使用 Ctrl+C 快速打开/关闭购物车
- 支持增删产品和查看购物车总价

### 在线下单
- 登录后可以从购物车结账
- 自动记录订单信息和时间戳

### 文件管理
后端支持文件上传和下载，用户可以上传产品说明书、测量报告等文档。

## 配置文件

### requirements.txt
包含所有 Python 依赖包：
- fastapi: Web 框架
- uvicorn: ASGI 服务器
- pydantic: 数据验证
- python-multipart: 文件上传支持

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+C | 打开/关闭购物车 |

## 扩展建议

1. **数据库集成：** 将内存存储替换为 SQLAlchemy ORM + PostgreSQL
2. **用户认证：** 实现 JWT Token 认证机制
3. **支付集成：** 集成支付宝或微信支付
4. **邮件服务：** 实现订单确认邮件通知
5. **Admin 后台：** 添加管理员后台管理产品和订单
6. **图片上传：** 实现产品图片和用户头像上传
7. **搜索功能：** 实现产品搜索和筛选

## 常见问题

### 问题 1: 访问 http://localhost:8000 显示 404
**解决：** 确保 FastAPI 服务器已启动，运行 `python backend/main.py`

### 问题 2: 静态文件加载失败（CSS 和 JS 失效）
**解决：** 检查文件路径是否正确，确保 `frontend` 目录在正确的位置

### 问题 3: CORS 错误
**解决：** 已在 FastAPI 中配置 CORS，允许所有来源。如需更改，修改 `backend/main.py` 中的 CORS 配置

## 许可证

本项目仅供学习和参考使用。

## 联系方式

- 邮箱: info@zeiss-cmm.com
- 电话: 400-XXX-XXXX

---

**开发时间：** 2024 年
**版本：** 1.0.0
**作者：** AI Assistant
