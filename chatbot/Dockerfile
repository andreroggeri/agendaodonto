FROM node:16

RUN mkdir -p /app

WORKDIR /app

ADD ./package*.json /app/

RUN npm i

ADD . /app

RUN npm run build

WORKDIR /app/dist

ADD scripts/* .

ENTRYPOINT [ "./entrypoint.sh" ]