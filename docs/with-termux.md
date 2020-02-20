# With Termux

**Warning:** Experimental.

Use [Termux](https://termux.com/) to run Oasis on Android.

Please note that this is very experimental and very slow.

## Build

Copy and paste the commands below into your terminal and run them.

```shell
# Install dependencies, some are optional (in case you need to build from source)
pkg install \
  autoconf \
  automake
  git \
  libsodium \
  libtool \
  make \
  nodejs \
  python

# Allow global npm dependencies
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile

# Upgrade npm
npm install -g npm

# Install Oasis
npm --global install --no-optional 'fraction/oasis#semver:*'
```

## Run

Oasis should open in your browser at http://localhost:3000 after you run:

```
oasis
```
