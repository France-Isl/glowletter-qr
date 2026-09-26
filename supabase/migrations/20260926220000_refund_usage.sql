-- Usage evidence for Google's refund review (2.4.16). When Google asks the
-- developer about a chargeback (PendingRefundReviewNotification), the RTDN
-- function answers within minutes instead of waiting for a person: it needs
-- the purchase time of the order and every use of the paid service since
-- then — QR links and letters created, reading progress saved. The order is
-- found by the same keyed order-id hash the verifier stores. Service role only.
-- Applied on 2026-09-26 at the owner's explicit request («применяй доказательства»).

create or replace function public.glowletter_play_refund_usage(p_order_id_hash text)
returns table (
  kind text,
  occurred_at timestamptz,
  purchase_time timestamptz,
  account_binding text
)
language sql
security definer
set search_path = ''
as $$
  with entitlement as (
    select
      e.user_id,
      e.purchase_time,
      rtrim(
        translate(
          encode(
            extensions.digest(
              convert_to('glowletter/play-account/v1' || chr(10) || lower(e.user_id::text), 'UTF8'),
              'sha256'
            ),
            'base64'
          ),
          '+/', '-_'
        ),
        '='
      ) as account_binding
    from private.glowletter_play_entitlements as e
    where e.order_id_hash = btrim(coalesce(p_order_id_hash, ''))
    order by e.last_verified_at desc
    limit 1
  ),
  usage as (
    select 'qr_link'::text as kind, link.created_at as occurred_at
    from public.glowletter_qr_links as link, entitlement
    where link.user_id = entitlement.user_id
      and link.created_at >= coalesce(entitlement.purchase_time, link.created_at)
    union all
    select 'letter', letter.created_at
    from public.glowletter_letters as letter, entitlement
    where letter.user_id = entitlement.user_id
      and letter.created_at >= coalesce(entitlement.purchase_time, letter.created_at)
    union all
    select 'progress', progress.updated_at
    from public.glowletter_progress as progress, entitlement
    where progress.user_id = entitlement.user_id
      and progress.updated_at >= coalesce(entitlement.purchase_time, progress.updated_at)
  )
  select 'purchase'::text, entitlement.purchase_time, entitlement.purchase_time, entitlement.account_binding
  from entitlement
  union all
  (
    select usage.kind, usage.occurred_at, entitlement.purchase_time, entitlement.account_binding
    from usage, entitlement
    order by usage.occurred_at
    limit 200
  )
$$;

revoke all on function public.glowletter_play_refund_usage(text) from public, anon, authenticated;
grant execute on function public.glowletter_play_refund_usage(text) to service_role;

-- The automatic answer closes the queued review row the same way an operator would.
grant execute on function public.glowletter_resolve_play_refund_review(text, text) to service_role;
