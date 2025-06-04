/*
  # Create youtube_videos table

  1. New Tables
    - `youtube_videos`
      - `id` (uuid, primary key, auto-generated)
      - `title` (text, not null)
      - `url` (text, not null)
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `youtube_videos` table
    - Add policy for anon users to read all data
    - Add policy for anon users to insert data
    - Add policy for anon users to delete data (Note: In a real app, admin actions would require authentication)
*/

CREATE TABLE IF NOT EXISTS youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read all videos
CREATE POLICY "Allow anon read access"
  ON youtube_videos FOR SELECT
  TO anon
  USING (true);

-- Allow anon users to insert videos (for demo purposes as per prompt)
CREATE POLICY "Allow anon insert access"
  ON youtube_videos FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon users to delete videos (for demo purposes as per prompt)
CREATE POLICY "Allow anon delete access"
  ON youtube_videos FOR DELETE
  TO anon
  USING (true);