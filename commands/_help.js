/*CMD
  command: /help
  help: What a whisper is, the inline syntax, how revealing works, practical tips — in the user's language
  need_reply: false
  aliases: help, /howto
CMD*/

var SC   = Libs.WhisperBot;
var I18N = Libs.WhisperI18n;
SC.ackCallback();

var tid = user ? String(user.telegramid) : "";
var L   = I18N.get(tid);
function bt(key) { return SC.toSmallCaps(I18N.t(L, key)); }

SC.editOrSend(
  I18N.helpBody(SC, L),
  [
    [
      { text: "💌 " + bt("btn_create"), callback_data: "/create_whisper" },
      { text: "🆔 " + bt("btn_id"),     callback_data: "/id" }
    ],
    [
      { text: "🌐 " + bt("btn_lang"),   callback_data: "/lang" },
      { text: "📤 " + bt("btn_share"),  switch_inline_query: "" }
    ],
    [
      { text: "🏠 " + bt("btn_home"),   callback_data: "/start" }
    ]
  ]
);
