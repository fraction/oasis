# With Docker

**Warning:** Experimental.

Use [Docker](https://www.docker.com/) to run Oasis in a container.

## Build

```shell
docker build --tag oasis --file contrib/Dockerfile  .
docker volume create ssb
```

## Run

```
docker run --mount source=ssb,target=/home/node/.ssb --publish 127.0.0.1:3000:3000 --rm oasis
```

You should now be able to open http://localhost:3000 in your browser.
