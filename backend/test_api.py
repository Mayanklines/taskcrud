import unittest
import json
from app import app, db, Task, Comment

class TaskAPITestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        
        with app.app_context():
            db.create_all()
    
    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
    
    def test_health_check(self):
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
    
    def test_create_task_valid(self):
        task_data = {
            'title': 'Test Task',
            'description': 'Test Description',
            'status': 'todo'
        }
        response = self.app.post('/api/tasks', 
                                json=task_data,
                                content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['data']['title'], 'Test Task')
        self.assertEqual(data['data']['status'], 'todo')
    
    def test_create_task_missing_title(self):
        task_data = {'description': 'Test Description'}
        response = self.app.post('/api/tasks', 
                                json=task_data,
                                content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('Title is required', data['error'])
    
    def test_get_all_tasks(self):
        # Create a task first
        with app.app_context():
            task = Task(title='Test Task', description='Test Description')
            db.session.add(task)
            db.session.commit()
        
        response = self.app.get('/api/tasks')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data['data'], list)
        self.assertEqual(len(data['data']), 1)
    
    def test_get_single_task(self):
        # Create a task first
        with app.app_context():
            task = Task(title='Test Task', description='Test Description')
            db.session.add(task)
            db.session.commit()
            task_id = task.id
        
        response = self.app.get(f'/api/tasks/{task_id}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['data']['title'], 'Test Task')
    
    def test_update_task(self):
        # Create a task first
        with app.app_context():
            task = Task(title='Test Task', description='Test Description')
            db.session.add(task)
            db.session.commit()
            task_id = task.id
        
        update_data = {
            'title': 'Updated Task',
            'description': 'Updated Description',
            'status': 'in_progress'
        }
        response = self.app.put(f'/api/tasks/{task_id}', 
                               json=update_data,
                               content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['data']['title'], 'Updated Task')
        self.assertEqual(data['data']['status'], 'in_progress')
    
    def test_delete_task(self):
        # Create a task first
        with app.app_context():
            task = Task(title='Test Task', description='Test Description')
            db.session.add(task)
            db.session.commit()
            task_id = task.id
        
        response = self.app.delete(f'/api/tasks/{task_id}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('deleted successfully', data['message'])
    
    def test_create_comment_valid(self):
        # Create a task first
        with app.app_context():
            task = Task(title='Test Task', description='Test Description')
            db.session.add(task)
            db.session.commit()
            task_id = task.id
        
        comment_data = {
            'task_id': task_id,
            'content': 'Test Comment'
        }
        response = self.app.post('/api/comments', 
                                json=comment_data,
                                content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['data']['content'], 'Test Comment')
    
    def test_create_comment_missing_content(self):
        comment_data = {'task_id': 1}
        response = self.app.post('/api/comments', 
                                json=comment_data,
                                content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('Content is required', data['error'])
    
    def test_create_comment_invalid_task(self):
        comment_data = {
            'task_id': 999,
            'content': 'Test Comment'
        }
        response = self.app.post('/api/comments', 
                                json=comment_data,
                                content_type='application/json')
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertIn('Task not found', data['error'])

if __name__ == '__main__':
    unittest.main()