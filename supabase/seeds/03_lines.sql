-- QueueCast seed step 3 of 5: five line types for each seeded event.
-- Requires 02_events.sql.

begin;

do $$
begin
  if (select count(*) from public.events where id::text like '30000000-0000-4000-8000-%') <> 8 then
    raise exception 'Run 02_events.sql first; eight fixed-ID events are required.';
  end if;
end $$;

delete from public.lines
where event_id in (
  select id from public.events
  where id::text like '30000000-0000-4000-8000-%'
);

with seeded_events as (
  select
    id as event_id,
    row_number() over (order by id) as event_number
  from public.events
  where id::text like '30000000-0000-4000-8000-%'
),
line_types as (
  select *
  from (
    values
      (1, 'entry', 'Entry'),
      (2, 'merch', 'Merch'),
      (3, 'parking', 'Parking'),
      (4, 'food', 'Food'),
      (5, 'bathrooms', 'Bathroom')
  ) as values_table(line_number, line_type, label)
)
insert into public.lines (id, event_id, line_type, label)
select
  (
    '40000000-0000-4000-8000-' ||
    lpad((((event_number - 1) * 5) + line_number)::text, 12, '0')
  )::uuid,
  event_id,
  line_type,
  label
from seeded_events
cross join line_types;

commit;

select count(*) as seeded_lines
from public.lines
where id::text like '40000000-0000-4000-8000-%';
