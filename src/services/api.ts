import { Task, Comment, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const headers = {
  'Content-Type': 'application/json',
};

class ApiClient {
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const options: RequestInit = {
        method,
        headers,
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Task API methods
  async getTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>('GET', '/tasks');
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    return this.request<Task>('GET', `/tasks/${id}`);
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Task>> {
    return this.request<Task>('POST', '/tasks', task);
  }

  async updateTask(id: string, task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Task>> {
    return this.request<Task>('PUT', `/tasks/${id}`, task);
  }

  async deleteTask(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('DELETE', `/tasks/${id}`);
  }

  // Comment API methods
  async getComments(taskId?: string): Promise<ApiResponse<Comment[]>> {
    const endpoint = taskId ? `/comments?task_id=${taskId}` : '/comments';
    return this.request<Comment[]>('GET', endpoint);
  }

  async getComment(id: string): Promise<ApiResponse<Comment>> {
    return this.request<Comment>('GET', `/comments/${id}`);
  }

  async createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Comment>> {
    return this.request<Comment>('POST', '/comments', comment);
  }

  async updateComment(id: string, comment: Pick<Comment, 'content'>): Promise<ApiResponse<Comment>> {
    return this.request<Comment>('PUT', `/comments/${id}`, comment);
  }

  async deleteComment(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('DELETE', `/comments/${id}`);
  }
}

export const apiClient = new ApiClient();