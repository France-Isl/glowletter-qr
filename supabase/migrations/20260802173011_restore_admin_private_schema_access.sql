-- Public admin RPCs delegate to explicitly guarded functions in `private`.
-- A later audio migration accidentally removed the schema traversal privilege
-- required to reach those functions. Restore only schema USAGE: no private
-- table privileges are granted.
grant usage on schema private to authenticated;
