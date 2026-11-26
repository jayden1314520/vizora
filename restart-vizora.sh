#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT_DIR/vizora-server"
ADMIN_DIR="$ROOT_DIR/vizora-admin"
JAVA_BIN="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21}/bin/java"

echo "[1/4] 启动基础服务"
brew services start mysql >/dev/null 2>&1 || true
brew services start redis >/dev/null 2>&1 || true

echo "[2/4] 停止旧的 VIZORA 服务"
pkill -f "ruoyi-admin/target/ruoyi-admin.jar" 2>/dev/null || true
pkill -f "vite.*vizora-admin" 2>/dev/null || true
sleep 1

echo "[3/4] 构建并启动后端接口"
cd "$SERVER_DIR"
mvn -q -DskipTests package
MYSQL_HOST=127.0.0.1 MYSQL_PORT=3306 MYSQL_DATABASE=vizora MYSQL_USERNAME=vizora_dev REDIS_HOST=127.0.0.1 REDIS_PORT=6379 LOG_PATH="$SERVER_DIR/.local/logs" nohup "$JAVA_BIN" -jar ruoyi-admin/target/ruoyi-admin.jar > "$SERVER_DIR/.local/backend.log" 2>&1 &

echo "[4/4] 启动前端开发服务"
cd "$ADMIN_DIR"
nohup pnpm dev --host 127.0.0.1 > "$ADMIN_DIR/.local-frontend.log" 2>&1 &
echo "VIZORA 已重启：前端 http://127.0.0.1:3000，后端 http://127.0.0.1:8080"
