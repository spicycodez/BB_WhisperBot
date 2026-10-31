/*CMD
  command: /total_stats
  help: Owner — pure counters (total whispers, inline whispers, all users)
  need_reply: false
  aliases: total_stats
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

var totalWhispers = W.getCounter("whisper_count_total");
var inlineWhispers = W.getCounter("whisper_count_inline");
var totalRevealed = W.getCounter("whisper_count_revealed");
var totalUsers    = W.totalUsers();

var body =
  SC.toSmallCaps("Total counters") + " 🔢\n" +
  SC.scDivider() + "\n" +
  "• " + SC.toSmallCaps("total whispers") + ": " + totalWhispers + "\n" +
  "• " + SC.toSmallCaps("inline whispers") + ": " + inlineWhispers + "\n" +
  "• " + SC.toSmallCaps("revealed") + ": " + totalRevealed + "\n" +
  "• " + SC.toSmallCaps("all users") + ": " + totalUsers;

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("Back to stats"), callback_data: "/stats" },
  { text: SC.toSmallCaps("Home"),          callback_data: "/start" }
]]);
