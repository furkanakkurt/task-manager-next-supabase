-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('task-manager-task-attachments', 'task-manager-task-attachments', true)
on conflict (id) do nothing;

-- Enable RLS on the bucket
update storage.buckets
set public = false
where id = 'task-manager-task-attachments';

-- Policy to allow users to read their own task attachments or attachments of tasks they have access to
create policy "Users can read task attachments"
on storage.objects for select
using (
  bucket_id = 'task-manager-task-attachments'
  and (
    -- User owns the file
    (storage.foldername(name))[1] = auth.uid()::text
    or
    -- User has access to the task (is the task owner)
    exists (
      select 1
      from tasks t
      where t.user_id = auth.uid()
      and (storage.foldername(name))[2] = t.id::text
    )
  )
);

-- Policy to allow users to upload files to their own tasks
create policy "Users can upload task attachments"
on storage.objects for insert
with check (
  bucket_id = 'task-manager-task-attachments'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from tasks t
    where t.user_id = auth.uid()
    and (storage.foldername(name))[2] = t.id::text
  )
);

-- Policy to allow users to delete their own task attachments
create policy "Users can delete their own task attachments"
on storage.objects for delete
using (
  bucket_id = 'task-manager-task-attachments'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
); 