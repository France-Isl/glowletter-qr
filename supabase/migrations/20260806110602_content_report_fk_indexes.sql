create index if not exists glowletter_content_reports_reporter_user_idx
  on private.glowletter_content_reports (reporter_user_id)
  where reporter_user_id is not null;

create index if not exists glowletter_content_reports_reviewed_by_idx
  on private.glowletter_content_reports (reviewed_by)
  where reviewed_by is not null;
