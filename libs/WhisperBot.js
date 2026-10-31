/*
 * WhisperBot — shared settings, small-caps styling, privilege checks,
 * and the smart edit helper used by every command.
 *
 * Configure OWNER_ID, SUDO_USERS, LOGGER_CHAT_ID and BOT_USERNAME here
 * once and every command picks them up via Libs.WhisperBot.<method>.
 */

/* ============================================================
 *  SETTINGS  —  EDIT THESE
 * ============================================================ */

// Your personal Telegram user id. Get it from @userinfobot or by
// sending /id to this bot once it is running.
var OWNER_ID = "6583017039";

// Telegram user ids (as strings) who get owner-like access without
// being the owner. Empty by default — only you can do admin actions.
var SUDO_USERS = [];

// Chat id where every successful reveal is logged. Set to "0" to
// disable reveal logging. To enable, create a private channel/group,
// add the bot, and put the chat id here (e.g. "-1001234567890").
var LOGGER_CHAT_ID = "0";

// The bot's own @username (without leading @). Used to preserve the
// real handle when small-caps styling the rest of a message.
var BOT_USERNAME = "wisspbot";

// Banner photo URL for the /start menu. Replace with your own banner
// image (or set to "" to send a text-only menu instead of a photo).
var START_PHOTO_URL = "https://yukiapi.site/file/q1J9hr3d";

// Small square icon URL used as the `thumb_url` on every inline result
// card (the small picture shown next to each result in Telegram's inline
// dropdown — replaces the default "W" letter avatar).
// Points at the whisper-logo.jpg asset in this repo, served publicly via
// GitHub raw. Replace with your own CDN URL if preferred.
// If left empty, the inline results fall back to START_PHOTO_URL.
var BOT_ICON_URL = "https://raw.githubusercontent.com/spicycodez/BB_WhisperBot/main/assets/whisper-logo.jpg";

/* ============================================================
 *  SMALL CAPS STYLING
 * ============================================================ */

// Uppercase A-Z → Unicode small caps equivalent.
// S becomes lowercase "s" (Telegram small-caps convention).
var SMALL_CAPS_MAP = {
  "A": "ᴀ", "B": "ʙ", "C": "ᴄ", "D": "ᴅ", "E": "ᴇ", "F": "ꜰ",
  "G": "ɢ", "H": "ʜ", "I": "ɪ", "J": "ᴊ", "K": "ᴋ", "L": "ʟ",
  "M": "ᴍ", "N": "ɴ", "O": "ᴏ", "P": "ᴘ", "Q": "ǫ", "R": "ʀ",
  "S": "s", "T": "ᴛ", "U": "ᴜ", "V": "ᴠ", "W": "ᴡ", "X": "x",
  "Y": "ʏ", "Z": "ᴢ"
};

// Convert a single character to its small-caps form.
// Uppercase letters map directly; lowercase letters are upper-cased
// first so "john" → "ᴊᴏʜɴ" (not left as lowercase). Digits, symbols,
// emojis and whitespace pass through unchanged.
function scChar(ch) {
  var upper = ch.toUpperCase();
  if (SMALL_CAPS_MAP[upper]) { return SMALL_CAPS_MAP[upper]; }
  return ch;
}

// Convert one whitespace-delimited token to small caps.
// /commands (e.g. "/start", "/mywhispers") and the literal bot
// handle "@wisspbot" are preserved verbatim — Telegram needs them
// intact so they remain tappable mentions/commands.
function scToken(token) {
  if (!token) { return token; }
  if (token.charAt(0) === "/") { return token; }
  if (token === "@" + BOT_USERNAME) { return token; }
  var out = "";
  for (var i = 0; i < token.length; i++) {
    out += scChar(token.charAt(i));
  }
  return out;
}

// Convert an entire string to small caps, preserving whitespace,
// /commands and the literal @wisspbot handle.
function toSmallCaps(text) {
  if (text === null || text === undefined) { return ""; }
  var s = String(text);
  // Split on whitespace but keep the whitespace runs so we can rejoin.
  var parts = s.split(/(\s+)/);
  var out = "";
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === "") { continue; }
    if (/^\s+$/.test(parts[i])) {
      out += parts[i];
    } else {
      out += scToken(parts[i]);
    }
  }
  return out;
}

// Convenience: small-caps + box-drawing divider line.
function scDivider() {
  return "━━━━━━━━━━━━━━━━━━━━";
}

/* ============================================================
 *  HTML ESCAPING  (used when a message opts into parse_mode HTML)
 * ============================================================ */

function escapeHtml(text) {
  if (text === null || text === undefined) { return ""; }
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ============================================================
 *  TEXT HELPERS
 * ============================================================ */

// Truncate text to `n` visible chars, appending "…" if it was cut.
function truncate(text, n) {
  if (!text) { return ""; }
  var s = String(text);
  if (s.length <= n) { return s; }
  return s.slice(0, n) + "…";
}

/* ============================================================
 *  PRIVILEGE CHECKS
 * ============================================================ */

function isOwner(currentUser) {
  if (!currentUser || !currentUser.telegramid) { return false; }
  return String(currentUser.telegramid) === String(OWNER_ID);
}

function isSudo(currentUser) {
  if (!currentUser || !currentUser.telegramid) { return false; }
  var tid = String(currentUser.telegramid);
  for (var i = 0; i < SUDO_USERS.length; i++) {
    if (String(SUDO_USERS[i]) === tid) { return true; }
  }
  return false;
}

function isOwnerOrSudo(currentUser) {
  return isOwner(currentUser) || isSudo(currentUser);
}

function isLoggingEnabled() {
  return String(LOGGER_CHAT_ID) !== "0" && LOGGER_CHAT_ID !== "";
}

/* ============================================================
 *  SMART EDIT HELPER
 *  Turns a tapped-button response into an edit of the same message
 *  instead of sending a new one. Falls back to a new message when
 *  there is no message_id (e.g. the command was typed directly).
 * ============================================================ */

function editOrSend(text, keyboard) {
  // ZERO-SPAM MENU NAVIGATION
  //
  // When a button is tapped on a BOT message, we edit that message in
  // place instead of sending a new one. This keeps all menus in ONE
  // self-updating message:
  //
  //   • Photo source  → Api.editMessageCaption  (photo stays as a
  //                    permanent header; caption + keyboard update)
  //   • Text source   → Api.editMessageText     (text + keyboard update)
  //
  // We only attempt the edit when ALL of these are true:
  //   1. request.data is set (callback context — the message is the
  //      bot's, so it's editable). If absent, the command was typed
  //      directly and request.message is the USER's message, which the
  //      bot cannot edit.
  //   2. request.message has message_id + chat.
  //
  // Telegram caption limit is 1024 chars; if the text is longer we
  // truncate with "…" so the edit doesn't fail.
  var msg = request && request.message;
  var isCallback = !!(request && request.data);
  var isPhoto    = !!(msg && msg.photo && msg.photo.length);
  var hasMsg     = !!(msg && msg.message_id && msg.chat);

  if (isCallback && hasMsg) {
    try {
      var opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id
      };
      if (keyboard) {
        opts.reply_markup = { inline_keyboard: keyboard };
      }
      if (isPhoto) {
        // Photo message — edit the caption (photo stays as header).
        // Truncate to 1020 chars to stay under Telegram's 1024 caption limit.
        opts.caption = truncate(text, 1020);
        Api.editMessageCaption(opts);
      } else {
        // Text message — edit the text (4096 char limit, plenty of room).
        opts.text = text;
        Api.editMessageText(opts);
      }
      return;
    } catch (e) {
      // Edit can fail if the message is too old, the text is identical,
      // or the message isn't editable. Fall through to a fresh send.
    }
  }

  // Default: send as a new text message. This branch handles:
  //   - Direct commands (typed, not from a button)
  //   - Any edit failure
  var sendOpts = { text: text };
  if (keyboard) {
    sendOpts.reply_markup = { inline_keyboard: keyboard };
  }
  Api.sendMessage(sendOpts);
}

/* ============================================================
 *  LOGGER
 * ============================================================ */

function logReveal(whisper, viewer) {
  if (!isLoggingEnabled()) { return; }
  var viewerTag = (viewer && viewer.username) ? "@" + viewer.username
                                              : String(viewer.telegramid || "unknown");
  var targetLabel = whisper.target_type === "username"
    ? "@" + whisper.target_value
    : "#" + whisper.target_value;

  var text =
    "👁 ʀᴇᴠᴇᴀʟ ʟᴏɢ\n" +
    scDivider() + "\n" +
    "• ɪᴅ: " + whisper.id + "\n" +
    "• ᴛᴀʀɢᴇᴛ: " + targetLabel + "\n" +
    "• ᴠɪᴇᴡᴇʀ: " + viewerTag + "\n" +
    "• ᴠɪᴇᴡs: " + ((whisper.view_count || 0) + 1) + "\n" +
    scDivider() + "\n" +
    truncate(whisper.message, 200);

  try {
    Bot.sendMessageToChatWithId(String(LOGGER_CHAT_ID), text);
  } catch (e) {
    // Logger chat may not be ready yet; ignore silently.
  }
}

/* ============================================================
 *  ACK CALLBACK  (dismiss the spinner on a tapped button)
 * ============================================================ */

function ackCallback() {
  if (request && request.id && request.data) {
    try {
      Api.answerCallbackQuery({ callback_query_id: request.id });
    } catch (e) { /* ignore */ }
  }
}

publish({
  // settings
  OWNER_ID: OWNER_ID,
  SUDO_USERS: SUDO_USERS,
  LOGGER_CHAT_ID: LOGGER_CHAT_ID,
  BOT_USERNAME: BOT_USERNAME,
  START_PHOTO_URL: START_PHOTO_URL,
  BOT_ICON_URL: BOT_ICON_URL,
  // text
  toSmallCaps: toSmallCaps,
  scDivider: scDivider,
  escapeHtml: escapeHtml,
  truncate: truncate,
  // auth
  isOwner: isOwner,
  isSudo: isSudo,
  isOwnerOrSudo: isOwnerOrSudo,
  isLoggingEnabled: isLoggingEnabled,
  // helpers
  editOrSend: editOrSend,
  logReveal: logReveal,
  ackCallback: ackCallback
});
