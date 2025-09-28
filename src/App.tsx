import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Task } from './types';
import { apiClient } from './services/api';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    try {
      await apiClient.createTask(taskData);
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingTask) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.updateTask(editingTask.id, taskData);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await apiClient.deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <div className="flex space-x-3">
              <button
                onClick={fetchTasks}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* To Do Column */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">To Do</h2>
              <span className="text-sm text-gray-500">{getTasksByStatus('todo').length} tasks</span>
            </div>
            <div className="p-4 space-y-3">
              {getTasksByStatus('todo').map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onRefresh={fetchTasks}
                />
              ))}
              {getTasksByStatus('todo').length === 0 && (
                <p className="text-gray-500 text-center py-8">No tasks to do</p>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">In Progress</h2>
              <span className="text-sm text-gray-500">{getTasksByStatus('in_progress').length} tasks</span>
            </div>
            <div className="p-4 space-y-3">
              {getTasksByStatus('in_progress').map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onRefresh={fetchTasks}
                />
              ))}
              {getTasksByStatus('in_progress').length === 0 && (
                <p className="text-gray-500 text-center py-8">No tasks in progress</p>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Completed</h2>
              <span className="text-sm text-gray-500">{getTasksByStatus('completed').length} tasks</span>
            </div>
            <div className="p-4 space-y-3">
              {getTasksByStatus('completed').map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onRefresh={fetchTasks}
                />
              ))}
              {getTasksByStatus('completed').length === 0 && (
                <p className="text-gray-500 text-center py-8">No completed tasks</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Task Form Modal */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask || undefined}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}

export default App;