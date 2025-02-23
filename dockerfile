FROM node:latest

ARG HUSKY
ENV HUSKY=${HUSKY}

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --verbose

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
