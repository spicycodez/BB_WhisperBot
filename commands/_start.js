/*CMD
  command: /start
  help: Photo menu with usage examples, inline buttons, registers user, notifies owner on first start
  need_reply: false
  aliases: start
CMD*/

var SC = Libs.WhisperBot;
var W  = Libs.WhisperStore;

// Register user + notify owner ONLY on a direct /start (typed), not when
// the user taps a "Home" button to navigate back here. This avoids
// re-registering existing users and spamming the owner with false
// "new user" notifications every time someone navigates Home.
var isDirect = !(request && request.data);
if (isDirect) {
  var isNew = W.registerUser(user);
  if (isNew && user) {
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
}

// Acknowledge the callback (dismisses the spinner) if reached via button.
SC.ackCallback();

// Menu body — kept under 1024 chars so it fits in a photo caption
// when editOrSend uses editMessageCaption for in-place updates.
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

// 4 buttons in 3 rows. "My whispers" was removed per spec.
var keyboard = [
  [
    { text: SC.toSmallCaps("Create whisper"),   callback_data: "/create_whisper" },
    { text: SC.toSmallCaps("Try in group"),     switch_inline_query_current_chat: "@wisspbot " }
  ],
  [
    { text: SC.toSmallCaps("Help"),             callback_data: "/help" },
    { text: SC.toSmallCaps("My id"),            callback_data: "/id" }
  ],
  [
    { text: SC.toSmallCaps("Share bot"),        switch_inline_query: "" }
  ]
];

if (isDirect) {
  // Direct command — send a NEW photo message (or text fallback).
  // This is the only place a new message is created for /start.
  if (SC.START_PHOTO_URL) {
    try {
      Api.sendPhoto({
        photo: SC.START_PHOTO_URL,
        caption: caption,
        reply_markup: { inline_keyboard: keyboard }
      });
      return;
    } catch (e) { /* fall through to text menu */ }
  }
  Api.sendMessage({
    text: caption,
    reply_markup: { inline_keyboard: keyboard }
  });
} else {
  // Callback (button tap) — edit the existing message in place.
  // If the source is the photo menu, editOrSend uses editMessageCaption
  // (photo stays as header, caption + keyboard update).
  // If the source is a text menu, editOrSend uses editMessageText.
  SC.editOrSend(caption, keyboard);
}
