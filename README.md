# VIZORA AI 创作平台

本仓库现在包含三部分：

- 根目录：React + Vite 用户 Web 端
- `vizora-admin`：若依 Vue 3 + Element Plus 运营后台
- `vizora-server`：若依 3.9.2 / Spring Boot 4 / Java 17 服务端

## 已实现的业务能力

- 七牛云 Kodo Web 直传凭证、回调验签和私有下载签名
- 灵感模板管理及用户端公开查询
- 图片、视频、AI 探店创作任务
- 创建任务时原子扣减算力，取消任务自动退还
- 用户作品查询、删除与后台审核
- 算力账户及流水
- 用户通知、单条已读与全部已读
- 若依后台动态菜单和按钮级权限

## 本地启动

### Docker Compose（推荐）

1. 复制环境变量示例并填写七牛配置：

```bash
cp .env.backend.example .env
```

2. 启动 MySQL、Redis、后端和管理端：

```bash
docker compose up --build
```

3. 访问：

- 运营后台：`http://localhost:8081`
- 后端接口：`http://localhost:8080`
- Swagger：`http://localhost:8080/swagger-ui.html`

若依初始管理员账号为 `admin / admin123`，上线前必须修改密码。

### 分别启动

后端需要 JDK 17、Maven、MySQL 8 和 Redis：

```bash
cd vizora-server
mvn clean package -DskipTests
java -jar ruoyi-admin/target/ruoyi-admin.jar
```

管理端：

```bash
cd vizora-admin
pnpm install
pnpm dev
```

用户 Web 端：

```bash
pnpm install
pnpm dev
```

将 `.env.web.example` 复制为 `.env.local` 可连接后端。真实密钥文件均被 `.gitignore` 排除。

## 数据库

手动部署时按顺序执行：

1. `vizora-server/sql/ry_20261117.sql`
2. `vizora-server/sql/quartz.sql`
3. `vizora-server/sql/vizora.sql`

## 七牛云配置

需要创建公共和私有两个空间，并设置：

- `QINIU_ACCESS_KEY`
- `QINIU_SECRET_KEY`
- `QINIU_BUCKET_PRIVATE`
- `QINIU_BUCKET_PUBLIC`
- `QINIU_PRIVATE_DOMAIN`
- `QINIU_PUBLIC_DOMAIN`
- `QINIU_CALLBACK_URL`

AccessKey 和 SecretKey 只允许通过服务器环境变量注入，不可写入前端或提交到 Git。

## 用户端接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/templates` | 公开模板列表 |
| POST | `/api/files/upload-token` | 获取七牛上传凭证 |
| POST | `/api/files/qiniu/callback` | 七牛回调 |
| GET | `/api/files/{id}` | 获取限时访问地址 |
| GET | `/api/works` | 当前用户作品 |
| POST | `/api/creation/tasks` | 创建 AI 任务并扣算力 |
| GET | `/api/creation/tasks/{id}` | 查询任务进度 |
| POST | `/api/creation/tasks/{id}/cancel` | 取消任务并退款 |
| GET | `/api/credits/account` | 算力账户 |
| GET | `/api/credits/records` | 算力流水 |
| GET | `/api/notifications` | 通知列表 |
| POST | `/api/notifications/read-all` | 全部已读 |

前端调用封装位于 `src/api/vizora.ts`。
