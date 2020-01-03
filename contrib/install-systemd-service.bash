#!/usr/bin/env bash

SCRIPT_DIR=`dirname "$0"`
test "$XDG_CONFIG_HOME" || XDG_CONFIG_HOME=$HOME/.config
test "$SYSTEMD_USER_HOME" || SYSTEMD_USER_HOME="$XDG_CONFIG_HOME"/systemd/user
mkdir -p "$SYSTEMD_USER_HOME"
test -f "$SYSTEMD_USER_HOME"/oasis.service || cp "$SCRIPT_DIR"/oasis.service "$SYSTEMD_USER_HOME"/
systemctl --user daemon-reload

printf "oasis service has been installed to %s\n\n" "$SYSTEMD_USER_HOME"

printf "to enable for the current user, run\n\n"
printf "    systemctl --user enable oasis\n\n"

printf "to start right now, run\n\n"
printf "    systemctl --user start oasis\n"
printf "    xdg-open http://localhost:4515\n"

