FROM node:12
WORKDIR /usr/local/eris-bot
COPY . .
RUN yarn install
RUN yarn build
CMD [ "yarn", "start" ]