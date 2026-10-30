/*CMD
  command: /all_users_list
  help: Owner — full user list, 15 per page, with prev/next buttons and a JSON export on page 1
  need_reply: false
  aliases: all_users_list
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

// Parse page number from params (callback or direct).
var page = 1;
var p = (params || "").trim();
if (p && /^[0-9]+$/.test(p)) { page = parseInt(p, 10); }

var info = W.listUsersPage(page, 15);
var users = info.users;
var totalPages = info.totalPages;
page = info.page;

var body =
  SC.toSmallCaps("All users") + " 👥\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("page") + " " + page + " / " + totalPages + " — " +
  SC.toSmallCaps("total") + " " + info.total + "\n" +
  SC.scDivider() + "\n";

if (!users.length) {
  body += SC.toSmallCaps("(no users registered yet)");
} else {
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var uname = u.username ? "@" + u.username : "—";
    var name = u.name ? u.name : "—";
    var join = formatDate(u.join_date);
    body += (i + 1 + (page - 1) * 15) + ". " + SC.toSmallCaps("id") + ": " + u.telegramid + "\n" +
            "   " + SC.toSmallCaps("name") + ": " + name + "\n" +
            "   " + SC.toSmallCaps("username") + ": " + uname + "\n" +
            "   " + SC.toSmallCaps("joined") + ": " + join + "\n" +
            "   " + SC.toSmallCaps("whispers") + ": " + (u.whisper_count || 0) + "\n";
  }
}

// Prev/next buttons.
var nav = [];
if (page > 1) {
  nav.push({ text: "◀ " + SC.toSmallCaps("prev"), callback_data: "/all_users_list " + (page - 1) });
}
if (page < totalPages) {
  nav.push({ text: SC.toSmallCaps("next") + " ▶", callback_data: "/all_users_list " + (page + 1) });
}

var keyboard = [];
if (nav.length) { keyboard.push(nav); }
keyboard.push([
  { text: SC.toSmallCaps("Refresh"), callback_data: "/all_users_list " + page }
]);
keyboard.push([
  { text: SC.toSmallCaps("Export users"), callback_data: "/export_users" },
  { text: SC.toSmallCaps("Home"),         callback_data: "/start" }
]);

SC.editOrSend(body, keyboard);

// On page 1, also send a complete JSON export as a separate plain-text
// message. (Using plain text instead of Markdown code blocks because
// user-supplied data — names, usernames — could contain Markdown special
// chars like `_`, `*`, `[`, `]`, `backtick` that would break formatting.)
if (page === 1) {
  var all = W.exportAllUsers();
  var json = JSON.stringify(all, null, 2);
  var chunks = chunkString(json, 3500);
  for (var c = 0; c < chunks.length; c++) {
    Api.sendMessage({
      text: chunks[c]
    });
  }
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
