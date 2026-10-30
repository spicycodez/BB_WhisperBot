/*CMD
  command: /stats
  help: Owner dashboard — today's date, totals, today counts, top 5 creators
  need_reply: false
  aliases: stats
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

var today = W.todayStr();
var totalWhispers   = W.getCounter("whisper_count_total");
var todayWhispers   = W.getTodayCount("whispers_today_count", "whispers_today_date");
var totalRevealed   = W.getCounter("whisper_count_revealed");
var totalUsers      = W.totalUsers();
var newUsersToday   = W.getTodayCount("users_today_count", "users_today_date");
var top5            = W.topWhisperSenders(5);

var body =
  SC.toSmallCaps("Owner dashboard") + " 📊\n" +
  SC.scDivider() + "\n" +
  "• " + SC.toSmallCaps("today") + ": " + today + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Whispers") + "\n" +
  "  • " + SC.toSmallCaps("total") + ": " + totalWhispers + "\n" +
  "  • " + SC.toSmallCaps("today") + ": " + todayWhispers + "\n" +
  "  • " + SC.toSmallCaps("revealed") + ": " + totalRevealed + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Users") + "\n" +
  "  • " + SC.toSmallCaps("total") + ": " + totalUsers + "\n" +
  "  • " + SC.toSmallCaps("new today") + ": " + newUsersToday + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Top 5 whisper creators") + " 🏆";

if (top5.length) {
  for (var i = 0; i < top5.length; i++) {
    var u = top5[i].user;
    var name = u.username ? "@" + u.username : (u.name || SC.toSmallCaps("unknown"));
    body += "\n" + (i + 1) + ". " + name + " — " + top5[i].count;
  }
} else {
  body += "\n" + SC.toSmallCaps("(no whispers yet)");
}

SC.editOrSend(body, [
  [
    { text: SC.toSmallCaps("Refresh"),      callback_data: "/stats" },
    { text: SC.toSmallCaps("Top whispers"), callback_data: "/top_whispers" }
  ],
  [
    { text: SC.toSmallCaps("Total stats"),  callback_data: "/total_stats" },
    { text: SC.toSmallCaps("Home"),         callback_data: "/start" }
  ]
]);
