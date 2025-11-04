
from django.core.management.base import BaseCommand
from accounts.models import Role

class Command(BaseCommand):
    help = "Create default roles"

    def handle(self, *args, **kwargs):
        roles = ['Master Admin', 'Website Admin', 'Teacher', 'Student', 'Parent', 'Accountant']
        for role in roles:
            Role.objects.get_or_create(name=role)
        self.stdout.write(self.style.SUCCESS('Default roles created!'))
