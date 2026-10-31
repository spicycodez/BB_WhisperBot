/*CMD
  command: /reveal
  help: Reveal whisper — callback target for the 👁 Reveal button (also an informational stub when typed directly)
  need_reply: false
CMD*/

// Dual-purpose command:
//   • Callback context (button tap)  → run the reveal logic
//   • Direct command (user typed it) → informational stub that
//                                      redirects to inline mode

var SC = Libs.WhisperBot;
var W  = Libs.WhisperStore;

// ---------- Informational stub (typed directly) ----------
function showStub() {
  SC.ackCallback();
  var text =
    SC.toSmallCaps("Whispers are inline only") + "\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps("Type in any chat:") + "\n" +
    "@wisspbot " + SC.toSmallCaps("@username your secret message") + "\n" +
    "@wisspbot " + SC.toSmallCaps("123456789 your secret message") + "\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps("Only the target can tap reveal.");
  Api.sendMessage({ text: text });
}

// ---------- Callback reveal ----------
function doReveal() {
  var id = (params || "").trim();
  var whisper = id ? W.getWhisper(id) : null;

  if (!whisper) {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: SC.toSmallCaps("This whisper has expired or was already read."),
      show_alert: false
    });
    return;
  }

  // Authorization: target match, original sender, or owner/sudo.
  var targetMatch = false;
  if (whisper.target_type === "username") {
    targetMatch = !!(user && user.username &&
                     String(user.username).toLowerCase() === whisper.target_value);
  } else if (whisper.target_type === "id") {
    targetMatch = !!(user && user.telegramid &&
                     String(user.telegramid) === String(whisper.target_value));
  }
  var senderMatch = !!(user && user.telegramid &&
                       String(user.telegramid) === String(whisper.sender_id));
  var privileged  = SC.isOwnerOrSudo(user);

  if (!targetMatch && !senderMatch && !privileged) {
    // Wrong user — keep whisper alive so the real recipient can still reveal.
    // Original-case target ("@Maxim") when we have it, lowercase fallback
    // for whispers stored before target_display existed.
    var targetLabel = whisper.target_display
      ? whisper.target_display
      : (whisper.target_type === "username"
          ? "@" + whisper.target_value
          : "#" + whisper.target_value);
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: SC.toSmallCaps("Not for you! Only") + " " + targetLabel + " " +
            SC.toSmallCaps("can view."),
      show_alert: false
    });
    return;
  }

  // Authorized — reveal in popup, truncated to ~195 chars (Telegram
  // alert text limit).
  var senderTag = whisper.sender_username
    ? "@" + whisper.sender_username
    : SC.toSmallCaps("anonymous");
  var fullMsg  = whisper.message || "";
  var shown    = SC.truncate(fullMsg, 195);

  var popup =
    SC.toSmallCaps("Whisper from") + " " + senderTag + "\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps(shown) + "\n" +
    SC.scDivider() + "\n" +
    SC.toSmallCaps("Views") + ": " + ((whisper.view_count || 0) + 1);

  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text: popup,
    show_alert: true
  });

  // Bump view counter on the stored whisper + global revealed counter.
  W.incrementViewCount(id);

  // Optional logger chat copy.
  SC.logReveal(whisper, user);
}

// ---------- Dispatch ----------
if (request && request.id && request.data) {
  doReveal();
} else {
  showStub();
}
