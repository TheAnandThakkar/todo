# Todo App Backend

This is a basic Todo application built using **NestJS** and **MySQL** as the database. The project utilizes **TypeORM** for ORM management.

## Features

- User authentication (Sign up & Login)
- Create tasks
- Tasks can have three statuses: `todo`, `in-progress`, or `completed`
- Fetch task details using task ID
- List all tasks created by the authenticated user
- Update task details
- Delete tasks

> **Note:** Searching, sorting, and filtering are **not yet implemented** in this boilerplate.

## Technologies Used

- **NestJS** - Backend framework
- **TypeORM** - ORM for database management
- **MySQL** - Database
- **JWT** - Authentication

## Installation & Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16+ recommended)
- **MySQL**
- **npm** or **yarn**

### Steps to Run the Project

1. Clone the repository:

   ```sh
   git clone https://github.com/TheAnandThakkar/todo.git
   cd todo
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

   or

   ```sh
   yarn install
   ```

3. Set up the `.env` file with the following variables:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_NAME=todo
   DB_SYNCRONIZE=true

   PORT=3000

   SALT=10

   JWT_SECRET=secret
   ```

4. Start the application:

   ```sh
   npm run start
   ```

   or in watch mode:

   ```sh
   npm run start:dev
   ```

5. API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication

| Method | Endpoint         | Description                               |
| ------ | ---------------- | ----------------------------------------- |
| POST   | `/auth/register` | Register a new user and receive JWT token |
| POST   | `/auth/login`    | Login and receive JWT token               |

### Task Management (Authenticated Routes)

| Method | Endpoint     | Description                        |
| ------ | ------------ | ---------------------------------- |
| POST   | `/tasks`     | Create a new task                  |
| GET    | `/tasks/:id` | Get task details by ID             |
| GET    | `/tasks`     | List all tasks created by the user |
| PUT    | `/tasks/:id` | Update a task                      |
| DELETE | `/tasks/:id` | Delete a task                      |

## Future Improvements

- Implement search, sorting, and filtering
- Improve error handling and validation
