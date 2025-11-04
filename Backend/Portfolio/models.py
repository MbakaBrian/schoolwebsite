from django.db import models
from django.utils.text import slugify


class Project(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    tech_stack = models.CharField(max_length=300, blank=True) # comma separated
    image = models.ImageField(upload_to='projects/', null=True, blank=True)
    repo_url = models.URLField(blank=True, null=True)
    live_url = models.URLField(blank=True, null=True)
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


def save(self, *args, **kwargs):
    if not self.slug:
        self.slug = slugify(self.title)
        super().save(*args, **kwargs)


def __str__(self):
    return self.title