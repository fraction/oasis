#!/bin/sh

set -ex

BASEDIR="$(dirname "$0")"

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

wget "$URL"
tar -xvf "$TARBALL" "$TARGET/bin/node"
rm -rf "$TARBALL"
cd ..

# Avoid building anything from source.
npm ci --only=prod --ignore-scripts --no-audit --no-fund

BINARY_NAME="oasis"

# Append .appimage for double-click support on Linux
if [ "$TARGET_PLATFORM" = "linux" ]; then
  BINARY_NAME="$BINARY_NAME.appimage"
fi

echo $BINARY_NAME

cat << EOF > "$BINARY_NAME"
#!/bin/sh
BASEDIR="\$(cd "\$(dirname "\$0")" && pwd)"
node="\$BASEDIR/vendor/node-v$TARGET_VERSION-$TARGET_PLATFORM-$TARGET_ARCH/bin/node"
verify () {
  node -p "require('\$1')" > /dev/null 2>&1 || echo "Error: \$1 not supported on your platform"
}
verify_optional () {
  node -p "require('\$1')" > /dev/null 2>&1 || rm -rf "node_modules/\$1"
}
verify_all () {
  verify leveldown
  verify sodium-native
  verify_optional sharp
}
verify_all
exec "\$node" "src/index.js" "\$@"
EOF

chmod +x "$BINARY_NAME"

# I think if the zip already exists it's adding files to the existing archive?
ZIP_PATH="/tmp/oasis-$TARGET_PLATFORM-$TARGET_ARCH.zip"
rm -f "$ZIP_PATH"

zip -r "$ZIP_PATH" . -x ".git/**"
git clean -fdx
