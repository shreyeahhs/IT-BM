from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from boards.models import BoardMembership, DiscussionBoard, Post, TradeChatMessage, TradeChatRoom
from books.models import Book


class BoardsAndTradeChatApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="pass123")
        self.buyer = User.objects.create_user(username="buyer", password="pass123")
        self.third = User.objects.create_user(username="third", password="pass123")

        self.owner_token = Token.objects.create(user=self.owner)
        self.buyer_token = Token.objects.create(user=self.buyer)
        self.third_token = Token.objects.create(user=self.third)

        self.general_board = DiscussionBoard.objects.create(
            name="General Readers", description="General discussion"
        )
        self.review_board, _ = DiscussionBoard.objects.get_or_create(
            name="__SYSTEM_REVIEWS__",
            defaults={"description": "System auto-generated board for book reviews."},
        )

        self.book = Book.objects.create(
            title="Clean Architecture",
            author="Uncle Bob",
            condition="good",
            price=20,
            status="available",
            owner=self.owner,
        )

    def _auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_board_list_works_and_can_filter_by_name(self):
        res = self.client.get("/api/boards/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res_filtered = self.client.get("/api/boards/?name=General Readers")
        self.assertEqual(res_filtered.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_filtered.data), 1)
        self.assertEqual(res_filtered.data[0]["name"], "General Readers")

    def test_join_and_leave_board(self):
        self._auth(self.buyer_token)

        join_res = self.client.post(f"/api/boards/{self.general_board.id}/join/", {}, format="json")
        self.assertEqual(join_res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            BoardMembership.objects.filter(user=self.buyer, board=self.general_board).exists()
        )

        leave_res = self.client.post(f"/api/boards/{self.general_board.id}/leave/", {}, format="json")
        self.assertEqual(leave_res.status_code, status.HTTP_200_OK)
        self.assertFalse(
            BoardMembership.objects.filter(user=self.buyer, board=self.general_board).exists()
        )

    def test_post_to_non_member_board_is_forbidden(self):
        self._auth(self.buyer_token)
        res = self.client.post(
            f"/api/boards/{self.general_board.id}/posts/",
            {"content": "Hello all"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_to_member_board_succeeds(self):
        BoardMembership.objects.create(user=self.buyer, board=self.general_board)
        self._auth(self.buyer_token)

        res = self.client.post(
            f"/api/boards/{self.general_board.id}/posts/",
            {"content": "Hello everyone"},
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["author_username"], "buyer")

    def test_review_post_requires_book_id_on_system_review_board(self):
        self._auth(self.buyer_token)
        res = self.client.post(
            f"/api/boards/{self.review_board.id}/posts/",
            {"content": "Nice book"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_review_board_rejects_book_id(self):
        BoardMembership.objects.create(user=self.buyer, board=self.general_board)
        self._auth(self.buyer_token)

        res = self.client.post(
            f"/api/boards/{self.general_board.id}/posts/",
            {"content": "Should fail", "book_id": self.book.id, "rating": 5},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_review_rating_range_validation(self):
        self._auth(self.buyer_token)
        res = self.client.post(
            f"/api/boards/{self.review_board.id}/posts/",
            {"content": "Bad rating", "book_id": self.book.id, "rating": 7},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_review_for_same_user_and_book_is_rejected(self):
        self._auth(self.buyer_token)

        first = self.client.post(
            f"/api/boards/{self.review_board.id}/posts/",
            {"content": "Great", "book_id": self.book.id, "rating": 5},
            format="json",
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        second = self.client.post(
            f"/api/boards/{self.review_board.id}/posts/",
            {"content": "Another review", "book_id": self.book.id, "rating": 4},
            format="json",
        )
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)

    def test_board_posts_can_filter_by_book_id(self):
        Post.objects.create(
            content="review 1",
            author=self.owner,
            board=self.review_board,
            book_id=self.book.id,
            rating=4,
        )
        other_book = Book.objects.create(
            title="Other",
            author="Writer",
            condition="used",
            price=7,
            owner=self.owner,
        )
        Post.objects.create(
            content="review 2",
            author=self.buyer,
            board=self.review_board,
            book_id=other_book.id,
            rating=3,
        )

        res = self.client.get(f"/api/boards/{self.review_board.id}/posts/?book_id={self.book.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["book_id"], self.book.id)

    def test_start_trade_chat_requires_auth(self):
        res = self.client.post(
            "/api/trade-chats/start/",
            {"book_id": self.book.id, "intent": "buy"},
            format="json",
        )
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_start_trade_chat_validates_intent_and_book(self):
        self._auth(self.buyer_token)

        invalid_intent = self.client.post(
            "/api/trade-chats/start/",
            {"book_id": self.book.id, "intent": "rent"},
            format="json",
        )
        self.assertEqual(invalid_intent.status_code, status.HTTP_400_BAD_REQUEST)

        missing_book = self.client.post(
            "/api/trade-chats/start/",
            {"intent": "buy"},
            format="json",
        )
        self.assertEqual(missing_book.status_code, status.HTTP_400_BAD_REQUEST)

    def test_start_trade_chat_disallows_own_listing(self):
        self._auth(self.owner_token)
        res = self.client.post(
            "/api/trade-chats/start/",
            {"book_id": self.book.id, "intent": "buy"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_start_trade_chat_is_idempotent_per_book_buyer_seller(self):
        self._auth(self.buyer_token)

        first = self.client.post(
            "/api/trade-chats/start/",
            {"book_id": self.book.id, "intent": "buy"},
            format="json",
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        second = self.client.post(
            "/api/trade-chats/start/",
            {"book_id": self.book.id, "intent": "borrow"},
            format="json",
        )
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(first.data["id"], second.data["id"])

    def test_trade_chat_list_shows_only_participant_rooms(self):
        room1 = TradeChatRoom.objects.create(book=self.book, buyer=self.buyer, seller=self.owner)
        room2 = TradeChatRoom.objects.create(book=self.book, buyer=self.third, seller=self.owner)

        self._auth(self.buyer_token)
        res = self.client.get("/api/trade-chats/")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [r["id"] for r in res.data]
        self.assertIn(room1.id, ids)
        self.assertNotIn(room2.id, ids)

    def test_trade_chat_messages_get_and_post(self):
        room = TradeChatRoom.objects.create(book=self.book, buyer=self.buyer, seller=self.owner)
        self._auth(self.buyer_token)

        post_res = self.client.post(
            f"/api/trade-chats/{room.id}/messages/",
            {"content": "Interested in borrowing this for two weeks."},
            format="json",
        )
        self.assertEqual(post_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(post_res.data["sender_username"], "buyer")

        get_res = self.client.get(f"/api/trade-chats/{room.id}/messages/")
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(get_res.data), 1)

    def test_trade_chat_message_rejects_blank_content(self):
        room = TradeChatRoom.objects.create(book=self.book, buyer=self.buyer, seller=self.owner)
        self._auth(self.buyer_token)

        res = self.client.post(
            f"/api/trade-chats/{room.id}/messages/",
            {"content": "   "},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_participant_cannot_access_trade_chat_detail_or_messages(self):
        room = TradeChatRoom.objects.create(book=self.book, buyer=self.buyer, seller=self.owner)

        self._auth(self.third_token)
        detail_res = self.client.get(f"/api/trade-chats/{room.id}/")
        messages_res = self.client.get(f"/api/trade-chats/{room.id}/messages/")

        self.assertEqual(detail_res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(messages_res.status_code, status.HTTP_404_NOT_FOUND)

    def test_board_serializer_marks_is_member_for_authenticated_user(self):
        BoardMembership.objects.create(user=self.buyer, board=self.general_board)
        self._auth(self.buyer_token)

        res = self.client.get(f"/api/boards/{self.general_board.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["is_member"], True)
