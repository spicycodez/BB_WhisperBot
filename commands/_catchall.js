/*CMD
  command: *
  help: Catch-all — unknown /command lists the mistake + offers menu; ordinary message/photo answers "send /start to open menu" (user's language)
  need_reply: false
CMD*/

var SC   = Libs.WhisperBot;
var I18N = Libs.WhisperI18n;

if (!request || !request.message) { return; }

var msg  = request.message;
var text = msg.text || msg.caption || "";

// Language for this user's private UI.
var tid = user ? String(user.telegramid) : "";
var L   = I18N.get(tid);
function bt(key) { return SC.toSmallCaps(I18N.t(L, key)); }

// If it starts with "/", treat as an unknown command.
if (typeof text === "string" && text.charAt(0) === "/") {
  var body =
    SC.toSmallCaps(I18N.t(L, "unknown_cmd")) + "\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps(I18N.t(L, "you_typed")) + ": " + text + "\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps(I18N.t(L, "start_choose"));

  Api.sendMessage({
    text: body,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "💌 " + bt("btn_create"), callback_data: "/create_whisper" },
          { text: "❓ " + bt("btn_help"),   callback_data: "/help" }
        ],
        [
          { text: "🆔 " + bt("btn_id"),     callback_data: "/id" },
          { text: "🌐 " + bt("btn_lang"),   callback_data: "/lang" }
        ],
        [
          { text: "🏠 " + bt("btn_home"),   callback_data: "/start" }
        ]
      ]
    }
  });
  return;
}

// Otherwise it is an ordinary message, photo, file, sticker, etc.
Api.sendMessage({
  text: SC.toSmallCaps(I18N.t(L, "send_start")),
  reply_markup: {
    inline_keyboard: [[
      { text: SC.toSmallCaps(I18N.t(L, "btn_open_menu")), callback_data: "/start" }
    ]]
  }
});
