-- Lead pipeline + resource categories (#40, #48)
alter table contacts
  add column if not exists pipeline_stage text,
  add column if not exists assigned_to text,
  add column if not exists admin_notes text;

update contacts
set pipeline_stage = case when is_read then 'contacted' else 'new' end
where pipeline_stage is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contacts_pipeline_stage_check'
  ) then
    alter table contacts
      add constraint contacts_pipeline_stage_check
      check (pipeline_stage in ('new', 'contacted', 'qualified', 'won', 'lost'));
  end if;
end $$;

create index if not exists idx_contacts_pipeline_stage on contacts(pipeline_stage);

alter table client_resources
  add column if not exists category text,
  add column if not exists version_label text;

comment on column contacts.pipeline_stage is 'Lead pipeline: new | contacted | qualified | won | lost';
comment on column client_resources.category is 'Document center category label for portal filtering';
comment on column client_resources.version_label is 'Optional human version string e.g. v1.2';
