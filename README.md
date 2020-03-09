# Oasis

Oasis is a **free, open-source, peer-to-peer social application** that helps
you follow friends and discover new ones on [Secure Scuttlebutt (SSB)][ssb].

**🦀 Powered by SSB.**  
You're the center of your own distributed network. Online or offline, SSB works
anywhere that you are. Follow the people you want to see and never worry about
spam again. Switch to any SSB app you want at any time.

**🌐 Bring your own browser.**  
Use your favorite web browser to read and write messages to the people you care
about. Oasis runs over HTTP, so you don't need to worry about adding another
Electron app to your computer.

**🏰 Just HTML and CSS.**  
No browser JavaScript! Oasis has strict security rules that prevent any
JavaScript from running in your browser, which helps us make Oasis accessible
and easy to improve.

## Example

```sh
oasis
```

![Screenshot of Oasis](./docs/screenshot.png)

Use `oasis --help` to get configuration options. You can change the default
values with a custom [configuration](./docs/configuring.md).

## Installation

Most people should install stable releases with [npm](https://npmjs.org/) and
Node.js [**current** or **active LTS** release](https://nodejs.org/en/about/releases/).

```shell
npm -g install fraction/oasis#semver:
```

For faster updates and less stability, install from GitHub and upgrade often.

```shell
npm -g install fraction/oasis
```

Check out [`install.md`](https://github.com/fraction/oasis/blob/master/docs/install.md)
for more information.

## FAQ

### Can I use the same profile from multiple computers?

No, this is a limitation of SSB. You'll need to make a separate profile on each device. There is a workaround [we'd like to implement](https://github.com/fraction/oasis/issues/267) which ties your multiple profiles together.

### Can I run this at the same time as Patchwork and other SSB apps?

Yes! They will both use the same data and profile. You can either run them one at a time or simultaneously. If you run them at the same time, start Patchwork first, then Oasis.

Details: SSB apps have two parts: a "server" that manages the database (on your own computer), and a user interface that gets things from the server to display. Only one server can run at a time, but multiple apps can use it.

| App       | Runs its own SSB server            | Can use SSB server of another app              |
| --------- | ---------------------------------- | ---------------------------------------------- |
| Oasis     | Yes, unless one is already running | Yes                                            |
| Patchwork | Yes                                | No, only uses its own server                   |
| Patchfox  | No                                 | Yes, depends on other apps to provide a server |

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
