FROM rust:alpine3.15
COPY . .
RUN cargo build --release
EXPOSE 8080
CMD [ "cargo","run","--release"]
