/*CMD
  command: /cancel
  help: Clears any half-finished whisper draft (leftover from older link-based version)
  need_reply: false
  aliases: cancel
CMD*/

var SC = Libs.WhisperBot;
SC.ackCallback();

var body =
  SC.toSmallCaps("Nothing to cancel") + " ✓\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Whispers are inline only — there is no draft to clear.") + "\n" +
  SC.toSmallCaps("Type in any chat:") + "\n" +
  "@wisspbot " + SC.toSmallCaps("@username your message");

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("Home"), callback_data: "/start" }
]]);
