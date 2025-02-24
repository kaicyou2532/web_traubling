FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --verbose

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
FROM node:18-alpine AS builder
WORKDIR /app

# 依存関係をインストール
COPY package.json package-lock.json ./
RUN npm install

# アプリをビルド
COPY . .
RUN npm run build

# ランタイムステージ
FROM node:18-alpine
WORKDIR /app

# ビルド済みファイルをコピー
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/node_modules /app/node_modules

# 環境変数を読み込む
ENV NODE_ENV=production
EXPOSE 3000

# Next.js のサーバーを起動
CMD ["npm", "start"]

