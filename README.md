# Restaurant Management System (Full-Stack)

A comprehensive restaurant management platform featuring a **React** frontend and a **Node.js/Express** backend, integrated with a **PostgreSQL** database.

## Features
- **User Authentication:** Complete Register/Login system using `bcrypt` for password hashing and `express-session` for secure session management.
- **CRUD Operations:** Full management of restaurant dishes (Create, Read, Update, Delete).
- **Search Logic:** Real-time dish searching capabilities.
- **Database Integration:** Robust connection to PostgreSQL using the `pg` pool for high-performance queries.

## Tech Stack
- **Frontend:** React (Hooks, Context-like logic), CSS3 (Grid & Flexbox).
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL.
- **Security:** Bcrypt, Middleware-based authentication.

##  Project Structure
- `backend/`: Express server logic, API endpoints, and database configuration.
- `frontend/`: React components, state management, and UI styling.

## How to Run
1. Clone the repository.
2. **Backend:** Navigate to `/backend`, run `npm install`, then `node server.js`.
3. **Frontend:** Navigate to `/frontend`, run `npm install`, then `npm start`.
