# Kubernetes デプロイメント用 Makefile

# 変数
REGISTRY ?= your-registry
FRONTEND_IMAGE ?= $(REGISTRY)/traubling-frontend
BACKEND_IMAGE ?= $(REGISTRY)/traubling-backend
TAG ?= latest
NAMESPACE ?= traubling

.PHONY: help build push deploy deploy-dev deploy-prod clean install-argocd

help: ## このヘルプメッセージを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Docker イメージをビルド
	@echo "フロントエンドイメージをビルドしています..."
	docker build -t $(FRONTEND_IMAGE):$(TAG) .
	@echo "バックエンドイメージをビルドしています..."
	docker build -t $(BACKEND_IMAGE):$(TAG) ./backend

push: build ## Docker イメージをプッシュ
	@echo "イメージをレジストリにプッシュしています..."
	docker push $(FRONTEND_IMAGE):$(TAG)
	docker push $(BACKEND_IMAGE):$(TAG)

install-argocd: ## ArgoCD をインストール
	@echo "ArgoCD をインストールしています..."
	./k8s/install-argocd.sh

deploy: ## ベース設定でデプロイ
	@echo "アプリケーションをデプロイしています..."
	kubectl apply -k k8s/

deploy-dev: ## 開発環境にデプロイ
	@echo "開発環境にデプロイしています..."
	kubectl apply -k k8s/overlays/development/

deploy-prod: ## 本番環境にデプロイ
	@echo "本番環境にデプロイしています..."
	kubectl apply -k k8s/overlays/production/

argocd-app: ## ArgoCD アプリケーションを作成
	@echo "ArgoCD アプリケーションを作成しています..."
	kubectl apply -f k8s/argocd/project.yaml
	kubectl apply -f k8s/argocd/application.yaml

status: ## デプロイメント状況を確認
	@echo "デプロイメント状況:"
	kubectl get all -n $(NAMESPACE)

logs-frontend: ## フロントエンドのログを表示
	kubectl logs -f deployment/frontend-deployment -n $(NAMESPACE)

logs-backend: ## バックエンドのログを表示
	kubectl logs -f deployment/backend-deployment -n $(NAMESPACE)

logs-db: ## データベースのログを表示
	kubectl logs -f deployment/postgres-deployment -n $(NAMESPACE)

scale-frontend: ## フロントエンドをスケール (例: make scale-frontend REPLICAS=3)
	kubectl scale deployment frontend-deployment --replicas=$(REPLICAS) -n $(NAMESPACE)

scale-backend: ## バックエンドをスケール (例: make scale-backend REPLICAS=2)
	kubectl scale deployment backend-deployment --replicas=$(REPLICAS) -n $(NAMESPACE)

clean: ## 全てのリソースを削除
	@echo "リソースを削除しています..."
	kubectl delete namespace $(NAMESPACE) --ignore-not-found=true

port-forward-frontend: ## フロントエンドへのポートフォワーディング
	@echo "フロントエンドポートフォワーディング開始 (http://localhost:3000)"
	kubectl port-forward svc/frontend-service 3000:3000 -n $(NAMESPACE)

port-forward-backend: ## バックエンドへのポートフォワーディング
	@echo "バックエンドポートフォワーディング開始 (http://localhost:8080)"
	kubectl port-forward svc/backend-service 8080:8080 -n $(NAMESPACE)

port-forward-argocd: ## ArgoCD UIへのポートフォワーディング
	@echo "ArgoCD UIポートフォワーディング開始 (https://localhost:8080)"
	kubectl port-forward svc/argocd-server -n argocd 8080:443

validate: ## Kubernetes 設定ファイルをバリデーション
	@echo "設定ファイルをバリデーションしています..."
	kubectl apply --dry-run=client -k k8s/

# 開発用コマンド
dev-setup: install-argocd deploy-dev ## 開発環境のセットアップ

prod-setup: install-argocd deploy-prod ## 本番環境のセットアップ
