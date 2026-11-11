# The Little Key

A short VGA-style story game, the newest sibling of [Lossy Inc](../lossy/) and [Don't Break Prod](../dontbreakprod/). A production database key is born, 528 bytes and wildly over-permissioned. It never knows it gets copied. The player does.

Everything is fiction. The game is one HTML file. It contacts no real system.

## Play

Open `index.html` in a browser, or the landing page at `../thelittlekey.html`. About 15 minutes to see every ending. Found rings are kept in the browser's localStorage (`littlekey.rings2`).

## How it plays

- No menus. Click anywhere to continue. Click the key to poke it.
- Click any object to look at it: the key says what it thinks it is, then the narrator corrects it. Once revoked, some objects get a sadder key line. Data lives in `LOOKS`, per scene.
- The key never makes a choice. The player's only choice is at a split, when the key is copied: pick which key to follow.
- **Back** steps back one line. **Back to the last split** returns to the last fork.
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

## Look

320×200 canvas scenes drawn in code and quantized to a 256-colour VGA palette with ordered dithering. Dialogue text is Comic Sans (Comic Neue fallback); status and buttons use VT323. Nothing blinks or moves on its own.
