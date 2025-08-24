# Kubernetes デプロイメント設定

このディレクトリには、TraublingアプリケーションをKubernetesクラスターにデプロイするための設定ファイルが含まれています。

## 構成

```
k8s/
├── argocd/                    # ArgoCD設定
│   ├── application.yaml       # Applicationリソース
│   └── project.yaml          # AppProjectリソース
├── backend/                   # Goバックエンド設定
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   └── Dockerfile.example
├── common/                    # 共通リソース
│   ├── namespace.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
├── database/                  # PostgreSQL設定
│   ├── postgres-pvc.yaml
│   ├── postgres-deployment.yaml
│   └── postgres-service.yaml
├── frontend/                  # Next.jsフロントエンド設定
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── frontend-ingress.yaml
│   └── Dockerfile.example
├── overlays/                  # 環境別設定
│   ├── development/
│   │   └── kustomization.yaml
│   └── production/
│       └── kustomization.yaml
└── kustomization.yaml         # ベース設定
```

## 前提条件

1. Kubernetesクラスターが利用可能であること
2. `kubectl` コマンドが設定済みであること
3. ArgoCD がクラスターにインストール済みであること
4. NGINX Ingress Controller がインストール済みであること（オプション）
5. cert-manager がインストール済みであること（SSL証明書用、オプション）

## セットアップ手順

### 1. Docker イメージのビルドとプッシュ

```bash
# フロントエンドイメージのビルド
docker build -t your-registry/traubling-frontend:latest .
docker push your-registry/traubling-frontend:latest

# バックエンドイメージのビルド
cd backend
docker build -t your-registry/traubling-backend:latest .
docker push your-registry/traubling-backend:latest
```

### 2. 設定の更新

以下のファイルで設定を更新してください：

#### `argocd/application.yaml`
- `spec.source.repoURL`: GitHubリポジトリのURLを設定
- `spec.destination.server`: Kubernetesクラスターのサーバーアドレス

#### `frontend/frontend-ingress.yaml`
- `spec.tls.hosts` および `spec.rules.host`: 実際のドメイン名に変更

#### `kustomization.yaml`
- `images`: Docker レジストリのパスを実際のものに変更

#### `common/secrets.yaml`
- シークレット値をBase64エンコードした実際の値に更新

### 3. ArgoCD でのデプロイ

```bash
# ArgoCD プロジェクトの作成
kubectl apply -f k8s/argocd/project.yaml

# ArgoCD アプリケーションの作成
kubectl apply -f k8s/argocd/application.yaml
```

### 4. 手動デプロイ（ArgoCD を使わない場合）

```bash
# ベース設定でデプロイ
kubectl apply -k k8s/

# 開発環境でデプロイ
kubectl apply -k k8s/overlays/development/

# 本番環境でデプロイ
kubectl apply -k k8s/overlays/production/
```

## 環境変数

### 共通設定 (`common/configmap.yaml`)
- `NEXT_PUBLIC_API_URL`: バックエンドAPIのURL
- `NODE_ENV`: 実行環境
- `DATABASE_URL`: PostgreSQLの接続URL
- `PORT`: バックエンドのポート番号

### シークレット (`common/secrets.yaml`)
- `POSTGRES_PASSWORD`: PostgreSQLのパスワード
- `JWT_SECRET`: JWT署名用シークレット
- `NEXTAUTH_SECRET`: NextAuth.jsのシークレット

## モニタリング

### ヘルスチェック
- フロントエンド: `http://frontend-service:3000/`
- バックエンド: `http://backend-service:8080/health`

### ログの確認
```bash
# フロントエンドのログ
kubectl logs -f deployment/frontend-deployment -n traubling

# バックエンドのログ
kubectl logs -f deployment/backend-deployment -n traubling

# データベースのログ
kubectl logs -f deployment/postgres-deployment -n traubling
```

## トラブルシューティング

### よくある問題

1. **イメージがプルできない**
   ```bash
   kubectl describe pod <pod-name> -n traubling
   ```

2. **データベース接続エラー**
   ```bash
   kubectl exec -it deployment/postgres-deployment -n traubling -- psql -U appuser -d appdb
   ```

3. **設定の確認**
   ```bash
   kubectl get configmap app-config -n traubling -o yaml
   kubectl get secret app-secrets -n traubling -o yaml
   ```

## セキュリティ考慮事項

1. **シークレット管理**: 本番環境では、Kubernetes Secrets の代わりに外部のシークレット管理ツール（AWS Secrets Manager、Azure Key Vault など）の使用を検討してください。

2. **Network Policies**: 必要に応じてNetwork Policiesを設定してポッド間通信を制限してください。

3. **RBAC**: 適切なRole-Based Access Control (RBAC) を設定してください。

4. **SSL/TLS**: IngressでSSL/TLS証明書を設定し、HTTPS通信を有効にしてください。

## スケーリング

### 手動スケーリング
```bash
kubectl scale deployment frontend-deployment --replicas=5 -n traubling
kubectl scale deployment backend-deployment --replicas=3 -n traubling
```

### Horizontal Pod Autoscaler (HPA)
```bash
kubectl autoscale deployment frontend-deployment --cpu-percent=70 --min=2 --max=10 -n traubling
kubectl autoscale deployment backend-deployment --cpu-percent=70 --min=2 --max=5 -n traubling
```
