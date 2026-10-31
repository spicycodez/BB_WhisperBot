/*CMD
  command: /inlineQuery
  help: Handle @wisspbot inline searches — invalid cards, live composing preview, whisper cards, instant answers
  need_reply: false
CMD*/

// Special Bots.Business command: runs whenever anyone types
// "@wisspbot <query>" in any chat. Telegram fires it again on EVERY
// keystroke, so this command is built for speed:
//
//   • The ONLY storage work before answering is createWhisperRecord()
//     (2 ops) — everything else (counters, registration, global list)
//     happens AFTER Api.answerInlineQuery via bumpInlineStats(). This
//     is why the dropdown updates instantly while typing.
//   • cache_time: 0 + is_personal: true → Telegram always re-asks us,
//     per user, so the preview keeps up with the keyboard.
//
// Cards:
//   • Empty query        → "❌ Invalid whisper! please create another one"
//                          with the full syntax (bot handle on the LEFT,
//                          target + message on the RIGHT — exactly where
//                          the user just typed the handle) and a button
//                          that opens the bot's /help.
//   • Invalid target     → same invalid card, description shows the reason.
//   • Target, no message → ✍️ live composing card ("Whisper for @Maxim")
//                          so the sender sees progress while typing.
//   • Valid query        → 💌 whisper card naming the recipient with
//                          ORIGINAL case ("@Maxim", never "@ᴍᴀxɪᴍ"),
//                          carrying the "👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ" button.
//
// Every result carries `thumb_url` set to the bot logo image, which
// replaces the default "W" letter avatar in Telegram's inline dropdown.

if (!request || !request.id) { return; }

var SC = Libs.WhisperBot;
var W  = Libs.WhisperStore;

var query  = request.query || "";
var sender = user || request.from || null;
var iconUrl = SC.BOT_ICON_URL || SC.START_PHOTO_URL || "";
var HELP_URL = "https://t.me/" + SC.BOT_USERNAME + "?start=help";

// Helper: build an InlineQueryResultArticle with the bot logo attached.
function makeResult(props) {
  if (iconUrl) { props.thumb_url = iconUrl; }
  return props;
}

// ---------- shared card pieces ----------

// The requested title, small-caps styled.
var INVALID_TITLE = SC.toSmallCaps("Invalid whisper! please create another one");

// Syntax line — the bot handle stays VERBATIM on the left, and the
// placeholder for what the user should type sits on the RIGHT of it,
// exactly where they typed the handle.
var SYNTAX_LINE =
  SC.toSmallCaps("Syntax") + ": @wisspbot " +
  SC.toSmallCaps("@username your message");

// Buttons on every invalid/composing card: deep link to the bot's help
// (?start=help opens the bot privately on the help screen) + a shortcut
// that restarts typing right here in the same chat.
var helpKeyboard = [[
  { text: "❓ " + SC.toSmallCaps("Bot help"), url: HELP_URL },
  { text: "🆕 " + SC.toSmallCaps("Start over"), switch_inline_query_current_chat: "@wisspbot " }
]];

function invalidCardText(reason) {
  return (
    "❌ " + INVALID_TITLE + "\n" +
    SC.scDivider() + "\n" +
    (reason ? reason + "\n" + SC.scDivider() + "\n" : "") +
    SYNTAX_LINE + "\n" +
    SC.toSmallCaps("Target first, then a space, then your message.")
  );
}

var results = [];

if (!query || !query.trim()) {
  // ---- EMPTY QUERY: the user typed @wisspbot and nothing else ----
  // Invalid card whose DESCRIPTION is the syntax itself, so the format
  // is visible right in the dropdown next to what they typed.
  results.push(makeResult({
    type: "article",
    id: "inv-e" + Math.floor(Math.random() * 1e9).toString(36),
    title: INVALID_TITLE,
    description: SYNTAX_LINE,
    input_message_content: { message_text: invalidCardText("") },
    reply_markup: { inline_keyboard: helpKeyboard }
  }));
} else {
  var parsed = W.parseQuery(query, SC);

  if (!parsed.ok && !parsed.target_display) {
    // ---- INVALID QUERY (bad target / message too long / junk) ----
    // Description shows the actual reason so the user sees the problem
    // immediately in the dropdown.
    results.push(makeResult({
      type: "article",
      id: "inv-" + Math.floor(Math.random() * 1e9).toString(36),
      title: INVALID_TITLE,
      description: SC.truncate(parsed.error, 100),
      input_message_content: { message_text: invalidCardText(parsed.error) },
      reply_markup: { inline_keyboard: helpKeyboard }
    }));
  } else if (!parsed.ok && parsed.target_display) {
    // ---- COMPOSING: valid target typed, message not started yet ----
    // Live preview card — updates on every keystroke, so the bot feels
    // instant while the user is still typing. Nothing is stored.
    var tag = parsed.target_display;
    results.push(makeResult({
      type: "article",
      id: "comp-" + Math.floor(Math.random() * 1e9).toString(36),
      title: "✍️ " + SC.toSmallCaps("Whisper for") + " " + tag,
      description: SC.toSmallCaps("Keep typing your message after the target") + " 💬",
      input_message_content: {
        message_text:
          "✍️ " + SC.toSmallCaps("Composing whisper for") + " " + tag + "\n" +
          SC.scDivider() + "\n" +
          SC.toSmallCaps("Keep typing your message after the target") + " 💬\n" +
          SC.scDivider() + "\n" +
          SYNTAX_LINE
      },
      reply_markup: { inline_keyboard: helpKeyboard }
    }));
  } else {
    // ---- VALID: store (fast path) → answer → stats ----
    var id = W.createWhisperRecord(parsed, sender);

    // Original-case display tag: "@Maxim" for usernames, "#123456789" for ids.
    var targetTag = parsed.target_type === "username"
      ? parsed.target_display
      : "#" + parsed.target_display;

    // Posted card — names the recipient with the case the SENDER typed,
    // never reveals the message text here.
    var card =
      "💌 " + SC.toSmallCaps("Whisper for") + " " + targetTag + "\n" +
      SC.scDivider() + "\n" +
      SC.toSmallCaps("🔒 Only") + " " + targetTag + " " +
      SC.toSmallCaps("can reveal this message") + "\n" +
      SC.scDivider() + "\n" +
      SC.toSmallCaps("🕊 Sent via") + " @wisspbot";

    // Dropdown preview — live message confirmation for the sender.
    var preview = "💬 " + SC.toSmallCaps(SC.truncate(parsed.message, 40));

    results.push(makeResult({
      type: "article",
      id: id,
      title: "💌 " + SC.toSmallCaps("Whisper for") + " " + targetTag,
      description: preview,
      input_message_content: { message_text: card },
      reply_markup: {
        inline_keyboard: [[
          { text: "👁 " + SC.toSmallCaps("Reveal whisper"), callback_data: "/reveal " + id }
        ]]
      }
    }));

    // ANSWER FIRST — the dropdown gets the card now...
    Api.answerInlineQuery({
      inline_query_id: request.id,
      results: results,
      cache_time: 0,
      is_personal: true
    });

    // ...THEN all the bookkeeping (registration, counters, global list).
    // Moving this after the answer is a big part of the perceived-speed
    // fix: typing never waits on storage writes it doesn't need.
    W.bumpInlineStats(id, sender);
    return;
  }
}

// Non-valid paths answer here (nothing stored, nothing to count).
Api.answerInlineQuery({
  inline_query_id: request.id,
  results: results,
  cache_time: 0,
  is_personal: true
});
