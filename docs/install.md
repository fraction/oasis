# Installation

## Download

### HTTP

```shell
git clone https://github.com/fraction/oasis.git
cd oasis
```

### SSH

```shell
git clone git@github.com:fraction/oasis.git
cd oasis
```

## Dependencies

### Yarn

```shell
yarn
```

### npm

```shell
npm install
```

## System service

```shell
cp contrib/oasis.service ~/.config/systemd/user
systemctl --user daemon-reload
systemctl --user enable oasis
systemctl --user start oasis
```
