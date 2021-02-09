FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm i -g serve
EXPOSE 5000
CMD [ "serve", "-S" , "build"]
