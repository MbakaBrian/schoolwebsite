import sys
import os

# Add your project directory to the sys.path
sys.path.insert(0, os.path.dirname(__file__))

# Set the settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'school_backend.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()