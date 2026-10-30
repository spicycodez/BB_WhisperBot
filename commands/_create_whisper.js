/*CMD
  command: /create_whisper
  help: Instructions that whispers are inline only, with a button to open inline mode directly
  need_reply: false
  aliases: /whisper, create_whisper, whisper
CMD*/

var SC = Libs.WhisperBot;
SC.ackCallback();

var text =
  SC.toSmallCaps("Create a whisper") + " 🤫\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Whispers are inline only — you type them in any chat, not here.") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Syntax") + ":\n" +
  "@wisspbot " + SC.toSmallCaps("@username your secret message") + "\n" +
  "@wisspbot " + SC.toSmallCaps("123456789 your secret message") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Example") + ":\n" +
  "@wisspbot @" + SC.toSmallCaps("john") + " " + SC.toSmallCaps("you are awesome!") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Tap the button below to start typing a whisper right here.");

SC.editOrSend(text, [[
  { text: SC.toSmallCaps("Open inline mode"), switch_inline_query_current_chat: "@wisspbot " }
], [
  { text: SC.toSmallCaps("Home"), callback_data: "/start" }
]]);
