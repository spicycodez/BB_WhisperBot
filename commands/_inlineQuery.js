/*CMD
  command: /inlineQuery
  help: Handle @wisspbot inline searches — validate target + message, store whisper, return Reveal card
  need_reply: false
CMD*/

// Special Bots.Business command: runs whenever anyone types
// "@wisspbot <query>" in any chat.
//
// Behavior:
//   • Empty query      → how-to card. The DESCRIPTION shows the format
//                        directly (no need to tap "see syntax"), with
//                        a button to open the bot privately.
//   • Invalid query    → error card. The DESCRIPTION shows the actual
//                        error so the user sees it immediately in the
//                        inline dropdown.
//   • Valid query      → store whisper, return a card that names the
//                        recipient and carries the "👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ"
//                        button. The description shows ~30 chars of the
//                        message so the sender can confirm before sending.
//
// Every result carries `thumb_url` set to the bot's icon image, which
// replaces the default "W" letter avatar in Telegram's inline dropdown.

if (!request || !request.id) { return; }

var SC = Libs.WhisperBot;
var W  = Libs.WhisperStore;

var query = request.query || "";
var parsed = W.parseQuery(query, SC);

// Resolve the bot icon URL: prefer BOT_ICON_URL, fall back to START_PHOTO_URL.
var iconUrl = SC.BOT_ICON_URL || SC.START_PHOTO_URL || "";

// Helper: build an InlineQueryResultArticle with the bot icon attached.
function makeResult(props) {
  if (iconUrl) {
    props.thumb_url = iconUrl;
  }
  return props;
}

var results = [];

if (!query || !query.trim()) {
  // Empty query → how-to card. Description shows the format directly
  // (visible in the dropdown without tapping).
  results.push(makeResult({
    type: "article",
    id: "how-to",
    title: SC.toSmallCaps("Whisper Bot — how to use"),
    description: SC.toSmallCaps("Format: @wisspbot @username message"),
    input_message_content: {
      message_text:
        SC.toSmallCaps("How to whisper") + "\n" +
        SC.scDivider() + "\n" +
        "@wisspbot " + SC.toSmallCaps("@username your secret message") + "\n" +
        "@wisspbot " + SC.toSmallCaps("123456789 your secret message") + "\n" +
        SC.scDivider() + "\n" +
        SC.toSmallCaps("Only the target can reveal the message — it pops up privately.")
    },
    reply_markup: {
      inline_keyboard: [[
        { text: SC.toSmallCaps("Open bot privately"), url: "https://t.me/" + SC.BOT_USERNAME }
      ]]
    }
  }));
} else if (!parsed.ok) {
  // Invalid query → error card. Description shows the actual error
  // (truncated to fit Telegram's description field) so the user sees
  // the problem immediately without tapping.
  results.push(makeResult({
    type: "article",
    id: "error-" + Math.floor(Math.random() * 1e9).toString(36),
    title: SC.toSmallCaps("Invalid whisper — see format"),
    description: SC.truncate(parsed.error, 100),
    input_message_content: {
      message_text:
        SC.toSmallCaps("Could not send whisper") + "\n" +
        SC.scDivider() + "\n" +
        parsed.error + "\n" +
        SC.scDivider() + "\n" +
        SC.toSmallCaps("Syntax:") + "\n" +
        "@wisspbot " + SC.toSmallCaps("@username your message") + "\n" +
        "@wisspbot " + SC.toSmallCaps("123456789 your message")
    }
  }));
} else {
  // Valid → store whisper, return card
  var id = W.storeWhisper(parsed, user);

  // Display label preserves the case the SENDER typed (e.g. "@Maxim"
  // shows as "@Maxim", not "@ᴍᴀxɪᴍ"). Case-insensitive matching for
  // reveal still uses the lowercased target_value under the hood.
  var label = parsed.target_type === "username"
    ? "@" + parsed.original_value
    : "#" + parsed.target_value;

  // Card body (sent into the chat when result is picked).
  // Format per spec:
  //   🤫 sᴇᴄʀᴇᴛ ᴡʜɪsᴘᴇʀ ғᴏʀ @Maxim ✨
  //   ᴏɴʟʏ @Maxim ᴄᴀɴ ʀᴇᴠᴇᴀʟ ɪᴛ — ᴛᴀᴘ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ.
  //   ━━━━━━━━━━━━━━━━━━━━
  //   ᴛᴀᴘ 👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ ᴛᴏ ᴠɪᴇᴡ (ᴘʀɪᴠᴀᴛᴇ ᴘᴏᴘᴜᴘ) 🔒
  // Never includes the message text — only the card + Reveal button.
  var card =
    "🤫 " + SC.toSmallCaps("secret whisper for") + " " + label + " ✨\n" +
    SC.toSmallCaps("Only") + " " + label + " " +
      SC.toSmallCaps("can reveal it — tap button below.") + "\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps("Tap") + " 👁 " +
      SC.toSmallCaps("reveal whisper") + " " +
      SC.toSmallCaps("to view") + " (" + SC.toSmallCaps("private popup") + ") 🔒";

  // Title in the dropdown uses the same wording.
  var resultTitle = "🤫 " + SC.toSmallCaps("secret whisper for") + " " + label;

  // Description shows in Telegram's inline result list (the dropdown
  // above the input field) — roughly 30 chars of the message so the
  // SENDER sees a confirmation of what they're about to send.
  var preview = SC.toSmallCaps("Message:") + " " +
                SC.truncate(parsed.message, 30);

  results.push(makeResult({
    type: "article",
    id: id,
    title: resultTitle,
    description: preview,
    input_message_content: {
      message_text: card
    },
    reply_markup: {
      inline_keyboard: [[
        { text: "👁 " + SC.toSmallCaps("Reveal whisper"), callback_data: "/reveal " + id }
      ]]
    }
  }));
}

Api.answerInlineQuery({
  inline_query_id: request.id,
  results: results,
  cache_time: 0,
  is_personal: true
});
