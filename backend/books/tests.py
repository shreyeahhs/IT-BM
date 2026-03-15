from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from boards.models import DiscussionBoard, Post
from books.models import Book


class BookApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="pass123")
        self.other = User.objects.create_user(username="other", password="pass123")
        self.owner_token = Token.objects.create(user=self.owner)
        self.other_token = Token.objects.create(user=self.other)

        self.book = Book.objects.create(
            title="Django Deep Dive",
            author="Jane Dev",
            condition="good",
            price=25.00,
            status="available",
            owner=self.owner,
        )

    def _auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_list_books_public(self):
        res = self.client.get("/api/books/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_create_book_requires_authentication(self):
        payload = {
            "title": "New Book",
            "author": "Someone",
            "condition": "good",
            "price": 9.99,
            "status": "available",
        }
        res = self.client.post("/api/books/", payload, format="json")
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_create_book_sets_owner_from_token_user(self):
        self._auth(self.other_token)
        payload = {
            "title": "API Design",
            "author": "Alex",
            "condition": "new",
            "price": 19.99,
            "status": "available",
        }
        res = self.client.post("/api/books/", payload, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        created = Book.objects.get(id=res.data["id"])
        self.assertEqual(created.owner, self.other)

    def test_my_books_returns_only_authenticated_users_books(self):
        Book.objects.create(
            title="Other User Book",
            author="Other",
            condition="used",
            price=5,
            status="available",
            owner=self.other,
        )

        self._auth(self.owner_token)
        res = self.client.get("/api/books/my-books/")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["owner"], self.owner.id)

    def test_update_book_denied_for_non_owner(self):
        self._auth(self.other_token)
        res = self.client.patch(
            f"/api/books/{self.book.id}/",
            {"price": 99.99},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_update_book(self):
        self._auth(self.owner_token)
        res = self.client.patch(
            f"/api/books/{self.book.id}/",
            {"price": 30.00},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.book.refresh_from_db()
        self.assertEqual(float(self.book.price), 30.00)

    def test_update_status_valid_choice(self):
        self._auth(self.owner_token)
        res = self.client.patch(
            f"/api/books/{self.book.id}/status/",
            {"status": "sold"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "sold")

    def test_update_status_invalid_choice_returns_400(self):
        self._auth(self.owner_token)
        res = self.client.patch(
            f"/api/books/{self.book.id}/status/",
            {"status": "invalid-status"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_books_by_title_or_author(self):
        Book.objects.create(
            title="React Handbook",
            author="UI Dev",
            condition="good",
            price=12,
            status="available",
            owner=self.owner,
        )

        res = self.client.get("/api/books/?search=react")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["title"], "React Handbook")

    def test_average_rating_computed_from_system_review_board(self):
        review_board, _ = DiscussionBoard.objects.get_or_create(
            name="__SYSTEM_REVIEWS__",
            defaults={"description": "reviews"},
        )

        Post.objects.create(
            content="Great",
            author=self.owner,
            board=review_board,
            book_id=self.book.id,
            rating=4,
        )
        Post.objects.create(
            content="Nice",
            author=self.other,
            board=review_board,
            book_id=self.book.id,
            rating=5,
        )

        res = self.client.get(f"/api/books/{self.book.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["average_rating"], 4)
