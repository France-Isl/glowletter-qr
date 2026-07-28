-- An explicit deny policy documents and enforces that browser clients never
-- read or mutate the private VIP audit trail.

create policy "VIP audit is never available to app clients"
  on private.glowletter_vip_audit
  for all
  to authenticated
  using (false)
  with check (false);
