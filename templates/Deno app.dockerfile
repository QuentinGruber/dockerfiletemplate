FROM ubuntu:21.04
WORKDIR /usr/src/app
# Install Deno
RUN apt update && apt-get install unzip -y && apt install -y curl
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
# Copy all not-ignored files to volume
COPY . .
# Cache the dependencies of your script
RUN /root/.deno/bin/deno cache index.ts
EXPOSE 8000
CMD [ "/root/.deno/bin/deno", "run", "--allow-net", "index.ts"]
