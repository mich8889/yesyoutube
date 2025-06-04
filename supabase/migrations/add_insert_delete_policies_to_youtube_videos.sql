/*
  # Add INSERT and DELETE RLS policies for youtube_videos table

  1. Security
    - Add RLS policy to allow 'anon' role to insert into `youtube_videos`
    - Add RLS policy to allow 'anon' role to delete from `youtube_videos`
*/

-- Allow anon role to insert videos
CREATE POLICY "Allow anon insert"
  ON youtube_videos
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon role to delete videos
CREATE POLICY "Allow anon delete"
  ON youtube_videos
  FOR DELETE
  TO anon
  USING (true);