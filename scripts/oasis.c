#ifndef NODE
#define NODE "/usr/bin/node"
#endif

#include <unistd.h>
#include <stdlib.h>
#include <string.h>

int main (int argc, char *argv[]) {
	static const char src[] = "src";
	char** new_argv = malloc(((argc + 1) * sizeof *new_argv) + strlen(src));

	int pad = 0;
	for(int i = 0; i < argc; i++) {
		size_t length = strlen(argv[i]) + 1;
		new_argv[i + pad] = malloc(length);
		memcpy(new_argv[i + pad], argv[i], length);

		if (i == 0) {
			pad = 1;
			size_t length = strlen(src) + 1;
			new_argv[i + pad] = malloc(length);
			memcpy(new_argv[i + pad], src, length);
		}
	}

	new_argv[argc + 1] = NULL;

	execv(NODE, new_argv);
	return 1;
}

