# Niche Books Exchange Platform

## Project Overview

This project is a web platform where users can lend, borrow, sell, and bid on niche or rare books that are usually not available in libraries. Along with this, the platform provides a discussion space similar to Reddit where users can create communities around authors, books, and genres and have conversations.

The main idea is that **books are the central object** in the system. Everything else such as listings, borrowing, bidding, and discussions is built around books.

This project demonstrates strong backend design, relational database modeling, REST API design, and full-stack integration using Django, React, and PostgreSQL.

---

## Tech Stack

### Backend
- Django
- Django REST Framework

### Frontend
- React

### Database
- PostgreSQL

### Authentication
- Django authentication with JWT tokens

### Deployment (later phase)
- Docker
- Render / Railway (Because they have free tier and we can host easily here)

PostgreSQL is used instead of SQLite because this system requires strong relationships, indexing, and scalability.

---

## Core System Design

The system is divided into logical modules:

1. Book Registry
2. Listings (lend / sell / auction)
3. Transactions (borrow, return, bids)
4. Communities (discussion space)
5. Users and ratings

Each module is implemented as a separate Django app for clean architecture.

---

## Database Design (High Level)

### Book
This is the master record of every book in the system.

Fields:
- Title
- Author
- ISBN
- Genre
- Description
- Tags
- Cover image

Why: A book should exist only once. Multiple users can create listings for the same book.

---

### Listing
Represents a user offering a book.

Fields:
- Book (Foreign Key)
- Owner (User)
- Listing type (LEND, SELL, AUCTION)
- Condition
- Price (for sell)
- Minimum bid (for auction)
- Lending duration
- Status

Why: Users do not create books, they create listings of books they own.

---

### Transaction
Handles borrowing and buying flow.

Fields:
- Listing
- Borrower/Buyer
- Status (requested, approved, returned, completed)
- Due date (for lending)

Why: To track the lifecycle of lending and selling.

---

### Bid
Used only for auction listings.

Fields:
- Listing
- Bidder
- Amount
- Timestamp

Why: To track all bids and determine the winner.

---

### Community
Discussion group around books, authors, or genres.

Fields:
- Name
- Description
- Creator

---

### Post and Comment
For Reddit-style discussions inside communities.

Why: This keeps users engaged and builds a knowledge network around books.

---

### User Profile and Ratings
Tracks:
- Books owned
- Books lent
- Books borrowed
- Ratings from other users

Why: Trust is important in a peer-to-peer lending system.

---

## Frontend Pages (React)

### Home Page
Shows active listings and trending communities.

Why: Entry point where users discover books and discussions.

---

### Book Detail Page
Shows:
- Book information
- All listings for that book
- Related discussions

Why: Book is the central object. Users should see everything related to it in one place.

---

### Create Listing Page
Allows user to select a book and create a lend/sell/auction listing.

Why: This is how inventory enters the system.

---

### Listing Detail Page
Shows listing information with actions:
- Borrow request
- Buy now
- Place bid

Why: Users interact with listings here.

---

### Auction Page
Live view of bids for auction listings.

Why: Required to manage real-time bidding experience.

---

### Communities Page
List of all communities.

Why: Users explore discussion spaces.

---

### Community Detail Page
Shows posts and discussions.

Why: Enables Reddit-style interaction.

---

### Profile Page
Shows user activity, listings, transactions, and ratings.

Why: Builds trust and transparency between users.

---

## Backend APIs (Django REST)

### Books
- `GET /api/books/` – List all books
- `POST /api/books/` – Add a new book
- `GET /api/books/{id}/` – Book details

Why: Required to maintain the central book registry.

---

### Listings
- `GET /api/listings/` – All listings
- `POST /api/listings/` – Create listing
- `GET /api/listings/{id}/` – Listing details

Why: Users interact with listings, not directly with books.

---

### Borrow / Buy / Bid Actions
- `POST /api/listings/{id}/borrow/`
- `POST /api/listings/{id}/buy/`
- `POST /api/listings/{id}/bid/`

Why: Special actions that change the state of listings.

---

### Transactions
- `GET /api/transactions/` – User transaction history

Why: To track borrowing and buying lifecycle.

---

### Communities
- `GET /api/communities/`
- `POST /api/communities/`
- `GET /api/communities/{id}/`

Why: To create and explore discussion groups.

---

### Posts and Comments
- `POST /api/posts/`
- `POST /api/comments/`

Why: Enable discussions inside communities.

---

### Users
- `GET /api/profile/`
- `GET /api/users/{id}/`

Why: Show user activity and ratings.

---

## Development Phases

### Phase 1
Books and Listings

### Phase 2
Borrowing and Transactions

### Phase 3
Auction and Bidding

### Phase 4
Communities and Discussions

### Phase 5
Search, ratings, notifications, and polishing

---

## Why This Architecture

- Clean separation of concerns using Django apps
- Strong relational modeling with PostgreSQL
- Scalable API design using REST
- React provides dynamic and interactive frontend
- Books remain the central entity across the system
- Supports lending, selling, bidding, and discussion without mixing logic

This design ensures the project is maintainable, scalable, and suitable as a serious full-stack portfolio project.
