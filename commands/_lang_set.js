/*CMD
  command: /lang_set
  help: Button target — saves the chosen language to the user's account and confirms in that language
  need_reply: false
CMD*/

// Callback-only command: callback_data is "/lang_set <code>" coming
// from the /lang picker grid. Saves the language against the user's
// account, then edits the SAME message into a confirmation written in
// the newly selected language (zero-spam, one message).

var SC   = Libs.WhisperBot;
var I18N = Libs.WhisperI18n;

SC.ackCallback();

var tid  = user ? String(user.telegramid) : "";
var code = (params || "").trim().toLowerCase();

if (!tid) { return; }

if (!I18N.LANGS[code]) {
  // Unknown code — back to the picker.
  var cur = I18N.get(tid);
  SC.editOrSend(
    SC.toSmallCaps(I18N.t(cur, "lang_bad")),
    I18N.langGrid(SC, cur)
  );
  return;
}

I18N.set(tid, code);

// Confirmation in the NEW language + back-to-home button (also in the
// new language, so the user immediately sees the switch took effect).
SC.editOrSend(
  I18N.setText(SC, code),
  [[
    { text: "🏠 " + SC.toSmallCaps(I18N.t(code, "btn_home")), callback_data: "/start" },
    { text: "🌐 " + SC.toSmallCaps(I18N.t(code, "btn_lang")), callback_data: "/lang" }
  ]]
);
