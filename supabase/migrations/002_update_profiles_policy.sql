-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON profiles;

-- Create updated policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow anyone to create a profile (needed for initial sign-up)
CREATE POLICY "Anyone can insert a profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Temporarily disable RLS for debugging
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY; 