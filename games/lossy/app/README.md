# Desktop app

The same single-file game, wrapped in Electron so it runs as a native app on Windows, macOS and Linux. Nothing in the game changes; the app loads `web/index.html`, a copy of the root `index.html`.

```sh
python3 ../build.py     # build the game
npm install
npm start               # run it
npm run dist            # package for the current OS into dist/
```

Per OS: `npm run dist:win` (installer + portable .exe), `npm run dist:mac` (.dmg + .zip), `npm run dist:linux` (.AppImage). Builds are unsigned: on macOS, right-click the app and choose Open the first time; on Windows, SmartScreen asks for confirmation.

The `desktop` GitHub workflow builds all three on every tag push (`v1.1.0`, …) and attaches them to the release. Saves live in the app's own storage, separate from any browser.
