import React, { useState } from 'react';
import { MessageSquare, CreditCard as Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Task } from '../types';
import CommentSection from './CommentSection';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onRefresh }) => {
  const [showComments, setShowComments] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const commentCount = task.comments?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 flex-1">{task.title}</h3>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit task"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
          >
            {getStatusText(task.status)}
          </span>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            {showComments ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <MessageSquare size={16} />
            <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
          </button>
        </div>
      </div>
      
      {showComments && (
        <div className="border-t border-gray-200">
          <CommentSection taskId={task.id} comments={task.comments || []} onRefresh={onRefresh} />
        </div>
      )}
    </div>
  );
};

export default TaskCard;