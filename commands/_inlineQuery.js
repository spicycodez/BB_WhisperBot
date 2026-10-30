/*CMD
  command: /inlineQuery
  help: Handle @wisspbot inline searches — validate target + message, store whisper, return Reveal card
  need_reply: false
CMD*/

// Special Bots.Business command: runs whenever anyone types
// "@wisspbot <query>" in any chat.
//
// Behavior:
//   • Empty query      → how-to card with a button to open the bot privately
//   • Invalid query    → error card explaining the right format
//   • Valid query      → store whisper, return a card that names the
//                        recipient and carries the "👁 ʀᴇᴠᴇᴀʟ ᴡʜɪsᴘᴇʀ" button.
//                        The preview (description) shows ~30 chars of the
//                        message in Telegram's inline result list ONLY;
//                        the posted card never contains the message text.

if (!request || !request.id) { return; }

var SC = Libs.WhisperBot;
var W  = Libs.WhisperStore;

var query = request.query || "";
var parsed = W.parseQuery(query, SC);

var results = [];

if (!query || !query.trim()) {
  // Empty query → how-to card
  results.push({
    type: "article",
    id: "how-to",
    title: SC.toSmallCaps("Whisper Bot — how to use"),
    description: SC.toSmallCaps("Tap to see the syntax"),
    input_message_content: {
      message_text:
        SC.toSmallCaps("How to whisper") + "\n" +
        SC.scDivider() + "\n" +
        "@wisspbot " + SC.toSmallCaps("@username your secret message") + "\n" +
        "@wisspbot " + SC.toSmallCaps("123456789 your secret message") + "\n" +
        SC.scDivider() + "\n" +
        SC.toSmallCaps("Only the target can reveal the message — it pops up privately."),
      parse_mode: null
    },
    reply_markup: {
      inline_keyboard: [[
        { text: SC.toSmallCaps("Open bot privately"), url: "https://t.me/" + SC.BOT_USERNAME }
      ]]
    }
  });
} else if (!parsed.ok) {
  // Invalid query → error card
  results.push({
    type: "article",
    id: "error-" + Math.floor(Math.random() * 1e9).toString(36),
    title: SC.toSmallCaps("Invalid whisper — tap for help"),
    description: SC.toSmallCaps("Wrong target or message"),
    input_message_content: {
      message_text:
        SC.toSmallCaps("Could not send whisper") + "\n" +
        SC.scDivider() + "\n" +
        parsed.error + "\n" +
        SC.scDivider() + "\n" +
        SC.toSmallCaps("Syntax:") + "\n" +
        "@wisspbot " + SC.toSmallCaps("@username your message") + "\n" +
        "@wisspbot " + SC.toSmallCaps("123456789 your message"),
      parse_mode: null
    }
  });
} else {
  // Valid → store whisper, return card
  var id = W.storeWhisper(parsed, user);
  var label = parsed.target_type === "username"
    ? "@" + parsed.target_value
    : "#" + parsed.target_value;

  // Card body (sent into the chat when result is picked) — names the
  // recipient only, never the message text.
  var card =
    SC.toSmallCaps("Whisper for") + " " + SC.toSmallCaps(label) + "\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps("Tap reveal to see — only the target can view") + " 🔒\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps("Sent via") + " @wisspbot";

  // Description shows in Telegram's inline result list (the dropdown
  // above the input field) — roughly 30 chars of the message so the
  // SENDER sees a confirmation of what they're about to send.
  var preview = SC.toSmallCaps("Message:") + " " +
                SC.truncate(parsed.message, 30);

  results.push({
    type: "article",
    id: id,
    title: SC.toSmallCaps("Whisper for") + " " + SC.toSmallCaps(label),
    description: preview,
    input_message_content: {
      message_text: card,
      parse_mode: null
    },
    reply_markup: {
      inline_keyboard: [[
        { text: "👁 " + SC.toSmallCaps("Reveal whisper"), callback_data: "/reveal " + id }
      ]]
    }
  });
}

Api.answerInlineQuery({
  inline_query_id: request.id,
  results: results,
  cache_time: 0,
  is_personal: true
});
