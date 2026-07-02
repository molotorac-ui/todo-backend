# Todo List — Backend

Node.js/Express REST API for the Todo List assessment (Part A).

## Tech Stack
- Node.js
- Express
- Yup (validation)
- CORS

## Data Storage
This project uses an **in-memory array** to store todo items. Data is not persisted to a database or file — it resets whenever the server restarts. This approach was chosen for simplicity, since no authentication or multi-user support was required for this assessment.

## Setup Instructions
1. Clone this repository.
2. Install dependencies:

    npm install

3. Start the server:

    node server.js

4. The API will run on `http://localhost:5000` (or the port set in the `PORT` environment variable).

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/todos | Get all todos |
| GET | /api/todos/:id | Get a single todo |
| POST | /api/todos | Create a new todo |
| PUT/PATCH | /api/todos/:id | Update a todo |
| DELETE | /api/todos/:id | Delete a todo |

## Assumptions
- Single anonymous user, no authentication or login required.
- Data is stored in memory and is not persisted between server restarts.
