# Docker 設定ガイド

このプロジェクトのDocker設定について説明します。

## 📁 ファイル構成

```
├── Dockerfile              # Next.js本番用
├── Dockerfile.dev          # Next.js開発用
├── docker-compose.yml      # ベース設定
├── docker-compose.dev.yml  # 開発環境用
├── docker-compose.prod.yml # 本番環境用
├── docker-make.mk          # Docker操作用Makefile
├── .dockerignore           # フロントエンド用
├── .env.example            # 環境変数例
└── backend/
    ├── Dockerfile          # Go本番用
    ├── Dockerfile.dev      # Go開発用（ホットリロード）
    ├── .dockerignore       # バックエンド用
    ├── .air.toml           # ホットリロード設定
    └── .env.example        # バックエンド環境変数例
```

## 🚀 クイックスタート

### 1. 初回セットアップ
```bash
# 環境変数ファイルをコピー
make -f docker-make.mk setup

# 環境変数を編集
vi .env
vi backend/.env
```

### 2. 開発環境の起動
```bash
# 開発環境を起動（ホットリロード有効）
make -f docker-make.mk dev

# ビルドして起動
make -f docker-make.mk dev-build
```

### 3. アクセス

| サービス | URL | 説明 |
|---------|-----|------|
| フロントエンド | http://localhost:3000 | Next.js アプリ |
| バックエンド | http://localhost:8080 | Go API |
| Adminer | http://localhost:8081 | DB管理 |
| MailHog | http://localhost:8025 | メール確認 |

## 🛠️ Docker Compose 設定

### 開発環境 (`docker-compose.dev.yml`)

**特徴:**
- ホットリロード対応
- ボリュームマウント
- 開発用ツール（Adminer、MailHog）
- デバッグ用設定

**サービス:**
- `db`: PostgreSQL
- `redis`: Redis
- `backend`: Go API（ホットリロード）
- `frontend`: Next.js（ホットリロード）
- `adminer`: DB管理ツール
- `mailhog`: メール開発ツール

### 本番環境 (`docker-compose.prod.yml`)

**特徴:**
- 最適化されたビルド
- リソース制限
- ヘルスチェック
- レプリケーション
- Nginx リバースプロキシ

**サービス:**
- `db`: PostgreSQL（リソース制限付き）
- `redis`: Redis（リソース制限付き）
- `backend`: Go API（2レプリカ）
- `frontend`: Next.js（2レプリカ）
- `nginx`: リバースプロキシ

## 🔧 Dockerfile の説明

### Next.js Dockerfile

**本番用 (`Dockerfile`)**
- マルチステージビルド
- 最適化されたNode.jsイメージ
- 非rootユーザー
- ヘルスチェック

**開発用 (`Dockerfile.dev`)**
- シンプルな構成
- ホットリロード対応
- 開発用依存関係

### Go Dockerfile

**本番用 (`backend/Dockerfile`)**
- Alpine Linuxベース
- 静的リンクバイナリ
- 非rootユーザー
- セキュリティ最適化

**開発用 (`backend/Dockerfile.dev`)**
- Air を使用したホットリロード
- 開発用設定

## 📋 よく使うコマンド

```bash
# 開発環境
make -f docker-make.mk dev          # 開発環境起動
make -f docker-make.mk dev-logs     # ログ表示
make -f docker-make.mk dev-down     # 停止

# 本番環境
make -f docker-make.mk prod         # 本番環境起動
make -f docker-make.mk prod-logs    # ログ表示
make -f docker-make.mk prod-down    # 停止

# 管理
make -f docker-make.mk ps           # 状態確認
make -f docker-make.mk health       # ヘルスチェック
make -f docker-make.mk clean        # クリーンアップ

# 個別ログ確認
make -f docker-make.mk frontend-logs
make -f docker-make.mk backend-logs
make -f docker-make.mk db-logs

# データベース操作
make -f docker-make.mk db-shell     # DB接続
make -f docker-make.mk db-migrate   # マイグレーション

# 開発ツール
make -f docker-make.mk adminer      # Adminer起動
make -f docker-make.mk mailhog      # MailHog起動
```

## 🔒 セキュリティ考慮事項

### 本番環境
1. **環境変数**: 機密情報は環境変数で管理
2. **非rootユーザー**: コンテナ内で非特権ユーザーを使用
3. **リソース制限**: メモリ・CPU制限を設定
4. **ヘルスチェック**: サービス監視を実装

### 開発環境
1. **ポート公開**: 必要最小限のポートのみ公開
2. **ボリューム**: 機密ファイルはマウントしない
3. **ネットワーク**: 隔離されたネットワークを使用

## 🐛 トラブルシューティング

### よくある問題

**1. ポートが使用中**
```bash
# ポート使用状況確認
lsof -i :3000
lsof -i :8080

# プロセス停止
kill -9 <PID>
```

**2. ボリュームの権限問題**
```bash
# 権限修正
sudo chown -R $(id -u):$(id -g) .
```

**3. イメージビルドエラー**
```bash
# キャッシュクリア
docker system prune -a
docker-compose build --no-cache
```

**4. データベース接続エラー**
```bash
# DB状態確認
make -f docker-make.mk db-logs

# DB接続テスト
make -f docker-make.mk db-shell
```

### ログの確認方法

```bash
# 全サービスのログ
make -f docker-make.mk dev-logs

# 特定サービスのログ
docker-compose -f docker-compose.dev.yml logs -f <service-name>

# エラーのみ表示
docker-compose -f docker-compose.dev.yml logs --tail=50 | grep -i error
```

## 🔄 開発ワークフロー

### 1. 新機能開発
```bash
# 開発環境起動
make -f docker-make.mk dev

# コード変更（ホットリロード自動適用）

# テスト実行
make -f docker-make.mk test

# ログ確認
make -f docker-make.mk dev-logs
```

### 2. 本番デプロイ前確認
```bash
# 本番用ビルドテスト
make -f docker-make.mk prod-build

# 動作確認
make -f docker-make.mk health

# 停止
make -f docker-make.mk prod-down
```

## 📈 パフォーマンス最適化

### イメージサイズ削減
1. **マルチステージビルド**: 不要なファイルを除外
2. **.dockerignore**: ビルドコンテキストを最小化
3. **Alpine Linux**: 軽量なベースイメージを使用

### ビルド時間短縮
1. **レイヤーキャッシュ**: 変更頻度の低いレイヤーを先に配置
2. **並列ビルド**: マルチコアを活用
3. **依存関係の分離**: package.jsonとソースコードを分離

この設定により、開発から本番まで一貫したDocker環境を構築できます。
