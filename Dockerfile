FROM node:12
COPY . .
RUN npm i
RUN npm run build
ENTRYPOINT node dist