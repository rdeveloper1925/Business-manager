#!/bin/sh
# Apache listen port is set from PORT (Railway) in entrypoint; default 80 for local Compose.
port="${PORT:-80}"
exec curl -fsS "http://127.0.0.1:${port}/" >/dev/null
