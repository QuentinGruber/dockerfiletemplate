FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build
RUN npm i -g serve
EXPOSE 3000
CMD [ "serve", "-S" , "build"]
