/*CMD
  command: /start
  help: Photo menu with usage examples, inline buttons, registers user, notifies owner on first start
  need_reply: false
  aliases: start
CMD*/

var SC = Libs.WhisperBot;
var W  = Libs.WhisperStore;

// 1. Register the user (returns true if brand new).
var isNew = W.registerUser(user);
if (isNew && user) {
  // Notify owner that a new user arrived.
  var nameTag = user.username ? "@" + user.username
                              : (user.first_name || SC.toSmallCaps("unknown"));
  try {
    Bot.sendMessageToChatWithId(
      String(SC.OWNER_ID),
      SC.toSmallCaps("New user arrived") + " ✨\n" +
      SC.scDivider() + "\n" +
      "• " + SC.toSmallCaps("name") + ": " + (user.first_name || "—") + "\n" +
      "• " + SC.toSmallCaps("username") + ": " + (user.username ? "@" + user.username : "—") + "\n" +
      "• " + SC.toSmallCaps("id") + ": " + String(user.telegramid || "—")
    );
  } catch (e) { /* owner may not have started the bot yet — ignore */ }
}

// 2. Acknowledge callback if reached via a button tap.
SC.ackCallback();

// 3. Photo menu body.
var caption =
  SC.toSmallCaps("Whisper Bot — Premium") + " 🤫✨\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Send anonymous inline whispers in any chat. Only the target can reveal.") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Inline only") + " ⚡\n" +
  "@wisspbot " + SC.toSmallCaps("@username your secret message") + "\n" +
  SC.toSmallCaps("Example") + ": @wisspbot @" + SC.toSmallCaps("john") + " " + SC.toSmallCaps("you are awesome!") + "\n" +
  SC.toSmallCaps("Or by id") + ": @wisspbot 123456789 " + SC.toSmallCaps("hello") + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Only the target can tap") + " 👁 " + SC.toSmallCaps("reveal (popup)") + " — " + SC.toSmallCaps("no public message") + " 💎\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps("Choose") + " 👇";

var keyboard = {
  inline_keyboard: [
    [
      { text: SC.toSmallCaps("Create whisper"),   callback_data: "/create_whisper" },
      { text: SC.toSmallCaps("Try in group"),     switch_inline_query_current_chat: "@wisspbot " }
    ],
    [
      { text: SC.toSmallCaps("My whispers"),      callback_data: "/mywhispers" },
      { text: SC.toSmallCaps("Help"),             callback_data: "/help" }
    ],
    [
      { text: SC.toSmallCaps("Share bot"),        switch_inline_query: "" }
    ]
  ]
};

// 4. Send the menu — photo if a URL is configured, else plain text.
if (SC.START_PHOTO_URL) {
  try {
    Api.sendPhoto({
      photo: SC.START_PHOTO_URL,
      caption: caption,
      reply_markup: keyboard
      // parse_mode omitted — BB serializes `null` to the string "null",
      // which Telegram rejects. Plain text is the default.
    });
    return;
  } catch (e) { /* fall through to text menu */ }
}

Api.sendMessage({
  text: caption,
  reply_markup: keyboard
});
