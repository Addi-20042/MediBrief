DO $$
DECLARE
  existing_job_id bigint;
BEGIN
  SELECT jobid
  INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'medibrief-send-medication-reminders-every-minute';

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'medibrief-send-medication-reminders-every-minute',
    '* * * * *',
    $cron$
    SELECT
      net.http_post(
        url := 'https://pxrqkkejnmbartvpuwlx.supabase.co/functions/v1/send-medication-reminders',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'apikey', 'sb_publishable_LAWicL1Zg2UwSpwVCYLQPw_U9ipMBNE',
          'Authorization', 'Bearer sb_publishable_LAWicL1Zg2UwSpwVCYLQPw_U9ipMBNE',
          'x-reminder-cron-secret', 'jqd2PUQyt5ceSzLAiVpIBE9lY7g0xvOZ6NCXMsf8'
        ),
        body := '{"trigger":"scheduled_due"}'::jsonb
      );
    $cron$
  );
END $$;
