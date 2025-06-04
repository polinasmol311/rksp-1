from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tariffs.models import Tariff
from orders.models import Order
from decimal import Decimal
import random
from datetime import datetime, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Create mock data for the design studio website'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating mock data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Order.objects.all().delete()
            Tariff.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        # Create tariffs
        self.stdout.write('Creating tariffs...')
        self.create_tariffs()

        # Create mock users
        self.stdout.write('Creating mock users...')
        self.create_mock_users()

        # Create mock orders
        self.stdout.write('Creating mock orders...')
        self.create_mock_orders()

        self.stdout.write(self.style.SUCCESS('Mock data created successfully!'))

    def create_tariffs(self):
        tariffs_data = [
            {
                'name': 'Базовый',
                'description': 'Идеально подходит для небольших проектов и стартапов. Включает все необходимое для создания современного веб-сайта.',
                'price': Decimal('49999.00'),
                'features': [
                    'Адаптивный дизайн под все устройства',
                    'SEO оптимизация',
                    'Базовая поддержка 1 месяц',
                    'До 5 страниц сайта',
                    'Интеграция с социальными сетями'
                ]
            },
            {
                'name': 'Премиум',
                'description': 'Расширенный пакет для серьезных проектов. Включает дополнительные функции и расширенную поддержку.',
                'price': Decimal('69999.00'),
                'features': [
                    'Все возможности базового тарифа',
                    'До 15 страниц сайта',
                    'Анимации и интерактивные элементы',
                    'Интеграция с CRM системами',
                    'Расширенная поддержка 3 месяца',
                    'Аналитика и отчеты',
                    'Оптимизация скорости загрузки'
                ]
            },
            {
                'name': 'Корпоративный',
                'description': 'Максимальный пакет для крупных компаний. Полный спектр услуг с индивидуальным подходом.',
                'price': Decimal('120000.00'),
                'features': [
                    'Все возможности премиум тарифа',
                    'Неограниченное количество страниц',
                    'Индивидуальный дизайн',
                    'Интеграция с корпоративными системами',
                    'Поддержка 6 месяцев',
                    'Обучение команды',
                    'Приоритетная техподдержка',
                    'Резервное копирование'
                ]
            }
        ]

        for tariff_data in tariffs_data:
            tariff, created = Tariff.objects.get_or_create(
                name=tariff_data['name'],
                defaults=tariff_data
            )
            if created:
                self.stdout.write(f'  Created tariff: {tariff.name}')
            else:
                self.stdout.write(f'  Tariff already exists: {tariff.name}')

    def create_mock_users(self):
        users_data = [
            {
                'username': 'ivan.petrov@example.com',
                'email': 'ivan.petrov@example.com',
                'first_name': 'Иван',
                'last_name': 'Петров',
                'phone': '+7(495)123-45-67',
                'company_name': 'ТОО "Альфа"',
                'password': 'testpass123'
            },
            {
                'username': 'maria.sidorova@example.com',
                'email': 'maria.sidorova@example.com',
                'first_name': 'Мария',
                'last_name': 'Сидорова',
                'phone': '+7(495)234-56-78',
                'company_name': 'ИП Сидорова М.А.',
                'password': 'testpass123'
            },
            {
                'username': 'alex.kozlov@example.com',
                'email': 'alex.kozlov@example.com',
                'first_name': 'Александр',
                'last_name': 'Козлов',
                'phone': '+7(495)345-67-89',
                'company_name': 'ООО "Бета Технологии"',
                'password': 'testpass123'
            }
        ]

        self.created_users = []
        for user_data in users_data:
            password = user_data.pop('password')
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password(password)
                user.save()
                self.created_users.append(user)
                self.stdout.write(f'  Created user: {user.username}')
            else:
                self.created_users.append(user)
                self.stdout.write(f'  User already exists: {user.username}')

    def create_mock_orders(self):
        if not hasattr(self, 'created_users'):
            self.created_users = list(User.objects.filter(is_superuser=False))

        tariffs = list(Tariff.objects.all())
        
        if not tariffs or not self.created_users:
            self.stdout.write(self.style.WARNING('No tariffs or users found. Skipping order creation.'))
            return

        orders_data = [
            {
                'project_name': 'Корпоративный сайт Альфа',
                'project_description': 'Корпоративный сайт для торговой компании с каталогом товаров',
                'requirements': 'Современный дизайн, интеграция с 1С, онлайн каталог',
                'status': Order.Status.COMPLETED,
                'days_ago': 45
            },
            {
                'project_name': 'Интернет-магазин одежды',
                'project_description': 'Интернет-магазин женской одежды с системой заказов',
                'requirements': 'Адаптивный дизайн, корзина, оплата онлайн',
                'status': Order.Status.IN_PROGRESS,
                'days_ago': 15
            },
            {
                'project_name': 'Лендинг IT-услуг',
                'project_description': 'Одностраничный сайт для IT-компании',
                'requirements': 'Яркий дизайн, форма обратной связи, SEO оптимизация',
                'status': Order.Status.NEW,
                'days_ago': 3
            },
            {
                'project_name': 'Портфолио дизайнера',
                'project_description': 'Личный сайт-портфолио для веб-дизайнера',
                'requirements': 'Минималистичный дизайн, галерея работ, блог',
                'status': Order.Status.COMPLETED,
                'days_ago': 30
            },
            {
                'project_name': 'Сайт ресторана',
                'project_description': 'Сайт для ресторана с меню и бронированием столиков',
                'requirements': 'Аппетитный дизайн, онлайн меню, система бронирования',
                'status': Order.Status.IN_PROGRESS,
                'days_ago': 8
            }
        ]

        for i, order_data in enumerate(orders_data):
            user = self.created_users[i % len(self.created_users)]
            tariff = random.choice(tariffs)
            
            days_ago = order_data.pop('days_ago')
            created_at = datetime.now() - timedelta(days=days_ago)
            
            order = Order.objects.create(
                user=user,
                tariff=tariff,
                total_price=tariff.price,
                created_at=created_at,
                **order_data
            )
            
            self.stdout.write(f'  Created order: {order.project_name} for {user.first_name} {user.last_name}')

        self.stdout.write(f'Created {len(orders_data)} mock orders.')