# Oasis

Oasis is a **free, open-source, peer-to-peer social application** that helps
you follow friends and discover new ones on [Secure Scuttlebutt (SSB)][ssb].

**🦀 Powered by SSB.**  
You're the center of your own distributed network. Online or offline, SSB works
anywhere that you are. Follow the people you want to see and never worry about
spam again. Migrate your data to another SSB app any time you want.

**🌐 Bring your own browser.**  
Use your favorite web browser to read and write messages to the people you care
about. Oasis runs over HTTP, so you don't need to worry about adding another
Electron app to your computer.

**🏰 Just HTML and CSS.**  
No browser JavaScript! Oasis has strict security rules that prevent any
JavaScript from running in your browser, which helps us make Oasis accessible
and easy to improve.

![Screenshot of Oasis](./docs/screenshot.png)

## Usage

Start Oasis from a command-line interface with the `oasis` command.

```console
$ oasis --help
Usage: oasis [options]

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]
  --open      Automatically open app in web browser. Use --no-open to disable.
                                                       [boolean] [default: true]
  --offline   Don't try to connect to scuttlebutt peers or pubs. This can be
              changed on the 'settings' page while Oasis is running.
                                                      [boolean] [default: false]
  --host      Hostname for web app to listen on  [string] [default: "localhost"]
  --port      Port for web app to listen on             [number] [default: 3000]
  --debug     Use verbose output for debugging        [boolean] [default: false]
  -c --config Show current default configuration      [boolean] [default: false]
```

## Configuration

The above options can be permanently set with a configuration file found in a
standard folder for configuration, depending on your operating system:

- Linux: `$XDG_CONFIG_HOME/oasis/default.json`.
  Usually this is `/home/<your username>/.config/oasis/default.json`
  <!-- cspell:disable-next-line -->
- Windows `%APPDATA%\oasis\default.json`.
- Mac OS, `/Users/<your username>/Library/Preferences/oasis/default.json`

The configuration file can override any or all of the command-line _defaults_.
Here is an example customizing the port number and the "open" settings:

```json
{
  "open": false,
  "port": 19192
}
```

### Configuration Semantics

Which value is given is decided like this:

1. If an argument is given on the command-line, use that value.
2. Otherwise, use the value from the configuration file if present.
3. If neither command-line nor configuration file are given, use the built-in default value.

## Installation

Most people should install stable releases with [npm](https://npmjs.org/) and
Node.js [**current** or **active LTS** release](https://nodejs.org/en/about/releases/).

```shell
npm --global install 'fraction/oasis#semver:*'
```

For faster updates and less stability, install from GitHub and upgrade often.

```shell
npm --global install fraction/oasis
```

Want more? Check out [`install.md`](https://github.com/fraction/oasis/blob/master/docs/install.md).

## Resources

- [Contributing](https://github.com/fraction/oasis/blob/master/docs/contributing.md)
- [Architecture](https://github.com/fraction/oasis/blob/master/docs/architecture.md)
- [Help](https://github.com/fraction/oasis/issues/new)
- [Security Policy](https://github.com/fraction/oasis/blob/master/docs/security.md)
- [Source Code](https://github.com/fraction/oasis.git)

## See Also

- [Patchbay](https://github.com/ssbc/patchbay)
- [Patchwork](https://github.com/ssbc/patchwork)
- [SSB-Browser](https://github.com/arj03/ssb-browser-demo)
- [SSB-Server](https://github.com/ssbc/ssb-server)
- [Yap](https://github.com/dominictarr/yap)

## License

AGPL-3.0

[ssb]: https://en.wikipedia.org/wiki/Secure_Scuttlebutt
