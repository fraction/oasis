#!/usr/bin/env bash

SCRIPT_DIR=`dirname "$0"`
test "$XDG_CONFIG_HOME" || XDG_CONFIG_HOME=$HOME/.config
test "$SYSTEMD_USER_HOME" || SYSTEMD_USER_HOME="$XDG_CONFIG_HOME"/systemd/user
TARGET_PATH="$SYSTEMD_USER_HOME"/oasis.service

if [ -f "$TARGET_PATH" ]; then
  printf "Cowardly refusing to overwrite file: %s\n\n" "$TARGET_PATH"
else
  mkdir -p "$SYSTEMD_USER_HOME"
  cp "$SCRIPT_DIR"/oasis.service "$TARGET_PATH"
  systemctl --user daemon-reload
  printf "Service configuration has been installed to: %s\n\n" "$TARGET_PATH"
fi

printf "To start Oasis automatically in the future, run:\n\n"
printf "    systemctl --user enable oasis\n\n"

printf "To start and open Oasis right now, run:\n\n"
printf "    systemctl --user start oasis\n"
printf "    xdg-open http://localhost:4515\n"

