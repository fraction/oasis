#!/bin/sh

set -ex

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

# Avoid building anything from source.
npm ci --only=prod --ignore-scripts --no-audit --no-fund

cat << EOF > oasis
#!/bin/sh

BASEDIR="\$(cd "\$(dirname "\$0")" && pwd)"

node="\$BASEDIR/vendor/node-v$TARGET_VERSION-$TARGET_PLATFORM-$TARGET_ARCH/bin/node"

npm () {
  "\$node" "\$BASEDIR/vendor/node-v$TARGET_VERSION-$TARGET_PLATFORM-$TARGET_ARCH/lib/node_modules/npm/bin/npm-cli.js" --scripts-prepend-node-path=true --silent \$@;
}

verify () {
  node -p "require('\$1')" \$@ > /dev/null 2>&1 || echo "Building \$1..."; (cd "node_modules/\$1" && npm install --only=prod --offline --no-audit --no-fund)
}

verify_optional () {
  node -p "require('\$1')" \$@ > /dev/null 2>&1 || rm -rf "node_modules/\$1"
}

verify_all () {
  verify leveldown
  verify sodium-native
  verify_optional sharp
}

verify_all
exec "\$node" "src/index.js" \$@

EOF

chmod +x oasis

zip -r "/tmp/oasis-$TARGET_PLATFORM-$TARGET_ARCH.zip" . -x '.git/**'
git clean -fdx
