FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm install -g @angular/cli
RUN ng build
RUN npm i -g serve
EXPOSE 5000
CMD [ "serve", "-S" , "dist/my-app-angular"]
