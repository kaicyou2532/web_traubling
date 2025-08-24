# Docker操作用 Makefile

# 変数
COMPOSE_FILE_DEV = docker-compose.dev.yml
COMPOSE_FILE_PROD = docker-compose.prod.yml
COMPOSE_FILE_BASE = docker-compose.yml

.PHONY: help build up down logs clean dev prod restart ps

help: ## このヘルプメッセージを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# 開発環境用コマンド
dev: ## 開発環境を起動
	@echo "開発環境を起動しています..."
	docker-compose -f $(COMPOSE_FILE_DEV) up

dev-build: ## 開発環境をビルドして起動
	@echo "開発環境をビルドして起動しています..."
	docker-compose -f $(COMPOSE_FILE_DEV) up -d --build

dev-down: ## 開発環境を停止
	@echo "開発環境を停止しています..."
	docker-compose -f $(COMPOSE_FILE_DEV) down

dev-logs: ## 開発環境のログを表示
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f

dev-restart: ## 開発環境を再起動
	@echo "開発環境を再起動しています..."
	docker-compose -f $(COMPOSE_FILE_DEV) restart

# 本番環境用コマンド
prod: ## 本番環境を起動
	@echo "本番環境を起動しています..."
	docker-compose -f $(COMPOSE_FILE_PROD) up -d

prod-build: ## 本番環境をビルドして起動
	@echo "本番環境をビルドして起動しています..."
	docker-compose -f $(COMPOSE_FILE_PROD) up -d --build

prod-down: ## 本番環境を停止
	@echo "本番環境を停止しています..."
	docker-compose -f $(COMPOSE_FILE_PROD) down

prod-logs: ## 本番環境のログを表示
	docker-compose -f $(COMPOSE_FILE_PROD) logs -f

# ベース環境用コマンド
up: ## サービスを起動
	@echo "サービスを起動しています..."
	docker-compose -f $(COMPOSE_FILE_BASE) up -d

build: ## イメージをビルドしてサービスを起動
	@echo "イメージをビルドしてサービスを起動しています..."
	docker-compose -f $(COMPOSE_FILE_BASE) up -d --build

down: ## サービスを停止
	@echo "サービスを停止しています..."
	docker-compose -f $(COMPOSE_FILE_BASE) down

logs: ## ログを表示
	docker-compose -f $(COMPOSE_FILE_BASE) logs -f

restart: ## サービスを再起動
	@echo "サービスを再起動しています..."
	docker-compose -f $(COMPOSE_FILE_BASE) restart

# 管理用コマンド
ps: ## 実行中のコンテナを表示
	@echo "=== 開発環境 ==="
	@docker-compose -f $(COMPOSE_FILE_DEV) ps 2>/dev/null || echo "開発環境は停止中"
	@echo ""
	@echo "=== 本番環境 ==="
	@docker-compose -f $(COMPOSE_FILE_PROD) ps 2>/dev/null || echo "本番環境は停止中"

clean: ## 停止中のコンテナとボリュームを削除
	@echo "停止中のコンテナとボリュームを削除しています..."
	docker-compose -f $(COMPOSE_FILE_DEV) down -v --remove-orphans
	docker-compose -f $(COMPOSE_FILE_PROD) down -v --remove-orphans
	docker-compose -f $(COMPOSE_FILE_BASE) down -v --remove-orphans
	docker system prune -f

# 個別サービスの操作
frontend-logs: ## フロントエンドのログを表示
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f frontend

backend-logs: ## バックエンドのログを表示
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f backend

db-logs: ## データベースのログを表示
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f db

# データベース操作
db-shell: ## データベースに接続
	docker-compose -f $(COMPOSE_FILE_DEV) exec db psql -U appuser -d appdb

db-migrate: ## データベースマイグレーション実行（開発環境）
	docker-compose -f $(COMPOSE_FILE_DEV) exec backend go run cmd/migrate/main.go

# 開発用ツール
adminer: ## Adminer（DB管理ツール）を開く
	@echo "Adminer を開いています: http://localhost:8081"
	@open http://localhost:8081 2>/dev/null || echo "ブラウザで http://localhost:8081 にアクセスしてください"

mailhog: ## MailHog（メール確認ツール）を開く
	@echo "MailHog を開いています: http://localhost:8025"
	@open http://localhost:8025 2>/dev/null || echo "ブラウザで http://localhost:8025 にアクセスしてください"

# 便利なコマンド
setup: ## 初回セットアップ（環境変数ファイルをコピー）
	@echo "初回セットアップを実行しています..."
	@cp .env.example .env 2>/dev/null || echo ".env ファイルは既に存在します"
	@cp backend/.env.example backend/.env 2>/dev/null || echo "backend/.env ファイルは既に存在します"
	@echo "セットアップ完了！環境変数ファイルを確認してください。"

test: ## テストを実行（開発環境）
	docker-compose -f $(COMPOSE_FILE_DEV) exec backend go test ./...
	docker-compose -f $(COMPOSE_FILE_DEV) exec frontend npm test

# ヘルスチェック
health: ## サービスの健康状態をチェック
	@echo "=== サービス健康状態 ==="
	@echo "Frontend: $(shell curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "接続できません")"
	@echo "Backend: $(shell curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || echo "接続できません")"
	@echo "Database: $(shell docker-compose -f $(COMPOSE_FILE_DEV) exec -T db pg_isready -U appuser -d appdb >/dev/null 2>&1 && echo "OK" || echo "NG")"
