-- Create task_attachments table
create table if not exists task_attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  file_type text,
  url text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table task_attachments enable row level security;

-- Create policies
create policy "Users can view their own task attachments"
  on task_attachments for select
  using (auth.uid() = user_id);

create policy "Users can create task attachments for their tasks"
  on task_attachments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from tasks
      where tasks.id = task_id
      and tasks.user_id = auth.uid()
    )
  );

create policy "Users can delete their own task attachments"
  on task_attachments for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create trigger set_updated_at
  before update on task_attachments
  for each row
  execute function update_updated_at_column(); 