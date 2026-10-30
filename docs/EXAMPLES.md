# Usage examples & edge cases

## ✅ Working examples

### Whisper by username — works in ANY case

```
@wisspbot @USERNAME you are awesome!     ← uppercase
@wisspbot @username you are awesome!     ← lowercase
@wisspbot @UserName you are awesome!     ← mixed case
@wisspbot @Username2 you are awesome!    ← with digits
@wisspbot @UserName_02 you are awesome!  ← underscore + digits
```

All five are accepted. Telegram usernames are case-insensitive, so a whisper sent to `@USERNAME` is revealed by the user whose actual Telegram handle is `@username`, `@UserName` — any case combination. Different usernames (`@Username2` vs `@UserName_02`) do NOT cross-match — each whisper only opens for its actual owner.

The validation follows Telegram's own rules:
- 5–32 characters
- Letters `A-Z a-z`, digits `0-9`, underscores `_`
- Must start with a letter
- Must end with a letter or digit (no trailing underscore)
- No consecutive underscores

So `@12345` (starts with digit), `@_john` (starts with underscore), `@john_` (ends with underscore) and `@john__doe` (consecutive underscores) are rejected — Telegram itself would never issue these, so a whisper to them would never reach anyone.

### Whisper by numeric Telegram ID

```
@wisspbot 9876543210 see you tomorrow
```
- Target: Telegram user id `9876543210` (5–15 digits)
- Use `/id` to find your own numeric ID, or use [@userinfobot](https://t.me/userinfobot) to look up anyone's

### Empty query (just `@wisspbot`)

```
@wisspbot
```
- Returns the how-to card with a button to open the bot privately

### Long message (up to 800 chars)

```
@wisspbot @john <800-character message...>
```
- Stored in full (only the bot owner can audit whispers via `/reveal` owner override)
- Popup reveals truncate to ~195 chars with `…` (Telegram alert limit)

### Send whisper in a group

1. Open the group chat
2. Type `@wisspbot @mary congrats on the win!`
3. Tap the result card → it posts in the group
4. Only `@mary` (or the sender, or owner) can tap Reveal
5. Other group members see "ɴᴏᴛ ғᴏʀ ʏᴏᴜ! ᴏɴʟʏ @ᴍᴀʀʏ ᴄᴀɴ ᴠɪᴇᴡ." if they try

### Send whisper to yourself (Saved Messages)

1. Open Saved Messages
2. Type `@wisspbot @your_username remember to buy milk`
3. Tap → send → tap Reveal → popup with your note
4. Or use your numeric id: `@wisspbot 1234567890 remember to buy milk`


## ⚠️ Edge cases & validation

### Invalid queries → error card

| Input | Why it fails |
|---|---|
| `@wisspbot @j hi` | Username `j` is < 5 chars (Telegram minimum) |
| `@wisspbot @12345 hi` | Username starts with a digit (Telegram requires first char to be a letter) |
| `@wisspbot @_john hi` | Username starts with `_` (not allowed) |
| `@wisspbot @john_ hi` | Username ends with `_` (not allowed) |
| `@wisspbot @john__doe hi` | Consecutive underscores (not allowed) |
| `@wisspbot @john.doe hi` | `.` not allowed (only letters, digits, `_`) |
| `@wisspbot @this_is_way_too_long_for_telegram_xyz hi` | > 32 chars |
| `@wisspbot 123 hi` | Numeric id `123` is < 5 digits |
| `@wisspbot 99999999999999999 hi` | Numeric id is > 15 digits |
| `@wisspbot @john` | Missing message body |
| `@wisspbot 800-char+ message` | Message > 800 chars |

In all these cases the bot returns an inline error card listing the accepted formats: `@USERNAME`, `@username`, `@UserName`, `@Username2`, `@UserName_02`.

### Recipient has no @username

If you target `@john` but `john` deleted their username, the reveal button always says "not for you" — even for that user. Use the numeric ID format instead:
```
@wisspbot 1234567890 hi
```

### Reveal authorization

Anyone who taps **👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ** is checked against four things:

1. **Target match by username**: `user.username.toLowerCase() === whisper.target_value` (for `@username` whispers)
2. **Target match by id**: `String(user.telegramid) === whisper.target_value` (for numeric id whispers)
3. **Original sender**: `String(user.telegramid) === whisper.sender_id`
4. **Owner / sudo list**: `Libs.WhisperBot.isOwnerOrSudo(user)`

If none match → "ɴᴏᴛ ғᴏʀ ʏᴏᴜ! ᴏɴʟʏ @ᴛᴀʀɢᴇᴛ ᴄᴀɴ ᴠɪᴇᴡ." (small toast, not popup). Whisper stays alive so the real recipient can still reveal it later.

### Same whisper tapped twice

- First tap (by target/sender/owner): popup with the message → `view_count` += 1 → reveal logged if `LOGGER_CHAT_ID` set
- Second tap: popup again with `view_count` incremented
- (Whispers are NOT one-time-read in this version — they persist indefinitely)

### Whisper never tapped

- Stays in storage indefinitely (no expiry in this version)
- (The /mywhispers feature was removed; the bot owner can still reveal any whisper via the owner-override in /reveal)
- Counts as 1 in `whisper_count_total` but 0 in `whisper_count_revealed`

### Long message truncation

- Stored: full message (up to 800 chars)
- Popup reveal: truncated to ~195 chars with `…` (Telegram alert limit)
- (Removed: /mywhispers and /mywhisper_view)

There is no automatic "deliver the rest via DM" fallback in this version. If you need it, modify `/reveal` to call `Bot.sendMessageToChatWithId(user.telegramid, fullMessage)` when the message is > 195 chars.

---

## 🎮 Group game ideas

### Mafia / Werewolf

- Moderator whispers role assignments: `@wisspbot @alice you are the seer`
- Each player taps Reveal → sees their role privately → no one else in the group knows

### Anonymous Q&A

- Members whisper questions to the host: `@wisspbot @host what's your favorite movie?`
- Host reveals each privately and reads them aloud
- Senders stay anonymous in the chat

### Secret Santa hints

- Each participant whispers a hint to their assigned recipient
- Recipient reveals → gets a hint about who their Santa is

### Compliment train

- Group members whisper compliments about each other
- Recipients reveal privately → smiles, no one else in the group sees the text

---

## 🧪 Self-test checklist

After deploying, verify all of these:

### Inline mode
- [ ] `@wisspbot` alone → how-to card with "Open bot privately" button
- [ ] `@wisspbot @your_username hello` → whisper card with **👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ** button
- [ ] Tapping the card sends the teaser into the chat (no message text)
- [ ] Tapping **👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ** as the target → popup with "hello"
- [ ] Tapping as a stranger → "ɴᴏᴛ ғᴏʀ ʏᴏᴜ! ᴏɴʟʏ @ʏᴏᴜʀ_ᴜsᴇʀɴᴀᴍᴇ ᴄᴀɴ ᴠɪᴇᴡ." toast
- [ ] `@wisspbot 12345` (bad id, < 5 digits) → error card
- [ ] `@wisspbot @john` (no message) → error card

### Private chat
- [ ] `/start` → photo menu (or text menu if no photo URL) + 4 buttons (Create / Try / Help / My id / Share)
- [ ] `/start` from a brand new user → owner gets a "ɴᴇᴡ ᴜsᴇʀ ᴀʀʀɪᴠᴇᴅ" DM
- [ ] **Create whisper** button → /create_whisper page
- [ ] **Try in group** button → puts `@wisspbot ` in the input field
- [ ] **Help** → /help with 3 tips
- [ ] **Share bot** → Telegram share chat picker
- [ ] `/id` → your Telegram ID and @username
- [ ] `/help` → detailed instructions
- [ ] `/cancel` → "ɴᴏᴛʜɪɴɢ ᴛᴏ ᴄᴀɴᴄᴇʟ"
- [ ] `/nonexistent` → "ᴜɴᴋɴᴏᴡɴ ᴄᴏᴍᴍᴀɴᴅ" with menu buttons
- [ ] random text → "sᴇɴᴅ /start ᴛᴏ ᴏᴘᴇɴ ᴍᴇɴᴜ"
- [ ] photo/sticker → "sᴇɴᴅ /start ᴛᴏ ᴏᴘᴇɴ ᴍᴇɴᴜ"

### Owner only
- [ ] `/stats` → dashboard with today's date, totals, today counts, top 5
- [ ] `/total_stats` → pure counters
- [ ] `/top_whispers` → top 10 senders
- [ ] `/top_inline` → top 10 inline users
- [ ] `/all_users_list` → page 1 of users + JSON export
- [ ] `/all_users_list 2` → page 2
- [ ] `/export_users` → first 20 + full JSON export
- [ ] Non-owner sending `/stats` → "ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ"

### Small caps styling
- [ ] Every message the bot sends uses small caps (e.g. "ᴡʜɪsᴘᴇʀ ʙᴏᴛ")
- [ ] `/commands` in messages are preserved as `/start` (not `/sᴛᴀʀᴛ`)
- [ ] `@wisspbot` is preserved as `@wisspbot` (not `@ᴡɪssᴘʙᴏᴛ`)
- [ ] Other @usernames in messages ARE converted (e.g. `@john` → `@ᴊᴏʜɴ`)
