FROM node:18-alpine as builder

RUN mkdir /app
WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

RUN mkdir /app
RUN mkdir /app/data

WORKDIR /app

COPY --from=builder /app/dist /app/dist

ENV NODE_ENV=production

ENTRYPOINT ["node", "dist/index.js"]
