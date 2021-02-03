FROM node:14-slim
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
RUN npm i -g serve
EXPOSE 5000
CMD [ "serve", "-S" , "dist"]
