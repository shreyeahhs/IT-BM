# Database Seeding Guide

This project includes demo data for easy testing and development. Follow these steps to get started.

## Quick Start

### 1. Generate Book Cover Images
The seed data includes 10 colorful book cover images. They're automatically generated:

```bash
cd backend
python generate_seed_images.py
```

This creates PNG files in `backend/seed_data/covers/cover_01.png` through `cover_10.png`.

### 2. Reset & Seed Database

```bash
cd backend
# Remove old database
Remove-Item db.sqlite3

# Run migrations  
python manage.py migrate

# Seed with demo data
python manage.py seed_db
```

### 3. Test Accounts

After seeding, you have 3 demo users ready to test:

| Username | Password | Name |
|----------|----------|------|
| shreyas | testpass123 | Shreyas Gowda |
| kunli | testpass123 | Kunli Shi |
| shuao | testpass123 | ShuAo Beh |

## What Gets Created

### Users (3)
- **shreyas**, **kunli**, **shuao** — Full accounts with names and tokens

### Books (10)
- 4 books distributed across users with colorful cover images
- Examples: "The Silent Reader", "Code Mastery", "Python Secrets", etc.
- Each has a unique base64-encoded PNG cover ready to display

### Discussion Boards (3)
1. **Fiction Lovers** — For novel discussions
2. **Tech & Programming** — For coding books
3. **Book Trades** — For swaps and meetups

### Posts (9)
- 3 sample messages per board from different users
- Demonstrates the Discord-style chat interface

## File Structure

```
backend/
├── seed_data/
│   └── covers/                    # Book cover PNG images (10 files)
│       ├── cover_01.png
│       ├── cover_02.png
│       └── ...
├── books/
│   └── management/
│       └── commands/
│           └── seed_db.py         # Django management command
├── generate_seed_images.py        # Script to generate covers
└── manage.py
```

## Re-seeding

To reset and re-seed the database at any time:

```bash
cd backend
Remove-Item db.sqlite3
python manage.py migrate
python manage.py seed_db
```

**Note:** This will wipe all user data and recreate fresh demo records.

## Customizing Seed Data

Edit `backend/books/management/commands/seed_db.py` to:
- Change user names, usernames, or passwords (in `users_data`)
- Modify book titles, authors, or prices (in `books_data`)
- Add/remove boards or change descriptions (in `boards_data`)
- Update sample posts (in `sample_posts`)

Then re-run `python manage.py seed_db`.

## Next Steps

1. Start the backend: `python manage.py runserver`
2. Start the frontend: `cd frontend && npm start`
3. Log in with any of the 3 test accounts
4. Explore books, create listings, join boards, chat!
