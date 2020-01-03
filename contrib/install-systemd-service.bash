#!/usr/bin/env bash

test "$XDG_CONFIG_HOME" || XDG_CONFIG_HOME=$HOME/.config
test "$SYSTEMD_USER_HOME" || SYSTEMD_USER_HOME="$XDG_CONFIG_HOME"/systemd/user
mkdir -p "$SYSTEMD_USER_HOME"
test -f "$SYSTEMD_USER_HOME"/oasis.service || cp oasis.service "$SYSTEMD_USER_HOME"/
systemctl --user daemon-reload

printf "oasis service has been installed to %s" "$SYSTEMD_USER_HOME"
printf "to enable for the current user, run"
printf "\n\tsystemctl --user enable oasis"

printf "to start right now, run"
printf "\n\tsystemctl --user start oasis"
printf "\txdg-open http://localhost:4515"

