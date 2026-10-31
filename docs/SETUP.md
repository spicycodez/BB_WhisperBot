# Detailed setup — Whisper Bot Premium (Bots.Business / BJS)

Walkthrough from zero to a fully working `@wisspbot` in your own Telegram account.

---

## Step 1 — Create the bot in BotFather

1. In Telegram, open [@BotFather](https://t.me/BotFather).
2. Send `/newbot`.
3. Choose a **display name** (e.g. "Whisper Bot Premium") and a **username** ending in `bot` (e.g. `wisspbot`).
4. BotFather replies with a **bot token** like `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`. Copy it.
5. **Enable inline mode** (mandatory):
   - Send `/setinline` to BotFather
   - Pick your bot
   - Send a placeholder prompt such as `Send a whisper to someone…`
   - BotFather confirms: "Success! Inline mode enabled."

Without inline mode enabled, typing `@wisspbot …` in any chat does nothing — the special `/inlineQuery` command never fires.

---

## Step 2 — Sign up for Bots.Business

1. Go to <https://bots.business/>
2. Click **Open web app** (or download the Android app)
3. Create an account (email + password)
4. Confirm the verification email

The **free plan** is enough for this bot — it includes up to 10 million BJS iterations per month. See <https://bots.business/pricing/>.

---

## Step 3 — Connect your bot to Bots.Business

1. Sign in to Bots.Business
2. **+ Add new bot** → paste the token from step 1
3. Verify the bot appears in your dashboard

Send `/start` to your bot in Telegram — Bots.Business's default placeholder should reply. Your own `/start` replaces it once we import.

---

## Step 4 — Configure the bot

Open `libs/WhisperBot.js` and edit the **SETTINGS** block at the top:

```js
var OWNER_ID       = "6583017039";     // ← already set to your Telegram id
var SUDO_USERS     = [];                 // ← additional admin ids as strings
var LOGGER_CHAT_ID = "0";                // ← chat id for reveal logs, or "0" to disable
var BOT_USERNAME   = "wisspbot";         // ← your bot's username (without @)
var START_PHOTO_URL = "";                // ← optional banner image URL for /start
```

### Get your Telegram ID (if not already set)

The `OWNER_ID` is already set to `6583017039` as you specified. If you ever need to verify or change it:

- Send `/id` to [@userinfobot](https://t.me/userinfobot), or
- After import, send `/id` to your own bot — it will reply with your Telegram id

### Enable reveal logging (optional)

1. Create a private Telegram channel or group (e.g. "Whisper Logs")
2. Add `@wisspbot` to it as admin (so it can post)
3. Forward a message from that channel to [@userinfobot](https://t.me/userinfobot) to learn its chat id (will look like `-1001234567890`)
4. Put that chat id in `LOGGER_CHAT_ID`

Now every successful reveal gets logged with whisper id, target, viewer, view count and a 200-char preview.

### Add a banner photo (optional)

Upload your banner image to any CDN (or use a Telegram file URL). Put the URL in `START_PHOTO_URL`. The `/start` command will then send a photo with the menu as its caption. Leave empty for a text-only menu.

---

## Step 5 — Push to GitHub

```bash
git clone https://github.com/your-user/whisper-bot-bjs.git
cd whisper-bot-bjs

# (you've already edited libs/WhisperBot.js with your settings)

git add -A
git commit -m "Initial commit: whisper bot BJS project (premium)"
git branch -M main
git remote add origin https://github.com/your-user/whisper-bot-bjs.git
git push -u origin main
```

The repo must be **public** for Bots.Business free-tier Git sync, or use a token for private repo access.

---

## Step 6 — Import into Bots.Business

1. In Bots.Business, open your bot
2. **Settings → Git**
3. Set:
   - **Repository URL**: `https://github.com/your-user/whisper-bot-bjs`
   - **Branch**: `main`
4. **Import from Git**
5. Confirm — Bots.Business will:
   - Read `bot.json`
   - Install `WhisperBot` and `WhisperStore` libraries from `libs/`
   - Create all 18 commands from `commands/_*.js`

You should see the commands listed under **Commands** and both libraries under **Libraries** in the bot dashboard.

---

## Step 7 — Verify

### Inline mode

1. Open **any** Telegram chat (group, DM, Saved Messages)
2. Type `@wisspbot @your_own_username you are awesome!`
3. A result card appears in the dropdown with title "ᴡʜɪsᴘᴇʀ ғᴏʀ @ʏᴏᴜʀ_ᴜsᴇʀɴᴀᴍᴇ" and a 30-char preview of the message
4. Tap the card → it posts into the chat with the **👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ** button
5. Tap **👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ** → popup with the full message
6. Tap again → "ᴛʜɪs ᴡʜɪsᴘᴇʀ ʜᴀs ᴇxᴘɪʀᴇᴅ ᴏʀ ᴡᴀs ᴀʟʀᴇᴀᴅʏ ʀᴇᴀᴅ."
7. Ask a friend to tap the button → "ɴᴏᴛ ғᴏʀ ʏᴏᴜ! ᴏɴʟʏ @ʏᴏᴜʀ_ᴜsᴇʀɴᴀᴍᴇ ᴄᴀɴ ᴠɪᴇᴡ." (toast, not popup)

### Private chat menu

1. Open a private chat with `@wisspbot`
2. Send `/start` → photo menu with usage examples + 4 buttons (Create whisper / Try in group / Help / My id / Share bot)
3. Tap **Try in group** → puts `@wisspbot ` into the current chat's input field
4. Tap **Share bot** → Telegram asks you to pick a chat to share the bot in
6. Tap any View button → full whisper detail
7. Send `/help` → detailed help with the 3 tips
8. Send `/id` → your Telegram id + @username
9. Send any random text → "sᴇɴᴅ /start ᴛᴏ ᴏᴘᴇɴ ᴍᴇɴᴜ"
10. Send `/nonexistent` → "ᴜɴᴋɴᴏᴡɴ ᴄᴏᴍᴍᴀɴᴅ" with menu buttons

### Zero-spam menu navigation

1. Send `/start` → photo menu appears
2. Tap **Help** → the SAME photo message's caption updates to show help text (no new message sent)
3. Tap **Home** → caption updates back to start text (still the same message)
4. Tap **My id** → caption updates to show your Telegram id
5. Tap **Home** → back to start

All navigation happens in one self-updating message — the chat stays clean.

### Owner dashboard

(Only `OWNER_ID = 6583017039` sees these — anyone else gets "ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ".)

1. Send `/stats` → today's date, totals, today's counts, top 5 whisper creators
2. Tap **Top whispers** → `/top_whispers` leaderboard
3. Tap **Total stats** → `/total_stats` pure counters
4. Send `/all_users_list` → page 1 of all users (15 per page) + JSON export as a code-block message
5. Send `/all_users_list 2` → page 2
6. Send `/export_users` → first 20 users as text + full JSON export

---

## Step 8 — Keep the repo in sync

After any edit:
- Edit locally → push to GitHub → **Import from Git** in Bots.Business
- Or edit in Bots.Business dashboard → **Export to Git** to push back to GitHub

Recommended: keep GitHub as the source of truth.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Typing `@wisspbot …` shows nothing | Inline mode not enabled in BotFather | Send `/setinline` to [@BotFather](https://t.me/BotFather) |
| Inline card appears but no Reveal button | `/reveal` command missing in Bots.Business | Re-run **Import from Git** |
| Tapping Reveal does nothing | `WhisperBot` or `WhisperStore` library not installed | Check **Libraries** tab; re-import |
| Reveal always says "not for you" | Username case mismatch, or you targeted the wrong user | Use `/id` to verify Telegram IDs; matching is case-insensitive on usernames |
| `/start` shows Bots.Business default reply | Old `/start` cached | Re-import; clear cache via **Clear cache** in the command editor |
| Owner commands say "access denied" | `OWNER_ID` in `libs/WhisperBot.js` doesn't match your Telegram id | Send `/id` to your bot, then update `OWNER_ID` and re-import |
| `users_total` not incrementing | New-user registration only fires on `/start` | Have a new user send `/start` once |
| Today counters stuck at 0 | Date rollover logic depends on `todayStr()` which uses UTC | Counters reset at 00:00 UTC |
| Photo menu doesn't appear | `START_PHOTO_URL` is empty or unreachable | Set a valid image URL, or leave empty for text menu |
