# BookLoop

A full-stack book sharing and community platform — buy, sell, borrow, and discuss books with other readers.

## Tech Stack

- Backend: Django + Django REST Framework
- Database: SQLite (`backend/db.sqlite3`)
- Frontend: React
- Auth: DRF token authentication

## Current Status

Both backend and frontend are fully implemented and connected.

## Backend Features

- User registration and login APIs
- Token-based authentication
- Book CRUD with ownership checks
- Book status updates (`available` / `sold` / `borrowed`)
- Discussion boards with membership (join / leave)
- Board posts API — member-only posting with validation
- Book reviews and star ratings via a system review board (`__SYSTEM_REVIEWS__`)
  - One review per user per book; edit supported
  - `book_id` and `rating` (1–5) stored on `Post`
- Trade chatroom API for buyer-seller negotiation per listing
	- Start chat by `book_id` with intent (`buy` / `borrow`)
	- Reuses existing room for same buyer-seller-book combination
	- Participant-only room and message access
- `generate_seed_images.py` — zero-dependency PNG cover generator
- Comprehensive backend API tests across users, books, boards, reviews, and trade chat

## Frontend Features

- Redesigned login and register pages with split-screen brand panel
- Register supports first name + last name
- Full-name greeting in navbar, dashboard, and My Books
- Dashboard with card-based layout and quick-action shortcuts
- My Books page:
  - Create-book modal
  - Inline edit listing
  - Delete listing
- Book cards show owner username (not numeric ID)
- Listings split into `My Listings` and `Marketplace Listings`
- Base64 book cover upload and preview
- Book detail page (`/book/:id`):
  - Full book info (title, author, price, owner, condition, status)
  - Post / edit star-rated reviews
  - Community review list
- Board page with Discord-inspired UI:
  - Dark sidebar + channel-like board list
  - Join / leave state synced with backend membership
  - Grouped message rows with avatars and timestamps
  - Empty-channel welcome message
  - Message composer with Enter-to-send and emoji picker
  - Expandable long messages
- Trade chat experience:
	- Buy/Borrow buttons on non-owned listings
	- Dedicated chatrooms tied to specific books
	- Chats index page (`/chats`) + full-screen responsive room (`/trade-chat/:roomId`)

## Data Model (High Level)

- `User` (Django auth user)
- `Book`
  - `title`, `author`, `condition`, `price`, `status`, `cover`, `owner`, `created_at`
- `DiscussionBoard`
  - `name`, `description`, `members` (through `BoardMembership`)
  - `__SYSTEM_REVIEWS__` — auto-created system board for book reviews
- `BoardMembership`
  - `user`, `board`, `joined_at`
- `Post`
  - `content`, `author`, `board`, `created_at`
  - `book_id` *(nullable)* — links review posts to a specific book
  - `rating` *(nullable, 1–5)* — star rating for review posts
- `TradeChatRoom`
	- `book`, `buyer`, `seller`, `initial_intent`, `created_at`, `updated_at`
- `TradeChatMessage`
	- `room`, `sender`, `content`, `created_at`

## Project Structure

```text
backend/
	manage.py
	requirements.txt
	db.sqlite3
	generate_seed_images.py   ← generates seed cover PNGs (no extra deps)
	bookshare/
		test_runner.py        ← custom runner with ✔/✘ verbose output
	books/
		tests.py
	boards/
		tests.py
	users/
		tests.py
	seed_data/
		covers/               ← cover_01.png … cover_10.png
frontend/
	src/
		pages/
			login.js
			register.js
			dashboard.js
			booklist.js
			mybook.js
			createbook.js
			board.js
			BookDetail.js     ← book detail + reviews page
			discussion.js
			tradechats.js     ← chats list page
			tradechat.js      ← single trade chat room page
		components/
			navbar.js
			bookcard.js
			postcard.js
			alert.js
```

## Local Setup (Windows)

### 1. Create Virtual Environment

**PowerShell**
```powershell
cd backend
python -m venv ..\.venv
```

**CMD**
```cmd
cd backend
python -m venv ..\.venv
```

### 2. Activate Virtual Environment

**PowerShell**
```powershell
cd ..
.\.venv\Scripts\Activate.ps1
```

If you get `running scripts is disabled on this system`, run one of these first:

Temporary (current shell only):
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Persistent for current user:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

**CMD**
```cmd
cd ..
.venv\Scripts\activate.bat
```

### 3. Install Backend Dependencies

**PowerShell**
```powershell
cd backend
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

**CMD**
```cmd
cd backend
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 4. Run Migrations

**PowerShell**
```powershell
..\.venv\Scripts\python.exe manage.py migrate
```

**CMD**
```cmd
..\.venv\Scripts\python.exe manage.py migrate
```

### 5. Start Backend

**PowerShell**
```powershell
..\.venv\Scripts\python.exe manage.py runserver
```

**CMD**
```cmd
..\.venv\Scripts\python.exe manage.py runserver
```

Backend runs at `http://127.0.0.1:8000/`.

### 6. Start Frontend

Open a second terminal:

**PowerShell / CMD**
```cmd
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000/`.

## Demo Seed Data

This project includes seed scripts for demo users, books, boards, and posts.

### Step 1 — Generate 10 Cover Images

**PowerShell**
```powershell
cd backend
..\.venv\Scripts\python.exe generate_seed_images.py
```

**CMD**
```cmd
cd backend
..\.venv\Scripts\python.exe generate_seed_images.py
```

Writes `cover_01.png` … `cover_10.png` into `backend/seed_data/covers/`.  
Uses only Python standard library — no extra packages required.

### Step 2 — Seed Database

**PowerShell**
```powershell
..\.venv\Scripts\python.exe manage.py seed_db
```

**CMD**
```cmd
..\.venv\Scripts\python.exe manage.py seed_db
```

Creates:

- 3 users
- 10 books (with base64 covers)
- 3 boards
- Sample posts in each board

### Re-seed from scratch

**PowerShell**
```powershell
Remove-Item db.sqlite3
..\.venv\Scripts\python.exe manage.py migrate
..\.venv\Scripts\python.exe manage.py seed_db
```

**CMD**
```cmd
del db.sqlite3
..\.venv\Scripts\python.exe manage.py migrate
..\.venv\Scripts\python.exe manage.py seed_db
```

### Default Test Credentials

| Username | Password | Name |
|---|---|---|
| `shreyas` | `testpass123` | Shreyas Gowda |
| `kunli` | `testpass123` | Kunli Shi |
| `shuao` | `testpass123` | ShuAo Beh |

## Backend Testing

The project includes API tests for all core backend flows:

- `users`: register/login behavior and token issuance
- `books`: CRUD auth rules, status updates, search, average ratings
- `boards`: memberships, posting permissions, review validations
- `trade chat`: room creation, participant access control, messaging

### Run All Backend Tests

**PowerShell**
```powershell
cd backend
..\.venv\Scripts\python.exe manage.py test users books boards -v 2
```

**CMD**
```cmd
cd backend
..\.venv\Scripts\python.exe manage.py test users books boards -v 2
```

### Run App-Specific Tests

**PowerShell**
```powershell
cd backend
..\.venv\Scripts\python.exe manage.py test users -v 2
..\.venv\Scripts\python.exe manage.py test books -v 2
..\.venv\Scripts\python.exe manage.py test boards -v 2
```

**CMD**
```cmd
cd backend
..\.venv\Scripts\python.exe manage.py test users -v 2
..\.venv\Scripts\python.exe manage.py test books -v 2
..\.venv\Scripts\python.exe manage.py test boards -v 2
```

Verbose test output uses:

- `✔ OK` for pass
- `✘ FAIL` and `✘ ERROR` for failures

## API Base

- Base URL: `http://127.0.0.1:8000/api/`

## Render Deployment (Backend)

If Render shows this error:

`ModuleNotFoundError: No module named 'your_application'`

your start command is using the placeholder module name. Use the Django project module from this repo instead.

### Correct Render Settings

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `python manage.py migrate && gunicorn bookshare.wsgi:application --bind 0.0.0.0:$PORT`

### Required Environment Variables

- `DEBUG=false`
- `ALLOWED_HOSTS=.onrender.com`
- `SQLITE_PATH=/var/data/db.sqlite3`
- `SECRET_KEY=<your-secret-key>`

### Optional Blueprint

This repo includes `render.yaml` at the project root with the same working settings.

