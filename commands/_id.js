/*CMD
  command: /id
  help: Show the user's Telegram id and @username — needed for id-based whispers
  need_reply: false
  aliases: id, /myid
CMD*/

var SC = Libs.WhisperBot;
SC.ackCallback();

if (!user) {
  SC.editOrSend(SC.toSmallCaps("Could not read your account info."), [[
    { text: SC.toSmallCaps("Home"), callback_data: "/start" }
  ]]);
  return;
}

var tid = String(user.telegramid || SC.toSmallCaps("unknown"));
var uname = user.username ? "@" + user.username : SC.toSmallCaps("(no username set)");

var body =
  SC.toSmallCaps("Your Telegram identity") + " 👤\n" +
  SC.scDivider() + "\n" +
  "• " + SC.toSmallCaps("Telegram id") + ": " + tid + "\n" +
  "• " + SC.toSmallCaps("Username") + ": " + uname + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Send this id to anyone who wants to whisper to you by numeric id") + ":\n" +
  "@wisspbot " + tid + " " + SC.toSmallCaps("your message");

SC.editOrSend(body, [[
  { text: SC.toSmallCaps("Home"), callback_data: "/start" },
  { text: SC.toSmallCaps("Help"), callback_data: "/help" }
]]);
