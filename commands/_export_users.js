/*CMD
  command: /export_users
  help: Owner — text list of first 20 users plus the full JSON export
  need_reply: false
  aliases: export_users
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

var info = W.listUsersPage(1, 20);
var users = info.users;

var body =
  SC.toSmallCaps("User export") + " 📤\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("first 20 of") + " " + info.total + " " + SC.toSmallCaps("users") + "\n" +
  SC.scDivider() + "\n";

if (!users.length) {
  body += SC.toSmallCaps("(no users registered yet)");
} else {
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var uname = u.username ? "@" + u.username : "—";
    var name = u.name ? u.name : "—";
    var join = formatDate(u.join_date);
    body += (i + 1) + ". " + name + " " + uname + " — id:" + u.telegramid + " joined:" + join + " whispers:" + (u.whisper_count || 0) + "\n";
  }
}

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("All users list"), callback_data: "/all_users_list" },
  { text: SC.toSmallCaps("Home"),           callback_data: "/start" }
]]);

// Send the full JSON dump as a separate code-block message.
var all = W.exportAllUsers();
var json = JSON.stringify(all, null, 2);
var chunks = chunkString(json, 3500);
for (var c = 0; c < chunks.length; c++) {
  Api.sendMessage({
    text: "```json\n" + chunks[c] + "\n```",
    parse_mode: "Markdown"
  });
}

function formatDate(ms) {
  if (!ms) { return "—"; }
  var d = new Date(ms);
  if (isNaN(d.getTime())) { return "—"; }
  var y = d.getUTCFullYear();
  var m = d.getUTCMonth() + 1; if (m < 10) m = "0" + m;
  var day = d.getUTCDate();    if (day < 10) day = "0" + day;
  return y + "-" + m + "-" + day;
}

function chunkString(s, n) {
  if (!s) { return [""]; }
  if (s.length <= n) { return [s]; }
  var out = [];
  for (var i = 0; i < s.length; i += n) {
    out.push(s.slice(i, i + n));
  }
  return out;
}
