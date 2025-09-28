import React, { useState } from 'react';
import { Task } from '../types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo' as const,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter task title..."
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description..."
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </form>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : task ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;