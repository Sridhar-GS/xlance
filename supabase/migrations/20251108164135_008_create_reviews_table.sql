/*
  # Create reviews table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, foreign key to users)
      - `to_user_id` (uuid, foreign key to users)
      - `job_id` (uuid, foreign key to jobs)
      - `rating` (numeric, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `reviews` table
    - Add policies for users to create reviews
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  rating numeric NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews for anyone"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Anon can view reviews"
  ON reviews
  FOR SELECT
  TO anon
  USING (true);

CREATE UNIQUE INDEX idx_reviews_job_from_to ON reviews(job_id, from_user_id, to_user_id);
CREATE INDEX idx_reviews_to_user_id ON reviews(to_user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
