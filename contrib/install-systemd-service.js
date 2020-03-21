const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const { execSync } = require("child_process");
const open = require("open");

let xdgConfigHome = process.env.XDG_CONFIG_HOME;
let systemdUserHome = process.env.SYSTEMD_USER_HOME;

if (xdgConfigHome == null) {
  // Note: path.join() throws when arguments are null-ish.
  xdgConfigHome = path.join(process.env.HOME, ".config");
}

if (systemdUserHome == null) {
  systemdUserHome = path.join(xdgConfigHome, "systemd", "user");
}

const targetPath = path.join(systemdUserHome, "oasis.service");

if (fs.existsSync(targetPath)) {
  console.log("Cowardly refusing to overwrite file:", targetPath);
} else {
  mkdirp.sync(systemdUserHome);

  const sourcePath = path.join(__dirname, "oasis.service");
  fs.copyFileSync(sourcePath, targetPath);

  execSync("systemctl --user daemon-reload");
  console.log("Service configuration has been installed to:", targetPath);
}

// Since this isn't in a post-install script we can enable, start, and open it.
execSync("systemctl --user enable oasis");
execSync("systemctl --user start oasis");
open("http://localhost:4515");
