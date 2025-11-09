/*
  # Create freelancer profiles table

  1. New Tables
    - `freelancer_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `skills` (text array)
      - `hourly_rate` (numeric)
      - `total_earnings` (numeric)
      - `completed_projects` (integer)
      - `rating` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `freelancer_profiles` table
    - Add policies for freelancers to manage their own profiles
*/

CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  skills text[] DEFAULT '{}',
  hourly_rate numeric DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  completed_projects integer DEFAULT 0,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancers can view own profile"
  ON freelancer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can update own profile"
  ON freelancer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view freelancer profiles"
  ON freelancer_profiles
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX idx_freelancer_profiles_user_id ON freelancer_profiles(user_id);
CREATE INDEX idx_freelancer_profiles_rating ON freelancer_profiles(rating);
  -- REMOVED: migration replaced during JS conversion
