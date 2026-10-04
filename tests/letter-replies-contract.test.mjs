import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Ответ получателя, «письмо прочитано» и «сохранить письмо себе» (2.4.17):
// ответы пишет только сервер с лимитами и фильтром, владелец читает свои,
// открытия считаются при выдаче письма, получатель отвечает одним касанием.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const index = read("index.html");
const app = read("app.js");
const moments = read("moments.js");
const styles = read("styles.css");
const extra = read("i18n-extra.js");
const config = read("supabase/config.toml");
const migration = read("supabase/migrations/20261004100000_letter_replies.sql");
const resolver = read("supabase/functions/resolve-letter/index.ts");
const reply = read("supabase/functions/reply-letter/index.ts");

// База: таблица ответов закрыта RLS, владелец видит только свои и меняет только seen_at.
assert.match(migration, /create table public\.glowletter_letter_replies \(/);
assert.match(migration, /reaction text not null default 'heart' check \(reaction in \('heart', 'thanks', 'smile', 'tears'\)\)/);
assert.match(migration, /message text check \(message is null or pg_catalog\.char_length\(message\) between 1 and 240\)/);
assert.match(migration, /alter table public\.glowletter_letter_replies enable row level security;/);
assert.match(migration, /revoke all on table public\.glowletter_letter_replies from public, anon, authenticated;/);
assert.match(migration, /grant select on table public\.glowletter_letter_replies to authenticated;/);
assert.match(migration, /grant update \(seen_at\) on table public\.glowletter_letter_replies to authenticated;/);
assert.match(migration, /for select to authenticated\s+using \(user_id = \(select auth\.uid\(\)\)\)/);
assert.match(migration, /for update to authenticated\s+using \(user_id = \(select auth\.uid\(\)\)\)\s+with check \(user_id = \(select auth\.uid\(\)\)\)/);
assert.match(migration, /alter publication supabase_realtime add table public\.glowletter_letter_replies/);
assert.match(migration, /alter publication supabase_realtime add table public\.glowletter_qr_links/);
assert.match(migration, /add column opened_at timestamptz,\s+add column last_opened_at timestamptz,\s+add column open_count integer not null default 0 check \(open_count >= 0\)/);
assert.match(migration, /check \(source in \('ai', 'custom', 'template', 'florist', 'received'\)\)/);

// Функции базы: открытие считается только у живой ссылки, ответ ограничен и отфильтрован.
assert.match(migration, /create or replace function public\.glowletter_record_qr_open\(p_public_id uuid\)/);
assert.match(migration, /grant execute on function public\.glowletter_record_qr_open\(uuid\) to service_role;/);
assert.match(migration, /create or replace function public\.glowletter_create_letter_reply\(/);
assert.match(migration, /private\.glowletter_notice_message_is_forbidden\(clean_message\)/);
assert.match(migration, /message = 'rate_limited'/);
assert.match(migration, /message = 'not_found'/);
assert.match(migration, /grant execute on function public\.glowletter_create_letter_reply\(uuid, text, text, text, text\) to service_role;/);
assert.doesNotMatch(migration, /grant execute on function public\.glowletter_create_letter_reply[^\n]*to (?:anon|authenticated)/);
assert.doesNotMatch(migration, /навсегда/u);

// Сервер: ответ без аккаунта с хешем источника, выдача письма отмечает открытие.
assert.match(reply, /Deno\.env\.get\("REPORT_RATE_LIMIT_SALT"\)/);
assert.match(reply, /admin\.rpc\("glowletter_create_letter_reply"/);
assert.match(reply, /if \(reason === "rate_limited"\) return json\(request, \{ state: "rate_limited" \}, 429\);/);
assert.match(reply, /crypto\.subtle\.digest\("SHA-256"/);
assert.doesNotMatch(reply, /console\.(?:log|info|warn|error|debug)\s*\(/);
assert.doesNotMatch(reply, /sb_secret_|service_role_key\s*[:=]\s*["'][^"']+/i);
assert.match(resolver, /admin\.rpc\("glowletter_record_qr_open", \{ p_public_id: publicId \}\)/);
assert.match(config, /\[functions\.reply-letter\][\s\S]{0,200}verify_jwt = false/);

// Получатель: панель ответа, четыре реакции, пара слов, «сохранить письмо себе».
for (const id of ["replyBar", "replyTitle", "replyLead", "replyReactions", "replyField", "replyMessage", "replySend", "saveLetterButton", "replyStatus", "momentsRepliesBadge"]) {
  assert.match(index, new RegExp(`id=["']${id}["']`), `${id} must exist`);
}
for (const reaction of ["heart", "thanks", "smile", "tears"]) assert.match(index, new RegExp(`data-reaction="${reaction}"`));
assert.match(index, /id="replyMessage"[^>]*maxlength="240"/);
assert.match(app, /functions\/v1\/reply-letter/);
assert.match(app, /async function sendLetterReply\(reaction\)[\s\S]{0,400}containsForbidden\(message\)/);
assert.match(app, /async function saveSharedLetterToSelf\(\)[\s\S]{0,900}recordLetter\(\{ source: "received"/);
assert.match(app, /#replyReactions[^\n]*addEventListener\("click"/);
assert.match(app, /notifyReply: reply => showToast\(replyToastText\(reply\)/);
assert.match(app, /onRepliesChanged: count => updateRepliesBadge\(count\)/);
assert.match(styles, /\.reply-bar \{/);
// Moments стартует после загрузки всех скриптов, иначе QR-письмо не откроется.
assert.match(app, /document\.addEventListener\("DOMContentLoaded",startMomentsIntegration,\{once:true\}\)/);

// Отправитель: ответы и открытия в истории, живые события, только seen_at меняется клиентом.
assert.match(moments, /const REPLIES_TABLE = "glowletter_letter_replies";/);
assert.match(moments, /received: "received"/);
assert.match(moments, /received: "sourceReceived"/);
assert.match(moments, /opened_at: cleanText\(row\.opened_at, 40\)/);
assert.match(moments, /\.on\("postgres_changes", \{ event: "INSERT", schema: "public", table: REPLIES_TABLE, filter: `user_id=eq\.\$\{userId\}` \}/);
assert.match(moments, /\.on\("postgres_changes", \{ event: "UPDATE", schema: "public", table: QR_TABLE, filter: `user_id=eq\.\$\{userId\}` \}/);
assert.match(moments, /from\(REPLIES_TABLE\)\.update\(\{ seen_at: now \}\)\.eq\("user_id", state\.user\.id\)\.is\("seen_at", null\)/);
assert.doesNotMatch(moments, /from\(REPLIES_TABLE\)\.(?:insert|upsert|delete)\(/);
assert.match(moments, /tr\("letterOpenedAt", \{ date: formatDisplayDate\(link\.opened_at, true\) \}\)/);
assert.match(moments, /class="glm-replies"/);
assert.match(moments, /reload: \(\) => loadAll\(\{ quiet: true \}\), unseenReplies, markRepliesSeen,/);

// Переводы: 25 языков для панели ответа и истории.
for (const key of ["replyTitle", "reactionHeart", "replyToast", "openedToast", "saveLetter"]) {
  assert.match(app, new RegExp(`,${key}:"`), `${key} must exist in ru/en/fr`);
  assert.equal((extra.match(new RegExp(`"${key}": "`, "g")) || []).length, 22, `${key} must exist in the 22 extra languages`);
}
for (const key of ["sourceReceived", "letterOpenedAt", "letterNotOpened", "letterOpenCount"]) {
  assert.match(moments, new RegExp(`${key}: "`), `${key} must exist in moments ru/en/fr`);
  assert.equal((extra.match(new RegExp(`"${key}": "`, "g")) || []).length, 22, `${key} must exist in the 22 extra languages`);
}
