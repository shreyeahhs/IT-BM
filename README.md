# Book Sharing and Discussion Platform

Full-stack project for posting books, managing your own listings, and chatting in board-based communities.

## Tech Stack

- Backend: Django + Django REST Framework
- Database: SQLite (`backend/db.sqlite3`)
- Frontend: React
- Auth: DRF token authentication

## Current Status

Both backend and frontend are implemented and connected.

## Backend Features

- User registration and login APIs
- Token-based authentication
- Book CRUD with ownership checks
- Book status updates (available/sold/borrowed)
- Discussion boards with membership
- Join/leave board actions
- Board posts API with member-only posting

## Frontend Features

- Login and register pages
- Register supports first name + last name
- Full-name greeting in navbar/dashboard/my books
- Dashboard redesign with card-based layout
- My Books page with:
	- Create-book modal
	- Edit listing inline
	- Delete listing
- Book cards show owner username (not numeric ID)
- Base64 book cover upload and preview support
- Board page with Discord-inspired UI:
	- Dark sidebar + channel-like board list
	- Join/leave state synced with backend membership
	- Grouped message rows with avatars and timestamps
	- Empty-channel welcome message
	- Message composer with Enter-to-send

## Data Model (High Level)

- `User` (Django auth user)
- `Book`
	- `title`, `author`, `condition`, `price`, `status`, `cover`, `owner`, `created_at`
- `DiscussionBoard`
	- `name`, `description`, `members` (through `BoardMembership`)
- `BoardMembership`
	- `user`, `board`, `joined_at`
- `Post`
	- `content`, `author`, `board`, `created_at`

## Project Structure

```text
backend/
	manage.py
	requirements.txt
	db.sqlite3
	bookshare/
	books/
	boards/
	users/
	seed_data/
		covers/
frontend/
```

## Local Setup (Windows)

### 1. Create Virtual Environment

```powershell
cd backend
python -m venv ..\venv
```

### 2. Activate Virtual Environment

```powershell
cd ..
.\venv\Scripts\Activate.ps1
```

If you get this error:

`running scripts is disabled on this system`

Use one of the following:

Temporary (current shell only):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

Persistent for current user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\venv\Scripts\Activate.ps1
```

If policy is managed by your organization, use alternatives:

```cmd
venv\Scripts\activate.bat
```

or run Python directly without activation:

```powershell
.\venv\Scripts\python.exe backend\manage.py runserver
```

### 3. Install Backend Dependencies

```powershell
cd backend
..\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 4. Run Migrations

```powershell
..\venv\Scripts\python.exe manage.py migrate
```

### 5. Start Backend

```powershell
..\venv\Scripts\python.exe manage.py runserver
```

Backend runs at `http://127.0.0.1:8000/`.

### 6. Start Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000/`.

## Demo Seed Data

This project includes seed scripts for demo users/books/boards/chats.

### Generate 10 Cover Images

```powershell
cd backend
..\venv\Scripts\python.exe generate_seed_images.py
```

### Seed Database

```powershell
cd backend
..\venv\Scripts\python.exe manage.py seed_db
```

Seed command creates:

- 3 users
- 10 books (with base64 covers)
- 3 boards
- sample posts in each board

Default test credentials:

- `shreyas / testpass123`
- `kunli / testpass123`
- `shuao / testpass123`

## API Base

- Base URL: `http://127.0.0.1:8000/api/`

