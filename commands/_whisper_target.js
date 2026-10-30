/*CMD
  command: /whisper_target
  help: Informational stub — redirects to inline mode
  need_reply: false
  aliases: whisper_target
CMD*/

var SC = Libs.WhisperBot;
SC.ackCallback();

var body =
  SC.toSmallCaps("Whisper target — inline only") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Targets are entered inline, not in this chat.") + "\n" +
  SC.toSmallCaps("Use @username or a numeric Telegram id") + ":\n" +
  "@wisspbot " + SC.toSmallCaps("@username your message") + "\n" +
  "@wisspbot " + SC.toSmallCaps("123456789 your message");

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("Open inline mode"), switch_inline_query_current_chat: "@wisspbot " }
], [
  { text: SC.toSmallCaps("Home"), callback_data: "/start" }
]]);
