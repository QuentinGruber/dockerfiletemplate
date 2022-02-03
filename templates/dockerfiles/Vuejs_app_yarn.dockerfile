FROM node:16-alpine
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
RUN yarn build
RUN yarn global add serve
EXPOSE 5000
CMD [ "serve", "-S" , "build"]
