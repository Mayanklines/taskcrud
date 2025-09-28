from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    status = db.Column(db.String(20), default='todo')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    comments = db.relationship('Comment', backref='task', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'comments': [comment.to_dict() for comment in self.comments]
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'task_id': str(self.task_id),
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Create tables
with app.app_context():
    db.create_all()

# Task Routes
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.order_by(Task.created_at.desc()).all()
        return jsonify({'data': [task.to_dict() for task in tasks]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        return jsonify({'data': task.to_dict()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        
        if not data or not data.get('title', '').strip():
            return jsonify({'error': 'Title is required'}), 400
        
        if data.get('status') not in ['todo', 'in_progress', 'completed']:
            data['status'] = 'todo'
        
        task = Task(
            title=data['title'].strip(),
            description=data.get('description', '').strip(),
            status=data.get('status', 'todo')
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({'data': task.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        
        if not data or not data.get('title', '').strip():
            return jsonify({'error': 'Title is required'}), 400
        
        if data.get('status') not in ['todo', 'in_progress', 'completed']:
            data['status'] = 'todo'
        
        task.title = data['title'].strip()
        task.description = data.get('description', '').strip()
        task.status = data.get('status', 'todo')
        task.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'data': task.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Task deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Comment Routes
@app.route('/api/comments', methods=['GET'])
def get_comments():
    try:
        task_id = request.args.get('task_id')
        if task_id:
            comments = Comment.query.filter_by(task_id=task_id).order_by(Comment.created_at.asc()).all()
        else:
            comments = Comment.query.order_by(Comment.created_at.desc()).all()
        
        return jsonify({'data': [comment.to_dict() for comment in comments]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<int:comment_id>', methods=['GET'])
def get_comment(comment_id):
    try:
        comment = Comment.query.get_or_404(comment_id)
        return jsonify({'data': comment.to_dict()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments', methods=['POST'])
def create_comment():
    try:
        data = request.get_json()
        
        if not data or not data.get('content', '').strip():
            return jsonify({'error': 'Content is required'}), 400
        
        if not data.get('task_id'):
            return jsonify({'error': 'Task ID is required'}), 400
        
        # Verify task exists
        task = Task.query.get(data['task_id'])
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        comment = Comment(
            task_id=data['task_id'],
            content=data['content'].strip()
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({'data': comment.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    try:
        comment = Comment.query.get_or_404(comment_id)
        data = request.get_json()
        
        if not data or not data.get('content', '').strip():
            return jsonify({'error': 'Content is required'}), 400
        
        comment.content = data['content'].strip()
        comment.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'data': comment.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    try:
        comment = Comment.query.get_or_404(comment_id)
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({'message': 'Comment deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Flask API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)