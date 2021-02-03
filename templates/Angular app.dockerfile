FROM node:14-slim
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN npm install -g @angular/cli
RUN ng build
RUN npm i -g serve
EXPOSE 5000
CMD [ "serve", "-S" , "dist/my-app-angular"]
