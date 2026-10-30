/*CMD
  command: /help
  help: What a whisper is, the inline syntax, how revealing works, and the three practical tips
  need_reply: false
  aliases: help, /howto
CMD*/

var SC = Libs.WhisperBot;
SC.ackCallback();

var body =
  SC.toSmallCaps("Help — Whisper Bot") + " 📖\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("What is a whisper") + "\n" +
  SC.toSmallCaps("A whisper is a secret inline message. The recipient sees only a card with a Reveal button. When they tap it, the message appears as a private popup — nothing is posted in the chat.") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Inline syntax") + " ⚡\n" +
  "@wisspbot " + SC.toSmallCaps("@username your secret message") + "\n" +
  "@wisspbot " + SC.toSmallCaps("123456789 your secret message") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("How revealing works") + " 👁\n" +
  SC.toSmallCaps("1. You type the inline query in any chat.") + "\n" +
  SC.toSmallCaps("2. A card appears with the recipient's name.") + "\n" +
  SC.toSmallCaps("3. Only the target (or the original sender) can reveal.") + "\n" +
  SC.toSmallCaps("4. The message pops up privately on their device.") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Three practical tips") + " 💡\n" +
  "1. " + SC.toSmallCaps("Inline mode must be enabled in @BotFather — run /setinline there.") + "\n" +
  "2. " + SC.toSmallCaps("The target needs a @username; otherwise use their numeric id.") + "\n" +
  "3. " + SC.toSmallCaps("To find your own numeric id, send /id to this bot.") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Perfect for groups, games and surprise compliments") + " ✨";

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("My whispers"), callback_data: "/mywhispers" },
  { text: SC.toSmallCaps("My id"), callback_data: "/id" }
], [
  { text: SC.toSmallCaps("Home"), callback_data: "/start" }
]]);
