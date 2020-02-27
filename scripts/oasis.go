package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// The relative path to the `node` binary depends on the platform, so we
// pass this via an `-ldflags` hack I don't completely understand. In my
// head this is similar to how GCC lets you use `-D` to define a macro to
// be inserted by the preprocessor.
var node string

func main() {
	// The problem with relative paths is that they only work when
	// you run `./oasis-platform-x64`, but not when you run a command
	// like `./path/to/oasis-platform-x64`. To resolve this problem
	// we need to put together an absolute path, which we can build
	// with the first argument (the relative path of this executable)
	// and the relative path of either the `node` binary or the
	// source code directory so that we can run `node src`.
	node := filepath.Join(filepath.Dir(os.Args[0]), node)
	src := filepath.Join(filepath.Dir(os.Args[0]), "src")

	// We know that the command will be the absolute path to `node`
	// and the first argument will be the absolute path to the `src`
	// directory, but we need to get collect the rest of the arguments
	// programatically by pulling them out of the `os.Args` slice and
	// putting them in a new slice called `args`.
	args := []string{src}
	for i := 1; i < len(os.Args); i++ {
		args = append(args, os.Args[i])
	}

	// This seems to execute the script and pass-through all of the
	// arguments we want, *plus* it hooks up stdout and stderr, but
	// the exit code of Oasis doesn't seem to be passed through. This
	// is easy to test with a command like:
	//
	//	./oasis-platform-x64 --port -1
	//
	// This should give an exit code of 1, but it seems to exit 0. :/
	cmd := exec.Command(node, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// This catches problems like "no such file or directory" if the
	// `node` variable points to a path where there isn't a binary.
	//
	// TODO: I think we're supposed to handle the exit code here.
	err := cmd.Run()
	if err != nil {
		fmt.Println(err)
	}
}
