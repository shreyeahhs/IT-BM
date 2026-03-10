"""
Django management command to seed the database with test data.
Usage: python manage.py seed_db
"""

import os
import base64
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from books.models import Book
from boards.models import DiscussionBoard, BoardMembership, Post

class Command(BaseCommand):
    help = 'Seed database with test users, books, boards, and posts'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n🌱 Starting database seed...\n'))

        # Create 3 test users
        users_data = [
            {'username': 'shreyas', 'first_name': 'Shreyas', 'last_name': 'Gowda', 'password': 'testpass123'},
            {'username': 'kunli', 'first_name': 'Kunli', 'last_name': 'Shi', 'password': 'testpass123'},
            {'username': 'shuao', 'first_name': 'ShuAo', 'last_name': 'Beh', 'password': 'testpass123'},
        ]

        users = {}
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'email': f"{user_data['username']}@bookshare.local"
                }
            )
            users[user_data['username']] = user
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created user: {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'  ⊘ User already exists: {user.username}'))

        # Create 10 sample books with covers
        books_data = [
            {'title': 'The Silent Reader', 'author': 'Elena Mark', 'cover': 'cover_01.png'},
            {'title': 'Code Mastery', 'author': 'James Chen', 'cover': 'cover_02.png'},
            {'title': 'Mindful Living', 'author': 'Sarah Wellness', 'cover': 'cover_03.png'},
            {'title': 'Python Secrets', 'author': 'Guido Van Dev', 'cover': 'cover_04.png'},
            {'title': 'Data Dreams', 'author': 'Alex Analytics', 'cover': 'cover_05.png'},
            {'title': 'Web Rising', 'author': 'React Rolly', 'cover': 'cover_06.png'},
            {'title': 'Dev Journey', 'author': 'Stack Overflow', 'cover': 'cover_07.png'},
            {'title': 'Cloud Nine', 'author': 'Meta Cloud', 'cover': 'cover_08.png'},
            {'title': 'API Design', 'author': 'REST Api', 'cover': 'cover_09.png'},
            {'title': 'Future Stack', 'author': 'Web3 Wizard', 'cover': 'cover_10.png'},
        ]

        # Get covers folder path
        covers_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'seed_data', 'covers')

        book_count = 0
        user_list = list(users.values())

        for i, book_data in enumerate(books_data):
            owner = user_list[i % len(user_list)]  # Distribute books across users
            
            # Read cover image and encode to base64
            cover_path = os.path.join(covers_dir, book_data['cover'])
            cover_base64 = None
            
            if os.path.exists(cover_path):
                with open(cover_path, 'rb') as f:
                    cover_base64 = base64.b64encode(f.read()).decode('utf-8')
            
            book, created = Book.objects.get_or_create(
                title=book_data['title'],
                author=book_data['author'],
                owner=owner,
                defaults={
                    'condition': 'good',
                    'price': 15.00 + (i * 2),
                    'status': 'available',
                    'cover': cover_base64
                }
            )
            
            if created:
                self.stdout.write(f'  ✓ Created book: "{book.title}" by {owner.username}')
                book_count += 1
            else:
                self.stdout.write(self.style.WARNING(f'  ⊘ Book already exists: "{book.title}"'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Created {book_count} books\n'))

        # Create 3 sample discussion boards
        boards_data = [
            {
                'name': 'Fiction Lovers',
                'description': 'Discuss your favorite fiction novels, authors, and recommendations.',
            },
            {
                'name': 'Tech & Programming',
                'description': 'Talk about tech books, coding resources, and software engineering.',
            },
            {
                'name': 'Book Trades',
                'description': 'Organize book swaps, trades, and meetups with other members.',
            },
        ]

        boards = {}
        for board_data in boards_data:
            board, created = DiscussionBoard.objects.get_or_create(
                name=board_data['name'],
                defaults={'description': board_data['description']}
            )
            boards[board_data['name']] = board

            if created:
                self.stdout.write(f'  ✓ Created board: {board.name}')
            else:
                self.stdout.write(self.style.WARNING(f'  ⊘ Board already exists: {board.name}'))

        # Add users to boards and create sample posts
        self.stdout.write('\n✓ Adding members and posts...\n')
        
        sample_posts = {
            'Fiction Lovers': [
                "Hey everyone! Just finished 'The Silent Reader' - absolutely loved it! 📖",
                "Anyone else reading anything good right now? Looking for recommendations!",
                "I prefer classics over modern fiction. What are your thoughts? 💭",
            ],
            'Tech & Programming': [
                "Just started reading 'Code Mastery' - so insightful!",
                "Python is my favorite language for learning. What's yours?",
                "Has anyone checked out the new web development book?",
            ],
            'Book Trades': [
                "I have a copy of 'Data Dreams' for trade - great condition!",
                "Looking for anyone near downtown willing to trade books",
                "Let's organize a book swap this weekend! Who's interested? 🤝",
            ],
        }

        post_count = 0
        for board_name, board in boards.items():
            # Add all users as members to the board
            for user in user_list:
                membership, created = BoardMembership.objects.get_or_create(user=user, board=board)
                if created:
                    post_count += 1

            # Add sample posts from users
            posts = sample_posts.get(board_name, [])
            for i, content in enumerate(posts):
                author = user_list[i % len(user_list)]
                post, created = Post.objects.get_or_create(
                    content=content,
                    author=author,
                    board=board,
                    defaults={}
                )
                if created:
                    self.stdout.write(f'  ✓ Post in {board.name} by {author.username}')

        self.stdout.write(self.style.SUCCESS(f'\n✅ Database seed complete!\n'))
        self.stdout.write(self.style.WARNING('📝 Test credentials:\n'))
        for user_data in users_data:
            self.stdout.write(f'   → {user_data["username"]} / {user_data["password"]}\n')
