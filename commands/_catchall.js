/*CMD
  command: *
  help: Catch-all — unknown /command lists the mistake + offers menu; ordinary message/photo answers "send /start to open menu"
  need_reply: false
CMD*/

var SC = Libs.WhisperBot;

if (!request || !request.message) { return; }

var msg = request.message;
var text = msg.text || msg.caption || "";

// If it starts with "/", treat as an unknown command.
if (typeof text === "string" && text.charAt(0) === "/") {
  var body =
    SC.toSmallCaps("Unknown command") + " ❓\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps("You typed") + ": " + text + "\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps("Choose an option") + " 👇";

  Api.sendMessage({
    text: body,
    reply_markup: {
      inline_keyboard: [
        [
          { text: SC.toSmallCaps("Create whisper"), callback_data: "/create_whisper" },
          { text: SC.toSmallCaps("My whispers"),    callback_data: "/mywhispers" }
        ],
        [
          { text: SC.toSmallCaps("Help"),           callback_data: "/help" },
          { text: SC.toSmallCaps("Home"),           callback_data: "/start" }
        ]
      ]
    }
  });
  return;
}

// Otherwise it is an ordinary message, photo, file, sticker, etc.
Api.sendMessage({
  text: SC.toSmallCaps("Send /start to open menu"),
  reply_markup: {
    inline_keyboard: [[
      { text: SC.toSmallCaps("Open menu"), callback_data: "/start" }
    ]]
  }
});
