FROM node:20-alpine3.18

RUN mkdir -p /app

WORKDIR /app

ADD ./package*.json /app/

RUN npm ci

ADD . /app

RUN npx prisma generate

RUN npm run build

WORKDIR /app/dist

ADD scripts/entrypoint.sh .

ENV NODE_ENV=production

ENV PORT=3000

EXPOSE 3000

ENTRYPOINT [ "./entrypoint.sh" ]