-- Create projects table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text check (status in ('active', 'completed', 'on_hold', 'cancelled')) default 'active',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Add project_id to tasks table
alter table tasks 
add column if not exists project_id uuid references projects(id) on delete cascade;

-- Enable RLS on projects table
alter table projects enable row level security;

-- Policies for projects table
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Update tasks policies to consider project access
drop policy if exists "Users can view their own tasks" on tasks;
create policy "Users can view their own tasks"
  on tasks for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from projects
      where projects.id = tasks.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for projects
create trigger set_updated_at
  before update on projects
  for each row
  execute function update_updated_at_column(); 