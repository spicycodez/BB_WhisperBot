# 🤫 Whisper Bot — Premium (Bots.Business / BJS)

> Send anonymous inline whispers in **any** Telegram chat. The recipient sees only a card with a **👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ** button. When they tap it, the message pops up privately on their device — **nothing is posted in the chat**. Perfect for groups, games and surprise compliments. ✨

Every line of text the bot sends is rendered in **small caps** (Unicode small caps, e.g. `ᴡʜɪsᴘᴇʀ ʙᴏᴛ`). `/commands` and the literal `@wisspbot` handle are preserved verbatim so they remain tappable Telegram links.

---

## ✨ Features

### Whisper mechanism

| Feature | How it works |
|---|---|
| **Inline-only** | Users type `@wisspbot @username message` in *any* chat — no `/command` needed in the chat |
| **Two target formats** | `@username` (5–32 chars) **or** numeric Telegram ID (5–15 digits) |
| **8-char whisper id** | Collision-checked random id like `ab12cd34` |
| **Validation** | Target must be valid @username or 5–15 digit id; message 1–800 chars; errors returned as inline error cards |
| **Card never leaks message** | The posted card names the recipient only. Message preview (~30 chars) appears in Telegram's inline result list, not on the card |
| **Reveal popup** | Only target/sender/owner/sudo can reveal — `Api.answerCallbackQuery({ show_alert: true })` popup, never a chat message |
| **One-time view counter** | Each reveal bumps `view_count` and `whisper_count_revealed` |
| **Popup truncation** | Telegram popups cap at ~195 chars; long messages are truncated with `…` |
| **Logger chat** | Optional: every successful reveal is logged to `LOGGER_CHAT_ID` |

### Storage

| Store | Cap | Purpose |
|---|---|---|
| `whisper_<id>` | — | One whisper object: id, target, message, sender, date, view_count |
| `user_<tid>` | — | One user object: telegramid, name, username, join_date, whisper_count, inline_count |
| `user_whispers_<tid>` | 100 newest | Per-user whisper history |
| `global_whispers` | 2000 newest | Global whisper index |
| `users_index` | — | All registered telegramids (registration order) |

### Normal-user commands

| Command | What it does |
|---|---|
| `/start` | Photo menu with usage examples, 5 buttons (create / try in group / my whispers / help / share bot), registers user, notifies owner on first start |
| `/create_whisper` (alias `/whisper`) | Instructions + button to open inline mode in the current chat |
| `/mywhispers` | User's 10 newest whispers with id, recipient, date, preview, and a per-whisper View button |
| `/mywhisper_view <id>` | Full whisper detail — only the creator (or owner) can open it |
| `/help` | What a whisper is, exact inline syntax, how revealing works, 3 practical tips |
| `/cancel` | Clears any half-finished draft (leftover — whispers are inline only, nothing to clear) |
| `/reveal`, `/whisper_target`, `/whisper_text` | Informational stubs that redirect to inline mode (`/reveal` is also the callback target for the 👁 button) |
| `/id` | Shows your Telegram ID + @username — needed for ID-based whispers |
| `*` (catch-all) | Unknown `/command` lists the mistake + menu buttons; ordinary message/photo/file answers "sᴇɴᴅ /start ᴛᴏ ᴏᴘᴇɴ ᴍᴇɴᴜ" |

### Owner-only commands (locked to `OWNER_ID = 6583017039`)

Anyone else gets `⛔ ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ`.

| Command | What it does |
|---|---|
| `/stats` | Today's date, total + today's whisper counts, total + new users, top 5 whisper creators. Buttons to refresh, top whispers, total stats |
| `/total_stats` | Pure counters: total whispers, inline whispers, all users |
| `/top_whispers` | Top 10 whisper senders with name + @username |
| `/top_inline` | Top 10 inline users, total inline count, active inline users |
| `/all_users_list [page]` | Full user list, 15 per page, with prev/next buttons; page 1 also attaches a complete JSON export |
| `/export_users` | Text list of first 20 users + full JSON export of all users |

### Shared helpers (in `libs/`)

- **`libs/WhisperBot.js`** — `OWNER_ID`, `SUDO_USERS`, `LOGGER_CHAT_ID`, `BOT_USERNAME`, `START_PHOTO_URL` constants. Exports `toSmallCaps`, `scDivider`, `escapeHtml`, `truncate`, `isOwner`, `isSudo`, `isOwnerOrSudo`, `isLoggingEnabled`, `editOrSend` (smart edit helper), `logReveal`, `ackCallback`.
- **`libs/WhisperStore.js`** — `parseQuery`, `generateId`, `registerUser`, `getUser`, `storeWhisper`, `getWhisper`, `deleteWhisper`, `incrementViewCount`, `listUserWhispers`, `listGlobalWhispers`, `bumpCounter`, `getCounter`, `getTodayCount`, `todayStr`, `topWhisperSenders`, `topInlineSenders`, `totalUsers`, `listUsersPage`, `exportAllUsers`.

Every command calls `Libs.WhisperBot.toSmallCaps(...)` on every string it sends, so the bot's voice is consistent end-to-end.

---

## 🚀 Quick start

### 1. Create the bot with BotFather

1. Open [@BotFather](https://t.me/BotFather)
2. `/newbot` → display name + username ending in `bot` (e.g. `wisspbot`)
3. Copy the **bot token**
4. **Enable inline mode**: `/setinline` → pick your bot → placeholder prompt like `Send a whisper…`

### 2. Connect to Bots.Business

1. Sign in at <https://bots.business/>
2. **+ Add new bot** → paste token
3. Verify it appears in your dashboard

### 3. Configure the bot

Edit **`libs/WhisperBot.js`** at the top — these are the only settings you should touch:

```js
var OWNER_ID       = "6583017039";     // ← your Telegram user id (already set)
var SUDO_USERS     = [];                 // ← additional admin ids as strings
var LOGGER_CHAT_ID = "0";                // ← chat id for reveal logs, or "0" to disable
var BOT_USERNAME   = "wisspbot";         // ← your bot's username (without @)
var START_PHOTO_URL = "";                // ← optional banner image URL for /start
```

Get your own Telegram ID from [@userinfobot](https://t.me/userinfobot). The `OWNER_ID` above is already set to the one you provided.

### 4. Push to GitHub

```bash
git clone https://github.com/your-user/whisper-bot-bjs.git
cd whisper-bot-bjs
# (edit libs/WhisperBot.js with your settings — already pre-filled)
git add -A
git commit -m "Initial commit: whisper bot BJS project (premium)"
git push origin main
```

### 5. Import into Bots.Business

1. Open your bot → **Settings → Git**
2. Repository URL: `https://github.com/your-user/whisper-bot-bjs`
3. Branch: `main`
4. **Import from Git** — installs the two libraries and all 18 commands

### 6. Test

- In any chat, type `@wisspbot @your_own_username you are awesome!`
- Tap the result card → it posts a teaser + **👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ** button
- Tap the button → popup with your message
- Send `/start` to `@wisspbot` in a private chat → photo menu + 5 buttons

---

## 📁 Repository structure

```
whisper-bot-bjs/
├── bot.json                          # bb_sync_version 1.0
├── commands/
│   ├── _start.js                     # /start        — photo menu, registers user
│   ├── _create_whisper.js            # /create_whisper + /whisper alias
│   ├── _mywhispers.js                # /mywhispers   — 10 newest, View buttons
│   ├── _mywhisper_view.js            # /mywhisper_view <id>
│   ├── _help.js                      # /help         — syntax + 3 tips
│   ├── _id.js                        # /id           — your Telegram id
│   ├── _cancel.js                    # /cancel       — leftover, harmless
│   ├── _reveal.js                    # /reveal       — callback + stub (dual)
│   ├── _whisper_target.js            # /whisper_target — stub
│   ├── _whisper_text.js              # /whisper_text   — stub
│   ├── _inlineQuery.js               # /inlineQuery  — SPECIAL inline handler
│   ├── _stats.js                     # /stats        — owner dashboard
│   ├── _total_stats.js               # /total_stats  — owner counters
│   ├── _top_whispers.js              # /top_whispers — owner leaderboard
│   ├── _top_inline.js                # /top_inline   — owner leaderboard
│   ├── _all_users_list.js            # /all_users_list [page]
│   ├── _export_users.js              # /export_users
│   └── _catchall.js                  # *             — catch-all
├── libs/
│   ├── WhisperBot.js                 # settings + small caps + auth + smart edit
│   └── WhisperStore.js               # storage + lists + leaderboards
├── docs/
│   ├── SETUP.md                      # detailed setup walkthrough
│   ├── BJS_API_NOTES.md              # BJS API reference used while building
│   └── EXAMPLES.md                   # usage examples + edge cases
├── README.md
├── LICENSE                           # MIT
└── .gitignore
```

---

## 🔤 Small caps styling — how it works

Every string the bot sends is passed through `Libs.WhisperBot.toSmallCaps(text)`:

1. **Tokenize** by whitespace.
2. **Preserve** tokens starting with `/` (commands like `/start`) and the literal `@wisspbot` handle — these need to stay intact so Telegram renders them as tappable links.
3. **Convert** every other token: uppercase the letters first, then map `A-Z` to their Unicode small-caps equivalents (`A→ᴀ`, `B→ʙ`, …, `Z→ᴢ`).
4. **Digits, emojis and symbols** pass through unchanged.

Result: `Whisper Bot — Premium` → `ᴡʜɪsᴘᴇʀ ʙᴏᴛ — ᴘʀᴇᴍɪᴜᴍ`, but `@wisspbot` and `/start` stay intact.

To override or extend the map, edit `SMALL_CAPS_MAP` in `libs/WhisperBot.js`.

---

## 🛠 Customize

### Change the bot username

In `libs/WhisperBot.js` set `BOT_USERNAME = "your_bot"`. The small-caps helper and every command picks it up automatically.

### Add another admin

```js
var SUDO_USERS = ["1234567890", "9876543210"];
```

### Enable reveal logging

1. Create a private Telegram channel/group
2. Add the bot as admin
3. Put the chat id in `LOGGER_CHAT_ID` (e.g. `"-1001234567890"`)
4. Every successful reveal gets a copy in that chat

### Add a banner photo for `/start`

Set `START_PHOTO_URL = "https://your.cdn/banner.jpg"` in `libs/WhisperBot.js`. The `/start` command will then send a photo with the menu as its caption. Leave empty for a text-only menu.

---

## 🔒 Security notes

- **Recipient verification is server-side.** The BJS `user` object is populated by Bots.Business from Telegram's signed callback payload — it cannot be faked by editing `callback_data`.
- **`callback_data` is input, not authorization.** Anyone can press any button; `/reveal` re-checks target/sender/owner/sudo on every tap.
- **Owner-only commands** are guarded by `Libs.WhisperBot.isOwnerOrSudo(user)` at the top of every admin command.
- **Popup truncation at ~195 chars** is a Telegram limit, not a bug. Long whispers get cut off with `…`; the full text is still accessible via `/mywhisper_view <id>` for the sender/owner.

---

## 📚 Documentation

- [`docs/SETUP.md`](docs/SETUP.md) — step-by-step setup
- [`docs/BJS_API_NOTES.md`](docs/BJS_API_NOTES.md) — BJS API reference used to build this bot
- [`docs/EXAMPLES.md`](docs/EXAMPLES.md) — usage examples and edge cases

External references:
- [Bots.Business Help](https://help.bots.business/)
- [Bots.Business: Inline buttons and inline mode](https://help.bots.business/bjs-reference/inline)
- [Bots.Business: Bot repository format](https://help.bots.business/import-and-integrations/repository-format)
- [Telegram Bot API: InlineQueryResultArticle](https://core.telegram.org/bots/api#inlinequeryresultarticle)
- [Telegram Bot API: answerCallbackQuery](https://core.telegram.org/bots/api#answercallbackquery)

---

## 📄 License

MIT — see [LICENSE](LICENSE).
