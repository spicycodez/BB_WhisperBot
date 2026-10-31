/*CMD
  command: /whisper_text
  help: Informational stub — redirects to inline mode
  need_reply: false
  aliases: whisper_text
CMD*/

var SC = Libs.WhisperBot;
SC.ackCallback();

var body =
  SC.toSmallCaps("Whisper text — inline only") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Whisper text is entered inline, not in this chat.") + "\n" +
  SC.toSmallCaps("Up to 800 characters; the popup shows the first ~195.") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Example") + ":\n" +
  "@wisspbot @" + SC.toSmallCaps("john") + " " + SC.toSmallCaps("you are awesome!");

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("Open inline mode"), switch_inline_query_current_chat: "@wisspbot " }
], [
  { text: SC.toSmallCaps("Home"), callback_data: "/start" }
]]);
