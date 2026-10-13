# xcal

A single static page that shows a calendar from an encrypted data file.

Open the page, enter the data URL and the passphrase once, and it decrypts in your browser. Nothing is stored in this repository and nothing is sent anywhere except the request for the data file itself.

To try the working copy, run `./serve.sh [port]`. It serves this folder on `http://127.0.0.1:8000` (or the given port) and opens it in the browser. On localhost the page leaves its service worker off, so a reload always shows your edits.
