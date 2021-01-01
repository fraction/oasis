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

If you run `oasis --help` you'll see all of the parameters, which are also defined in the source code here: https://github.com/fraction/oasis/blob/master/src/cli.js

## Semantics

Which value is given is decided like this:

1. If an argument is given on the command-line, use that value.
2. Otherwise, use the value from the configuration file if present.
3. If neither command-line nor configuration file are given, use the built-in default value.

# Custom Styles

The stylesheet values may be overridden by adding custom values to a file found in a
standard folder for configuration, depending on your operating system:

- Linux: `$XDG_CONFIG_HOME/oasis/custom-style.css`.
  Usually this is `/home/<your username>/.config/oasis/custom-style.css`
- Windows `%APPDATA%\oasis\custom-style.css`.
- Mac OS, `/Users/<your username>/Library/Preferences/oasis/custom-style.css`

As an example the width used for the main body may be changed to a different
fixed width or a dynamic width:

```css
:root {
  --measure: 75%;
}
```
