/*
  # Task Management System Database Schema

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `status` (text, default 'todo')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `comments`
      - `id` (uuid, primary key) 
      - `task_id` (uuid, foreign key)
      - `content` (text, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow public access to tasks"
  ON tasks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to comments" 
  ON comments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments  
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();