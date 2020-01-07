## With systemd

**Warning:** Experimental.

If you're using Linux and your distribution supports
[systemd](https://systemd.io/), you may be able to have Oasis automatically
start in the background when you start your computer. This is good for SSB and
makes it more likely that you'll download messages that you want.

```shell
node contrib/install-systemd-service.js
```

Follow the instructions to finish configuring the background service.
