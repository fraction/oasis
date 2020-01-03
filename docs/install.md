# Install

This is a guide on how to download the source code for Oasis so that you can
build and install it on your computer.  If you'd like an easier installation
option, try one of the options in the readme.

If you want to run Oasis in the background, see [`with-systemd.md`](./with-systemd.md).

If you want to run Oasis in a container, see [`with-docker.md`](./with-docker.md).

## Download

### HTTPS

Most people should download Oasis over HTTPS.

```shell
git clone https://github.com/fraction/oasis.git
```

### SSH

If you already have SSH, you may prefer to download over SSH instead.

```shell
git clone git@github.com:fraction/oasis.git
```

## Install

Most people should build and install Oasis with npm.

```shell
cd oasis
npm install
npm --global install .
```

## Start

You did it! Oasis should now be installed.

```shell
oasis --help
```

If you have problems, read the documentation on [downloading and installing
packages globally](https://docs.npmjs.com/downloading-and-installing-packages-globally)
or [get some help](https://github.com/fraction/oasis/issues/new/choose).

