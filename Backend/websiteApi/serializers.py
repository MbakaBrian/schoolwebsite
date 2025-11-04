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