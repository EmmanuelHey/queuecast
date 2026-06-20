-- QueueCast seed step 5 of 5: verify seeded row counts and relationships.

select
  (select count(*) from public.profiles where id::text like '10000000-0000-4000-8000-%') as profiles,
  (select count(*) from public.venues where id::text like '20000000-0000-4000-8000-%') as venues,
  (select count(*) from public.events where id::text like '30000000-0000-4000-8000-%') as events,
  (select count(*) from public.lines where id::text like '40000000-0000-4000-8000-%') as lines,
  (select count(*) from public.line_reports where id::text like '50000000-0000-4000-8000-%') as line_reports,
  (select count(*) from public.reporter_scores where id::text like '60000000-0000-4000-8000-%') as reporter_scores;

-- Every result below should be zero.
select
  (
    select count(*)
    from public.events event
    left join public.venues venue on venue.id = event.venue_id
    where event.id::text like '30000000-0000-4000-8000-%'
      and venue.id is null
  ) as events_without_venue,
  (
    select count(*)
    from public.lines line
    left join public.events event on event.id = line.event_id
    where line.id::text like '40000000-0000-4000-8000-%'
      and event.id is null
  ) as lines_without_event,
  (
    select count(*)
    from public.line_reports report
    left join public.lines line on line.id = report.line_id
    left join public.profiles profile on profile.id = report.user_id
    where report.id::text like '50000000-0000-4000-8000-%'
      and (line.id is null or profile.id is null)
  ) as reports_without_parent;
