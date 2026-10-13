#!/bin/sh
# Serves this working copy on http://127.0.0.1:PORT (default 8000) and opens
# it in the browser. Responses are not cached and the page leaves its service
# worker off on localhost, so a reload always shows the files as they are.
# Data URL and passphrase are asked once, as on any new origin.
cd "$(dirname "$0")" || exit 1
port="${1:-8000}"
url="http://127.0.0.1:$port/"
(sleep 1; if command -v open >/dev/null 2>&1; then open "$url"; else xdg-open "$url"; fi) >/dev/null 2>&1 &
echo "xcal on $url (Ctrl-C to stop)"
exec python3 -I -c '
import http.server, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1])), H).serve_forever()
' "$port"
