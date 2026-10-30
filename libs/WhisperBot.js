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
var START_PHOTO_URL = "";

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
  var hasMsg = (request && request.message &&
                request.message.message_id &&
                request.message.chat);

  if (hasMsg) {
    try {
      var editOpts = {
        chat_id: request.message.chat.id,
        message_id: request.message.message_id,
        text: text,
        parse_mode: null
      };
      if (keyboard) {
        editOpts.reply_markup = { inline_keyboard: keyboard };
      }
      Api.editMessageText(editOpts);
      return;
    } catch (e) {
      // editMessageText can fail if the message is too old or the text
      // is identical — fall through to a fresh send.
    }
  }

  var sendOpts = { text: text, parse_mode: null };
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
