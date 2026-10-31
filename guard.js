/* GlowLetter — защита: без интернета приложение закрыто, блокировка от админа,
   предупреждения админа и жалоба на человека. Всё решает сервер. */
(function () {
  "use strict";

  const TEXT = {
    ru: { offTitle: "Нет интернета", offText: "GlowLetter работает только онлайн. Проверьте Wi-Fi или мобильный интернет.", retry: "Повторить", blockTitle: "Аккаунт заблокирован", blockUntil: "Блокировка до {date}", blockForever: "Блокировка без срока", blockReason: "Причина: {reason}", signOut: "Выйти", warnTitle: "Сообщение от администрации", ok: "Понятно", report: "Пожаловаться", reportTitle: "Пожаловаться на игрока", reportNote: "Что случилось? (необязательно)", r_abuse: "Оскорбления", r_adult: "Недопустимое содержание", r_spam: "Спам", r_cheat: "Накрутка опыта", r_other: "Другое", send: "Отправить", cancel: "Отмена", sent: "Жалоба отправлена. Спасибо!", tooMany: "Слишком много жалоб за сутки", failed: "Не получилось. Попробуйте ещё раз" },
    en: { offTitle: "No internet", offText: "GlowLetter works online only. Check your Wi-Fi or mobile data.", retry: "Try again", blockTitle: "Account blocked", blockUntil: "Blocked until {date}", blockForever: "Blocked with no end date", blockReason: "Reason: {reason}", signOut: "Sign out", warnTitle: "Message from the team", ok: "Got it", report: "Report", reportTitle: "Report this player", reportNote: "What happened? (optional)", r_abuse: "Insults", r_adult: "Inappropriate content", r_spam: "Spam", r_cheat: "XP cheating", r_other: "Other", send: "Send", cancel: "Cancel", sent: "Report sent. Thank you!", tooMany: "Too many reports today", failed: "Something went wrong. Please try again" },
    fr: { offTitle: "Pas d'internet", offText: "GlowLetter fonctionne uniquement en ligne. Vérifiez le Wi-Fi ou les données mobiles.", retry: "Réessayer", blockTitle: "Compte bloqué", blockUntil: "Bloqué jusqu'au {date}", blockForever: "Bloqué sans date de fin", blockReason: "Motif : {reason}", signOut: "Se déconnecter", warnTitle: "Message de l'équipe", ok: "Compris", report: "Signaler", reportTitle: "Signaler ce joueur", reportNote: "Que s'est-il passé ? (facultatif)", r_abuse: "Insultes", r_adult: "Contenu inapproprié", r_spam: "Spam", r_cheat: "Triche d'XP", r_other: "Autre", send: "Envoyer", cancel: "Annuler", sent: "Signalement envoyé. Merci !", tooMany: "Trop de signalements aujourd'hui", failed: "Échec. Réessayez" },
    de: { offTitle: "Kein Internet", offText: "GlowLetter funktioniert nur online. Prüfe WLAN oder mobile Daten.", retry: "Erneut versuchen", blockTitle: "Konto gesperrt", blockUntil: "Gesperrt bis {date}", blockForever: "Ohne Enddatum gesperrt", blockReason: "Grund: {reason}", signOut: "Abmelden", warnTitle: "Nachricht vom Team", ok: "Verstanden", report: "Melden", reportTitle: "Spieler melden", reportNote: "Was ist passiert? (optional)", r_abuse: "Beleidigungen", r_adult: "Unangemessene Inhalte", r_spam: "Spam", r_cheat: "XP-Betrug", r_other: "Sonstiges", send: "Senden", cancel: "Abbrechen", sent: "Meldung gesendet. Danke!", tooMany: "Zu viele Meldungen heute", failed: "Hat nicht geklappt. Bitte erneut versuchen" },
    es: { offTitle: "Sin internet", offText: "GlowLetter solo funciona en línea. Revisa el Wi-Fi o los datos móviles.", retry: "Reintentar", blockTitle: "Cuenta bloqueada", blockUntil: "Bloqueada hasta el {date}", blockForever: "Bloqueada sin fecha de fin", blockReason: "Motivo: {reason}", signOut: "Cerrar sesión", warnTitle: "Mensaje del equipo", ok: "Entendido", report: "Denunciar", reportTitle: "Denunciar a este jugador", reportNote: "¿Qué pasó? (opcional)", r_abuse: "Insultos", r_adult: "Contenido inapropiado", r_spam: "Spam", r_cheat: "Trampa de XP", r_other: "Otro", send: "Enviar", cancel: "Cancelar", sent: "Denuncia enviada. ¡Gracias!", tooMany: "Demasiadas denuncias hoy", failed: "No se pudo. Inténtalo de nuevo" },
    it: { offTitle: "Nessuna connessione", offText: "GlowLetter funziona solo online. Controlla il Wi-Fi o i dati mobili.", retry: "Riprova", blockTitle: "Account bloccato", blockUntil: "Bloccato fino al {date}", blockForever: "Bloccato senza scadenza", blockReason: "Motivo: {reason}", signOut: "Esci", warnTitle: "Messaggio dal team", ok: "Ho capito", report: "Segnala", reportTitle: "Segnala questo giocatore", reportNote: "Cosa è successo? (facoltativo)", r_abuse: "Insulti", r_adult: "Contenuti inappropriati", r_spam: "Spam", r_cheat: "Trucchi con l'XP", r_other: "Altro", send: "Invia", cancel: "Annulla", sent: "Segnalazione inviata. Grazie!", tooMany: "Troppe segnalazioni oggi", failed: "Non è riuscito. Riprova" },
    pl: { offTitle: "Brak internetu", offText: "GlowLetter działa tylko online. Sprawdź Wi-Fi lub dane komórkowe.", retry: "Spróbuj ponownie", blockTitle: "Konto zablokowane", blockUntil: "Blokada do {date}", blockForever: "Blokada bez terminu", blockReason: "Powód: {reason}", signOut: "Wyloguj", warnTitle: "Wiadomość od zespołu", ok: "Rozumiem", report: "Zgłoś", reportTitle: "Zgłoś tego gracza", reportNote: "Co się stało? (opcjonalnie)", r_abuse: "Obrażanie", r_adult: "Niestosowne treści", r_spam: "Spam", r_cheat: "Oszukiwanie XP", r_other: "Inne", send: "Wyślij", cancel: "Anuluj", sent: "Zgłoszenie wysłane. Dziękujemy!", tooMany: "Za dużo zgłoszeń dzisiaj", failed: "Nie udało się. Spróbuj ponownie" },
    uk: { offTitle: "Немає інтернету", offText: "GlowLetter працює лише онлайн. Перевірте Wi-Fi або мобільний інтернет.", retry: "Повторити", blockTitle: "Акаунт заблоковано", blockUntil: "Блокування до {date}", blockForever: "Блокування без терміну", blockReason: "Причина: {reason}", signOut: "Вийти", warnTitle: "Повідомлення від адміністрації", ok: "Зрозуміло", report: "Поскаржитися", reportTitle: "Поскаржитися на гравця", reportNote: "Що сталося? (необов'язково)", r_abuse: "Образи", r_adult: "Неприпустимий вміст", r_spam: "Спам", r_cheat: "Накрутка досвіду", r_other: "Інше", send: "Надіслати", cancel: "Скасувати", sent: "Скаргу надіслано. Дякуємо!", tooMany: "Забагато скарг за добу", failed: "Не вдалося. Спробуйте ще раз" },
    pt: { offTitle: "Sem internet", offText: "O GlowLetter só funciona online. Verifique o Wi-Fi ou os dados móveis.", retry: "Tentar novamente", blockTitle: "Conta bloqueada", blockUntil: "Bloqueada até {date}", blockForever: "Bloqueada sem data de fim", blockReason: "Motivo: {reason}", signOut: "Sair", warnTitle: "Mensagem da equipe", ok: "Entendi", report: "Denunciar", reportTitle: "Denunciar este jogador", reportNote: "O que aconteceu? (opcional)", r_abuse: "Insultos", r_adult: "Conteúdo impróprio", r_spam: "Spam", r_cheat: "Trapaça de XP", r_other: "Outro", send: "Enviar", cancel: "Cancelar", sent: "Denúncia enviada. Obrigado!", tooMany: "Denúncias demais hoje", failed: "Não deu certo. Tente novamente" },
    nl: { offTitle: "Geen internet", offText: "GlowLetter werkt alleen online. Controleer je wifi of mobiele data.", retry: "Opnieuw", blockTitle: "Account geblokkeerd", blockUntil: "Geblokkeerd tot {date}", blockForever: "Geblokkeerd zonder einddatum", blockReason: "Reden: {reason}", signOut: "Uitloggen", warnTitle: "Bericht van het team", ok: "Begrepen", report: "Melden", reportTitle: "Deze speler melden", reportNote: "Wat is er gebeurd? (optioneel)", r_abuse: "Beledigingen", r_adult: "Ongepaste inhoud", r_spam: "Spam", r_cheat: "XP-vals spelen", r_other: "Anders", send: "Versturen", cancel: "Annuleren", sent: "Melding verstuurd. Bedankt!", tooMany: "Te veel meldingen vandaag", failed: "Mislukt. Probeer het opnieuw" },
    tr: { offTitle: "İnternet yok", offText: "GlowLetter yalnızca çevrimiçi çalışır. Wi-Fi'yi veya mobil veriyi kontrol et.", retry: "Tekrar dene", blockTitle: "Hesap engellendi", blockUntil: "{date} tarihine kadar engelli", blockForever: "Süresiz engelli", blockReason: "Neden: {reason}", signOut: "Çıkış yap", warnTitle: "Ekipten mesaj", ok: "Anladım", report: "Şikâyet et", reportTitle: "Bu oyuncuyu şikâyet et", reportNote: "Ne oldu? (isteğe bağlı)", r_abuse: "Hakaret", r_adult: "Uygunsuz içerik", r_spam: "Spam", r_cheat: "XP hilesi", r_other: "Diğer", send: "Gönder", cancel: "İptal", sent: "Şikâyet gönderildi. Teşekkürler!", tooMany: "Bugün çok fazla şikâyet", failed: "Olmadı. Tekrar dene" },
    ro: { offTitle: "Fără internet", offText: "GlowLetter funcționează doar online. Verifică Wi-Fi-ul sau datele mobile.", retry: "Încearcă din nou", blockTitle: "Cont blocat", blockUntil: "Blocat până la {date}", blockForever: "Blocat fără termen", blockReason: "Motiv: {reason}", signOut: "Deconectare", warnTitle: "Mesaj de la echipă", ok: "Am înțeles", report: "Raportează", reportTitle: "Raportează acest jucător", reportNote: "Ce s-a întâmplat? (opțional)", r_abuse: "Insulte", r_adult: "Conținut nepotrivit", r_spam: "Spam", r_cheat: "Trișat la XP", r_other: "Altceva", send: "Trimite", cancel: "Anulează", sent: "Raport trimis. Mulțumim!", tooMany: "Prea multe rapoarte azi", failed: "Nu a reușit. Încearcă din nou" },
    cs: { offTitle: "Bez internetu", offText: "GlowLetter funguje jen online. Zkontrolujte Wi-Fi nebo mobilní data.", retry: "Zkusit znovu", blockTitle: "Účet zablokován", blockUntil: "Blokace do {date}", blockForever: "Blokace bez konce", blockReason: "Důvod: {reason}", signOut: "Odhlásit se", warnTitle: "Zpráva od týmu", ok: "Rozumím", report: "Nahlásit", reportTitle: "Nahlásit hráče", reportNote: "Co se stalo? (nepovinné)", r_abuse: "Urážky", r_adult: "Nevhodný obsah", r_spam: "Spam", r_cheat: "Podvádění se zkušenostmi", r_other: "Jiné", send: "Odeslat", cancel: "Zrušit", sent: "Nahlášení odesláno. Děkujeme!", tooMany: "Dnes příliš mnoho nahlášení", failed: "Nepovedlo se. Zkuste to znovu" },
    sv: { offTitle: "Inget internet", offText: "GlowLetter fungerar bara online. Kontrollera wifi eller mobildata.", retry: "Försök igen", blockTitle: "Kontot är spärrat", blockUntil: "Spärrat till {date}", blockForever: "Spärrat utan slutdatum", blockReason: "Orsak: {reason}", signOut: "Logga ut", warnTitle: "Meddelande från teamet", ok: "Jag förstår", report: "Anmäl", reportTitle: "Anmäl spelaren", reportNote: "Vad hände? (valfritt)", r_abuse: "Förolämpningar", r_adult: "Olämpligt innehåll", r_spam: "Spam", r_cheat: "XP-fusk", r_other: "Annat", send: "Skicka", cancel: "Avbryt", sent: "Anmälan skickad. Tack!", tooMany: "För många anmälningar i dag", failed: "Det gick inte. Försök igen" },
    el: { offTitle: "Χωρίς internet", offText: "Το GlowLetter λειτουργεί μόνο online. Έλεγξε το Wi-Fi ή τα δεδομένα κινητής.", retry: "Ξανά", blockTitle: "Ο λογαριασμός αποκλείστηκε", blockUntil: "Αποκλεισμός έως {date}", blockForever: "Αποκλεισμός χωρίς λήξη", blockReason: "Λόγος: {reason}", signOut: "Αποσύνδεση", warnTitle: "Μήνυμα από την ομάδα", ok: "Κατάλαβα", report: "Αναφορά", reportTitle: "Αναφορά παίκτη", reportNote: "Τι συνέβη; (προαιρετικό)", r_abuse: "Προσβολές", r_adult: "Ακατάλληλο περιεχόμενο", r_spam: "Spam", r_cheat: "Απάτη με XP", r_other: "Άλλο", send: "Αποστολή", cancel: "Ακύρωση", sent: "Η αναφορά στάλθηκε. Ευχαριστούμε!", tooMany: "Πάρα πολλές αναφορές σήμερα", failed: "Δεν έγινε. Δοκίμασε ξανά" },
    da: { offTitle: "Intet internet", offText: "GlowLetter virker kun online. Tjek wi-fi eller mobildata.", retry: "Prøv igen", blockTitle: "Kontoen er blokeret", blockUntil: "Blokeret til {date}", blockForever: "Blokeret uden slutdato", blockReason: "Årsag: {reason}", signOut: "Log ud", warnTitle: "Besked fra teamet", ok: "Forstået", report: "Anmeld", reportTitle: "Anmeld spilleren", reportNote: "Hvad skete der? (valgfrit)", r_abuse: "Fornærmelser", r_adult: "Upassende indhold", r_spam: "Spam", r_cheat: "XP-snyd", r_other: "Andet", send: "Send", cancel: "Annuller", sent: "Anmeldelse sendt. Tak!", tooMany: "For mange anmeldelser i dag", failed: "Det lykkedes ikke. Prøv igen" },
    no: { offTitle: "Ingen internett", offText: "GlowLetter fungerer bare på nett. Sjekk wifi eller mobildata.", retry: "Prøv igjen", blockTitle: "Kontoen er sperret", blockUntil: "Sperret til {date}", blockForever: "Sperret uten sluttdato", blockReason: "Årsak: {reason}", signOut: "Logg ut", warnTitle: "Melding fra teamet", ok: "Skjønner", report: "Rapporter", reportTitle: "Rapporter spilleren", reportNote: "Hva skjedde? (valgfritt)", r_abuse: "Fornærmelser", r_adult: "Upassende innhold", r_spam: "Spam", r_cheat: "XP-juks", r_other: "Annet", send: "Send", cancel: "Avbryt", sent: "Rapport sendt. Takk!", tooMany: "For mange rapporter i dag", failed: "Det gikk ikke. Prøv igjen" },
    fi: { offTitle: "Ei internetyhteyttä", offText: "GlowLetter toimii vain verkossa. Tarkista Wi-Fi tai mobiilidata.", retry: "Yritä uudelleen", blockTitle: "Tili on estetty", blockUntil: "Estetty {date} asti", blockForever: "Estetty toistaiseksi", blockReason: "Syy: {reason}", signOut: "Kirjaudu ulos", warnTitle: "Viesti tiimiltä", ok: "Selvä", report: "Ilmianna", reportTitle: "Ilmianna pelaaja", reportNote: "Mitä tapahtui? (valinnainen)", r_abuse: "Loukkaukset", r_adult: "Sopimaton sisältö", r_spam: "Roskaposti", r_cheat: "XP-huijaus", r_other: "Muu", send: "Lähetä", cancel: "Peruuta", sent: "Ilmoitus lähetetty. Kiitos!", tooMany: "Liian monta ilmoitusta tänään", failed: "Ei onnistunut. Yritä uudelleen" },
    ja: { offTitle: "インターネットに接続されていません", offText: "GlowLetter はオンラインでのみ使えます。Wi-Fi またはモバイルデータを確認してください。", retry: "再試行", blockTitle: "アカウントは停止されています", blockUntil: "{date} まで停止", blockForever: "無期限の停止", blockReason: "理由：{reason}", signOut: "ログアウト", warnTitle: "運営からのお知らせ", ok: "わかりました", report: "報告", reportTitle: "このプレイヤーを報告", reportNote: "何がありましたか？（任意）", r_abuse: "暴言", r_adult: "不適切な内容", r_spam: "スパム", r_cheat: "XP の不正", r_other: "その他", send: "送信", cancel: "キャンセル", sent: "報告を送信しました。ありがとうございます！", tooMany: "今日は報告が多すぎます", failed: "できませんでした。もう一度お試しください" },
    ko: { offTitle: "인터넷 연결 없음", offText: "GlowLetter는 온라인에서만 작동해요. Wi-Fi나 모바일 데이터를 확인하세요.", retry: "다시 시도", blockTitle: "계정이 차단되었어요", blockUntil: "{date}까지 차단", blockForever: "기한 없는 차단", blockReason: "사유: {reason}", signOut: "로그아웃", warnTitle: "운영팀 메시지", ok: "확인", report: "신고", reportTitle: "이 플레이어 신고", reportNote: "무슨 일이 있었나요? (선택)", r_abuse: "모욕", r_adult: "부적절한 내용", r_spam: "스팸", r_cheat: "XP 부정행위", r_other: "기타", send: "보내기", cancel: "취소", sent: "신고를 보냈어요. 고마워요!", tooMany: "오늘 신고가 너무 많아요", failed: "실패했어요. 다시 시도하세요" },
    zh: { offTitle: "没有网络", offText: "GlowLetter 只能在线使用。请检查 Wi-Fi 或移动数据。", retry: "重试", blockTitle: "账号已被封禁", blockUntil: "封禁至 {date}", blockForever: "无限期封禁", blockReason: "原因：{reason}", signOut: "退出登录", warnTitle: "来自团队的消息", ok: "知道了", report: "举报", reportTitle: "举报该玩家", reportNote: "发生了什么？（可选）", r_abuse: "辱骂", r_adult: "不当内容", r_spam: "垃圾信息", r_cheat: "刷经验", r_other: "其他", send: "发送", cancel: "取消", sent: "举报已发送，谢谢！", tooMany: "今天举报次数过多", failed: "没有成功，请重试" },
    th: { offTitle: "ไม่มีอินเทอร์เน็ต", offText: "GlowLetter ใช้งานได้เฉพาะออนไลน์ โปรดตรวจสอบ Wi-Fi หรือเน็ตมือถือ", retry: "ลองอีกครั้ง", blockTitle: "บัญชีถูกระงับ", blockUntil: "ระงับถึง {date}", blockForever: "ระงับไม่มีกำหนด", blockReason: "เหตุผล: {reason}", signOut: "ออกจากระบบ", warnTitle: "ข้อความจากทีมงาน", ok: "เข้าใจแล้ว", report: "รายงาน", reportTitle: "รายงานผู้เล่นนี้", reportNote: "เกิดอะไรขึ้น? (ไม่บังคับ)", r_abuse: "คำดูหมิ่น", r_adult: "เนื้อหาไม่เหมาะสม", r_spam: "สแปม", r_cheat: "โกง XP", r_other: "อื่น ๆ", send: "ส่ง", cancel: "ยกเลิก", sent: "ส่งรายงานแล้ว ขอบคุณ!", tooMany: "วันนี้รายงานมากเกินไป", failed: "ไม่สำเร็จ โปรดลองอีกครั้ง" },
    ar: { offTitle: "لا يوجد إنترنت", offText: "يعمل GlowLetter عبر الإنترنت فقط. تحقّق من Wi-Fi أو بيانات الجوال.", retry: "إعادة المحاولة", blockTitle: "الحساب محظور", blockUntil: "محظور حتى {date}", blockForever: "حظر بلا تاريخ انتهاء", blockReason: "السبب: {reason}", signOut: "تسجيل الخروج", warnTitle: "رسالة من الفريق", ok: "فهمت", report: "إبلاغ", reportTitle: "الإبلاغ عن هذا اللاعب", reportNote: "ماذا حدث؟ (اختياري)", r_abuse: "إهانات", r_adult: "محتوى غير لائق", r_spam: "رسائل مزعجة", r_cheat: "غش في نقاط الخبرة", r_other: "أخرى", send: "إرسال", cancel: "إلغاء", sent: "تم إرسال البلاغ. شكرًا!", tooMany: "بلاغات كثيرة اليوم", failed: "لم ينجح. حاول مرة أخرى" },
    ind: { offTitle: "Tidak ada internet", offText: "GlowLetter hanya berfungsi online. Periksa Wi-Fi atau data seluler.", retry: "Coba lagi", blockTitle: "Akun diblokir", blockUntil: "Diblokir sampai {date}", blockForever: "Diblokir tanpa batas waktu", blockReason: "Alasan: {reason}", signOut: "Keluar", warnTitle: "Pesan dari tim", ok: "Mengerti", report: "Laporkan", reportTitle: "Laporkan pemain ini", reportNote: "Apa yang terjadi? (opsional)", r_abuse: "Hinaan", r_adult: "Konten tidak pantas", r_spam: "Spam", r_cheat: "Curang XP", r_other: "Lainnya", send: "Kirim", cancel: "Batal", sent: "Laporan terkirim. Terima kasih!", tooMany: "Terlalu banyak laporan hari ini", failed: "Gagal. Coba lagi" },
    vi: { offTitle: "Không có internet", offText: "GlowLetter chỉ hoạt động khi trực tuyến. Hãy kiểm tra Wi-Fi hoặc dữ liệu di động.", retry: "Thử lại", blockTitle: "Tài khoản bị khóa", blockUntil: "Bị khóa đến {date}", blockForever: "Bị khóa vô thời hạn", blockReason: "Lý do: {reason}", signOut: "Đăng xuất", warnTitle: "Tin nhắn từ đội ngũ", ok: "Đã hiểu", report: "Báo cáo", reportTitle: "Báo cáo người chơi này", reportNote: "Chuyện gì đã xảy ra? (không bắt buộc)", r_abuse: "Xúc phạm", r_adult: "Nội dung không phù hợp", r_spam: "Spam", r_cheat: "Gian lận XP", r_other: "Khác", send: "Gửi", cancel: "Hủy", sent: "Đã gửi báo cáo. Cảm ơn!", tooMany: "Hôm nay báo cáo quá nhiều", failed: "Không thành công. Hãy thử lại" }
  };
  const REASONS = ["abuse", "adult", "spam", "cheat", "other"];

  const app = () => window.GlowLetterApp || null;
  const cloud = () => window.GlowLetterCloud || null;
  const language = () => { const value = String(app()?.getState?.().language || document.documentElement.lang || "ru").toLowerCase(); return TEXT[value] ? value : "en"; };
  const tr = (key, values = {}) => String(TEXT[language()]?.[key] ?? TEXT.en[key] ?? key).replace(/\{(\w+)\}/g, (all, name) => values[name] ?? "");
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const notify = message => app()?.notify?.(message, 4200);

  function layer(id, html) {
    let node = document.getElementById(id);
    if (!node) {
      node = document.createElement("div");
      node.id = id;
      node.className = "glx-layer";
      node.setAttribute("role", "dialog");
      node.setAttribute("aria-modal", "true");
      document.body.append(node);
    }
    node.innerHTML = `<div class="glx-card">${html}</div>`;
    node.hidden = false;
    document.body.classList.add("glx-locked");
    return node;
  }
  function hide(id) {
    const node = document.getElementById(id);
    if (node) node.hidden = true;
    if (![...document.querySelectorAll(".glx-layer")].some(item => !item.hidden)) document.body.classList.remove("glx-locked");
  }

  // ——— Без интернета приложение закрыто ———
  const OFFLINE_ICON = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M6 18a26 26 0 0 1 36 0M12 25a17 17 0 0 1 24 0M18 32a8.5 8.5 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/><circle cx="24" cy="38" r="3" fill="currentColor"/><path d="M8 8l32 32" stroke="#ff6b81" stroke-width="3.4" stroke-linecap="round"/></svg>';
  let checking = false;
  async function reachable() {
    if (!navigator.onLine) return false;
    const url = window.NUR_APP_CONFIG?.supabaseUrl || "";
    if (!url) return true;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, { method: "GET", mode: "no-cors", cache: "no-store", signal: controller.signal });
      clearTimeout(timer);
      return true;
    } catch { return false; }
  }
  function showOffline() {
    const node = layer("glxOffline", `<span class="glx-icon is-offline">${OFFLINE_ICON}</span><h2>${escapeHtml(tr("offTitle"))}</h2><p>${escapeHtml(tr("offText"))}</p><button class="glx-btn" type="button" data-glx="retry">${escapeHtml(tr("retry"))}</button>`);
    node.querySelector("[data-glx=retry]").addEventListener("click", checkNetwork);
  }
  async function checkNetwork() {
    if (checking) return;
    checking = true;
    const online = await reachable();
    checking = false;
    if (online) { hide("glxOffline"); refreshStatus(); } else showOffline();
  }
  addEventListener("offline", showOffline);
  addEventListener("online", checkNetwork);
  if (!navigator.onLine) showOffline();

  // ——— Блокировка и предупреждения ———
  let statusFor = "";
  let statusAt = 0;
  async function refreshStatus(force = false) {
    const state = cloud()?.getState?.();
    const db = cloud()?.getClient?.();
    if (!state?.signedIn || !db) { statusFor = ""; hide("glxBlocked"); return; }
    if (!force && statusFor === state.userId && Date.now() - statusAt < 60000) return;
    statusFor = state.userId; statusAt = Date.now();
    try {
      const { data, error } = await db.rpc("glowletter_my_status");
      if (error || !data) return;
      if (data.blocked) showBlocked(data); else hide("glxBlocked");
      if (!data.blocked && Array.isArray(data.warnings) && data.warnings.length) showWarning(data.warnings[0]);
    } catch {}
  }
  function date(value) {
    try { return new Intl.DateTimeFormat(language() === "ind" ? "id" : language(), { dateStyle: "long", timeStyle: "short" }).format(new Date(value)); } catch { return String(value); }
  }
  const LOCK_ICON = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="10" y="21" width="28" height="21" rx="5" fill="currentColor"/><path d="M16 21v-5a8 8 0 0 1 16 0v5" fill="none" stroke="currentColor" stroke-width="3.6"/><circle cx="24" cy="31" r="3" fill="#2a1424"/></svg>';
  function showBlocked(data) {
    const node = layer("glxBlocked", `<span class="glx-icon is-blocked">${LOCK_ICON}</span><h2>${escapeHtml(tr("blockTitle"))}</h2><p>${escapeHtml(data.until ? tr("blockUntil", { date: date(data.until) }) : tr("blockForever"))}</p>${data.reason ? `<p class="glx-reason">${escapeHtml(tr("blockReason", { reason: data.reason }))}</p>` : ""}<button class="glx-btn" type="button" data-glx="out">${escapeHtml(tr("signOut"))}</button>`);
    node.querySelector("[data-glx=out]").addEventListener("click", async () => { try { await cloud()?.signOut?.(); } catch {} hide("glxBlocked"); });
  }
  function showWarning(warning) {
    const node = layer("glxWarning", `<span class="glx-icon is-warning">!</span><h2>${escapeHtml(tr("warnTitle"))}</h2><p class="glx-message">${escapeHtml(warning.message)}</p><button class="glx-btn" type="button" data-glx="ok">${escapeHtml(tr("ok"))}</button>`);
    node.querySelector("[data-glx=ok]").addEventListener("click", async () => {
      hide("glxWarning");
      try { await cloud()?.getClient?.()?.rpc("glowletter_warning_seen", { p_id: warning.id }); } catch {}
      refreshStatus(true);
    });
  }
  addEventListener("glowletter-cloud-session", () => setTimeout(() => refreshStatus(true), 600));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { refreshStatus(); if (!navigator.onLine) showOffline(); } });
  setInterval(() => refreshStatus(), 5 * 60 * 1000);
  setTimeout(() => refreshStatus(true), 2500);

  // ——— Жалоба на игрока ———
  function report(userId) {
    if (!userId || !cloud()?.getState?.().signedIn) return;
    const node = layer("glxReport", `<h2>${escapeHtml(tr("reportTitle"))}</h2>
      <div class="glx-reasons" role="radiogroup">${REASONS.map((reason, index) => `<label><input type="radio" name="glxReason" value="${reason}"${index === 0 ? " checked" : ""}><span>${escapeHtml(tr(`r_${reason}`))}</span></label>`).join("")}</div>
      <textarea class="glx-note" maxlength="300" rows="3" placeholder="${escapeHtml(tr("reportNote"))}"></textarea>
      <div class="glx-actions"><button class="glx-btn is-soft" type="button" data-glx="cancel">${escapeHtml(tr("cancel"))}</button><button class="glx-btn" type="button" data-glx="send">${escapeHtml(tr("send"))}</button></div>`);
    node.querySelector("[data-glx=cancel]").addEventListener("click", () => hide("glxReport"));
    node.querySelector("[data-glx=send]").addEventListener("click", async event => {
      const button = event.currentTarget;
      button.disabled = true;
      const reason = node.querySelector("input[name=glxReason]:checked")?.value || "other";
      const note = node.querySelector(".glx-note").value;
      try {
        const { error } = await cloud().getClient().rpc("glowletter_report_user", { p_target: userId, p_reason: reason, p_note: note });
        if (error) throw error;
        hide("glxReport");
        notify(tr("sent"));
      } catch (error) {
        button.disabled = false;
        notify(String(error?.message || "").includes("too_many") ? tr("tooMany") : tr("failed"));
      }
    });
  }

  window.GlowLetterGuard = Object.freeze({ report, refresh: () => refreshStatus(true), checkNetwork, label: key => tr(key) });
})();
