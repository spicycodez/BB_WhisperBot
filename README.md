# 🤫 Whisper Bot — Premium (Bots.Business / BJS)

> Send anonymous inline whispers in **any** Telegram chat. The recipient sees only a card with a **👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ** button. When they tap it, the message pops up privately on their device — **nothing is posted in the chat**. Perfect for groups, games and surprise compliments. ✨

Every line of text the bot sends is rendered in **small caps** (Unicode small caps, e.g. `ᴡʜɪsᴘᴇʀ ʙᴏᴛ`). `/commands` and preserved handles (`@wisspbot`, `@BotFather`) are kept verbatim so they remain tappable Telegram links.

---

## ✨ Features

### Multilingual UI — /lang (12 languages)

`/lang` opens a 2-column picker (English, हिन्दी, বাংলা, தமிழ், اردو, Español, Português, العربية, Русский, Indonesia, Français, Deutsch). The choice is **saved against the user's account** (`user_<id>.lang`) and drives `/start`, `/help`, `/id`, `/create_whisper`, the catch-all and the language screens themselves — the confirmation even arrives in the newly picked language. Inline whisper cards and reveal popups stay English on purpose: they are shown in group chats to mixed audiences.

Deep links: `t.me/wisspbot?start=help` opens the help screen, `t.me/wisspbot?start=lang` opens the language picker directly.

### Instant inline dropdown (no "slow bot" feel)

Telegram re-fires the inline query on **every keystroke**. The handler is built for that:

- Before answering it only does the minimum (parse + save the whisper record — 2 storage ops)
- Registration, counters and the global list run **after** `Api.answerInlineQuery`
- `cache_time: 0` + `is_personal: true` keep every user's results fresh
- A target with no message yet shows a **✍️ composing card** ("Whisper for @Maxim") instead of an error, so typing feels live

### Smart inline cards

| Input | Card |
|---|---|
| `@wisspbot` (nothing else) | **❌ ɪɴᴠᴀʟɪᴅ ᴡʜɪsᴘᴇʀ! ᴘʟᴇᴀsᴇ ᴄʀᴇᴀᴛᴇ ᴀɴᴏᴛʜᴇʀ ᴏɴᴇ** + full syntax `@wisspbot @username your message` (handle on the left, what to type on the right — exactly where the user typed the handle) |
| invalid target / message too long | same invalid card, the reason in the dropdown description |
| valid target, no message | ✍️ composing preview with the target's original case |
| valid whisper | 💌 whisper card + 👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ button |

Every invalid/composing card carries a **❓ ʙᴏᴛ ʜᴇʟᴘ** button (deep link to `?start=help`) and a **🆕 sᴛᴀʀᴛ ᴏᴠᴇʀ** button that re-opens inline mode in the same chat.

### Original-case names

Targets and senders keep **the exact case the sender typed**: whisper to `@Maxim` and the card, the dropdown title and the reveal popups all show `@Maxim` — never `@ᴍᴀxɪᴍ`. Matching on reveal stays case-insensitive (`@MAXIM`, `@maxim`, `@Maxim` all match).

### Bot logo in the inline dropdown

`assets/bot_logo.png` (speech-bubble + padlock mark) is served from the repo's raw URL and attached as `thumb_url` on **every** inline result — it replaces Telegram's default letter avatar in the dropdown.

### Zero-spam menu navigation

All menus live in **one self-updating message**. When you tap a button (Help, My id, Create whisper, etc.), the current message is edited in place — no new message is sent:

- Photo menu (`/start` direct command) → sends one photo message
- Subsequent navigation → `editMessageCaption` updates the caption + keyboard in place (photo stays as a permanent header)
- Text-menu navigation → `editMessageText` updates text + keyboard in place
- Direct typed commands (e.g. `/help`) → still send a new message, since there's no prior bot message to edit

This keeps the chat clean — no message spam from menu navigation.

### Whisper mechanism

| Feature | How it works |
|---|---|
| **Inline-only** | Users type `@wisspbot @username message` in *any* chat — no `/command` needed in the chat |
| **Two target formats** | `@username` (5–32 chars) **or** numeric Telegram ID (5–15 digits) |
| **8-char whisper id** | Collision-checked random id like `ab12cd34` |
| **Validation** | Target must be valid @username or 5–15 digit id; message 1–800 chars; invalid input returns the ❌ invalid-whisper card with reason + syntax + help button |
| **Card never leaks message** | The posted card names the recipient only. Message preview (~40 chars) appears in Telegram's inline result list, not on the card |
| **Reveal popup** | Only target/sender/owner/sudo can reveal — `Api.answerCallbackQuery({ show_alert: true })` popup, never a chat message |
| **One-time view counter** | Each reveal bumps `view_count` and `whisper_count_revealed` |
| **Popup truncation** | Telegram popups cap at ~195 chars; long messages are truncated with `…` |
| **Logger chat** | Optional: every successful reveal is logged to `LOGGER_CHAT_ID` |

### Storage

| Store | Cap | Purpose |
|---|---|---|
| `whisper_<id>` | — | One whisper object: id, target, target_display (original case), message, sender, date, view_count |
| `user_<tid>` | — | One user object: telegramid, name, username, join_date, whisper_count, inline_count, **lang** (from /lang) |
| `global_whispers` | 2000 newest | Global whisper index |
| `users_index` | — | All registered telegramids (registration order) |

### Normal-user commands

| Command | What it does |
|---|---|
| `/start` | Photo menu with usage examples, 6 buttons (create / try in group / help / my id / **language** / share bot), registers user, notifies owner on first start. Deep links: `?start=help`, `?start=lang`. All menus edit-in-place (zero spam) |
| `/create_whisper` (alias `/whisper`) | Instructions + button to open inline mode in the current chat |
| `/lang` | Pick the language the bot speaks to you in (12 languages) — choice saved to your account |
| `/lang_set <code>` | Button target that saves the language and confirms in that language |
| `/help` | What a whisper is, exact inline syntax, how revealing works, 3 practical tips — in the user's language |
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

- **`libs/WhisperBot.js`** — `OWNER_ID`, `SUDO_USERS`, `LOGGER_CHAT_ID`, `BOT_USERNAME`, `START_PHOTO_URL`, `BOT_ICON_URL` constants. Exports `toSmallCaps`, `scDivider`, `escapeHtml`, `truncate`, `isOwner`, `isSudo`, `isOwnerOrSudo`, `isLoggingEnabled`, `editOrSend` (smart edit helper), `logReveal`, `ackCallback`.
- **`libs/WhisperStore.js`** — `parseQuery` (returns `target_display` with original case), `generateId`, `registerUser`, `getUser`, `createWhisperRecord` (fast pre-answer save), `bumpInlineStats` (post-answer bookkeeping), `storeWhisper`, `getWhisper`, `deleteWhisper`, `incrementViewCount`, `listGlobalWhispers`, `bumpCounter`, `getCounter`, `getTodayCount`, `todayStr`, `topWhisperSenders`, `topInlineSenders`, `totalUsers`, `listUsersPage`, `exportAllUsers`.
- **`libs/WhisperI18n.js`** — 12-language string table, `get`/`set` (language saved to `user_<id>.lang`), and ready-made screens: `pickText`, `langGrid`, `setText`, `helpBody`.

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
├── assets/
│   └── bot_logo.png                  # logo used as inline thumb_url
├── commands/
│   ├── _start.js                     # /start        — photo menu, deep links, registers user
│   ├── _create_whisper.js            # /create_whisper + /whisper alias
│   ├── _lang.js                      # /lang         — language picker (12 languages)
│   ├── _lang_set.js                  # /lang_set     — saves language to account
│   ├── _help.js                      # /help         — syntax + 3 tips (user's language)
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
│   ├── WhisperStore.js               # storage + lists + leaderboards
│   └── WhisperI18n.js                # 12-language UI translations
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
2. **Preserve** tokens starting with `/` (commands like `/start`), preserved handles (`@wisspbot`, `@BotFather`, `@userinfobot`) and `/commands` embedded in punctuation (e.g. `(/setinline)`) — these need to stay intact so Telegram renders them as tappable links.
3. **Convert** every other token: uppercase the letters first, then map `A-Z` to their Unicode small-caps equivalents (`A→ᴀ`, `B→ʙ`, …, `Z→ᴢ`).
4. **Digits, emojis, non-Latin scripts (Hindi, Arabic, Russian, …) and symbols** pass through unchanged.

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

### Change the inline logo

`BOT_ICON_URL` in `libs/WhisperBot.js` defaults to the repo's own logo:
`https://raw.githubusercontent.com/spicycodez/BB_WhisperBot/main/assets/bot_logo.png`.
Replace it with any public square image (PNG/JPG, 512×512 recommended), or set it to `""` to fall back to the start banner.

### Add a language

1. Open `libs/WhisperI18n.js`
2. Add the code to `LANG_NAMES` (flag + native name) and `ORDER` (picker grid)
3. Copy the `en` block, translate every key, add it to `STR` — the picker, saving and fallback all pick it up automatically
4. Any missing key automatically falls back to English

---

## 🔒 Security notes

- **Recipient verification is server-side.** The BJS `user` object is populated by Bots.Business from Telegram's signed callback payload — it cannot be faked by editing `callback_data`.
- **`callback_data` is input, not authorization.** Anyone can press any button; `/reveal` re-checks target/sender/owner/sudo on every tap.
- **Owner-only commands** are guarded by `Libs.WhisperBot.isOwnerOrSudo(user)` at the top of every admin command.
- **Popup truncation at ~195 chars** is a Telegram limit, not a bug. Long whispers get cut off with `…`.

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
