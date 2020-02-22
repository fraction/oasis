#!/bin/sh

set -x

BASEDIR="$(dirname $0)"

cd "$BASEDIR/.."

TARGET_VERSION="12.16.1"
TARGET_PLATFORM="$1"
TARGET_ARCH="$2"

echo "Target version: $TARGET_VERSION"
echo "Target platform: $TARGET_PLATFORM"
echo "Target arch: $TARGET_ARCH"

git clean -fdx

mkdir -p vendor
cd vendor

TARGET="node-v$TARGET_VERSION-$TARGET_PLATFORM-$TARGET_ARCH"
TARBALL="$TARGET.tar.gz"
URL="https://nodejs.org/dist/v$TARGET_VERSION/$TARBALL"
echo $URL

wget "$URL"
tar -xvf "$TARBALL"
rm -rf "$TARBALL"
cd ..

cat << EOF > oasis
#!/bin/sh

echo "Installing dependencies..."

BASEDIR="\$(dirname $)"

node="\$BASEDIR/vendor/node-v$TARGET_VERSION-$TARGET_PLATFORM-$TARGET_ARCH/bin/node"

npm () {
  "\$node" "\$BASEDIR/vendor/node-v$TARGET_VERSION-$TARGET_PLATFORM-$TARGET_ARCH/lib/node_modules/npm/bin/npm-cli.js" --scripts-prepend-node-path=true --silent \$@;
}

npm start > /dev/null 2>&1 || rm -rf "\$BASEDIR/node_modules" && npm install --only=prod --no-audit --no-fund && npm start
EOF

chmod +x oasis

zip -r "/tmp/oasis-$TARGET_PLATFORM-$TARGET_ARCH.zip" . -x '.git/**'
git clean -fdx

