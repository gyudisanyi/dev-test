FROM node:14.17.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --network-timeout 1000000

COPY . .

EXPOSE 8080

CMD [ "yarn", "start"]