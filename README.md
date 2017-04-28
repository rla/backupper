# Personal backup scripts

A set of backup scripts written in Node.js. The scripts
are built onto SSH, RSYNC, GIT, TAR and Amazon S3.

## Installation

Installation from GitHub:

```
npm install git+https://github.com/rla/backupper.git -g
```

Crontab entry (adjust paths):

```
0 2 * * * /opt/node-v7.9.0-linux-x64/bin/backupper -b /files/backups/automatic >> /files/backups/automatic/backup.log 2>&1
```

If you want to reuse pieces of code then do so under the
conditions of the MIT license.
