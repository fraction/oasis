FROM node:12-alpine
RUN apk add --update --no-cache libtool autoconf automake alpine-sdk python3
RUN mkdir /app
WORKDIR /app
ADD package.json .
ADD yarn.lock .
RUN yarn
ADD . ./
EXPOSE 3000
EXPOSE 8008
VOLUME /root/.ssb
ADD https://github.com/just-containers/s6-overlay/releases/download/v1.21.8.0/s6-overlay-amd64.tar.gz /tmp/
RUN tar xzf /tmp/s6-overlay-amd64.tar.gz -C /
RUN mkdir /etc/services.d/sbot/
RUN printf "#!/usr/bin/execlineb -P\n/usr/local/bin/node /app/src/pages/models/lib/server.js" >> /etc/services.d/sbot/run
RUN mkdir /etc/services.d/oasis/
RUN printf "#!/usr/bin/execlineb -P\n/usr/local/bin/node /app/index.js --host 0.0.0.0 --open false" >> /etc/services.d/oasis/run
ENTRYPOINT ["/init"]
