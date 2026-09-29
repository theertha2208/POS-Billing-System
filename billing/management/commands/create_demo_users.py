from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from billing.models import StaffProfile


class Command(BaseCommand):
    help = "Create demo admin and staff accounts"

    def handle(self, *args, **options):

        # Demo Admin
        admin, _ = User.objects.get_or_create(
            username="demo_admin"
        )

        admin.first_name = "Demo"
        admin.last_name = "Admin"
        admin.email = "admin@gmail.com"
        admin.is_staff = True
        admin.is_superuser = True
        admin.is_active = True
        admin.set_password("Admin@123")
        admin.save()

        self.stdout.write(
            self.style.SUCCESS("Demo admin ready")
        )

        # Demo Staff
        staff, _ = User.objects.get_or_create(
            username="demo_staff"
        )

        staff.first_name = "Arya"
        staff.last_name = ""
        staff.email = "arya@gmail.com"
        staff.is_staff = False
        staff.is_superuser = False
        staff.is_active = True
        staff.set_password("Staff@123")
        staff.save()

        profile, _ = StaffProfile.objects.get_or_create(
            user=staff
        )

        profile.is_active = True
        profile.save()

        self.stdout.write(
            self.style.SUCCESS("Demo staff ready")
        )