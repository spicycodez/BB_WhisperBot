/*CMD
  command: /mywhisper_view
  help: Show one whisper in full — only the creator or owner can open it
  need_reply: false
  aliases: mywhisper_view
CMD*/

var SC = Libs.WhisperBot;
var W  = Libs.WhisperStore;
SC.ackCallback();

var id = (params || "").trim();
if (!id) {
  SC.editOrSend(SC.toSmallCaps("Usage: /mywhisper_view <id>"), [[
    { text: SC.toSmallCaps("My whispers"), callback_data: "/mywhispers" },
    { text: SC.toSmallCaps("Home"), callback_data: "/start" }
  ]]);
  return;
}

var whisper = W.getWhisper(id);
if (!whisper) {
  SC.editOrSend(SC.toSmallCaps("Whisper not found or expired."), [[
    { text: SC.toSmallCaps("My whispers"), callback_data: "/mywhispers" },
    { text: SC.toSmallCaps("Home"), callback_data: "/start" }
  ]]);
  return;
}

// Authorization: only the original sender or the owner/sudo list.
var isSender  = !!(user && user.telegramid &&
                   String(user.telegramid) === String(whisper.sender_id));
var isPriv    = SC.isOwnerOrSudo(user);

if (!isSender && !isPriv) {
  SC.editOrSend(SC.toSmallCaps("Access denied — you can only view your own whispers."), [[
    { text: SC.toSmallCaps("My whispers"), callback_data: "/mywhispers" },
    { text: SC.toSmallCaps("Home"), callback_data: "/start" }
  ]]);
  return;
}

var targetLabel = whisper.target_type === "username"
  ? "@" + whisper.target_value
  : "#" + whisper.target_value;

var dateStr = formatDate(whisper.created_at);

var body =
  SC.toSmallCaps("Whisper detail") + " 📄\n" +
  SC.scDivider() + "\n" +
  "• " + SC.toSmallCaps("id") + ": " + whisper.id + "\n" +
  "• " + SC.toSmallCaps("recipient") + ": " + SC.toSmallCaps(targetLabel) + "\n" +
  "• " + SC.toSmallCaps("date") + ": " + dateStr + "\n" +
  "• " + SC.toSmallCaps("views") + ": " + (whisper.view_count || 0) + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Message") + ":\n" +
  SC.toSmallCaps(whisper.message);

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("Back to list"), callback_data: "/mywhispers" },
  { text: SC.toSmallCaps("Home"), callback_data: "/start" }
]]);

function formatDate(ms) {
  if (!ms) { return "—"; }
  var d = new Date(ms);
  if (isNaN(d.getTime())) { return "—"; }
  var y = d.getUTCFullYear();
  var m = d.getUTCMonth() + 1; if (m < 10) m = "0" + m;
  var day = d.getUTCDate();    if (day < 10) day = "0" + day;
  var h = d.getUTCHours();     if (h < 10) h = "0" + h;
  var min = d.getUTCMinutes(); if (min < 10) min = "0" + min;
  return y + "-" + m + "-" + day + " " + h + ":" + min;
}
