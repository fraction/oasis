# Configuring

The default options can be permanently set with a configuration file found in a
standard folder for configuration, depending on your operating system:

- Linux: `$XDG_CONFIG_HOME/oasis/default.json`.
  Usually this is `/home/<your username>/.config/oasis/default.json`
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

## Semantics

Which value is given is decided like this:

1. If an argument is given on the command-line, use that value.
2. Otherwise, use the value from the configuration file if present.
3. If neither command-line nor configuration file are given, use the built-in default value.
