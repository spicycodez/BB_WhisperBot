# BJS API notes — what was used to build this bot

Reference notes extracted from the official Bots.Business help while building the whisper bot. Useful when extending the project.

---

## Repository format

Source: <https://help.bots.business/import-and-integrations/repository-format>

```
bot.json
commands/
  _start.js          # filename → /start (leading _ becomes /)
  hello.js           # filename → command "hello"
  support/
    _help.js         # folder + filename → /help in folder "support"
libs/
  WhisperStore.js    # library installed as name "WhisperStore"
```

### `bot.json`

```json
{
  "bb_sync_version": "1.0",
  "name": "ExampleBot",
  "csv_url": null
}
```

`bb_sync_version` MUST be `"1.0"`. `name` updates the bot's internal name. `csv_url` is for CSV command imports. The Telegram token is **not** in this file.

### Command file format

```js
/*CMD
  command: /start
  help: Start the example bot
  need_reply: false
  aliases: /hello
CMD*/
Bot.sendMessage("Welcome!");
```

Supported header keys: `command`, `aliases`, `help`, `need_reply`, `auto_retry_time`, `folder`, `answer`, `keyboard`, `group`.

Multiline `answer`:

```js
/*CMD
  command: /help
  <<ANSWER
Send /start to begin.
Send /help to see this message again.
  ANSWER
CMD*/
```

### Library file format

```js
function greeting() { return "Hello"; }
publish({ greeting });
```

Called as: `Libs.WhisperStore.greeting()` (where `WhisperStore` is the filename without `.js`).

---

## Inline mode — `/inlineQuery`

Source: <https://help.bots.business/bjs-reference/inline>

The special command name `/inlineQuery` is invoked whenever a user types `@YourBotUsername <query>` in any Telegram chat. BotFather's `/setinline` must be enabled first.

```js
// Command: /inlineQuery
if (!request || !request.id) { return; }
var query = request.query || "";
Api.answerInlineQuery({
  inline_query_id: request.id,
  results: [{
    type: "article",
    id: "help-result",
    title: "Send a greeting",
    description: "Tap to send",
    input_message_content: { message_text: "Hello from this bot!" },
    reply_markup: {
      inline_keyboard: [[
        { text: "Reveal", callback_data: "/reveal abc123" }
      ]]
    }
  }],
  cache_time: 0,
  is_personal: true
});
```

Key fields:
- `request.id` — inline query id (pass to `Api.answerInlineQuery`)
- `request.query` — the text the user typed after `@bot_username`
- `request.from` — user object of the searcher
- `cache_time: 0` — never cache (each whisper needs a fresh id)
- `is_personal: true` — results are tied to the searching user

`InlineQueryResultArticle` full schema: <https://core.telegram.org/bots/api#inlinequeryresultarticle>

---

## Callback queries — buttons trigger commands

Source: <https://help.bots.business/bjs-reference/inline>

When a user taps an inline button, Bots.Business treats the button's `callback_data` as a command name and runs it. So `callback_data: "/reveal abc123"` triggers the `/reveal` command with `params === "abc123"`.

```js
// Command: /reveal
if (!request || !request.id || !request.data) { return; }
Api.answerCallbackQuery({
  callback_query_id: request.id,
  text: "🤫 Whisper revealed",
  show_alert: true       // ← true = popup, false = small toast
});
```

Key fields:
- `request.id` — callback query id (pass to `Api.answerCallbackQuery`)
- `request.data` — the raw callback data (e.g. `/reveal abc123`)
- `params` — the part after the command name (e.g. `abc123`)
- `request.message.message_id` — message containing the button (when in a chat)
- `request.message.chat.id` — chat of that message
- `request.inline_message_id` — identifier for inline-mode messages (no chat context)

`show_alert: true` shows the text as a full-screen popup; `false` (or omitted) shows it as a small toast at the top of the screen.

---

## Sending messages + inline keyboards

### High-level helpers

```js
Bot.sendMessage("Hello!");                          // plain message
Bot.sendMessage("text", { parse_mode: "Markdown" });

Bot.sendInlineKeyboard([
  { title: "Help", command: "/help" },
  { title: "Website", url: "https://bots.business/" }
], "Choose an option:");
```

Note: `Bot.sendInlineKeyboard` uses `{ title, command, url }` button shape — different from Telegram's raw `{ text, callback_data }`.

### Raw Telegram API (`Api.*`)

For full control (and what we use in this project for the `/start` menu):

```js
Api.sendMessage({
  chat_id: chat.chatid,                  // optional; defaults to current chat
  text: "Welcome!",
  parse_mode: null,                       // null = plain text, "Markdown" or "HTML"
  reply_markup: {
    inline_keyboard: [
      [
        { text: "📖 Help", callback_data: "/help" },
        { text: "🌐 Site", url: "https://bots.business/" }
      ]
    ]
  }
});
```

For `answerInlineQuery` and `answerCallbackQuery` you MUST use `Api.*` — there is no `Bot.*` shortcut.

---

## Storage — properties

Source: <https://help.bots.business/bjs-reference/user-and-bot-properties>

BJS does not support a true in-memory dict across iterations (each command execution is a fresh sandbox). The Bots.Business-native equivalent is `Bot.setProperty` / `Bot.getProperty` with a `type`.

```js
// Bot-wide property
Bot.setProperty("TotalScore", 100, "integer");
var score = Bot.getProperty("TotalScore");      // → 100 (number)
Bot.deleteProperty("TotalScore");

// JSON object storage
Bot.setProperty("whisper_lw1abc", {
  target_type: "username",
  target_value: "john",
  message: "hi",
  created_at: Date.now()
}, "json");
var w = Bot.getProperty("whisper_lw1abc");      // → parsed object
```

Supported types: `integer`, `float`, `string`, `text`, `json`, `datetime`, `boolean`, `list`.

Per-user equivalent: `User.setProperty(name, value, type)` and `User.getProperty(name)`.

This project stores each whisper under `whisper_<id>` as `json`, and two integer counters as `whisper_count_sent` and `whisper_count_revealed`.

---

## User context — `user` object

```js
user.id            // Bots.Business internal user id (NOT Telegram id)
user.telegramid    // Telegram numeric user id (as a string)
user.username      // Telegram @username without the leading @ (may be undefined)
user.first_name
user.last_name
user.language_code
```

For callback queries, Bots.Business sets `user` to the user who pressed the button. So `user.telegramid` and `user.username` in `/reveal` identify the tapper — verified by Telegram's signed callback payload, not by anything in `callback_data`.

To check admin status:
```js
var ADMIN_TELEGRAM_ID = "123456789";
if (!user || !user.telegramid ||
    String(user.telegramid) !== ADMIN_TELEGRAM_ID) {
  return;
}
```

---

## Important BJS sandbox rules

Source: <https://help.bots.business/bjs-reference/security>

BJS is **not** Node.js or browser JS. The following are NOT available:
- `require` / CommonJS / ESM imports
- Filesystem access (`fs`, `path`)
- Browser DOM APIs
- Promises / `async`/`await` at top level
- `queueMicrotask`, `Function` constructor, `Proxy`, `WebAssembly`
- `eval` on user input (forbidden for security)

Use BJS callbacks (`Bot.run`, `Bot.runCommand`, scheduled commands) instead.

Also: do not cache commands that grant access or perform one-time operations — cache replay and retries must not repeat a one-time side effect. (This is why `/reveal` deletes the whisper before any caching could replay it.)

---

## HTTP requests (if you ever need external storage)

BJS supports HTTP fetches via the `->(url)` directive in a separate command scenario, or via `HTTP.get` / `HTTP.post` inside BJS code (see HTTP reference). This project does not use HTTP — all storage is local to Bots.Business properties — but if you want to back whispers with your own Redis/Postgres, swap the bodies of `storeWhisper`, `getWhisper`, `deleteWhisper` in `libs/WhisperStore.js` for HTTP calls.

⚠️ Per Bots.Business security docs: the current BJS HTTP transport does not validate HTTPS server certificates. Do not rely on HTTPS alone for confidential communication.
