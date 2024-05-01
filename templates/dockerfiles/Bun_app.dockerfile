FROM oven/bun
WORKDIR /usr/src/app
COPY . .
RUN bun i
EXPOSE 3000
CMD [ "bun", "start" ]
