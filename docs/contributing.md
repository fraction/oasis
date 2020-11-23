# Contributing

If you want to dive into the details, please see the [contract](./contract.md)
that defines the contributor role in this project. If you're comfortable with
a top-level summary, you can start here first.

Our workflow is basically [GitHub Flow][github-flow] with specific roles:

- **Contributor:** Write patches that reduce the number of problems.
- **Maintainers:** Merge patches that reduce the number of problems.

If you have an issue, it's best to open an issue to describe the problem and
discuss solutions, but don't worry if you've already skipped that step.

Assuming you already have a [developer install](./install.md) you should be
able to start editing source code. There are a few useful commands you should
know about:

- **`npm install`**: Ensure that software dependencies are installed.
- **`npm test`**: Ensure that all automated tests pass.
- **`npm run fix`**: If an automated test failed, this may fix it.

Please run `npm test` before writing a commit, because if there are errors then
maintainers won't be able to merge your patch. Please ask for help if `npm test`
is giving you any trouble.

**Note:** `npm run fix` is run automatically as a pre-commit hook. You always
have the option to disable pre-commit hooks with `git commit --no-verify`.

## Frequently Failed Tests

### Unknown word

<!-- spell-checker:disable -->

```
/src/index.js:10:42 - Unknown word (Scuttlebtut)
```

<!-- spell-checker:enable -->

If this word is a typo, please fix the typo. If this error is a mistake, and
you're sure that this is a word, please add the word to `.cspell.json`.

### Code style issues found

```
Checking formatting...
src/index.js
README.md
Code style issues found in the above file(s). Forgot to run Prettier?
```

You can use `npm run fix` to resolve inconsistent code style. Please remember to
add those changes with `git add` or similar before you commit.

## Tips

### TypeScript opportunities

If you're looking for places where TypeScript would enjoy more detail, you can
run the TypeScript linter with `--noImplicitAny`:

```sh
npx tsc --allowJs --resolveJsonModule --lib es2018,dom --checkJs --noEmit --skipLibCheck --noImplicitAny src/index.js
```

[github-flow]: https://guides.github.com/introduction/flow/
