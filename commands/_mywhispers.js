/*CMD
  command: /mywhispers
  help: The user's 10 newest whispers with id, recipient, date, preview, and a per-whisper View button
  need_reply: false
  aliases: mywhispers
CMD*/

var SC = Libs.WhisperBot;
var W  = Libs.WhisperStore;
SC.ackCallback();

if (!user || !user.telegramid) {
  SC.editOrSend(SC.toSmallCaps("Could not read your account info."), [[
    { text: SC.toSmallCaps("Home"), callback_data: "/start" }
  ]]);
  return;
}

var whispers = W.listUserWhispers(String(user.telegramid), 10);

if (!whispers.length) {
  SC.editOrSend(
    SC.toSmallCaps("You haven't sent any whispers yet") + " 🤫\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps("Whispers are inline only — type in any chat:") + "\n" +
    "@wisspbot " + SC.toSmallCaps("@username your message"),
    [[
      { text: SC.toSmallCaps("Create whisper"), switch_inline_query_current_chat: "@wisspbot " }
    ], [
      { text: SC.toSmallCaps("Home"), callback_data: "/start" }
    ]]
  );
  return;
}

var body =
  SC.toSmallCaps("Your whispers (10 newest)") + " 📜\n" +
  SC.scDivider() + "\n";

var keyboard = [];
for (var i = 0; i < whispers.length; i++) {
  var w = whispers[i];
  var targetLabel = w.target_type === "username"
    ? "@" + w.target_value
    : "#" + w.target_value;
  var dateStr = formatDate(w.created_at);
  var preview = SC.truncate(w.message, 30);

  body += (i + 1) + ". " + SC.toSmallCaps("id") + ": " + w.id + "\n" +
          "   " + SC.toSmallCaps("to") + ": " + SC.toSmallCaps(targetLabel) + "\n" +
          "   " + SC.toSmallCaps("date") + ": " + dateStr + "\n" +
          "   " + SC.toSmallCaps("preview") + ": " + SC.toSmallCaps(preview) + "\n";

  keyboard.push([
    { text: SC.toSmallCaps("View") + " " + w.id, callback_data: "/mywhisper_view " + w.id }
  ]);
}

keyboard.push([
  { text: SC.toSmallCaps("Home"), callback_data: "/start" }
]);

SC.editOrSend(body, keyboard);

// Helper: render a millisecond timestamp as YYYY-MM-DD HH:MM (UTC).
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
