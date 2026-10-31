/*CMD
  command: /id
  help: Show the user's Telegram id and @username — needed for id-based whispers (user's language)
  need_reply: false
  aliases: id, /myid
CMD*/

var SC   = Libs.WhisperBot;
var I18N = Libs.WhisperI18n;
SC.ackCallback();

var tid = user ? String(user.telegramid) : "";
var L   = I18N.get(tid);
function bt(key) { return SC.toSmallCaps(I18N.t(L, key)); }

if (!user) {
  SC.editOrSend(SC.toSmallCaps(I18N.t(L, "id_error")), [[
    { text: "🏠 " + bt("btn_home"), callback_data: "/start" }
  ]]);
  return;
}

var uid   = String(user.telegramid || SC.toSmallCaps("unknown"));
var uname = user.username ? "@" + user.username
                          : SC.toSmallCaps(I18N.t(L, "no_username"));

var body =
  SC.toSmallCaps(I18N.t(L, "id_title")) + "\n" +
  SC.scDivider() + "\n" +
  "• " + SC.toSmallCaps(I18N.t(L, "lbl_tgid")) + ": " + uid + "\n" +
  "• " + SC.toSmallCaps(I18N.t(L, "lbl_username")) + ": " + uname + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps(I18N.t(L, "id_hint")) + "\n" +
  "@wisspbot " + uid + " " + SC.toSmallCaps(I18N.t(L, "id_msg_hint"));

SC.editOrSend(body, [
  [
    { text: "🏠 " + bt("btn_home"), callback_data: "/start" },
    { text: "❓ " + bt("btn_help"), callback_data: "/help" }
  ],
  [
    { text: "🌐 " + bt("btn_lang"), callback_data: "/lang" }
  ]
]);
