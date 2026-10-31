/*
 * WhisperStore — storage layer for the Whisper Bot.
 *
 * Uses Bots.Business properties (Bot.setProperty / Bot.getProperty)
 * as a persistent key/value store. Schema:
 *
 *   whisper_<id>            json    one whisper object
 *   user_<telegramid>       json    one user object (with counters)
 *   global_whispers         json    array of whisper ids (newest first, cap 2000)
 *   users_index             json    array of telegramids (registration order)
 *   whisper_count_total     integer total whispers ever sent
 *   whisper_count_inline    integer inline-only whispers (same as total here)
 *   whisper_count_revealed  integer total reveals
 *   whispers_today_count    integer whispers sent today
 *   whispers_today_date     string  YYYY-MM-DD for the today counter
 *   users_total             integer total users ever registered
 *   users_today_count       integer users who joined today
 *   users_today_date        string  YYYY-MM-DD for the today counter
 */

var GLOBAL_LIST_CAP = 2000;
var USER_LIST_CAP   = 100;     // per-user whisper history
var ID_LENGTH       = 8;
var ID_ALPHABET     = "abcdefghijklmnopqrstuvwxyz0123456789";
var MAX_MESSAGE_LEN = 800;
var ID_DIGITS_MIN   = 5;
var ID_DIGITS_MAX   = 15;

// Telegram username rules (per @BotFather / Telegram itself):
//   • 5–32 characters total
//   • Letters A–Z a–z, digits 0–9, underscores _
//   • MUST start with a letter
//   • MUST end with a letter or digit (not underscore)
//   • NO consecutive underscores
// This regex accepts every valid Telegram username — uppercase,
// lowercase, mixed case, with digits, with underscores, in any
// combination — and rejects only the things Telegram itself rejects.
//   ✓ @USERNAME   ✓ @username   ✓ @UserName   ✓ @Username2
//   ✓ @UserName_02   ✓ @john_doe   ✓ @a_b_c_d_e
//   ✗ @12345 (starts with digit)  ✗ @_username (starts with _)
//   ✗ @username_ (ends with _)    ✗ @user__name (consecutive _)
var USERNAME_RE = /^[A-Za-z](?:[A-Za-z0-9]|_(?!_)){3,30}[A-Za-z0-9]$/;

/* ============================================================
 *  QUERY PARSING
 * ============================================================ */

// Parse an inline query.
// Returns { ok:true, target_type, target_value, message } on success
// or { ok:false, error } on failure. `error` is already small-caps
// styled and safe to display.
function parseQuery(query, sc) {
  if (!query) {
    return { ok: false, error: sc.toSmallCaps("Empty query. Use @username message or 123456789 message.") };
  }
  var raw = String(query).trim();
  if (!raw) {
    return { ok: false, error: sc.toSmallCaps("Empty query. Use @username message or 123456789 message.") };
  }

  // Split on first whitespace.
  var spaceIdx = -1;
  for (var i = 0; i < raw.length; i++) {
    var c = raw.charCodeAt(i);
    if (c === 32 || c === 9 || c === 10 || c === 13) { spaceIdx = i; break; }
  }
  if (spaceIdx === -1) {
    return { ok: false, error: sc.toSmallCaps("Missing message body. Use @username your message.") };
  }

  var token = raw.slice(0, spaceIdx);
  var message = raw.slice(spaceIdx + 1).trim();
  if (!message) {
    return { ok: false, error: sc.toSmallCaps("Missing message body. Use @username your message.") };
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return { ok: false, error: sc.toSmallCaps("Message too long. Maximum " + MAX_MESSAGE_LEN + " characters.") };
  }

  var target_type = null;
  var target_value = null;
  var original_value = null;

  if (token.charAt(0) === "@") {
    var username = token.slice(1);
    if (!USERNAME_RE.test(username)) {
      return {
        ok: false,
        error: sc.toSmallCaps(
          "Invalid @username. Telegram usernames are 5–32 chars, " +
          "must start with a letter, end with a letter or digit, " +
          "and use only letters, digits and single underscores. " +
          "Examples: @USERNAME, @username, @UserName, @Username2, " +
          "@UserName_02."
        )
      };
    }
    target_type = "username";
    // Lowercase for case-insensitive matching on reveal — so a whisper
    // sent to @USERNAME, @username or @UserName all match the same user.
    target_value = username.toLowerCase();
    // Preserve the original case as the sender typed it, for display on
    // the whisper card (e.g. sender types @Maxim → card shows @Maxim).
    original_value = username;
  } else if (/^[0-9]+$/.test(token) &&
             token.length >= ID_DIGITS_MIN &&
             token.length <= ID_DIGITS_MAX) {
    target_type = "id";
    target_value = token;
    original_value = token;
  } else {
    return {
      ok: false,
      error: sc.toSmallCaps(
        "Target must be @username (5–32 chars, letters/digits/underscores) " +
        "or numeric Telegram id (" + ID_DIGITS_MIN + "–" + ID_DIGITS_MAX + " digits)."
      )
    };
  }

  return {
    ok: true,
    target_type: target_type,
    target_value: target_value,
    original_value: original_value || target_value,
    message: message
  };
}

/* ============================================================
 *  ID GENERATION  (8-char, collision-checked)
 * ============================================================ */

function generateId() {
  for (var attempt = 0; attempt < 6; attempt++) {
    var id = "";
    for (var i = 0; i < ID_LENGTH; i++) {
      id += ID_ALPHABET.charAt(Math.floor(Math.random() * ID_ALPHABET.length));
    }
    if (!Bot.getProperty("whisper_" + id)) { return id; }
  }
  // Fallback: timestamp base36 suffix
  var ts = (typeof Date !== "undefined" && Date.now) ? Date.now().toString(36) : "0";
  return ts.slice(-ID_LENGTH);
}

/* ============================================================
 *  USER REGISTRATION
 * ============================================================ */

// Returns true if the user is new (just registered).
function registerUser(currentUser) {
  if (!currentUser || !currentUser.telegramid) { return false; }
  var tid = String(currentUser.telegramid);
  var key = "user_" + tid;
  var existing = Bot.getProperty(key);
  if (existing) { return false; }

  var now = (typeof Date !== "undefined" && Date.now) ? Date.now() : 0;
  var userObj = {
    telegramid: tid,
    name: (currentUser.first_name || "") +
          (currentUser.last_name ? " " + currentUser.last_name : ""),
    username: currentUser.username || "",
    join_date: now,
    whisper_count: 0,
    inline_count: 0
  };
  Bot.setProperty(key, userObj, "json");

  // Add to users_index
  var idx = Bot.getProperty("users_index");
  if (!idx) { idx = []; }
  idx.push(tid);
  Bot.setProperty("users_index", idx, "json");

  // Bump users_total
  bumpCounter("users_total");

  // Bump users_today (with date roll-over)
  bumpTodayCounter("users_today_count", "users_today_date");

  return true;
}

// Read a user object by Telegram id.
function getUser(tid) {
  if (!tid) { return null; }
  return Bot.getProperty("user_" + String(tid));
}

// Increment a user's whisper_count (and inline_count) by 1.
function bumpUserCounters(tid, field) {
  if (!tid) { return; }
  var key = "user_" + String(tid);
  var u = Bot.getProperty(key);
  if (!u) { return; }
  if (field === "whisper") {
    u.whisper_count = (u.whisper_count || 0) + 1;
  }
  if (field === "inline") {
    u.inline_count = (u.inline_count || 0) + 1;
  }
  Bot.setProperty(key, u, "json");
}

/* ============================================================
 *  WHISPER CRUD
 * ============================================================ */

function storeWhisper(parsed, sender) {
  var id = generateId();
  var now = (typeof Date !== "undefined" && Date.now) ? Date.now() : 0;
  var whisper = {
    id: id,
    target_type: parsed.target_type,
    target_value: parsed.target_value,
    message: parsed.message,
    sender_id: (sender && sender.telegramid) ? String(sender.telegramid) : "",
    sender_username: (sender && sender.username) ? String(sender.username) : "",
    sender_name: (sender && sender.first_name) ? String(sender.first_name) : "",
    created_at: now,
    view_count: 0
  };
  Bot.setProperty("whisper_" + id, whisper, "json");

  // Bump the sender's per-user counters (used by /stats and /top_whispers).
  // The per-user whisper LIST (user_whispers_<tid>) was removed along
  // with the /mywhispers feature — we only keep the count now.
  if (whisper.sender_id) {
    bumpUserCounters(whisper.sender_id, "whisper");
    bumpUserCounters(whisper.sender_id, "inline");
  }

  // Add to global list (newest first, capped at GLOBAL_LIST_CAP)
  var globalList = Bot.getProperty("global_whispers");
  if (!globalList) { globalList = []; }
  globalList.unshift(id);
  if (globalList.length > GLOBAL_LIST_CAP) {
    globalList = globalList.slice(0, GLOBAL_LIST_CAP);
  }
  Bot.setProperty("global_whispers", globalList, "json");

  // Counters
  bumpCounter("whisper_count_total");
  bumpCounter("whisper_count_inline");
  bumpTodayCounter("whispers_today_count", "whispers_today_date");
  // Note: whisper_count_revealed is bumped only on actual reveals
  // inside incrementViewCount() — never here on send.

  return id;
}

function getWhisper(id) {
  if (!id) { return null; }
  return Bot.getProperty("whisper_" + String(id));
}

function deleteWhisper(id) {
  if (!id) { return; }
  Bot.deleteProperty("whisper_" + String(id));
}

function incrementViewCount(id) {
  if (!id) { return; }
  var key = "whisper_" + String(id);
  var w = Bot.getProperty(key);
  if (!w) { return; }
  w.view_count = (w.view_count || 0) + 1;
  Bot.setProperty(key, w, "json");
  bumpCounter("whisper_count_revealed");
}

/* ============================================================
 *  LIST QUERIES
 * ============================================================ */

// Up to `limit` global whispers (newest first).
function listGlobalWhispers(limit) {
  if (!limit) { limit = 10; }
  var ids = Bot.getProperty("global_whispers");
  if (!ids) { return []; }
  var out = [];
  for (var i = 0; i < ids.length && out.length < limit; i++) {
    var w = Bot.getProperty("whisper_" + ids[i]);
    if (w) { out.push(w); }
  }
  return out;
}

/* ============================================================
 *  COUNTERS (simple + today-aware)
 * ============================================================ */

function bumpCounter(name) {
  var cur = Bot.getProperty(name);
  if (cur === null || cur === undefined || cur === "") { cur = 0; }
  var n = (typeof cur === "number") ? cur + 1 : parseInt(cur, 10) + 1;
  if (isNaN(n)) { n = 1; }
  Bot.setProperty(name, n, "integer");
}

function getCounter(name) {
  var cur = Bot.getProperty(name);
  if (cur === null || cur === undefined || cur === "") { return 0; }
  if (typeof cur === "number") { return cur; }
  var n = parseInt(cur, 10);
  return isNaN(n) ? 0 : n;
}

// Today-aware counter: rolls over to 1 when the date changes.
function bumpTodayCounter(countName, dateName) {
  var today = todayStr();
  var storedDate = Bot.getProperty(dateName);
  if (storedDate !== today) {
    Bot.setProperty(countName, 1, "integer");
    Bot.setProperty(dateName, today, "string");
  } else {
    bumpCounter(countName);
  }
}

function getTodayCount(countName, dateName) {
  var today = todayStr();
  var storedDate = Bot.getProperty(dateName);
  if (storedDate !== today) { return 0; }
  return getCounter(countName);
}

function todayStr() {
  var d = (typeof Date !== "undefined") ? new Date() : null;
  if (!d) { return ""; }
  var y = d.getFullYear();
  var m = d.getMonth() + 1;
  var day = d.getDate();
  var mm = m < 10 ? "0" + m : "" + m;
  var dd = day < 10 ? "0" + day : "" + day;
  return y + "-" + mm + "-" + dd;
}

/* ============================================================
 *  LEADERBOARDS
 * ============================================================ */

// Top N whisper senders, sorted by whisper_count desc.
// Returns array of { user, count }.
function topSenders(limit, field) {
  if (!limit) { limit = 5; }
  if (!field) { field = "whisper_count"; }
  var idx = Bot.getProperty("users_index");
  if (!idx || !idx.length) { return []; }
  var arr = [];
  for (var i = 0; i < idx.length; i++) {
    var u = Bot.getProperty("user_" + idx[i]);
    if (u) {
      var c = u[field] || 0;
      if (c > 0) { arr.push({ user: u, count: c }); }
    }
  }
  arr.sort(function (a, b) { return b.count - a.count; });
  return arr.slice(0, limit);
}

function topWhisperSenders(limit) {
  return topSenders(limit, "whisper_count");
}

function topInlineSenders(limit) {
  return topSenders(limit, "inline_count");
}

/* ============================================================
 *  USER LIST  (paginated)
 * ============================================================ */

function totalUsers() {
  return getCounter("users_total");
}

function listUsersPage(page, perPage) {
  if (!page || page < 1) { page = 1; }
  if (!perPage) { perPage = 15; }
  var idx = Bot.getProperty("users_index");
  if (!idx) { idx = []; }
  var total = idx.length;
  var totalPages = Math.max(1, Math.ceil(total / perPage));
  if (page > totalPages) { page = totalPages; }
  var start = (page - 1) * perPage;
  var end = Math.min(start + perPage, total);
  var users = [];
  for (var i = start; i < end; i++) {
    var u = Bot.getProperty("user_" + idx[i]);
    if (u) { users.push(u); }
  }
  return {
    page: page,
    perPage: perPage,
    total: total,
    totalPages: totalPages,
    users: users,
    allIndex: idx
  };
}

// Full JSON export of all users (for /export_users).
function exportAllUsers() {
  var idx = Bot.getProperty("users_index");
  if (!idx) { idx = []; }
  var out = [];
  for (var i = 0; i < idx.length; i++) {
    var u = Bot.getProperty("user_" + idx[i]);
    if (u) { out.push(u); }
  }
  return out;
}

publish({
  // constants
  GLOBAL_LIST_CAP: GLOBAL_LIST_CAP,
  USER_LIST_CAP: USER_LIST_CAP,
  MAX_MESSAGE_LEN: MAX_MESSAGE_LEN,
  // parsing
  parseQuery: parseQuery,
  generateId: generateId,
  // users
  registerUser: registerUser,
  getUser: getUser,
  bumpUserCounters: bumpUserCounters,
  // whispers
  storeWhisper: storeWhisper,
  getWhisper: getWhisper,
  deleteWhisper: deleteWhisper,
  incrementViewCount: incrementViewCount,
  listGlobalWhispers: listGlobalWhispers,
  // counters
  bumpCounter: bumpCounter,
  getCounter: getCounter,
  getTodayCount: getTodayCount,
  todayStr: todayStr,
  // leaderboards
  topWhisperSenders: topWhisperSenders,
  topInlineSenders: topInlineSenders,
  // user list
  totalUsers: totalUsers,
  listUsersPage: listUsersPage,
  exportAllUsers: exportAllUsers
});
