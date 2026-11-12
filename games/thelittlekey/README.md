# The Little Key

A short VGA-style story game, the newest sibling of [Lossy Inc](../lossy/) and [Don't Break Prod](../dontbreakprod/). A production database key is born, 528 bytes and wildly over-permissioned. It never knows it gets copied. The player does.

Everything is fiction. The game is one HTML file. It contacts no real system.

## Play

Open `index.html` in a browser, or the landing page at `../thelittlekey.html`. About 15 minutes to see every ending. Nothing is stored between visits: a reload starts fresh.

## Save codes

`LK-XXXX-XXXX`, 32 bits in hex: rings found (bits 0 to 10, in `RINGS` order), story node (bits 11 to 15, index into `STORY`), line in that node (bits 16 to 20), checksum (bits 27 to 31). A bad checksum is rejected with a typo message. Letter O is read as zero, and case, spaces and dashes don't matter. Every ending shows the code; the Save code button shows it any time.

Browser Back and Forward keep the game: the page cache usually holds it, and as a fallback the state is mirrored to `sessionStorage`, which is only read when the page is reached by Back or Forward and is cleared on every other load, including a refresh.

## How it plays

- No menus. Click anywhere to continue. Click the key to poke it.
- Click any object to look at it: the key says what it thinks it is, then the narrator corrects it. Once revoked, some objects get a sadder key line. Data lives in `LOOKS`, per scene.
- The key never makes a choice. The player's only choice is at a split, when the key is copied: pick which key to follow.
- **Back** steps back one line. **Back to the last split** returns to the last fork.
- The ring strip at the top: hovering shows which key a ring belongs to, or the color to look for if not found. Clicking a found ring shows it on a cushion to admire (`RINGINFO`).
- Keyboard: Enter or → continues, ← goes back, P pokes.

## Story rules

- Each copy believes it is the only key. A copy never sees or mentions another copy. Only the narrator knows.
- Sad endings: the copy is revoked without being told, then sits useless (grey, dusty) for months or years until its system is wiped. That final day is a happy one for the key.
- Every ending awards that copy's ring. Eleven in all.

| Split | Choices |
|---|---|
| Birth (vault) | Stay in the vault · App memory · Secrets.txt |
| Secrets.txt | Stay · Team chat · Build pipeline |
| Team chat | Stay · Wiki · AI assistant |
| AI assistant | Stay · Public repository |
| Public repository | Stay · Stranger's laptop |
| Stranger's laptop | Stay in notes.txt · backup_service_02's new key |
| Build pipeline | Stay · Container image |

| Ring | Key | Ending |
|---|---|---|
| Golden | Original, vault | Revoked and deleted in the same breath |
| Moment | App memory | Process restarts, nothing written down |
| Notepad | Secrets.txt | Four years in a drawer, laptop wiped |
| Party | #general | Seven years of scrollback, retention policy |
| Bookmark | Wiki | Left behind in a wiki migration |
| Prompt | AI conversation | Account deleted with its history |
| Fork | Public repo | Last fork deleted, eight and a half years later |
| Hoodie | Stranger's notes.txt | The laptop's drive fails |
| Birthday | backup_service_02's new key | Access review deletes the account |
| Hard Hat | Build pipeline | Logs expire, build server shut down |
| Onion | Container image | Registry cleanup deletes the layers |

## The prize

With all 11 rings, an **Open the exploration map** button appears. It opens GitGuardian as it appears in Lossy Inc: the same browser chrome, nav, incident page and exploration map styles (copied from `lossy/src`). Incident #2001 (PostgreSQL Credentials, app_admin@prod-db) with its occurrences, remediation and activity; the map shows the key's family tree with a time picker (day 0 to year 9); Inventory shows backup_service_02. Code: `prize.js`.

## Look

320×200 canvas scenes drawn in code and quantized to a 256-colour VGA palette with ordered dithering. Dialogue text is Comic Sans (Comic Neue fallback); status and buttons use VT323. Nothing blinks or moves on its own.
