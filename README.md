# Task Management System

A comprehensive task management application with comments functionality, built with React, TypeScript, and Supabase.

## Features

### Backend APIs (Task #1)
- **Tasks CRUD API**: Complete Create, Read, Update, Delete operations for tasks
- **Comments CRUD API**: Full comment management system for tasks
- **Proper API Design**: RESTful endpoints with proper HTTP status codes
- **Data Validation**: Input validation and error handling
- **Automated Tests**: Comprehensive test suite for all API endpoints

### Frontend Interface (Task #2)
- **Task Management**: Create, edit, delete, and organize tasks
- **Kanban Board**: Visual task organization by status (To Do, In Progress, Completed)
- **Comments System**: Add, edit, and delete comments on tasks
- **Real-time Updates**: Automatic data synchronization
- **Responsive Design**: Works on all device sizes

## API Endpoints

### Tasks
- `GET /functions/v1/tasks` - Get all tasks
- `GET /functions/v1/tasks/:id` - Get single task with comments
- `POST /functions/v1/tasks` - Create new task
- `PUT /functions/v1/tasks/:id` - Update task
- `DELETE /functions/v1/tasks/:id` - Delete task

### Comments
- `GET /functions/v1/comments` - Get all comments
- `GET /functions/v1/comments?task_id=:id` - Get comments for task
- `GET /functions/v1/comments/:id` - Get single comment
- `POST /functions/v1/comments` - Create new comment
- `PUT /functions/v1/comments/:id` - Update comment
- `DELETE /functions/v1/comments/:id` - Delete comment

## Database Schema

### Tasks Table
- `id` (uuid, primary key)
- `title` (text, required)
- `description` (text, optional)
- `status` (enum: todo, in_progress, completed)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Comments Table
- `id` (uuid, primary key)
- `task_id` (uuid, foreign key to tasks)
- `content` (text, required)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Setup Instructions

1. **Configure Supabase**:
   - Click the "Supabase" button in the settings panel
   - This will set up your database connection and environment variables

2. **Run the Application**:
   ```bash
   npm run dev
   ```

3. **Run Tests**:
   ```bash
   node tests/api.test.js
   ```

## Architecture

- **Frontend**: React with TypeScript
- **Backend**: Supabase Edge Functions
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS
- **API Client**: Custom TypeScript API client

## Security Features

- Row Level Security (RLS) enabled
- Input validation and sanitization
- Proper error handling
- CORS configuration

## Testing

The test suite includes:
- Task CRUD operations testing
- Comment CRUD operations testing
- Data validation testing
- Error handling verification
- API endpoint coverage

Run tests with: `node tests/api.test.js`