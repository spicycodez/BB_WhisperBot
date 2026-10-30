/*CMD
  command: /top_whispers
  help: Owner — leaderboard of the 10 most active whisper senders
  need_reply: false
  aliases: top_whispers
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

var top = W.topWhisperSenders(10);

var body =
  SC.toSmallCaps("Top whisper senders") + " 🏆\n" +
  SC.scDivider() + "\n";

if (!top.length) {
  body += SC.toSmallCaps("(no whispers sent yet)");
} else {
  for (var i = 0; i < top.length; i++) {
    var u = top[i].user;
    var name = u.name ? u.name : SC.toSmallCaps("unknown");
    var uname = u.username ? " @" + u.username : "";
    body += (i + 1) + ". " + name + uname + " — " + top[i].count + "\n";
  }
}

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("Top inline"), callback_data: "/top_inline" },
  { text: SC.toSmallCaps("Stats"),      callback_data: "/stats" }
], [
  { text: SC.toSmallCaps("Home"),       callback_data: "/start" }
]]);
