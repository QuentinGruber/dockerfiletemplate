FROM node:16-alpine
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn global add @angular/cli
RUN ng build
RUN yarn build
RUN yarn global add serve
EXPOSE 3000
CMD [ "serve", "-S" , "build"]
