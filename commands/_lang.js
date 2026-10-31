/*CMD
  command: /lang
  help: Pick the language the bot speaks to you in — the choice is saved against your account
  need_reply: false
  aliases: lang, /language
CMD*/

// Language picker. Zero-spam: typing /lang opens (or a button tap edits
// the same message into) a 2-column grid of 12 languages. Choosing one
// saves user_<id>.lang and the SAME message turns into the confirmation.

var SC   = Libs.WhisperBot;
var I18N = Libs.WhisperI18n;

SC.ackCallback();

var tid = user ? String(user.telegramid) : "";
var current = I18N.get(tid);

SC.editOrSend(
  I18N.pickText(SC, current),
  I18N.langGrid(SC, current)
);
