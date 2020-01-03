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
docker run --mount source=ssb,target=/root/.ssb --publish 3000:3000 --rm oasis
```
