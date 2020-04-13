# Maintaining

Please read the [contract](./contract) that defines the maintainer role in this
project. In short:

- Please merge any patches that reduce the number of problems in this project.
- If you have small nitpicks about a patch, please merge the patch and write a
  new patch with your preferred improvements.
- **Take care of yourself and don't burn out.** Please don't sacrifice your
  health to improve this project, and know that there are much more important
  things in life than merging pull requests quickly.

## Tips

### Checking out a patch

If you want to check out pull request number 42 and you're comfortable running
the code on your local device.

```sh
remote="https://github.com/fraction/oasis.git"
git fetch "$remote"
git reset --hard $remote master
git pull "$remote" pull/42/head
npm ci && npm test && npm start
```

No need to add their fork as a remote.

Or for ultimate convenience (and github lock-in), use the [github cli tool](https://cli.github.com):

```sh
gh pr list
gh pr checkout 42
```
