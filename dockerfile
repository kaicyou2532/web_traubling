# ビルド用ステージ
FROM node:18-alpine AS base

# 必要なパッケージをインストール
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# 依存関係のインストール用ステージ
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ビルド用ステージ
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Prismaスキーマをコピーしてクライアントを生成
COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# Prisma クライアントを生成
RUN npx prisma generate

# Next.jsアプリケーションをビルド
RUN npm run build

# 本番用ステージ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 必要なファイルをコピー
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# 適切な権限を設定
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]