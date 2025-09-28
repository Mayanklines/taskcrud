import React, { useState } from 'react';
import { Send, CreditCard as Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Comment } from '../types';
import { apiClient } from '../services/api';

interface CommentSectionProps {
  taskId: string;
  comments: Comment[];
  onRefresh: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ taskId, comments, onRefresh }) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      await apiClient.createComment({
        task_id: taskId,
        content: newComment.trim()
      });
      setNewComment('');
      onRefresh();
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to create comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      await apiClient.updateComment(commentId, { content: content.trim() });
      setEditingComment(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setIsLoading(true);
    try {
      await apiClient.deleteComment(commentId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-4">
      {comments.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                {editingComment?.id === comment.id ? (
                  <div className="flex-1 mr-2">
                    <textarea
                      value={editingComment.content}
                      onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setEditingComment(null)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEdit(comment.id, editingComment.content)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                        disabled={isLoading || !editingComment.content.trim()}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(comment.created_at)}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => setEditingComment({ id: comment.id, content: comment.content })}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit comment"
                        disabled={isLoading}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete comment"
                        disabled={isLoading}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !newComment.trim()}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;