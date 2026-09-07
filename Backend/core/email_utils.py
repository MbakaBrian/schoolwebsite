# email_utils.py
from django.core.mail import send_mail
from django.conf import settings

def send_enrollment_emails(student_name, guardian_email):
    """
    Sends two emails:
    1. To admin notifying about a new enrollment.
    2. To student confirming receipt of their enrollment.
    """

    # 1. Send email to admin
    send_mail(
        subject="New Student Enrollment",
        message=f"A new student named {student_name} has just enrolled.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['info@peppercornpremierschools.sc.ke'],  # Replace with actual admin email
        fail_silently=False,
    )

    # 2. Send confirmation to the student
    send_mail(
        subject="Enrollment Received",
        message=f"Hi {student_name},\n\nWe’ve received your enrollment successfully! Our team will get in touch with you soon.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[guardian_email],
        fail_silently=False,
    )
