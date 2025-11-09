/*
  # Create proposals table

  1. New Tables
    - `proposals`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `freelancer_id` (uuid, foreign key to users)
      - `bid_amount` (numeric)
      - `message` (text)
      - `status` ('pending' | 'accepted' | 'rejected')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `proposals` table
    - Add policies for freelancers and clients
*/

CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bid_amount numeric NOT NULL CHECK (bid_amount > 0),
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancers can view own proposals"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Clients can view proposals for own jobs"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = proposals.job_id AND jobs.client_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can create proposals"
  ON proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Clients can update proposal status"
  ON proposals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = proposals.job_id AND jobs.client_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = proposals.job_id AND jobs.client_id = auth.uid()
    )
  );

CREATE UNIQUE INDEX idx_proposals_job_freelancer ON proposals(job_id, freelancer_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);
