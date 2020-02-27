#!/bin/sh

set -ex

BASEDIR="$(dirname "$0")"
TARGET_VERSION="12.16.1"

cd "$BASEDIR/.."

git clean -fdx

mkdir -p vendor
cd vendor

get_tgz () {
  TARGET_PLATFORM="$1"
  TARGET="node-v$TARGET_VERSION-$TARGET_PLATFORM-x64"
  ARCHIVE="$TARGET.tar.gz"
  URL="https://nodejs.org/dist/v$TARGET_VERSION/$ARCHIVE"
  TARGET_NODE="$TARGET/bin/node"

  wget "$URL"
  tar -xvf "$ARCHIVE" "$TARGET_NODE"
  rm -f "$ARCHIVE"
}

get_zip () {
  TARGET_PLATFORM="$1"
  TARGET="node-v$TARGET_VERSION-$TARGET_PLATFORM-x64"
  ARCHIVE="$TARGET.zip"
  URL="https://nodejs.org/dist/v$TARGET_VERSION/$ARCHIVE"
  TARGET_NODE="$TARGET/node.exe"

  wget "$URL"
  unzip "$ARCHIVE" "$TARGET_NODE"
  rm -f "$ARCHIVE"
}

get_tgz darwin
get_tgz linux
get_zip win

cd ..

# Avoid building anything from source.
npm ci --only=prod --ignore-scripts --no-audit --no-fund
# More trouble than it's worth :)
rm -rf ./node_modules/sharp

export GOARCH="amd64"

# Darwin (shell script)
export GOOS="darwin"
OUTFILE="oasis-$GOOS-$GOARCH"
go build -ldflags "-X main.node=vendor/node-v$TARGET_VERSION-darwin-x64/bin/node" -o "$OUTFILE" scripts/oasis.go
chmod +x "$OUTFILE"

# Linux (ELF executable)
export GOOS="linux"
OUTFILE="oasis-$GOOS-$GOARCH"
go build -ldflags "-X main.node=vendor/node-v$TARGET_VERSION-linux-x64/bin/node" -o "$OUTFILE" scripts/oasis.go
chmod +x "$OUTFILE"

# Windows (batch file)
export GOOS="windows"
OUTFILE="oasis-$GOOS-$GOARCH.exe"
go build -ldflags "-X main.node=vendor\\node-v$TARGET_VERSION-win-x64\\bin\\node" -o "$OUTFILE" scripts/oasis.go
chmod +x "$OUTFILE"

# I think if the zip already exists it's adding files to the existing archive?
ZIP_PATH="/tmp/oasis-x64.zip"

rm -f "$ZIP_PATH"
zip -r "$ZIP_PATH" . -x ".git/**"

git clean -fdx

