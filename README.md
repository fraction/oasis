# Oasis

**Friendly Scuttlebutt interface designed for simplicity and accessibility.**
This is an experimental client built with HTML, CSS, and Node.js without any
front-end JavaScript. The goal is to support basic social messaging schemas with
some extra tools for debugging, *not* to support all known message types.

## Usage

```console
$ oasis --help
Usage: oasis [options]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --open     Automatically open app in web browser     [boolean] [default: true]
  --host     Hostname for web app to listen on   [string] [default: "localhost"]
  --port     Set port for web app to listen on          [number] [default: 3000]
  --debug    Use verbose output for debugging         [boolean] [default: false]
```

## Installation

With [npm](https://npmjs.org/):

```shell
npm -g install @fraction/oasis
```

With [yarn](https://yarnpkg.com/en/):

```shell
yarn global add @fraction/oasis
```

## Resources

- [Contributing](https://github.com/fraction/oasis/blob/master/docs/contributing.md)
- [Help](https://github.com/fraction/oasis/issues/new/choose)
- [Roadmap](https://github.com/fraction/oasis/blob/master/docs/roadmap.md)
- [Security Policy](https://github.com/fraction/oasis/blob/master/docs/security.md)
- [Source Code](https://github.com/fraction/oasis.git)

## See Also

- [patchbay](https://github.com/ssbc/patchbay)
- [patchwork](https://github.com/ssbc/patchwork)
- [ssb-browser-demo](https://github.com/arj03/ssb-browser-demo)
- [ssb-server](https://github.com/ssbc/ssb-server)
- [yap](https://github.com/dominictarr/yap)

## License

AGPL-3.0
