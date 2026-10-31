/*
 * WhisperI18n — per-user language for the bot's PRIVATE interface.
 *
 * /lang lets each user pick the language the bot speaks to them in.
 * The choice is saved against their account (user_<telegramid>.lang)
 * and used by /start, /help, /id, /create_whisper, the catch-all and
 * the /lang screens themselves.
 *
 * Inline whisper cards and reveal popups stay English on purpose —
 * they are shown in GROUP chats to mixed audiences, not to a single
 * user's private UI.
 *
 * Non-Latin languages (Hindi, Bengali, Tamil, Urdu, Arabic, Russian)
 * pass through toSmallCaps() unchanged (no small-caps glyphs exist),
 * which is exactly the behaviour we want. Latin-script languages are
 * rendered in the bot's signature Unicode small caps by the helpers
 * below, with /commands and @handles (the @wisspbot/@BotFather set in
 * WhisperBot.js) preserved verbatim.
 *
 * Storage schema added:
 *   user_<telegramid>.lang   string   language code ("en", "hi", ...)
 */

var DEFAULT_LANG = "en";

/* ============================================================
 *  LANGUAGE REGISTRY  (button label = flag + native name)
 * ============================================================ */

var LANG_NAMES = {
  en: { name: "English",   flag: "🇬🇧" },
  hi: { name: "हिन्दी",     flag: "🇮🇳" },
  bn: { name: "বাংলা",     flag: "🇧🇩" },
  ta: { name: "தமிழ்",     flag: "🇮🇳" },
  ur: { name: "اردو",      flag: "🇵🇰" },
  es: { name: "Español",   flag: "🇪🇸" },
  pt: { name: "Português", flag: "🇧🇷" },
  ar: { name: "العربية",   flag: "🇸🇦" },
  ru: { name: "Русский",   flag: "🇷🇺" },
  id: { name: "Indonesia", flag: "🇮🇩" },
  fr: { name: "Français",  flag: "🇫🇷" },
  de: { name: "Deutsch",   flag: "🇩🇪" }
};

// Grid order (2 buttons per row in the /lang picker).
var ORDER = ["en", "hi", "bn", "ta", "ur", "es", "pt", "ar", "ru", "id", "fr", "de"];

/* ============================================================
 *  TRANSLATIONS
 * ============================================================ */

var STR = {

  /* ---------------- English ---------------- */
  en: {
    start_title: "Whisper Bot — Premium",
    start_tag: "Send anonymous inline whispers in any chat. Only the target can reveal.",
    start_example: "Example",
    ex_whisper: "you are awesome!",
    start_choose: "Choose 👇",
    btn_create: "Create whisper",
    btn_group: "Try in group",
    btn_help: "Help",
    btn_id: "My id",
    btn_share: "Share bot",
    btn_lang: "Language",
    btn_home: "Home",
    btn_open_menu: "Open menu",
    unknown_cmd: "Unknown command ❓",
    you_typed: "You typed",
    send_start: "Send /start to open menu",
    id_error: "Could not read your account info.",
    id_title: "Your Telegram identity 👤",
    lbl_tgid: "Telegram id",
    lbl_username: "Username",
    no_username: "(no username set)",
    id_hint: "Send this id to anyone who wants to whisper to you by numeric id:",
    id_msg_hint: "your message",
    create_title: "Create a whisper 🤫",
    create_inline_only: "Whispers are inline only — you type them in any chat, not here.",
    syntax: "Syntax",
    syntax_user_msg: "@username your secret message",
    syntax_id_msg: "123456789 your secret message",
    create_tap: "Tap the button below to start typing a whisper right here.",
    help_title: "Help — Whisper Bot 📖",
    help_body: "What is a whisper?\nA whisper is a secret inline message. The recipient sees only a card with a Reveal button — when they tap it, the message pops up privately. Nothing is posted in the chat.\n\nSyntax ⚡\n@wisspbot @username your secret message\n@wisspbot 123456789 your secret message\n\nHow it works 👁\n1. Type the query in any chat\n2. A card appears with the recipient's name\n3. Only the target (or the sender) can reveal\n4. The message pops up privately on their device\n\nTips 💡\n• Inline mode must be enabled in @BotFather (/setinline)\n• No username? Whisper to a numeric id instead — send /id here to get yours\n• 🌐 /lang — pick the language the bot speaks to you in\n\nPerfect for groups, games and surprise compliments ✨",
    lang_pick: "Pick your language",
    lang_current: "Current",
    lang_note: "The choice is saved to your account.",
    lang_set_ok: "✅ Language set to",
    lang_bad: "Unknown language."
  },

  /* ---------------- हिन्दी Hindi ---------------- */
  hi: {
    start_title: "व्हिस्पर बॉट — प्रीमियम",
    start_tag: "किसी भी चैट में गुप्त व्हिस्पर भेजें। केवल पाने वाला व्यक्ति उसे देख सकता है।",
    start_example: "उदाहरण",
    ex_whisper: "तुम कमाल हो!",
    start_choose: "चुनें 👇",
    btn_create: "व्हिस्पर बनाएँ",
    btn_group: "ग्रुप में आज़माएँ",
    btn_help: "मदद",
    btn_id: "मेरी आईडी",
    btn_share: "बॉट शेयर करें",
    btn_lang: "भाषा",
    btn_home: "होम",
    btn_open_menu: "मेनू खोलें",
    unknown_cmd: "अज्ञात कमांड ❓",
    you_typed: "आपने लिखा",
    send_start: "मेनू खोलने के लिए /start भेजें",
    id_error: "आपकी खाता जानकारी नहीं मिली।",
    id_title: "आपकी टेलीग्राम पहचान 👤",
    lbl_tgid: "टेलीग्राम आईडी",
    lbl_username: "यूज़रनेम",
    no_username: "(कोई यूज़रनेम नहीं)",
    id_hint: "यह आईडी उसे भेजें जो आपको नंबर से व्हिस्पर भेजना चाहे:",
    id_msg_hint: "आपका संदेश",
    create_title: "व्हिस्पर बनाएँ 🤫",
    create_inline_only: "व्हिस्पर सिर्फ़ इनलाइन हैं — इन्हें किसी भी चैट में टाइप करें, यहाँ नहीं।",
    syntax: "सिंटैक्स",
    syntax_user_msg: "@username आपका गुप्त संदेश",
    syntax_id_msg: "123456789 आपका गुप्त संदेश",
    create_tap: "यहीं व्हिस्पर टाइप करना शुरू करने के लिए नीचे का बटन दबाएँ।",
    help_title: "मदद — व्हिस्पर बॉट 📖",
    help_body: "व्हिस्पर क्या है?\nव्हिस्पर एक गुप्त इनलाइन संदेश है। पाने वाले को सिर्फ़ रिवील बटन वाला कार्ड दिखता है — टैप करने पर संदेश निजी पॉपअप में दिखता है। चैट में कुछ भी पोस्ट नहीं होता।\n\nसिंटैक्स ⚡\n@wisspbot @username आपका गुप्त संदेश\n@wisspbot 123456789 आपका गुप्त संदेश\n\nकैसे काम करता है 👁\n1. किसी भी चैट में क्वेरी टाइप करें\n2. पाने वाले के नाम के साथ कार्ड दिखेगा\n3. सिर्फ़ लक्ष्य (या भेजने वाला) रिवील कर सकता है\n4. संदेश उसकी स्क्रीन पर निजी पॉपअप में दिखेगा\n\nसुझाव 💡\n• @BotFather में इनलाइन मोड चालू होना चाहिए (/setinline)\n• यूज़रनेम नहीं है? नंबर आईडी से व्हिस्पर भेजें — अपनी आईडी के लिए यहाँ /id भेजें\n• 🌐 /lang — बॉट की भाषा बदलें\n\nग्रुप, गेम और सरप्राइज़ के लिए बेहतरीन ✨",
    lang_pick: "अपनी भाषा चुनें",
    lang_current: "वर्तमान",
    lang_note: "आपकी पसंद आपके खाते में सेव होती है।",
    lang_set_ok: "✅ भाषा बदली गई:",
    lang_bad: "अज्ञात भाषा।"
  },

  /* ---------------- বাংলা Bengali ---------------- */
  bn: {
    start_title: "হুইসপার বট — প্রিমিয়াম",
    start_tag: "যেকোনো চ্যাটে নাম গোপন রেখে হুইসপার পাঠান। শুধু প্রাপক সেটি দেখতে পাবে।",
    start_example: "উদাহরণ",
    ex_whisper: "তুমি অসাধারণ!",
    start_choose: "বেছে নিন 👇",
    btn_create: "হুইসপার লিখুন",
    btn_group: "গ্রুপে ব্যবহার করুন",
    btn_help: "সাহায্য",
    btn_id: "আমার আইডি",
    btn_share: "বট শেয়ার করুন",
    btn_lang: "ভাষা",
    btn_home: "হোম",
    btn_open_menu: "মেনু খুলুন",
    unknown_cmd: "অজানা কমান্ড ❓",
    you_typed: "আপনি লিখেছেন",
    send_start: "মেনু খুলতে /start পাঠান",
    id_error: "আপনার অ্যাকাউন্টের তথ্য পাওয়া যায়নি।",
    id_title: "আপনার টেলিগ্রাম পরিচয় 👤",
    lbl_tgid: "টেলিগ্রাম আইডি",
    lbl_username: "ইউজারনেম",
    no_username: "(ইউজারনেম নেই)",
    id_hint: "যে আপনাকে নম্বর দিয়ে হুইসপার পাঠাতে চায় তাকে এই আইডি পাঠান:",
    id_msg_hint: "আপনার বার্তা",
    create_title: "হুইসপার লিখুন 🤫",
    create_inline_only: "হুইসপার শুধু ইনলাইনে — এগুলো যেকোনো চ্যাটে টাইপ করুন, এখানে নয়।",
    syntax: "সিনট্যাক্স",
    syntax_user_msg: "@username আপনার গোপন বার্তা",
    syntax_id_msg: "123456789 আপনার গোপন বার্তা",
    create_tap: "এখানেই হুইসপার টাইপ শুরু করতে নিচের বোতামে ট্যাপ করুন।",
    help_title: "সাহায্য — হুইসপার বট 📖",
    help_body: "হুইসপার কী?\nহুইসপার একটি গোপন ইনলাইন বার্তা। প্রাপক শুধু রিভিল বোতামসহ কার্ড দেখে — ট্যাপ করলে বার্তা তার স্ক্রিনে ব্যক্তিগত পপআপে দেখা যায়। च्याटে किछु पोस्ट हय ना।\n\nসিনট্যাক্স ⚡\n@wisspbot @username আপনার গোপন বার্তা\n@wisspbot 123456789 আপনার গোপন বার্তা\n\nকীভাবে কাজ করে 👁\n১. যেকোনো চ্যাটে কোয়েরি টাইপ করুন\n২. প্রাপকের নামসহ কার্ড দেখা যাবে\n৩. শুধু প্রাপক (বা প্রেরক) রিভিল করতে পারে\n৪. বার্তা তার ডিভাইসে ব্যক্তিগত পপআপে আসবে\n\nটিপস 💡\n• @BotFather-এ ইনলাইন মোড চালু থাকতে হবে (/setinline)\n• ইউজারনেম নেই? সংখ্যা আইডিতে হুইসপার পাঠান — নিজের আইডির জন্য এখানে /id পাঠান\n• 🌐 /lang — বটের ভাষা বদলান\n\nগ্রুপ, গেম ও সারপ্রাইজের জন্য দারুণ ✨",
    lang_pick: "আপনার ভাষা বেছে নিন",
    lang_current: "বর্তমান",
    lang_note: "আপনার পছন্দ অ্যাকাউন্টে সংরক্ষিত হয়।",
    lang_set_ok: "✅ ভাষা নির্ধারিত হয়েছে:",
    lang_bad: "অজানা ভাষা।"
  },

  /* ---------------- தமிழ் Tamil ---------------- */
  ta: {
    start_title: "விஸ்பர் பாட் — பிரீமியம்",
    start_tag: "எந்த அரட்டையிலும் பெயர் மறைத்து விஸ்பர் அனுப்புங்கள். பெறுபவர் மட்டுமே படிக்க முடியும்.",
    start_example: "உதாரணம்",
    ex_whisper: "நீ அற்புதம்!",
    start_choose: "தேர்வு செய்யுங்கள் 👇",
    btn_create: "விஸ்பர் எழுது",
    btn_group: "குழுவில் முயற்சி",
    btn_help: "உதவி",
    btn_id: "என் ஐடி",
    btn_share: "பாட்டை பங்கிடு",
    btn_lang: "மொழி",
    btn_home: "முகப்பு",
    btn_open_menu: "மெனுவைத் திற",
    unknown_cmd: "தெரியாத கட்டளை ❓",
    you_typed: "நீங்கள் தட்டச்சு செய்தது",
    send_start: "மெனுவைத் திறக்க /start அனுப்புங்கள்",
    id_error: "உங்கள் கணக்கு தகவலைப் படிக்க முடியவில்லை.",
    id_title: "உங்கள் டெலிகிராம் அடையாளம் 👤",
    lbl_tgid: "டெலிகிராம் ஐடி",
    lbl_username: "பயனர்பெயர்",
    no_username: "(பயனர்பெயர் இல்லை)",
    id_hint: "உங்களுக்கு எண் மூலம் விஸ்பர் அனுப்ப விரும்புபவருக்கு இந்த ஐடியை அனுப்புங்கள்:",
    id_msg_hint: "உங்கள் செய்தி",
    create_title: "விஸ்பர் உருவாக்கு 🤫",
    create_inline_only: "விஸ்பர்கள் இன்லைனில் மட்டுமே — அவற்றை எந்த அரட்டையிலும் டைப் செய்யுங்கள், இங்கே அல்ல.",
    syntax: "வடிவம்",
    syntax_user_msg: "@username உங்கள் இரகசிய செய்தி",
    syntax_id_msg: "123456789 உங்கள் இரகசிய செய்தி",
    create_tap: "இங்கேயே விஸ்பர் டைப் செய்ய கீழே உள்ள பொத்தானை அழுத்துங்கள்.",
    help_title: "உதவி — விஸ்பர் பாட் 📖",
    help_body: "விஸ்பர் என்றால் என்ன?\nவிஸ்பர் ஒரு இரகசிய இன்லைன் செய்தி. பெறுபவருக்கு ரிவீல் பொத்தானுடன் ஒரு கார்டு மட்டுமே தெரியும் — தட்டினால் செய்தி அவர் திரையில் தனிப்பட்ட பாப்அப்பாக தோன்றும். அரட்டையில் எதுவும் இடப்படாது.\n\n\n\nவடிவம் ⚡\n@wisspbot @username உங்கள் இரகசிய செய்தி\n@wisspbot 123456789 உங்கள் இரகசிய செய்தி\n\nஎப்படி வேலை செய்கிறது 👁\n1. எந்த அரட்டையிலும் கேள்வியை டைப் செய்யுங்கள்\n2. பெறுபவரின் பெயருடன் கார்டு தோன்றும்\n3. இலக்கு (அல்லது அனுப்பியவர்) மட்டுமே ரிவீல் செய்யலாம்\n4. செய்தி அவர் சாதனத்தில் தனிப்பட்ட பாப்அப்பாக வரும்\n\nகுறிப்புகள் 💡\n• @BotFather இல் இன்லைன் முறை இயக்கப்பட வேண்டும் (/setinline)\n• பயனர்பெயர் இல்லையா? எண் ஐடிக்கு அனுப்புங்கள் — உங்கள் ஐடிக்கு இங்கே /id அனுப்புங்கள்\n• 🌐 /lang — பாட்டின் மொழியை மாற்றுங்கள்\n\nகுழுக்கள், விளையாட்டுகள், ஆச்சரிய பாராட்டுகளுக்கு சிறந்தது ✨",
    lang_pick: "உங்கள் மொழியைத் தேர்ந்தெடுங்கள்",
    lang_current: "தற்போதைய",
    lang_note: "இந்த தேர்வு உங்கள் கணக்கில் சேமிக்கப்படும்.",
    lang_set_ok: "✅ மொழி மாற்றப்பட்டது:",
    lang_bad: "தெரியாத மொழி."
  },

  /* ---------------- اردو Urdu ---------------- */
  ur: {
    start_title: "وسپر باٹ — پریمیم",
    start_tag: "کسی بھی چیٹ میں گمنام وسپر بھیجیں۔ صرف مطلوبہ شخص اسے پڑھ سکتا ہے۔",
    start_example: "مثال",
    ex_whisper: "آپ کمال ہیں!",
    start_choose: "منتخب کریں 👇",
    btn_create: "وسپر لکھیں",
    btn_group: "گروپ میں آزمائیں",
    btn_help: "مدد",
    btn_id: "میری آئی ڈی",
    btn_share: "باٹ شیئر کریں",
    btn_lang: "زبان",
    btn_home: "ہوم",
    btn_open_menu: "مینو کھولیں",
    unknown_cmd: "نامعلوم کمانڈ ❓",
    you_typed: "آپ نے لکھا",
    send_start: "مینو کھولنے کے لیے /start بھیجیں",
    id_error: "آپ کے اکاؤنٹ کی معلومات نہیں مل سکیں۔",
    id_title: "آپ کی ٹیلیگرام شناخت 👤",
    lbl_tgid: "ٹیلیگرام آئی ڈی",
    lbl_username: "یوزرنیم",
    no_username: "(یوزرنیم نہیں ہے)",
    id_hint: "جو آپ کو نمبر سے وسپر بھیجنا چاہے اسے یہ آئی ڈی بھیجیں:",
    id_msg_hint: "آپ کا پیغام",
    create_title: "وسپر بنائیں 🤫",
    create_inline_only: "وسپر صرف ان لائن ہیں — انہیں کسی بھی چیٹ میں ٹائپ کریں، یہاں نہیں۔",
    syntax: "فارمیٹ",
    syntax_user_msg: "@username آپ کا خفیہ پیغام",
    syntax_id_msg: "123456789 آپ کا خفیہ پیغام",
    create_tap: "یہیں وسپر ٹائپ شروع کرنے کے لیے نیچے دیے بٹن پر ٹیپ کریں۔",
    help_title: "مدد — وسپر باٹ 📖",
    help_body: "وسپر کیا ہے؟\nوسپر ایک خفیہ ان لائن پیغام ہے۔ وصول کنندہ کو صرف ریویل بٹن والا کارڈ دکھتا ہے — ٹیپ کرنے پر پیغام اس کی اسکرین پر نجی پاپ اپ میں آتا ہے۔ چیٹ میں کچھ بھی پوسٹ نہیں ہوتا۔\n\n\n\nفارمیٹ ⚡\n@wisspbot @username آپ کا خفیہ پیغام\n@wisspbot 123456789 آپ کا خفیہ پیغام\n\nکیسے کام کرتا ہے 👁\n1. کسی بھی چیٹ میں کوانٹی ٹائپ کریں\n2. وصول کنندہ کے نام کے ساتھ کارڈ نظر آئے گا\n3. صرف مطلوبہ شخص (یا بھیجنے والا) ریویل کر سکتا ہے\n4. پیغام اس کے ڈیوائس پر نجی پاپ اپ میں آئے گا\n\nمشورے 💡\n• @BotFather میں ان لائن موڈ آن ہونا چاہیے (/setinline)\n• یوزرنیم نہیں؟ نمبر آئی ڈی پر وسپر بھیجیں — اپنی آئی ڈی کے لیے یہاں /id بھیجیں\n• 🌐 /lang — باٹ کی زبان بدلیں\n\nگروپس، گیمز اور سرپرائز کے لیے بہترین ✨",
    lang_pick: "اپنی زبان منتخب کریں",
    lang_current: "موجودہ",
    lang_note: "آپ کا انتخاب آپ کے اکاؤنٹ میں محفوظ ہوتا ہے۔",
    lang_set_ok: "✅ زبان تبدیل ہو گئی:",
    lang_bad: "نامعلوم زبان۔"
  },

  /* ---------------- Español ---------------- */
  es: {
    start_title: "Whisper Bot — Premium",
    start_tag: "Envía susurros anónimos en cualquier chat. Solo el destinatario puede revelarlos.",
    start_example: "Ejemplo",
    ex_whisper: "¡eres increíble!",
    start_choose: "Elige 👇",
    btn_create: "Crear susurro",
    btn_group: "Probar en grupo",
    btn_help: "Ayuda",
    btn_id: "Mi id",
    btn_share: "Compartir bot",
    btn_lang: "Idioma",
    btn_home: "Inicio",
    btn_open_menu: "Abrir menú",
    unknown_cmd: "Comando desconocido ❓",
    you_typed: "Escribiste",
    send_start: "Envía /start para abrir el menú",
    id_error: "No se pudo leer la información de tu cuenta.",
    id_title: "Tu identidad de Telegram 👤",
    lbl_tgid: "Id de Telegram",
    lbl_username: "Usuario",
    no_username: "(sin nombre de usuario)",
    id_hint: "Envía este id a quien quiera susurrarte por número:",
    id_msg_hint: "tu mensaje",
    create_title: "Crear un susurro 🤫",
    create_inline_only: "Los susurros son solo en línea — escríbelos en cualquier chat, no aquí.",
    syntax: "Sintaxis",
    syntax_user_msg: "@username tu mensaje secreto",
    syntax_id_msg: "123456789 tu mensaje secreto",
    create_tap: "Toca el botón de abajo para empezar a escribir un susurro aquí mismo.",
    help_title: "Ayuda — Whisper Bot 📖",
    help_body: "¿Qué es un susurro?\nUn susurro es un mensaje en línea secreto. El destinatario solo ve una tarjeta con un botón Revelar — al tocarlo, el mensaje aparece en una ventana privada. Nada se publica en el chat.\n\n\n\nSintaxis ⚡\n@wisspbot @username tu mensaje secreto\n@wisspbot 123456789 tu mensaje secreto\n\nCómo funciona 👁\n1. Escribe la consulta en cualquier chat\n2. Aparece una tarjeta con el nombre del destinatario\n3. Solo el destinatario (o el remitente) puede revelar\n4. El mensaje aparece en privado en su dispositivo\n\nConsejos 💡\n• El modo en línea debe estar activado en @BotFather (/setinline)\n• ¿Sin nombre de usuario? Susurra a un id numérico — envía /id aquí para obtener el tuyo\n• 🌐 /lang — cambia el idioma del bot\n\nPerfecto para grupos, juegos y cumplidos sorpresa ✨",
    lang_pick: "Elige tu idioma",
    lang_current: "Actual",
    lang_note: "Tu elección se guarda en tu cuenta.",
    lang_set_ok: "✅ Idioma cambiado a:",
    lang_bad: "Idioma desconocido."
  },

  /* ---------------- Português ---------------- */
  pt: {
    start_title: "Whisper Bot — Premium",
    start_tag: "Envie sussurros anônimos em qualquer chat. Só o destinatário pode revelar.",
    start_example: "Exemplo",
    ex_whisper: "você é incrível!",
    start_choose: "Escolha 👇",
    btn_create: "Criar sussurro",
    btn_group: "Testar no grupo",
    btn_help: "Ajuda",
    btn_id: "Meu id",
    btn_share: "Compartilhar bot",
    btn_lang: "Idioma",
    btn_home: "Início",
    btn_open_menu: "Abrir menu",
    unknown_cmd: "Comando desconhecido ❓",
    you_typed: "Você digitou",
    send_start: "Envie /start para abrir o menu",
    id_error: "Não foi possível ler as informações da sua conta.",
    id_title: "Sua identidade no Telegram 👤",
    lbl_tgid: "Id do Telegram",
    lbl_username: "Usuário",
    no_username: "(sem nome de usuário)",
    id_hint: "Envie este id para quem quiser sussurrar para você por número:",
    id_msg_hint: "sua mensagem",
    create_title: "Criar um sussurro 🤫",
    create_inline_only: "Sussurros são só no modo inline — digite-os em qualquer chat, não aqui.",
    syntax: "Sintaxe",
    syntax_user_msg: "@username sua mensagem secreta",
    syntax_id_msg: "123456789 sua mensagem secreta",
    create_tap: "Toque no botão abaixo para começar a digitar um sussurro aqui mesmo.",
    help_title: "Ajuda — Whisper Bot 📖",
    help_body: "O que é um sussurro?\nUm sussurro é uma mensagem inline secreta. O destinatário vê apenas um cartão com um botão Revelar — ao tocar, a mensagem aparece num popup privado. Nada é publicado no chat.\n\n\n\nSintaxe ⚡\n@wisspbot @username sua mensagem secreta\n@wisspbot 123456789 sua mensagem secreta\n\nComo funciona 👁\n1. Digite a consulta em qualquer chat\n2. Um cartão aparece com o nome do destinatário\n3. Só o destinatário (ou o remetente) pode revelar\n4. A mensagem aparece em privado no aparelho dele\n\nDicas 💡\n• O modo inline precisa estar ativado no @BotFather (/setinline)\n• Sem nome de usuário? Sussurre para um id numérico — envie /id aqui para obter o seu\n• 🌐 /lang — mude o idioma do bot\n\nPerfeito para grupos, jogos e elogios surpresa ✨",
    lang_pick: "Escolha seu idioma",
    lang_current: "Atual",
    lang_note: "Sua escolha fica salva na sua conta.",
    lang_set_ok: "✅ Idioma definido para:",
    lang_bad: "Idioma desconhecido."
  },

  /* ---------------- العربية ---------------- */
  ar: {
    start_title: "وبسبر بوت — بريميوم",
    start_tag: "أرسل همسات مجهولة في أي محادثة. الهدف فقط يمكنه كشفها.",
    start_example: "مثال",
    ex_whisper: "أنت رائع!",
    start_choose: "اختر 👇",
    btn_create: "إنشاء همسة",
    btn_group: "جرّب في مجموعة",
    btn_help: "مساعدة",
    btn_id: "معرّفي",
    btn_share: "شارك البوت",
    btn_lang: "اللغة",
    btn_home: "الرئيسية",
    btn_open_menu: "افتح القائمة",
    unknown_cmd: "أمر غير معروف ❓",
    you_typed: "كتبت",
    send_start: "أرسل /start لفتح القائمة",
    id_error: "تعذر قراءة معلومات حسابك.",
    id_title: "هويتك في تيليجرام 👤",
    lbl_tgid: "معرّف تيليجرام",
    lbl_username: "اسم المستخدم",
    no_username: "(لا يوجد اسم مستخدم)",
    id_hint: "أرسل هذا المعرّف لمن يريد مراسلتك بالرقم:",
    id_msg_hint: "رسالتك",
    create_title: "إنشاء همسة 🤫",
    create_inline_only: "الهمسات تعمل بالإنلاين فقط — اكتبها في أي محادثة، ليس هنا.",
    syntax: "الصيغة",
    syntax_user_msg: "@username رسالتك السرية",
    syntax_id_msg: "123456789 رسالتك السرية",
    create_tap: "اضغط الزر أدناه لبدء كتابة همسة هنا.",
    help_title: "المساعدة — وبسبر بوت 📖",
    help_body: "ما هي الهمسة؟\nالهمسة رسالة إنلاين سرية. يرى الهدف بطاقة فيها زر كشف فقط — وعند الضغط عليه تظهر الرسالة في نافذة خاصة على شاشته. لا يُنشر شيء في المحادثة.\n\n\n\nالصيغة ⚡\n@wisspbot @username رسالتك السرية\n@wisspbot 123456789 رسالتك السرية\n\nكيف تعمل 👁\n1. اكتب الاستعلام في أي محادثة\n2. تظهر بطاقة باسم الهدف\n3. الهدف (أو المرسل) فقط يمكنه الكشف\n4. تظهر الرسالة خاصة على جهازه\n\nنصائح 💡\n• يجب تفعيل وضع الإنلاين في @BotFather (/setinline)\n• لا يوجد اسم مستخدم؟ أرسل لرقم تيليجرام — أرسل /id هنا لمعرفة رقمك\n• 🌐 /lang — غيّر لغة البوت\n\nمثالي للمجموعات والألعاب والمجاملات المفاجئة ✨",
    lang_pick: "اختر لغتك",
    lang_current: "الحالية",
    lang_note: "يُحفظ اختيارك في حسابك.",
    lang_set_ok: "✅ تم تعيين اللغة إلى:",
    lang_bad: "لغة غير معروفة."
  },

  /* ---------------- Русский ---------------- */
  ru: {
    start_title: "Whisper Bot — Premium",
    start_tag: "Отправляйте анонимные шёпоты в любом чате. Прочитать может только адресат.",
    start_example: "Пример",
    ex_whisper: "ты замечательный!",
    start_choose: "Выберите 👇",
    btn_create: "Создать шёпот",
    btn_group: "Попробовать в группе",
    btn_help: "Помощь",
    btn_id: "Мой id",
    btn_share: "Поделиться ботом",
    btn_lang: "Язык",
    btn_home: "Главная",
    btn_open_menu: "Открыть меню",
    unknown_cmd: "Неизвестная команда ❓",
    you_typed: "Вы написали",
    send_start: "Отправьте /start, чтобы открыть меню",
    id_error: "Не удалось прочитать данные вашего аккаунта.",
    id_title: "Ваш профиль в Telegram 👤",
    lbl_tgid: "Telegram id",
    lbl_username: "Юзернейм",
    no_username: "(нет юзернейма)",
    id_hint: "Отправьте этот id тому, кто хочет шепнуть вам по номеру:",
    id_msg_hint: "ваше сообщение",
    create_title: "Создать шёпот 🤫",
    create_inline_only: "Шёпоты работают только через инлайн — печатайте их в любом чате, не здесь.",
    syntax: "Формат",
    syntax_user_msg: "@username ваше секретное сообщение",
    syntax_id_msg: "123456789 ваше секретное сообщение",
    create_tap: "Нажмите кнопку ниже, чтобы начать печатать шёпот прямо здесь.",
    help_title: "Помощь — Whisper Bot 📖",
    help_body: "Что такое шёпот?\nШёпот — секретное инлайн-сообщение. Адресат видит только карточку с кнопкой «Показать» — при нажатии сообщение появляется в приватном окне на его экране. В чат ничего не публикуется.\n\n\n\nФормат ⚡\n@wisspbot @username ваше секретное сообщение\n@wisspbot 123456789 ваше секретное сообщение\n\nКак это работает 👁\n1. Введите запрос в любом чате\n2. Появится карточка с именем адресата\n3. Показать может только адресат (или отправитель)\n4. Сообщение появится у него приватно\n\nСоветы 💡\n• Инлайн-режим должен быть включён в @BotFather (/setinline)\n• Нет юзернейма? Шепните на числовой id — отправьте /id здесь, чтобы узнать свой\n• 🌐 /lang — сменить язык бота\n\nИдеально для групп, игр и неожиданных комплиментов ✨",
    lang_pick: "Выберите язык",
    lang_current: "Текущий",
    lang_note: "Выбор сохраняется в вашем аккаунте.",
    lang_set_ok: "✅ Язык изменён на:",
    lang_bad: "Неизвестный язык."
  },

  /* ---------------- Indonesia ---------------- */
  id: {
    start_title: "Whisper Bot — Premium",
    start_tag: "Kirim bisikan anonim di chat apa pun. Hanya target yang bisa membukanya.",
    start_example: "Contoh",
    ex_whisper: "kamu hebat!",
    start_choose: "Pilih 👇",
    btn_create: "Buat bisikan",
    btn_group: "Coba di grup",
    btn_help: "Bantuan",
    btn_id: "Id saya",
    btn_share: "Bagikan bot",
    btn_lang: "Bahasa",
    btn_home: "Beranda",
    btn_open_menu: "Buka menu",
    unknown_cmd: "Perintah tidak dikenal ❓",
    you_typed: "Kamu menulis",
    send_start: "Kirim /start untuk membuka menu",
    id_error: "Tidak bisa membaca info akunmu.",
    id_title: "Identitas Telegram kamu 👤",
    lbl_tgid: "Id Telegram",
    lbl_username: "Username",
    no_username: "(tidak ada username)",
    id_hint: "Kirim id ini ke orang yang ingin membisikanmu lewat nomor:",
    id_msg_hint: "pesanmu",
    create_title: "Buat bisikan 🤫",
    create_inline_only: "Bisikan hanya lewat inline — ketik di chat mana pun, bukan di sini.",
    syntax: "Format",
    syntax_user_msg: "@username pesan rahasiamu",
    syntax_id_msg: "123456789 pesan rahasiamu",
    create_tap: "Ketuk tombol di bawah untuk mulai menulis bisikan di sini.",
    help_title: "Bantuan — Whisper Bot 📖",
    help_body: "Apa itu bisikan?\nBisikan adalah pesan inline rahasia. Penerima hanya melihat kartu dengan tombol Buka — saat ditekan, pesan muncul sebagai popup pribadi di layarnya. Tidak ada yang diposting ke chat.\n\n\n\nFormat ⚡\n@wisspbot @username pesan rahasiamu\n@wisspbot 123456789 pesan rahasiamu\n\nCara kerja 👁\n1. Ketik query di chat apa pun\n2. Kartu dengan nama penerima akan muncul\n3. Hanya target (atau pengirim) yang bisa membuka\n4. Pesan muncul privat di perangkatnya\n\nTips 💡\n• Mode inline harus diaktifkan di @BotFather (/setinline)\n• Tidak punya username? Bisikkan ke id angka — kirim /id di sini untuk melihat id-mu\n• 🌐 /lang — ganti bahasa bot\n\nSempurna untuk grup, game dan pujian kejutan ✨",
    lang_pick: "Pilih bahasamu",
    lang_current: "Saat ini",
    lang_note: "Pilihanmu disimpan di akunmu.",
    lang_set_ok: "✅ Bahasa diubah ke:",
    lang_bad: "Bahasa tidak dikenal."
  },

  /* ---------------- Français ---------------- */
  fr: {
    start_title: "Whisper Bot — Premium",
    start_tag: "Envoyez des murmures anonymes dans n'importe quel chat. Seul le destinataire peut les révéler.",
    start_example: "Exemple",
    ex_whisper: "tu es génial !",
    start_choose: "Choisissez 👇",
    btn_create: "Créer un murmure",
    btn_group: "Essayer dans un groupe",
    btn_help: "Aide",
    btn_id: "Mon id",
    btn_share: "Partager le bot",
    btn_lang: "Langue",
    btn_home: "Accueil",
    btn_open_menu: "Ouvrir le menu",
    unknown_cmd: "Commande inconnue ❓",
    you_typed: "Vous avez tapé",
    send_start: "Envoyez /start pour ouvrir le menu",
    id_error: "Impossible de lire les informations de votre compte.",
    id_title: "Votre identité Telegram 👤",
    lbl_tgid: "Id Telegram",
    lbl_username: "Pseudonyme",
    no_username: "(pas de pseudonyme)",
    id_hint: "Envoyez cet id à ceux qui veulent vous murmurer un message par numéro :",
    id_msg_hint: "votre message",
    create_title: "Créer un murmure 🤫",
    create_inline_only: "Les murmures sont en inline uniquement — tapez-les dans n'importe quel chat, pas ici.",
    syntax: "Syntaxe",
    syntax_user_msg: "@username votre message secret",
    syntax_id_msg: "123456789 votre message secret",
    create_tap: "Appuyez sur le bouton ci-dessous pour commencer à taper un murmure ici.",
    help_title: "Aide — Whisper Bot 📖",
    help_body: "Qu'est-ce qu'un murmure ?\nUn murmure est un message inline secret. Le destinataire ne voit qu'une carte avec un bouton Révéler — en appuyant, le message apparaît dans une fenêtre privée sur son écran. Rien n'est publié dans le chat.\n\n\n\nSyntaxe ⚡\n@wisspbot @username votre message secret\n@wisspbot 123456789 votre message secret\n\nComment ça marche 👁\n1. Tapez la requête dans n'importe quel chat\n2. Une carte apparaît avec le nom du destinataire\n3. Seul le destinataire (ou l'expéditeur) peut révéler\n4. Le message s'affiche en privé sur son appareil\n\nAstuces 💡\n• Le mode inline doit être activé dans @BotFather (/setinline)\n• Pas de pseudo ? Murmurez à un id numérique — envoyez /id ici pour obtenir le vôtre\n• 🌐 /lang — changez la langue du bot\n\nParfait pour les groupes, les jeux et les compliments surprises ✨",
    lang_pick: "Choisissez votre langue",
    lang_current: "Actuelle",
    lang_note: "Votre choix est enregistré dans votre compte.",
    lang_set_ok: "✅ Langue définie sur :",
    lang_bad: "Langue inconnue."
  },

  /* ---------------- Deutsch ---------------- */
  de: {
    start_title: "Whisper Bot — Premium",
    start_tag: "Sende anonyme Flüsternachrichten in jedem Chat. Nur der Empfänger kann sie lesen.",
    start_example: "Beispiel",
    ex_whisper: "du bist toll!",
    start_choose: "Wähle 👇",
    btn_create: "Flüstern erstellen",
    btn_group: "In Gruppe testen",
    btn_help: "Hilfe",
    btn_id: "Meine id",
    btn_share: "Bot teilen",
    btn_lang: "Sprache",
    btn_home: "Start",
    btn_open_menu: "Menü öffnen",
    unknown_cmd: "Unbekannter Befehl ❓",
    you_typed: "Du hast geschrieben",
    send_start: "Sende /start, um das Menü zu öffnen",
    id_error: "Kontodaten konnten nicht gelesen werden.",
    id_title: "Deine Telegram-Identität 👤",
    lbl_tgid: "Telegram-id",
    lbl_username: "Benutzername",
    no_username: "(kein Benutzername)",
    id_hint: "Sende diese id an alle, die dir per Nummer flüstern wollen:",
    id_msg_hint: "deine Nachricht",
    create_title: "Flüstern erstellen 🤫",
    create_inline_only: "Flüstern geht nur inline — tippe sie in einem beliebigen Chat, nicht hier.",
    syntax: "Format",
    syntax_user_msg: "@username deine geheime Nachricht",
    syntax_id_msg: "123456789 deine geheime Nachricht",
    create_tap: "Tippe auf die Schaltfläche unten, um hier direkt ein Flüstern zu schreiben.",
    help_title: "Hilfe — Whisper Bot 📖",
    help_body: "Was ist ein Flüstern?\nEin Flüstern ist eine geheime Inline-Nachricht. Der Empfänger sieht nur eine Karte mit einem Zeigen-Button — beim Antippen erscheint die Nachricht privat auf seinem Bildschirm. Im Chat wird nichts gepostet.\n\n\n\nFormat ⚡\n@wisspbot @username deine geheime Nachricht\n@wisspbot 123456789 deine geheime Nachricht\n\nSo funktioniert es 👁\n1. Tippe die Anfrage in einen beliebigen Chat\n2. Eine Karte mit dem Namen des Empfängers erscheint\n3. Nur der Empfänger (oder Absender) kann sie öffnen\n4. Die Nachricht erscheint privat auf seinem Gerät\n\nTipps 💡\n• Der Inline-Modus muss in @BotFather aktiviert sein (/setinline)\n• Kein Benutzername? Flüstere an eine nummerische id — sende hier /id für deine\n• 🌐 /lang — Sprache des Bots ändern\n\nPerfekt für Gruppen, Spiele und Überraschungs-Komplimente ✨",
    lang_pick: "Wähle deine Sprache",
    lang_current: "Aktuell",
    lang_note: "Deine Wahl wird in deinem Konto gespeichert.",
    lang_set_ok: "✅ Sprache geändert auf:",
    lang_bad: "Unbekannte Sprache."
  }
};

/* ============================================================
 *  CORE API
 * ============================================================ */

// Read the saved language for a Telegram id. Falls back to "en".
function get(tid) {
  if (!tid) { return DEFAULT_LANG; }
  var u = Bot.getProperty("user_" + String(tid));
  return (u && u.lang && STR[u.lang]) ? u.lang : DEFAULT_LANG;
}

// Save the language against the user's account. Creates a minimal
// user record if one does not exist yet (silent — no owner DM; the
// owner notification stays reserved for /start registration).
function set(tid, code) {
  if (!tid || !STR[code]) { return false; }
  var key = "user_" + String(tid);
  var u = Bot.getProperty(key);
  if (!u) {
    u = {
      telegramid: String(tid),
      name: "",
      username: "",
      join_date: (typeof Date !== "undefined" && Date.now) ? Date.now() : 0,
      whisper_count: 0,
      inline_count: 0,
      lang: code
    };
  } else {
    u.lang = code;
  }
  Bot.setProperty(key, u, "json");
  return true;
}

// Translate one key for a language code (falls back to English).
function t(code, key) {
  var d = STR[code] || STR[DEFAULT_LANG];
  var v = d[key];
  if (v === undefined || v === null) { v = STR[DEFAULT_LANG][key]; }
  return (v === undefined || v === null) ? "" : v;
}

// "🇮🇳 हिन्दी" label for a language code.
function langLabel(code) {
  var m = LANG_NAMES[code];
  return m ? (m.flag + " " + m.name) : code;
}

/* ============================================================
 *  READY-MADE SCREENS (composed with small-caps styling)
 * ============================================================ */

// /lang picker text — shows current language + note that it is saved.
function pickText(sc, current) {
  return (
    "🌐 " + sc.toSmallCaps(t(current, "lang_pick")) + "\n" +
    sc.scDivider() + "\n" +
    sc.toSmallCaps(t(current, "lang_current")) + ": " + langLabel(current) + "\n" +
    sc.toSmallCaps(t(current, "lang_note"))
  );
}

// /lang picker keyboard — 12 languages in a 2-column grid, current one
// marked with ✓, Home button at the bottom.
function langGrid(sc, current) {
  var rows = [];
  var row = [];
  for (var i = 0; i < ORDER.length; i++) {
    var code = ORDER[i];
    var label = LANG_NAMES[code].flag + " " + LANG_NAMES[code].name +
                (code === current ? " ✓" : "");
    row.push({ text: label, callback_data: "/lang_set " + code });
    if (row.length === 2) { rows.push(row); row = []; }
  }
  if (row.length) { rows.push(row); }
  rows.push([{ text: sc.toSmallCaps(t(current, "btn_home")), callback_data: "/start" }]);
  return rows;
}

// Confirmation after a language is chosen — rendered in the NEW language.
function setText(sc, code) {
  return (
    sc.toSmallCaps(t(code, "lang_set_ok")) + " " + langLabel(code) + "\n" +
    sc.scDivider() + "\n" +
    sc.toSmallCaps(t(code, "lang_note"))
  );
}

// Full /help body for a language (title + divider + translated body).
function helpBody(sc, code) {
  return (
    sc.toSmallCaps(t(code, "help_title")) + "\n" +
    sc.scDivider() + "\n" +
    sc.toSmallCaps(t(code, "help_body"))
  );
}

publish({
  LANGS: LANG_NAMES,
  ORDER: ORDER,
  DEFAULT_LANG: DEFAULT_LANG,
  get: get,
  set: set,
  t: t,
  langLabel: langLabel,
  pickText: pickText,
  langGrid: langGrid,
  setText: setText,
  helpBody: helpBody
});
