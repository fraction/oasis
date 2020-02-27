package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

var node string

func main() {
	node := filepath.Join(filepath.Dir(os.Args[0]), node)
	src := filepath.Join(filepath.Dir(os.Args[0]), "src")

	args := []string{src}

	for i := 1; i < len(os.Args); i++ {
		args = append(args, os.Args[i])
	}

	cmd := exec.Command(node, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err := cmd.Run()

	if err != nil {
		fmt.Println(err)
	}


	fmt.Println(args)
}
