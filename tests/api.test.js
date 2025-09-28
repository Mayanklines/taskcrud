// Test suite for Tasks and Comments APIs
// Run with: node tests/api.test.js

const API_BASE_URL = 'http://localhost:54321/functions/v1';

class APITester {
  constructor() {
    this.testResults = [];
  }

  async test(name, testFn) {
    try {
      console.log(`Running: ${name}`);
      await testFn();
      this.testResults.push({ name, status: 'PASS' });
      console.log(`✅ PASS: ${name}`);
    } catch (error) {
      this.testResults.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${name} - ${error.message}`);
    }
  }

  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
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
  }

  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message} Expected: ${expected}, Got: ${actual}`);
    }
  }

  assertExists(value, message = '') {
    if (!value) {
      throw new Error(`${message} Value should exist`);
    }
  }

  async runTests() {
    console.log('🚀 Starting API Tests\n');
    
    let createdTaskId = null;
    let createdCommentId = null;

    // Task API Tests
    await this.test('Create Task - Valid Data', async () => {
      const result = await this.request('POST', '/tasks', {
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo'
      });
      
      this.assertExists(result.data, 'Task should be created');
      this.assertEqual(result.data.title, 'Test Task', 'Title should match');
      this.assertEqual(result.data.status, 'todo', 'Status should match');
      createdTaskId = result.data.id;
    });

    await this.test('Create Task - Missing Title', async () => {
      try {
        await this.request('POST', '/tasks', {
          description: 'Test Description'
        });
        throw new Error('Should have failed validation');
      } catch (error) {
        if (!error.message.includes('Title is required')) {
          throw new Error('Wrong error message');
        }
      }
    });

    await this.test('Get All Tasks', async () => {
      const result = await this.request('GET', '/tasks');
      this.assertExists(result.data, 'Should return tasks');
      this.assertEqual(Array.isArray(result.data), true, 'Should return array');
    });

    await this.test('Get Single Task', async () => {
      if (!createdTaskId) throw new Error('No task ID available');
      
      const result = await this.request('GET', `/tasks/${createdTaskId}`);
      this.assertExists(result.data, 'Task should exist');
      this.assertEqual(result.data.id, createdTaskId, 'Task ID should match');
    });

    await this.test('Update Task', async () => {
      if (!createdTaskId) throw new Error('No task ID available');
      
      const result = await this.request('PUT', `/tasks/${createdTaskId}`, {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'in_progress'
      });
      
      this.assertEqual(result.data.title, 'Updated Task', 'Title should be updated');
      this.assertEqual(result.data.status, 'in_progress', 'Status should be updated');
    });

    // Comment API Tests
    await this.test('Create Comment - Valid Data', async () => {
      if (!createdTaskId) throw new Error('No task ID available');
      
      const result = await this.request('POST', '/comments', {
        task_id: createdTaskId,
        content: 'Test Comment'
      });
      
      this.assertExists(result.data, 'Comment should be created');
      this.assertEqual(result.data.content, 'Test Comment', 'Content should match');
      this.assertEqual(result.data.task_id, createdTaskId, 'Task ID should match');
      createdCommentId = result.data.id;
    });

    await this.test('Create Comment - Missing Content', async () => {
      if (!createdTaskId) throw new Error('No task ID available');
      
      try {
        await this.request('POST', '/comments', {
          task_id: createdTaskId
        });
        throw new Error('Should have failed validation');
      } catch (error) {
        if (!error.message.includes('Content is required')) {
          throw new Error('Wrong error message');
        }
      }
    });

    await this.test('Create Comment - Invalid Task ID', async () => {
      try {
        await this.request('POST', '/comments', {
          task_id: '00000000-0000-0000-0000-000000000000',
          content: 'Test Comment'
        });
        throw new Error('Should have failed validation');
      } catch (error) {
        if (!error.message.includes('Task not found')) {
          throw new Error('Wrong error message');
        }
      }
    });

    await this.test('Get Comments for Task', async () => {
      if (!createdTaskId) throw new Error('No task ID available');
      
      const result = await this.request('GET', `/comments?task_id=${createdTaskId}`);
      this.assertExists(result.data, 'Should return comments');
      this.assertEqual(Array.isArray(result.data), true, 'Should return array');
    });

    await this.test('Update Comment', async () => {
      if (!createdCommentId) throw new Error('No comment ID available');
      
      const result = await this.request('PUT', `/comments/${createdCommentId}`, {
        content: 'Updated Comment'
      });
      
      this.assertEqual(result.data.content, 'Updated Comment', 'Content should be updated');
    });

    // Cleanup
    await this.test('Delete Comment', async () => {
      if (!createdCommentId) throw new Error('No comment ID available');
      
      const result = await this.request('DELETE', `/comments/${createdCommentId}`);
      this.assertExists(result.message, 'Should return success message');
    });

    await this.test('Delete Task', async () => {
      if (!createdTaskId) throw new Error('No task ID available');
      
      const result = await this.request('DELETE', `/tasks/${createdTaskId}`);
      this.assertExists(result.message, 'Should return success message');
    });

    // Print Results
    console.log('\n📊 Test Results:');
    console.log('================');
    
    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log(`\n${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
      process.exit(1);
    }
  }
}

// Run tests
const tester = new APITester();
tester.runTests().catch(console.error);