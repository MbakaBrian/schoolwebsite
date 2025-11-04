from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    absolute_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'slug',
            'short_description',
            'description',
            'tech_stack',
            'image',  # keep the original image field for file upload
            'absolute_image_url',  # this is the full image URL for frontend
            'repo_url',
            'live_url',
            'is_private',
            'created_at',
        ]
        read_only_fields = ['absolute_image_url']

    def get_absolute_image_url(self, obj):
        """Return absolute URL for project image."""
        request = self.context.get('request')
        if obj.image:
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
