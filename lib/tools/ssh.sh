#!/bin/sh

# Wrapper script to run SSH with the specified
# private key and no strict host checking.

if [ -z "$PKEY" ] || [ -z "$PORT" ] ; then
    exit 1
else
    ssh -p "$PORT" -i "$PKEY" -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no "$@"
fi
