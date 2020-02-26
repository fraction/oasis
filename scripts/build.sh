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

if [ "$TARGET_ARCH" == "x64" ]; then
	GCC_ARCH="x86-64"
else
	echo "Unsupported architecture: $TARGET_ARCH"
	exit 1
fi

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
# More trouble than it's worth :)
rm -rf ./node_modules/sharp

BINARY_NAME="oasis"

echo $BINARY_NAME

cat << EOF | gcc -Wall -g -no-pie -o "$BINARY_NAME" -x c -march="$GCC_ARCH" -
#include <unistd.h>
#include <stdlib.h>
#include <string.h>

int main (int argc, char *argv[]) {
	static const char node[] = "./vendor/node-v$TARGET_VERSION-$TARGET_PLATFORM-$TARGET_ARCH/bin/node";
	static const char src[] = "src";

	char** new_argv = malloc(((argc+1) * sizeof *new_argv) + sizeof src);

	int pad = 0;
	for(int i = 0; i < argc; i++) {
		size_t length = strlen(argv[i])+1;
		new_argv[i+pad] = malloc(length);
		memcpy(new_argv[i+pad], argv[i], length);
		if (i == 0) {
			pad = 1;
			new_argv[i + pad] = src;
		}
	}

	new_argv[argc + 1] = NULL;

	execv(node, new_argv);
	return 1;
}

EOF

chmod +x "$BINARY_NAME"

# I think if the zip already exists it's adding files to the existing archive?
ZIP_PATH="/tmp/oasis-$TARGET_PLATFORM-$TARGET_ARCH.zip"
rm -f "$ZIP_PATH"

zip -r "$ZIP_PATH" . -x ".git/**"
git clean -fdx
