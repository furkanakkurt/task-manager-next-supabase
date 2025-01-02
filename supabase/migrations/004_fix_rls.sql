-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert access for own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can insert a profile" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for own profile"
ON profiles FOR SELECT
USING (
  auth.uid() = id
  OR
  auth.role() = 'service_role'
);

CREATE POLICY "Enable update access for own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert access for profiles"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id
  OR
  auth.role() = 'service_role'
); 