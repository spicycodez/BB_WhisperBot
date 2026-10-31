/*CMD
  command: /create_whisper
  help: Instructions that whispers are inline only, with a button to open inline mode directly (user's language)
  need_reply: false
  aliases: /whisper, create_whisper, whisper
CMD*/

var SC   = Libs.WhisperBot;
var I18N = Libs.WhisperI18n;
SC.ackCallback();

var tid = user ? String(user.telegramid) : "";
var L   = I18N.get(tid);
function bt(key) { return SC.toSmallCaps(I18N.t(L, key)); }

var text =
  SC.toSmallCaps(I18N.t(L, "create_title")) + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps(I18N.t(L, "create_inline_only")) + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps(I18N.t(L, "syntax")) + ":\n" +
  "@wisspbot " + SC.toSmallCaps(I18N.t(L, "syntax_user_msg")) + "\n" +
  "@wisspbot " + SC.toSmallCaps(I18N.t(L, "syntax_id_msg")) + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps(I18N.t(L, "start_example")) + ":\n" +
  "@wisspbot @" + SC.toSmallCaps("john") + " " +
  SC.toSmallCaps(I18N.t(L, "ex_whisper")) + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps(I18N.t(L, "create_tap"));

SC.editOrSend(text, [
  [
    { text: "⚡ " + SC.toSmallCaps("Open inline mode"),
      switch_inline_query_current_chat: "@wisspbot " }
  ],
  [
    { text: "🌐 " + bt("btn_lang"), callback_data: "/lang" },
    { text: "🏠 " + bt("btn_home"), callback_data: "/start" }
  ]
]);
