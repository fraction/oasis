# Install

This is a guide on how to download the source code for Oasis so that you can
build and install it on your computer. If you'd like an easier installation
option, try one of the options in the readme.

If you want to run Oasis in the background, see [`with-systemd.md`](./with-systemd.md).

If you want to run Oasis in a container, see [`with-docker.md`](./with-docker.md).

If you want to run Oasis on Android via Termux, see [`with-termux.md`](./with-termux.md).

## Download

Download Oasis from GitHub over HTTPS.

```shell
git clone https://github.com/fraction/oasis.git
```

## Install dependencies

Most people should build and install Oasis with npm.

```shell
cd oasis
npm install --only=prod
```

## Start

You can try Oasis without installing with:

```shell
node .
```

## Install globally

If you want to install to make `oasis` available globally:

```shell
npm -g install .
```

If you see a permission error, see [resolving EACCESS permission errors](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally). If you any other problems, please [reach out for help](https://github.com/fraction/oasis/issues/new).
