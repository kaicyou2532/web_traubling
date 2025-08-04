 
FROM node:lts-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --force

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]