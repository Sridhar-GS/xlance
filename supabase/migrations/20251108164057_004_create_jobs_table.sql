/*
  # Create jobs table

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `budget` (numeric)
      - `duration` (text)
      - `level` ('beginner' | 'intermediate' | 'expert')
      - `skills` (text array)
      - `status` ('open' | 'in_progress' | 'completed' | 'cancelled')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `jobs` table
    - Add policies for access control
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  budget numeric NOT NULL CHECK (budget > 0),
  duration text NOT NULL,
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'expert')),
  skills text[] DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() IN (SELECT user_id FROM freelancer_profiles));

CREATE POLICY "Clients can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Public can view open jobs"
  ON jobs
  FOR SELECT
  TO anon
  USING (status = 'open');

CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
