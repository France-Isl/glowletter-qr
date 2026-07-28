import { createClient } from "npm:@supabase/supabase-js@2.110.9";

const ALLOWED_ORIGINS = new Set([
  "https://france-isl.github.io",
  "https://appassets.androidplatform.net",
  "http://127.0.0.1",
  "http://localhost",
  "null"
]);

function responseHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  };
  if (ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(request: Request, body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(request) });
}

Deno.serve(async request => {
  const origin = request.headers.get("origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json(request, { error: "origin_not_allowed" }, 403);

  if (request.method === "OPTIONS") {
    const headers = new Headers(responseHeaders(request));
    headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type, x-client-info");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Max-Age", "86400");
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "POST") return json(request, { error: "method_not_allowed" }, 405);

  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  if (!match) return json(request, { error: "authentication_required" }, 401);

  let payload: { confirmation?: string };
  try {
    payload = await request.json();
  } catch {
    return json(request, { error: "invalid_json" }, 400);
  }
  if (payload.confirmation !== "DELETE_GLOWLETTER_ACCOUNT") {
    return json(request, { error: "confirmation_required" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json(request, { error: "service_unavailable" }, 503);

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(match[1]);
  if (userError || !userData.user) return json(request, { error: "invalid_session" }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userData.user.id, false);
  if (deleteError) return json(request, { error: "delete_failed" }, 500);

  return json(request, { deleted: true });
});
