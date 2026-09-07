from django.db import models
from django.utils.text import slugify

# ---------- Enrollment Form ----------
class Enrollment(models.Model):
    guardian_name = models.CharField(max_length=100)
    student_name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    grade_interested = models.CharField(max_length=50)
    boarder_or_day = models.CharField(
        max_length=20,
        choices=[("Boarder", "Boarder"), ("Day Scholar", "Day Scholar")]
    )
    guardian_email = models.EmailField()
    guardian_phone = models.CharField(max_length=20)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student_name} ({self.guardian_name})"


# ---------- Gallery ----------
class GalleryImage(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="gallery/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ---------- Events ----------
class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    location = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.title


# ---------- Our Team ----------
class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="team/")

    def __str__(self):
        return f"{self.name} - {self.role}"


#---------- Facilities --------

class Facility(models.Model):
    title = models.CharField(max_length=200)
    shortDesc = models.TextField(blank=True)
    longDesc = models.TextField()
    image = models.ImageField(upload_to='facilities/')
    slug = models.SlugField(unique=True, blank=True)
    category = models.CharField(max_length=50 , blank=True)

    def save(self, *args, **kwargs):
        # Auto-generate slug from title if it’s not manually provided
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            num = 1

            # Ensure slug uniqueness (avoid duplicate slugs)
            while Facility.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

# NEW MODEL: Program
class Program(models.Model):
    # Link to Facility, using related_name='programs'
    facility = models.ForeignKey(
        Facility,
        related_name='programs',
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    desc = models.TextField()
    # Stores the string name of the Lucide React Icon (e.g., 'Baby', 'BookOpen')
    icon_name = models.CharField(
        max_length=50,
        help_text="Lucide React icon name (e.g., Baby, BookOpen, Bus, Apple)"
    )
    # Stores the Tailwind CSS class for the color
    color_class = models.CharField(
        max_length=50,
        default="bg-gray-400",
        help_text="Tailwind CSS class for background color (e.g., bg-green-400)"
    )

    class Meta:
        ordering = ['name'] # Or use an 'order' field for custom ordering

    def __str__(self):
        return f"{self.name} for {self.facility.title}"


class AboutHistory(models.Model):
    title = models.CharField(max_length=255, default="Our History")
    content = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class AboutHistoryImage(models.Model):
    about = models.ForeignKey(
        AboutHistory, related_name="images", on_delete=models.CASCADE,
        null=True, blank=True
    )
    image = models.ImageField(upload_to="about_history/")
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.about.title}"