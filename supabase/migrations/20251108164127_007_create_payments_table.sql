/*
  # Create payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `amount` (numeric)
      - `status` ('pending' | 'completed' | 'failed' | 'refunded')
      - `payment_method` ('upi' | 'card' | 'bank')
      - `transaction_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for access control
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text NOT NULL CHECK (payment_method IN ('upi', 'card', 'bank')),
  transaction_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = payments.job_id AND (jobs.client_id = auth.uid())
    )
  );

CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
