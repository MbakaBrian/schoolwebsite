from rest_framework import serializers
from .models import Enrollment, GalleryImage, Event, TeamMember,Facility, Program

from .models import AboutHistory, AboutHistoryImage


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = "__all__"


class GalleryImageSerializer(serializers.ModelSerializer):
    # CRITICAL FIX: The base 'image' field is implicitly included via fields='__all__', 
    # but we must use a *different* field name for the read-only absolute URL.
    # We define a custom read-only field for the URL output:
    absolute_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = GalleryImage
        # 2. Include all fields, including the writeable 'image' field and the read-only 'absolute_image_url' field.
        fields = "__all__"
        # Ensure the custom URL field is set to read-only
        read_only_fields = ['absolute_image_url'] 

    # 3. Method to construct the absolute URL, now for the 'absolute_image_url' field.
    def get_absolute_image_url(self, obj):
        # Check if an image file exists
        if obj.image:
            # Get the request context passed from the ViewSet
            request = self.context.get('request')
            
            # Use request.build_absolute_uri to create the full URL
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            
            # Fallback 
            return obj.image.url
        return None # Return None if no image is attached

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"


# In your serializers.py

class TeamMemberSerializer(serializers.ModelSerializer):
    # 1. Define the read-only field for the absolute URL
    absolute_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TeamMember
        # 2. Use __all__ to include the base 'image' field (for writing)
        #    and our new 'absolute_image_url' (for reading)
        fields = "__all__"
        read_only_fields = ['absolute_image_url'] # Make the new URL field read-only

    # 3. Method to generate the absolute URL
    def get_absolute_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            # Fallback if request context isn't passed
            return obj.image.url
        return None # Return None if no image is attached

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = "__all__"


class FacilitySerializer(serializers.ModelSerializer):
    # 1. Nested serialization for related Programs
    programs = ProgramSerializer(many=True, read_only=True)
    
    # 2. Define a *read-only* field for the absolute image URL
    # This replaces the custom logic you had on the primary 'image' field.
    absolute_image_url = serializers.SerializerMethodField(read_only=True) 

    class Meta:
        model = Facility
        # 3. CRITICAL: The base 'image' field MUST be in the fields list
        # This allows the ModelSerializer to handle incoming file uploads.
        fields = ['id', 'title', 'longDesc','shortDesc', 'image', 'slug', 'programs', 'absolute_image_url']
        read_only_fields = ['slug', 'absolute_image_url'] # slug is auto-generated, URL is output only

    # 4. This method now handles the output for the new field 'absolute_image_url'
    def get_absolute_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    # Note: You do NOT need a custom 'update' method now. 
    # The default ModelSerializer 'update' method will see 'image' in the fields 
    # and use the file found in request.FILES to update the model instance.



class AboutHistoryImageSerializer(serializers.ModelSerializer):
    absolute_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AboutHistoryImage
        fields = ['id', 'image', 'caption', 'absolute_image_url']
        read_only_fields = ['absolute_image_url']

    def get_absolute_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class AboutHistorySerializer(serializers.ModelSerializer):
    images = AboutHistoryImageSerializer(many=True, read_only=True)

    class Meta:
        model = AboutHistory
        fields = ['id', 'title', 'content', 'updated_at', 'images']


from rest_framework import viewsets
from .models import Enrollment, GalleryImage, Event, TeamMember, Facility, Program
from .serializers import (
    EnrollmentSerializer,
    GalleryImageSerializer,
    EventSerializer,
    TeamMemberSerializer,
    FacilitySerializer,
    ProgramSerializer
)
from rest_framework.permissions import AllowAny
class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().order_by("-submitted_at")
    serializer_class = EnrollmentSerializer
    permission_classes = [AllowAny]


class GalleryImageViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = GalleryImage.objects.all().order_by("-uploaded_at")
    serializer_class = GalleryImageSerializer
    # Add this method to pass the request context to the serializer
    def get_serializer_context(self):
        return {'request': self.request}


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("date")
    serializer_class = EventSerializer
    permission_classes = [AllowAny]


# In your views.py

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]

    # 4. CRITICAL: Add this method to pass the request context
    def get_serializer_context(self):
        """
        Pass the request context to the serializer to build absolute URLs.
        """
        return {'request': self.request}

#---------- Facilities ViewSet --------

from .models import Facility
from .serializers import FacilitySerializer

class FacilityViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    lookup_field = 'slug'  # ✅ use slug instead of id
    def get_serializer_context(self):
        # <--- THIS IS CRITICAL for build_absolute_uri to work
        return {'request': self.request}
    def update(self, request, *args, **kwargs):
        # --- TEMPORARY DEBUGGING CODE ---
        print("--- FILE CHECK ---")
        # Check if the file is present in request.FILES (for MultiPartParser)
        print(f"FILES dictionary keys: {request.FILES.keys()}")
        
        # Check if the image key is present in the request data
        print(f"Request Data Image field: {request.data.get('image')}")
        print("------------------")
        # --- END DEBUGGING CODE ---
        
        return super().update(request, *args, **kwargs)

#---------- Programs ViewSet --------
class ProgramViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer


from .models import AboutHistory, AboutHistoryImage
from .serializers import AboutHistorySerializer, AboutHistoryImageSerializer
from rest_framework.parsers import MultiPartParser, FormParser


class AboutHistoryViewSet(viewsets.ModelViewSet):
    queryset = AboutHistory.objects.all()
    serializer_class = AboutHistorySerializer
    permission_classes = [AllowAny]


class AboutHistoryImageViewSet(viewsets.ModelViewSet):
    queryset = AboutHistoryImage.objects.all()
    serializer_class = AboutHistoryImageSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # Automatically link to the first About record
        about_instance = AboutHistory.objects.first()
        serializer.save(about=about_instance)