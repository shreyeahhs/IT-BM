from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase


class AuthApiTests(APITestCase):
    def test_register_creates_user_and_returns_token(self):
        payload = {
            "username": "alice",
            "password": "securepass123",
            "email": "alice@example.com",
            "first_name": "Alice",
            "last_name": "Reader",
        }
        res = self.client.post("/api/register/", payload, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", res.data)
        self.assertEqual(res.data["user"]["username"], "alice")
        self.assertTrue(User.objects.filter(username="alice").exists())

    def test_register_duplicate_username_fails(self):
        User.objects.create_user(username="alice", password="x")

        payload = {
            "username": "alice",
            "password": "securepass123",
        }
        res = self.client.post("/api/register/", payload, format="json")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_existing_token_and_profile_fields(self):
        user = User.objects.create_user(
            username="bob",
            password="secret123",
            first_name="Bob",
            last_name="Writer",
        )
        token = Token.objects.create(user=user)

        res = self.client.post(
            "/api/login/",
            {"username": "bob", "password": "secret123"},
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["token"], token.key)
        self.assertEqual(res.data["username"], "bob")
        self.assertEqual(res.data["first_name"], "Bob")
        self.assertEqual(res.data["last_name"], "Writer")

    def test_login_invalid_password_fails(self):
        User.objects.create_user(username="carol", password="goodpass")

        res = self.client.post(
            "/api/login/",
            {"username": "carol", "password": "wrongpass"},
            format="json",
        )

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
