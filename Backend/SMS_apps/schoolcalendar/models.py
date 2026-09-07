from django.db import models

TERMS = [
    ('1','Term 1'),
    ('2','Term 2'),
    ('3','Term 3'),
]

class TermDate(models.Model):
    term = models.CharField(max_length=1, choices=TERMS)
    year = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        unique_together = ('term', 'year')

    def __str__(self):
        return f"{self.get_term_display()} - {self.year}"

class CurrentTermYear(models.Model):
    term = models.CharField(max_length=1, choices=TERMS)
    year = models.IntegerField()
    is_active = models.BooleanField(default=False)

    class Meta:
        unique_together = ('term', 'year')

    def __str__(self):
        return f"{self.get_term_display()} - {self.year} {'(Active)' if self.is_active else ''}"

    @classmethod
    def get_active(cls):
        """Return the active term/year (or None if not set)."""
        return cls.objects.filter(is_active=True).first()

    @classmethod
    def get_previous(cls, term, year):
        """Return previous term/year pair based on academic calendar logic."""
        if term == '1':
            return '3', year - 1
        else:
            return str(int(term) - 1), year
