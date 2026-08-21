Task Management System

A simple full-stack Task Management System built using React, Node.js, Express, and MongoDB.

Features

- User Signup and Login
- JWT Authentication
- Create Tasks
- View Tasks
- Update Tasks
- Delete Tasks
- Mark Tasks as Completed
- Search Tasks by Title
- Filter Tasks by Status
- Filter Tasks by Priority
- Task Analytics
- Responsive UI
- Dark Mode

Technologies Used

Frontend

- React.js
- Axios
- CSS
- Vite

Backend

- Node.js
- Express.js
- JWT
- Mongoose

Database
- MongoDB Atlas

Setup Steps

1. Clone the Repository

git clone YOUR_GITHUB_REPOSITORY_URL
cd task-management-system


2. Setup Backend

cd backend
npm install

Create a `.env` file inside the backend folder:

MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
PORT=5001

Start the backend:

npm run dev

The backend runs on:

http://localhost:5001

3. Setup Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The frontend runs on:

http://localhost:5173



API Endpoints

### Authentication

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | `/api/auth/signup` | Register a new user |
| POST   | `/api/auth/login`  | Login user          |

### Tasks

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/tasks`              | Create a task          |
| GET    | `/api/tasks`              | Get user's tasks       |
| PUT    | `/api/tasks/:id`          | Update a task          |
| DELETE | `/api/tasks/:id`          | Delete a task          |
| PATCH  | `/api/tasks/:id/complete` | Mark task as completed |
| GET    | `/api/tasks/analytics`    | Get task analytics     |

### Search and Filtering

Search tasks by title:

`GET /api/tasks?search=React`

Filter by status:

`GET /api/tasks?status=Todo`

Filter by priority:

`GET /api/tasks?priority=High`

## Task Fields

Each task contains:

* Title
* Description
* Status
* Priority
* Due Date

### Status

* Todo
* In Progress
* Done

### Priority

* Low
* Medium
* High

## Analytics

The dashboard displays:

* Total number of tasks
* Completed tasks
* Pending tasks
* Completion percentage

## Design Decisions

### React Frontend

React was used to build the user interface because it allows the application to be divided into reusable components and provides a simple way to manage application state.

### Node.js and Express

Node.js and Express were used to create the backend REST APIs for authentication and task management.

### MongoDB

MongoDB Atlas was used to store users and tasks. MongoDB works well with Node.js and provides a flexible document-based database structure.

### JWT Authentication

JWT is used to authenticate users. Protected task APIs require a valid JWT token.

 User-Specific Tasks

Each task is associated with the logged-in user. This ensures that users can only access and manage their own tasks.

 Simple Analytics

The dashboard provides basic task statistics such as total, completed, pending tasks and completion percentage.

 Simple UI

The application was designed to be clean, responsive and easy to use while focusing on the main requirements of the assignment.

 Project Structure

task-management-system

 ── backend
   ── server.js
   ── User.js
   ── Task.js
   ── package.json
   ── .env

── frontend
   ── src
      ── App.jsx
      ── App.css
      ── index.css
      ── main.jsx
   ── package.json

 README.md

## Future Improvements

* Pagination
* Sorting by due date and priority
* Role-based access
* Task notifications
* Deployment


