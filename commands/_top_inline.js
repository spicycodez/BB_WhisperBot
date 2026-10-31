/*CMD
  command: /top_inline
  help: Owner — leaderboard of the 10 most active inline users, with total and unique counts
  need_reply: false
  aliases: top_inline
CMD*/

var SC = Libs.WhisperBot;
var W  = Libs.WhisperStore;
SC.ackCallback();

if (!SC.isOwnerOrSudo(user)) {
  SC.editOrSend("⛔ " + SC.toSmallCaps("Access denied"), [[
    { text: SC.toSmallCaps("Home"), callback_data: "/start" }
  ]]);
  return;
}

var top = W.topInlineSenders(10);
var totalInline = W.getCounter("whisper_count_inline");
var uniqueInlineUsers = top.length; // simplification: count users with inline_count > 0

var body =
  SC.toSmallCaps("Top inline users") + " ⚡\n" +
  SC.scDivider() + "\n" +
  "• " + SC.toSmallCaps("total inline") + ": " + totalInline + "\n" +
  "• " + SC.toSmallCaps("active inline users") + ": " + uniqueInlineUsers + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Leaderboard") + " 🏆\n";

if (!top.length) {
  body += SC.toSmallCaps("(no inline activity yet)");
} else {
  for (var i = 0; i < top.length; i++) {
    var u = top[i].user;
    var name = u.name ? u.name : SC.toSmallCaps("unknown");
    var uname = u.username ? " @" + u.username : "";
    body += (i + 1) + ". " + name + uname + " — " + top[i].count + "\n";
  }
}

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("Top whispers"), callback_data: "/top_whispers" },
  { text: SC.toSmallCaps("Stats"),        callback_data: "/stats" }
], [
  { text: SC.toSmallCaps("Home"),         callback_data: "/start" }
]]);
