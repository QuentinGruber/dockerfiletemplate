FROM rust:alpine3.15
COPY . .
RUN rustc src/main.rs
EXPOSE 8080
CMD [ "./main"]
