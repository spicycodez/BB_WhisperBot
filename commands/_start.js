/*CMD
  command: /start
  help: Photo menu with usage examples, inline buttons, registers user, notifies owner on first start. Deep links: ?start=help and ?start=lang
  need_reply: false
  aliases: start
CMD*/

var SC   = Libs.WhisperBot;
var W    = Libs.WhisperStore;
var I18N = Libs.WhisperI18n;

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

// Language for this user's private UI (saved via /lang, default English).
var tid = user ? String(user.telegramid) : "";
var L   = I18N.get(tid);
function bt(key) { return SC.toSmallCaps(I18N.t(L, key)); }

// Acknowledge the callback (dismisses the spinner) if reached via button.
SC.ackCallback();

// ---------- DEEP LINKS ----------
// t.me/wisspbot?start=help → /start help  → open the help screen.
// t.me/wisspbot?start=lang → /start lang  → open the language picker.
// These are used by the ❓ ʙᴏᴛ ʜᴇʟᴘ button on the inline invalid card
// and by anyone sharing a direct link.
var deepLink = "";
if (isDirect && request.message && request.message.text) {
  var parts = String(request.message.text).trim().split(/\s+/);
  if (parts.length > 1 && /^\/start(@[A-Za-z0-9_]+)?$/i.test(parts[0])) {
    deepLink = parts[1].toLowerCase();
  }
}

if (deepLink === "lang") {
  Api.sendMessage({
    text: I18N.pickText(SC, L),
    reply_markup: { inline_keyboard: I18N.langGrid(SC, L) }
  });
  return;
}

if (deepLink === "help") {
  Api.sendMessage({
    text: I18N.helpBody(SC, L),
    reply_markup: { inline_keyboard: [
      [
        { text: "💌 " + bt("btn_create"), callback_data: "/create_whisper" },
        { text: "🆔 " + bt("btn_id"),     callback_data: "/id" }
      ],
      [
        { text: "🌐 " + bt("btn_lang"),   callback_data: "/lang" }
      ],
      [
        { text: "🏠 " + bt("btn_home"),   callback_data: "/start" }
      ]
    ]}
  });
  return;
}

// ---------- MAIN MENU ----------
// Menu body — kept under 1024 chars so it fits in a photo caption
// when editOrSend uses editMessageCaption for in-place updates.
var caption =
  SC.toSmallCaps(I18N.t(L, "start_title")) + " 🤫✨\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps(I18N.t(L, "start_tag")) + "\n" +
  SC.scDivider() + "\n" +
  "@wisspbot " + SC.toSmallCaps(I18N.t(L, "syntax_user_msg")) + "\n" +
  SC.toSmallCaps(I18N.t(L, "start_example")) + ": @wisspbot @" +
  SC.toSmallCaps("john") + " " + SC.toSmallCaps(I18N.t(L, "ex_whisper")) + "\n" +
  "@wisspbot " + SC.toSmallCaps(I18N.t(L, "syntax_id_msg")) + "\n" +
  SC.scDivider() + "\n" +
  SC.toSmallCaps(I18N.t(L, "start_choose"));

// 6 buttons in 3 rows (language picker added). "My whispers" removed per spec.
var keyboard = [
  [
    { text: "💌 " + bt("btn_create"), callback_data: "/create_whisper" },
    { text: "💬 " + bt("btn_group"),  switch_inline_query_current_chat: "@wisspbot " }
  ],
  [
    { text: "❓ " + bt("btn_help"),   callback_data: "/help" },
    { text: "🆔 " + bt("btn_id"),     callback_data: "/id" }
  ],
  [
    { text: "🌐 " + bt("btn_lang"),   callback_data: "/lang" },
    { text: "📤 " + bt("btn_share"),  switch_inline_query: "" }
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
