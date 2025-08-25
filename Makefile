# Traubling Docker Management Makefile
# Next.js + Prisma + Go の最低限構成

# 変数
COMPOSE_FILE_DEV = docker-compose.dev.yml
COMPOSE_FILE_BASE = docker-compose.yml

.PHONY: help start stop build up down logs clean dev restart ps

# デフォルトターゲット
.DEFAULT_GOAL := help

help: ## このヘルプメッセージを表示
	@echo "Traubling Docker Management Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# === 基本コマンド ===
start: ## 開発環境を起動
	@echo "開発環境を起動 ..."
	docker-compose -f $(COMPOSE_FILE_DEV) up -d

stop: ## 開発環境を停止
	@echo "開発環境を停止..."
	docker-compose -f $(COMPOSE_FILE_DEV) down

build: ## 開発環境をビルドして起動
	@echo "開発環境をビルドして起動..."
	docker-compose -f $(COMPOSE_FILE_DEV) up -d --build

restart: ## 開発環境を再起動
	@echo "開発環境を再起動しています..."
	docker-compose -f $(COMPOSE_FILE_DEV) restart

logs: ## 開発環境のログを表示
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f

# === 本番環境コマンド ===
prod-up: ## 本番環境を起動
	@echo "本番環境を起動しています..."
	docker-compose -f $(COMPOSE_FILE_BASE) up -d

prod-build: ## 本番環境をビルドして起動
	@echo "本番環境をビルドして起動しています..."
	docker-compose -f $(COMPOSE_FILE_BASE) up -d --build

prod-down: ## 本番環境を停止
	@echo "本番環境を停止しています..."
	docker-compose -f $(COMPOSE_FILE_BASE) down

prod-logs: ## 本番環境のログを表示
	docker-compose -f $(COMPOSE_FILE_BASE) logs -f

# === サービス別ログ ===
logs-frontend: ## フロントエンドのログを表示
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f frontend

logs-backend: ## バックエンドのログを表示
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f backend

logs-db: ## データベースのログを表示
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f db

# === データベース操作 ===
db-shell: ## データベースに接続
	docker-compose -f $(COMPOSE_FILE_DEV) exec db psql -U appuser -d appdb

# === Prisma操作 ===
prisma-generate: ## Prismaクライアントを生成
	docker-compose -f $(COMPOSE_FILE_DEV) exec frontend npx prisma generate

prisma-migrate: ## Prismaマイグレーション実行
	docker-compose -f $(COMPOSE_FILE_DEV) exec frontend npx prisma migrate dev

prisma-studio: ## Prisma Studioを起動（ブラウザで http://localhost:5555）
	docker-compose -f $(COMPOSE_FILE_DEV) exec frontend npx prisma studio

# === 管理コマンド ===
ps: ## 実行中のコンテナを表示
	@echo "=== 開発環境 ==="
	@docker-compose -f $(COMPOSE_FILE_DEV) ps 2>/dev/null || echo "開発環境は停止中"
	@echo ""
	@echo "=== 本番環境 ==="
	@docker-compose -f $(COMPOSE_FILE_BASE) ps 2>/dev/null || echo "本番環境は停止中"

clean: ## 停止中のコンテナとボリュームを削除
	@echo "停止中のコンテナとボリュームを削除しています..."
	docker-compose -f $(COMPOSE_FILE_DEV) down -v --remove-orphans
	docker-compose -f $(COMPOSE_FILE_BASE) down -v --remove-orphans
	docker system prune -f

# === 便利なコマンド ===
fresh: ## 全てを停止してクリーンアップ後、開発環境を再起動
	@echo "フレッシュスタートを実行しています..."
	make stop
	make clean
	make build

reset-db: ## データベースをリセット
	@echo "データベースをリセットしています..."
	docker-compose -f $(COMPOSE_FILE_DEV) stop db
	docker-compose -f $(COMPOSE_FILE_DEV) rm -f db
	docker volume rm traubling_postgres_data_dev 2>/dev/null || echo "ボリュームが存在しませんでした"
	docker-compose -f $(COMPOSE_FILE_DEV) up -d db
	@echo "データベースのリセットが完了しました"

shell-frontend: ## フロントエンドコンテナにシェル接続
	docker-compose -f $(COMPOSE_FILE_DEV) exec frontend sh

shell-backend: ## バックエンドコンテナにシェル接続
	docker-compose -f $(COMPOSE_FILE_DEV) exec backend sh

# === ヘルスチェック ===
health: ## サービスの健康状態をチェック
	@echo "=== サービス健康状態 ==="
	@echo -n "Frontend: "
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "接続できません"
	@echo -n "Backend: "
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ 2>/dev/null || echo "接続できません"
	@echo -n "Database: "
	@docker-compose -f $(COMPOSE_FILE_DEV) exec -T db pg_isready -U appuser -d appdb >/dev/null 2>&1 && echo "OK" || echo "NG"

# === 開発用エイリアス ===
up: start ## startのエイリアス
down: stop ## stopのエイリアス
rebuild: build ## buildのエイリアス
