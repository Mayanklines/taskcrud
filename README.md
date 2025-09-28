# Task Management System - Flask + React

A comprehensive task management application with comments functionality, built with Flask backend API and React frontend.

## Features

### Backend API (Flask)
- **Tasks CRUD API**: Complete Create, Read, Update, Delete operations for tasks
- **Comments CRUD API**: Full comment management system for tasks
- **RESTful Design**: Proper HTTP methods and status codes
- **Data Validation**: Input validation and error handling
- **SQLite Database**: Local database with SQLAlchemy ORM
- **Automated Tests**: Comprehensive test suite using unittest

### Frontend Interface (React)
- **Task Management**: Create, edit, delete, and organize tasks
- **Kanban Board**: Visual task organization by status (To Do, In Progress, Completed)
- **Comments System**: Add, edit, and delete comments on tasks
- **Real-time Updates**: Automatic data synchronization
- **Responsive Design**: Works on all device sizes

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task with comments
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Comments
- `GET /api/comments` - Get all comments
- `GET /api/comments?task_id=:id` - Get comments for task
- `GET /api/comments/:id` - Get single comment
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Health Check
- `GET /api/health` - API health status

## Database Schema

### Tasks Table
- `id` (integer, primary key)
- `title` (string, required)
- `description` (text, optional)
- `status` (enum: todo, in_progress, completed)
- `created_at` (datetime)
- `updated_at` (datetime)

### Comments Table
- `id` (integer, primary key)
- `task_id` (integer, foreign key to tasks)
- `content` (text, required)
- `created_at` (datetime)
- `updated_at` (datetime)

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Application**:
   
   **Option 1: Run both servers simultaneously**
   ```bash
   npm run dev:full
   ```
   
   **Option 2: Run servers separately**
   
   Terminal 1 (Flask Backend):
   ```bash
   npm run flask
   # or
   cd backend && python app.py
   ```
   
   Terminal 2 (React Frontend):
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Testing

**Run Flask API Tests**:
```bash
cd backend && python test_api.py
```

**Test API Endpoints**:
```bash
# Health check
curl http://localhost:5000/api/health

# Get all tasks
curl http://localhost:5000/api/tasks

# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "description": "Test Description", "status": "todo"}'
```

## Architecture

- **Backend**: Flask with SQLAlchemy ORM
- **Frontend**: React with TypeScript
- **Database**: SQLite (local development)
- **Styling**: Tailwind CSS
- **API Client**: Custom TypeScript API client
- **State Management**: React hooks

## Development Features

- **Hot Reload**: Both Flask and React support hot reloading
- **CORS Enabled**: Cross-origin requests configured
- **Error Handling**: Comprehensive error handling on both ends
- **Type Safety**: Full TypeScript support
- **Responsive Design**: Mobile-first approach

## Project Structure

```
├── backend/
│   ├── app.py              # Flask application
│   ├── test_api.py         # API tests
│   └── tasks.db            # SQLite database (auto-created)
├── src/
│   ├── components/         # React components
│   ├── services/          # API client
│   ├── types/             # TypeScript types
│   └── App.tsx            # Main React component
├── requirements.txt        # Python dependencies
└── package.json           # Node.js dependencies
```

## API Response Format

All API responses follow this format:

**Success Response**:
```json
{
  "data": { ... }
}
```

**Error Response**:
```json
{
  "error": "Error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error