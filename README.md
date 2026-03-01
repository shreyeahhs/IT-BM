# Book Sharing and Discussion Platform

Welcome to the **Book Sharing and Discussion Platform**, a full-stack web application designed for bibliophiles. This platform allows users to lend, borrow, sell, and bid on niche or rare books while participating in Reddit-style community discussions.

---

## 🚀 What's Built (Backend)

The backend is fully implemented using **Django** and **Django REST Framework (DRF)**. It features a robust relational database schema managed via **PostgreSQL**.

### Core Apps:
- **Users**: Custom user model with JWT-based authentication (Login, Register).
- **Books**: Management of a central book registry and user-specific book listings.
- **Boards**: Discussion communities (Boards), Posts, and Comments with nested relationships.

### Key Features:
- **Authentication**: Secure token-based access using `djangorestframework-simplejwt`.
- **Permissions**: Granular access control (e.g., only authors can edit their posts).
- **Serialization**: Optimized data representation including nested community and user details.
- **Filtering**: Search and filter capabilities for books and boards.

---

## 🛠️ What Needs to be Built (Frontend)

The frontend is planned as a **React** application that will consume the REST API.

### Upcoming Features:
- **Dashboard**: A vibrant home page showing trending books and active discussions.
- **Authentication Flow**: User-friendly login and registration forms.
- **Book Marketplace**: Interface for browsing listings, placing bids, and requesting borrows.
- **Community Space**: Interactive Reddit-style boards for threaded discussions.
- **User Profiles**: Personalized views of owned books, transaction history, and ratings.

---

## � Database Schema

The system uses a relational schema designed to handle books, listings, and community interactions efficiently.

### 1. User (Built-in)
- Default Django auth User stores credentials and profile information.

### 2. Book
- `title` (CharField): The title of the book.
- `author` (CharField): The author of the book.
- `condition` (CharField): Current physical state of the book.
- `price` (DecimalField): Listing price (optional).
- `status` (ChoiceField): available, sold, or borrowed.
- `owner` (ForeignKey): Reference to the User who owns the book.
- `created_at` (DateTimeField): Timestamp of listing creation.

### 3. DiscussionBoard
- `name` (CharField): Unique name for the community.
- `description` (TextField): About the board.
- `members` (ManyToManyField): Users who have joined the board via `BoardMembership`.

### 4. Post
- `content` (TextField): The body of the post.
- `author` (ForeignKey): The user who created the post.
- `board` (ForeignKey): The community board where the post is located.
- `created_at` (DateTimeField): Timestamp of post creation.

---

## 🔗 Available Links

| Name | URL | Description |
| :--- | :--- | :--- |
| **Admin Panel** | `/admin/` | Manage users, books, and boards (Staff only). |
| **Base API** | `/api/` | Root for all application endpoints. |

---

## ⚙️ Setup Instructions (Backend)

Follow these steps to get the backend running locally on Windows.

### 1. Prerequisites
- Python 3.10+
- PostgreSQL (Ensure it's installed and running)

### 2. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`) and add your database credentials:
```env
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=127.0.0.1
DB_PORT=5432
SECRET_KEY=your_django_secret_key
```

### 3. Using Virtual Environment (Recommended)
It is strongly advised to use a virtual environment to manage dependencies:
```cmd
python -m venv venv
venv\Scripts\activate
```

### 4. Install Dependencies & Run Setup
Run the setup script to install requirements and apply migrations:
```cmd
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

> [!NOTE]
> AI was used to restructure this README for better understanding and detailing, ensuring a professional and exhaustive overview of the project's current state and roadmap.
