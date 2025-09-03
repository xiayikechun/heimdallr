# Heimdallr 生产环境快速部署指南

本指南将帮助您快速在生产环境中部署 Heimdallr 通知网关。

## 🚀 快速开始

### 1. 环境要求

确保您的服务器已安装以下软件：

- **Docker** (版本 20.10+)
- **Docker Compose** (版本 2.0+)
- **Git** (用于获取源码)

```bash
# 检查 Docker 和 Docker Compose 版本
docker --version
docker compose version
```

### 2. 获取源码

```bash
# 克隆项目仓库
git clone https://github.com/LeslieLeung/heimdallr.git
cd heimdallr

# 切换到部署目录
cd deploy
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
nano .env  # 或使用其他编辑器
```

**重要配置项：**

```bash
# 必须修改的配置
DOMAIN=your-domain.com                    # 您的域名
SECRET_KEY=your_super_secure_secret_key   # JWT密钥(32位随机字符串)，可以通过openssl rand -hex 32生成

# 数据库配置 (推荐使用 MySQL)
USE_MYSQL=true
MYSQL_PASSWORD=your_secure_password
DATABASE_DSN=mysql+pymysql://heimdallr:your_secure_password@mysql:3306/heimdallr

# 服务器配置
WORKERS=2          # 根据服务器CPU核心数调整
HTTP_PORT=80       # HTTP端口
HTTPS_PORT=443     # HTTPS端口(如果使用SSL)
```

### 4. 启动服务

#### 使用 MySQL 数据库（推荐）

```bash
# 启动所有服务（包括MySQL）
docker compose -f docker-compose.prod.yaml --profile mysql up -d

# 查看服务状态
docker compose -f docker-compose.prod.yaml ps
```

#### 使用 SQLite 数据库（轻量级选择）

如果您不需要 MySQL，可以使用 SQLite：

```bash
# 修改 .env 文件
USE_MYSQL=false
DATABASE_DSN=sqlite:////app/data/heimdallr.db

# 启动服务（不包括MySQL）
docker compose -f docker-compose.prod.yaml up -d
```

### 5. 验证部署

```bash
# 检查所有容器状态
docker compose -f docker-compose.prod.yaml ps

# 查看日志
docker compose -f docker-compose.prod.yaml logs -f

# 测试服务是否正常
curl http://localhost/api/health
```

### 6. 初始化应用

1. **访问应用**: 打开浏览器访问 `http://your-domain.com`

2. **注册管理员账户**: 首次访问时注册的用户将自动成为管理员

3. **创建第一个通知通道**:
   - 登录后点击"通道管理"
   - 选择您需要的通知类型（如 Bark、微信、Telegram 等）
   - 填写相应的配置信息

4. **创建群组**:
   - 点击"群组管理"
   - 创建新群组并添加通知通道
   - 记录群组的 Token，用于发送通知

5. **测试通知**:
   ```bash
   # 使用群组Token发送测试通知
   curl -X POST http://your-domain.com/api/push/GROUP_TOKEN \
     -H "Content-Type: application/json" \
     -d '{
       "title": "测试通知",
       "message": "Heimdallr 部署成功！"
     }'
   ```

## 📁 文件结构

部署完成后，您的目录结构如下：

```
deploy/
├── docker-compose.prod.yaml   # 生产环境配置文件
├── nginx.prod.conf           # Nginx反向代理配置
├── .env                      # 环境变量配置
├── .env.example             # 环境变量模板
├── QUICK_START.md           # 本指南
└── data/                    # 数据持久化目录
    ├── mysql/              # MySQL数据文件
    ├── sqlite/             # SQLite数据文件
    └── ssl/               # SSL证书（可选）
```

## 🔧 常用管理命令

```bash
# 查看服务状态
docker compose -f docker-compose.prod.yaml ps

# 查看实时日志
docker compose -f docker-compose.prod.yaml logs -f [service_name]

# 重启服务
docker compose -f docker-compose.prod.yaml restart

# 停止服务
docker compose -f docker-compose.prod.yaml down

# 更新应用
git pull
docker compose -f docker-compose.prod.yaml up -d --build

# 备份数据库
docker exec heimdallr-mysql-prod mysqldump -u root -p heimdallr > backup_$(date +%Y%m%d).sql
```

## 🔒 HTTPS 配置

如需启用 HTTPS，请参考以下步骤：

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt update
sudo apt install certbot

# 获取证书（需要停止现有服务）
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./data/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./data/ssl/key.pem
sudo chmod 644 ./data/ssl/*.pem
```

### 启用 HTTPS 配置

1. 编辑 `nginx.prod.conf`，取消注释 HTTPS 相关配置
2. 修改域名配置
3. 重启服务：
   ```bash
   docker compose -f docker-compose.prod.yaml restart nginx
   ```

## 🛠️ 故障排除

### 常见问题

**1. 容器无法启动**
```bash
# 检查日志
docker compose -f docker-compose.prod.yaml logs [service_name]

# 检查端口占用
sudo netstat -tlnp | grep :80
```

**2. 数据库连接失败**
```bash
# 检查MySQL容器状态
docker compose -f docker-compose.prod.yaml logs mysql

# 测试数据库连接
docker exec heimdallr-mysql-prod mysql -u heimdallr -p -e "SELECT 1"
```

**3. 前端无法访问后端API**
```bash
# 检查Nginx配置
docker compose -f docker-compose.prod.yaml exec nginx nginx -t

# 检查后端服务
curl http://localhost/api/health
```

**4. 权限问题**
```bash
# 检查数据目录权限
ls -la data/

# 修复权限
sudo chown -R 999:999 data/mysql/
sudo chown -R $USER:$USER data/sqlite/
```

### 日志查看

```bash
# 查看所有服务日志
docker compose -f docker-compose.prod.yaml logs -f

# 查看特定服务日志
docker compose -f docker-compose.prod.yaml logs -f nginx
docker compose -f docker-compose.prod.yaml logs -f backend
docker compose -f docker-compose.prod.yaml logs -f mysql
```

### 性能优化

**调整 worker 数量:**
```bash
# 根据CPU核心数调整 .env 中的 WORKERS 参数
# 推荐：1-2个worker每CPU核心
WORKERS=4  # 例如，4核CPU
```

**数据库优化:**
```bash
# MySQL配置优化（可选）
# 在 docker-compose.prod.yaml 中添加MySQL配置文件挂载
```

## 📞 技术支持

- **项目主页**: https://github.com/LeslieLeung/heimdallr
- **问题反馈**: https://github.com/LeslieLeung/heimdallr/issues
- **文档中心**: 查看项目 `docs/` 目录

## 🎉 完成！

恭喜！您已成功部署 Heimdallr 通知网关。现在可以开始配置您的通知通道并享受统一的消息推送服务。
