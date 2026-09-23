from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from django.urls import path, include


urlpatterns = [

    # --------------------------------------------------
    # DJANGO AUTH
    # --------------------------------------------------

    path(
        "logout/",
        auth_views.LogoutView.as_view(),
        name="logout",
    ),

    # --------------------------------------------------
    # DJANGO ADMIN
    # --------------------------------------------------

    path(
        "admin/",
        admin.site.urls,
    ),

    # --------------------------------------------------
    # REST API
    # --------------------------------------------------

    # Website API
    path(
        "api/",
        include("websiteApi.urls"),
    ),

    # Authentication API
    path(
        "api/",
        include("accounts.urls"),
    ),

    # Students
    path(
        "api/students/",
        include("SMS_apps.students.urls"),
    ),

    # # Teachers
    # path(
    #     "api/teachers/",
    #     include("SMS_apps.teachers.urls"),
    # ),

    # Inventory
    path(
        "api/inventory/",
        include("SMS_apps.Inventory.urls"),
    ),

    # Fees
    # path(
    #     "api/fees/",
    #     include("SMS_apps.fees.urls"),
    # ),

    # Academics
    path(
        "api/academics/",
        include("SMS_apps.academics.urls"),
    ),

    # Dashboard
    path(
        "api/dashboard/",
        include("dashboards.dashboardReports.urls"),
    ),

    # Portfolio
    path(
        "api/portfolio/",
        include("Portfolio.urls"),
    ),

    # Receipts
    path(
        "api/receipts/",
        include("SMS_apps.Receipts.urls"),
    ),
    # Staff
    path(
    "api/staff/",
    include("SMS_apps.Staff.urls"),
    ),

     #Transport

     path(
          "api/transport/",
          include("SMS_apps.Transport.urls"),
     ),


]


# --------------------------------------------------
# MEDIA FILES - DEVELOPMENT ONLY
# --------------------------------------------------

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )

