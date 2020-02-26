#!/bin/sh

set -ex

BASEDIR="$(dirname "$0")"

cd "$BASEDIR/.."

TARGET_VERSION="12.16.1"

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
  rm -rf "$ARCHIVE"
}

get_zip () {
  TARGET_PLATFORM="$1"
  TARGET="node-v$TARGET_VERSION-$TARGET_PLATFORM-x64"
  ARCHIVE="$TARGET.zip"
  URL="https://nodejs.org/dist/v$TARGET_VERSION/$ARCHIVE"
  TARGET_NODE="$TARGET/node.exe"

  wget "$URL"
  unzip "$ARCHIVE" "$TARGET_NODE"
  rm -rf "$ARCHIVE"
}

get_tgz darwin
get_tgz linux
get_zip win

cd ..

# Avoid building anything from source.
npm ci --only=prod --ignore-scripts --no-audit --no-fund
# More trouble than it's worth :)
rm -rf ./node_modules/sharp

# Darwin (shell script)
cat << EOF > oasis-darwin-x64
#!/bin/sh
exec vendor/node-v$TARGET_VERSION-darwin-x64/bin/node src "\$@"
EOF
chmod +x oasis-darwin-x64

# Linux (ELF executable)
clang scripts/oasis.c  -Wall -g -no-pie -o "oasis-linux-x64" --target=x86_64-linux-unknown -D "NODE=\"vendor/node-v$TARGET_VERSION-linux-x64/bin/node\""
chmod +x oasis-linux-x64

# Windows (batch file)
cat << EOF > oasis-win-x64.bat
vendor\\node-v$TARGET_VERSION-darwin-x64\\bin\\node src "\$@"
EOF

chmod +x oasis-win-x64.bat

# I think if the zip already exists it's adding files to the existing archive?
ZIP_PATH="/tmp/oasis-x64.zip"

rm -f "$ZIP_PATH"
zip -r "$ZIP_PATH" . -x ".git/**"

rm -f oasis-darwin-x64
rm -f oasis-linux-x64
rm -f oasis-win-x64.bat
rm -rf vendor
