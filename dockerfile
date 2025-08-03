# frontend/Dockerfile

# 1. ベースイメージ（Node.js LTS版）
FROM node:lts-alpine

# 2. 作業ディレクトリを作成＆移動
WORKDIR /app

# 3. 依存パッケージを先にインストール（レイヤーキャッシュ効かせる）
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 4. ソースコードをコピー
COPY . .

# 5. Next.js のホットリロード開発サーバー用ポートを開放
EXPOSE 3000

# 6. デフォルト起動コマンド（docker-compose.yml と合わせて yarn dev）
CMD ["npm", "run", "dev"]
