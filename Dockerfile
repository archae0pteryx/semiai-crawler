FROM node:18-alpine as builder

RUN mkdir /app
WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

RUN npm run build

# *** Production Image ***
FROM node:18-alpine

RUN mkdir /app
RUN mkdir /app/data

WORKDIR /app

COPY --from=builder /app/dist /app/dist

ENV NODE_ENV=production
ENV LOG_FILE=stdout.log
ENV DATA_DIR=data
ENV SLEEP_MS=100

ENTRYPOINT ["node", "dist/index.js"]
