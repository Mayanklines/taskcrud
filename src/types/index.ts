export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}