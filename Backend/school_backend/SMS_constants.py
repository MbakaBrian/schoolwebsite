# school_backend/constants.py


# ==========================================================
# STUDENT ADMISSION NUMBER
# ==========================================================
#
# This controls the FORMAT of student admission numbers.
#
# IMPORTANT:
# The admission number itself is NOT automatically generated
# on the Student model.
#
# The user will enter admission numbers manually when
# migrating existing school records.
#
# The system can later use this configuration to suggest
# the next available admission number.
#
# Example:
#     PPS-00001
#     PPS-00002
#     PPS-00003
#
# If the school later wants:
#     ADM-00001
#
# Only this configuration needs to change.
#

STUDENT_ADMISSION_NUMBER_CONFIG = {
    "prefix": "PPS",
    "separator": "-",
    "digits": 5,
}


# ==========================================================
# PAYMENT METHODS
# ==========================================================

PAYMENT_METHODS = [
    ("cash", "Cash"),
    ("mpesa", "M-Pesa"),
    ("bank_transfer", "Bank Transfer"),
    ("cheque", "Cheque"),
    ("card", "Card"),
    ("eft", "EFT"),
    ("other", "Other"),
]


# ==========================================================
# UNITS OF MEASUREMENT
# ==========================================================

UNIT_CHOICES = [
    # Countable items
    ("pieces", "Pieces"),
    ("units", "Units"),
    ("pairs", "Pairs"),
    ("sets", "Sets"),
    ("boxes", "Boxes"),
    ("packs", "Packs"),
    ("dozens", "Dozens"),
    ("rolls", "Rolls"),
    ("bundles", "Bundles"),
    ("cartons", "Cartons"),
    ("bags", "Bags"),
    ("sacks", "Sacks"),
    ("bottles", "Bottles"),
    ("cans", "Cans"),
    ("tins", "Tins"),
    ("containers", "Containers"),

    # Weight
    ("kg", "Kilograms"),
    ("g", "Grams"),
    ("mg", "Milligrams"),
    ("tonnes", "Tonnes"),

    # Volume / Liquids
    ("liters", "Liters"),
    ("ml", "Milliliters"),
    ("cl", "Centiliters"),
    ("gallons", "Gallons"),

    # Length / Distance
    ("meters", "Meters"),
    ("cm", "Centimeters"),
    ("mm", "Millimeters"),
    ("km", "Kilometers"),
    ("inches", "Inches"),
    ("feet", "Feet"),
    ("yards", "Yards"),

    # Area
    ("square_meters", "Square Meters"),
    ("square_feet", "Square Feet"),

    # Other common inventory measurements
    ("reams", "Reams"),
    ("sheets", "Sheets"),
    ("ream", "Ream"),

    # Flexible option
    ("other", "Other"),
]


# ==========================================================
# BOARDING OPTIONS
# ==========================================================

BOARDING_OPTIONS = [
    ("day", "Day Scholar"),
    ("boarder", "Boarder"),
]


# ==========================================================
# KENYA COUNTIES AND SUB-COUNTIES
# ==========================================================
#
# These are reference values used by the Student module.
#
# The structure is:
#
#     "County": [
#         "Sub-County",
#         "Sub-County",
#     ]
#
# The frontend will later consume this data through a
# backend API.
#
# This allows the Student form to:
#
#     1. Display all counties.
#     2. Search for a county.
#     3. Filter sub-counties based on the selected county.
#
# ==========================================================

KENYA_COUNTIES = {
    # ------------------------------------------------------
    # 1. MOMBASA
    # ------------------------------------------------------

    "Mombasa": [
        "Changamwe",
        "Jomvu",
        "Kisauni",
        "Likoni",
        "Mvita",
        "Nyali",
    ],


    # ------------------------------------------------------
    # 2. KWALE
    # ------------------------------------------------------

    "Kwale": [
        "Kinango",
        "Lunga Lunga",
        "Matuga",
        "Msambweni",
    ],


    # ------------------------------------------------------
    # 3. KILIFI
    # ------------------------------------------------------

    "Kilifi": [
        "Ganze",
        "Kaloleni",
        "Kilifi North",
        "Kilifi South",
        "Magarini",
        "Malindi",
        "Rabai",
    ],


    # ------------------------------------------------------
    # 4. TANA RIVER
    # ------------------------------------------------------

    "Tana River": [
        "Bura",
        "Galole",
        "Garsen (Tana Delta)",
    ],


    # ------------------------------------------------------
    # 5. LAMU
    # ------------------------------------------------------

    "Lamu": [
        "Lamu East",
        "Lamu West",
    ],


    # ------------------------------------------------------
    # 6. TAITA-TAVETA
    # ------------------------------------------------------

    "Taita-Taveta": [
        "Mwatate",
        "Taveta",
        "Voi",
        "Wundanyi",
    ],


    # ------------------------------------------------------
    # 7. GARISSA
    # ------------------------------------------------------

    "Garissa": [
        "Balambala",
        "Dadaab",
        "Fafi",
        "Garissa Township",
        "Hulugho",
        "Ijara",
        "Lagdera",
    ],


    # ------------------------------------------------------
    # 8. WAJIR
    # ------------------------------------------------------

    "Wajir": [
        "Eldas",
        "Tarbaj",
        "Wajir East",
        "Wajir North",
        "Wajir South",
        "Wajir West",
    ],


    # ------------------------------------------------------
    # 9. MANDERA
    # ------------------------------------------------------

    "Mandera": [
        "Banissa",
        "Lafey",
        "Mandera East",
        "Mandera North",
        "Mandera South",
        "Mandera West",
    ],


    # ------------------------------------------------------
    # 10. MARSABIT
    # ------------------------------------------------------

    "Marsabit": [
        "Laisamis",
        "Moyale",
        "North Horr",
        "Saku",
    ],


    # ------------------------------------------------------
    # 11. ISIOLO
    # ------------------------------------------------------

    "Isiolo": [
        "Garbatulla",
        "Isiolo",
        "Merti",
    ],


    # ------------------------------------------------------
    # 12. MERU
    # ------------------------------------------------------

    "Meru": [
        "Buuri",
        "Igembe Central",
        "Igembe North",
        "Igembe South",
        "Imenti Central",
        "Imenti North",
        "Imenti South",
        "Tigania East",
        "Tigania West",
    ],


    # ------------------------------------------------------
    # 13. THARAKA-NITHI
    # ------------------------------------------------------

    "Tharaka-Nithi": [
        "Chuka",
        "Igambang'ombe",
        "Maara",
        "Muthambi",
        "Tharaka North",
        "Tharaka South",
    ],


    # ------------------------------------------------------
    # 14. EMBU
    # ------------------------------------------------------

    "Embu": [
        "Manyatta",
        "Mbeere North",
        "Mbeere South",
        "Runyenjes",
    ],


    # ------------------------------------------------------
    # 15. KITUI
    # ------------------------------------------------------

    "Kitui": [
        "Kitui Central",
        "Kitui East",
        "Kitui Rural",
        "Kitui South",
        "Kitui West",
        "Mwingi Central",
        "Mwingi North",
        "Mwingi West",
    ],


    # ------------------------------------------------------
    # 16. MACHAKOS
    # ------------------------------------------------------

    "Machakos": [
        "Kathiani",
        "Machakos Town",
        "Masinga",
        "Matungulu",
        "Mavoko",
        "Mwala",
        "Yatta",
    ],


    # ------------------------------------------------------
    # 17. MAKUENI
    # ------------------------------------------------------

    "Makueni": [
        "Kaiti",
        "Kibwezi East",
        "Kibwezi West",
        "Kilome",
        "Makueni",
        "Mbooni",
    ],


    # ------------------------------------------------------
    # 18. NYANDARUA
    # ------------------------------------------------------

    "Nyandarua": [
        "Kinangop",
        "Kipipiri",
        "Ndaragwa",
        "Ol-Kalou",
        "Ol Joro Orok",
    ],


    # ------------------------------------------------------
    # 19. NYERI
    # ------------------------------------------------------

    "Nyeri": [
        "Kieni East",
        "Kieni West",
        "Mathira East",
        "Mathira West",
        "Mukurweini",
        "Nyeri Town",
        "Othaya",
        "Tetu",
    ],


    # ------------------------------------------------------
    # 20. KIRINYAGA
    # ------------------------------------------------------

    "Kirinyaga": [
        "Kirinyaga Central",
        "Kirinyaga East",
        "Kirinyaga West",
        "Mwea East",
        "Mwea West",
    ],


    # ------------------------------------------------------
    # 21. MURANG'A
    # ------------------------------------------------------

    "Murang'a": [
        "Gatanga",
        "Kahuro",
        "Kandara",
        "Kangema",
        "Kigumo",
        "Kiharu",
        "Mathioya",
        "Murang'a South",
    ],


    # ------------------------------------------------------
    # 22. KIAMBU
    # ------------------------------------------------------

    "Kiambu": [
        "Gatundu North",
        "Gatundu South",
        "Githunguri",
        "Juja",
        "Kabete",
        "Kiambaa",
        "Kiambu",
        "Kikuyu",
        "Lari",
        "Limuru",
        "Ruiru",
        "Thika Town",
    ],


    # ------------------------------------------------------
    # 23. TURKANA
    # ------------------------------------------------------

    "Turkana": [
        "Loima",
        "Turkana Central",
        "Turkana East",
        "Turkana North",
        "Turkana South",
        "Turkana West",
    ],


    # ------------------------------------------------------
    # 24. WEST POKOT
    # ------------------------------------------------------

    "West Pokot": [
        "Kacheliba",
        "Kapenguria",
        "Pokot Central",
        "Pokot South",
        "West Pokot",
    ],


    # ------------------------------------------------------
    # 25. SAMBURU
    # ------------------------------------------------------

    "Samburu": [
        "Samburu Central",
        "Samburu East",
        "Samburu North",
    ],


    # ------------------------------------------------------
    # 26. TRANS-NZOIA
    # ------------------------------------------------------

    "Trans-Nzoia": [
        "Cherangany",
        "Endebess",
        "Kiminini",
        "Kwanza",
        "Saboti",
    ],


    # ------------------------------------------------------
    # 27. UASIN GISHU
    # ------------------------------------------------------

    "Uasin Gishu": [
        "Ainabkoi",
        "Kapsaret",
        "Kesses",
        "Moiben",
        "Soy",
        "Turbo",
    ],


    # ------------------------------------------------------
    # 28. ELGEYO-MARAKWET
    # ------------------------------------------------------

    "Elgeyo-Marakwet": [
        "Keiyo North",
        "Keiyo South",
        "Marakwet East",
        "Marakwet West",
    ],


    # ------------------------------------------------------
    # 29. NANDI
    # ------------------------------------------------------

    "Nandi": [
        "Aldai",
        "Chesumei",
        "Emgwen",
        "Mosop",
        "Nandi Hills",
        "Tindiret",
    ],


    # ------------------------------------------------------
    # 30. BARINGO
    # ------------------------------------------------------

    "Baringo": [
        "Baringo Central",
        "Baringo North",
        "Baringo South",
        "Eldama Ravine",
        "Mogotio",
        "Tiaty",
    ],


    # ------------------------------------------------------
    # 31. LAIKIPIA
    # ------------------------------------------------------

    "Laikipia": [
        "Laikipia Central",
        "Laikipia East",
        "Laikipia North",
        "Laikipia West",
        "Nyahururu",
    ],


    # ------------------------------------------------------
    # 32. NAKURU
    # ------------------------------------------------------

    "Nakuru": [
        "Bahati",
        "Gilgil",
        "Kuresoi North",
        "Kuresoi South",
        "Molo",
        "Naivasha",
        "Nakuru Town East",
        "Nakuru Town West",
        "Njoro",
        "Rongai",
        "Subukia",
    ],


    # ------------------------------------------------------
    # 33. NAROK
    # ------------------------------------------------------

    "Narok": [
        "Narok East",
        "Narok North",
        "Narok South",
        "Narok West",
        "Transmara East",
        "Transmara West",
    ],


    # ------------------------------------------------------
    # 34. KAJIADO
    # ------------------------------------------------------

    "Kajiado": [
        "Isinya",
        "Kajiado Central",
        "Kajiado North",
        "Kajiado West",
        "Loitokitok",
        "Mashuuru",
    ],


    # ------------------------------------------------------
    # 35. KERICHO
    # ------------------------------------------------------

    "Kericho": [
        "Ainamoi",
        "Belgut",
        "Bureti",
        "Kipkelion East",
        "Kipkelion West",
        "Soin/Sigowet",
    ],


    # ------------------------------------------------------
    # 36. BOMET
    # ------------------------------------------------------

    "Bomet": [
        "Bomet Central",
        "Bomet East",
        "Chepalungu",
        "Konoin",
        "Sotik",
    ],


    # ------------------------------------------------------
    # 37. KAKAMEGA
    # ------------------------------------------------------

    "Kakamega": [
        "Butere",
        "Kakamega Central (Lurambi)",
        "Kakamega East (Shinyalu)",
        "Kakamega North (Malava)",
        "Kakamega South (Ikolomani)",
        "Khwisero",
        "Likuyani",
        "Lugari",
        "Matungu",
        "Mumias East",
        "Mumias West",
        "Navakholo",
    ],


    # ------------------------------------------------------
    # 38. VIHIGA
    # ------------------------------------------------------

    "Vihiga": [
        "Emuhaya",
        "Hamisi",
        "Luanda",
        "Sabatia",
        "Vihiga",
    ],


    # ------------------------------------------------------
    # 39. BUNGOMA
    # ------------------------------------------------------

    "Bungoma": [
        "Bumula",
        "Kabuchai",
        "Kanduyi",
        "Kimilili",
        "Mt Elgon",
        "Sirisia",
        "Tongaren",
        "Webuye East",
        "Webuye West",
    ],


    # ------------------------------------------------------
    # 40. BUSIA
    # ------------------------------------------------------

    "Busia": [
        "Budalangi",
        "Butula",
        "Funyula",
        "Matayos",
        "Nambale",
        "Teso North",
        "Teso South",
    ],


    # ------------------------------------------------------
    # 41. SIAYA
    # ------------------------------------------------------

    "Siaya": [
        "Alego Usonga",
        "Bondo",
        "Gem",
        "Rarieda",
        "Ugenya",
        "Ugunja",
    ],


    # ------------------------------------------------------
    # 42. KISUMU
    # ------------------------------------------------------

    "Kisumu": [
        "Kisumu Central",
        "Kisumu East",
        "Kisumu West",
        "Muhoroni",
        "Nyakach",
        "Nyando",
        "Seme",
    ],


    # ------------------------------------------------------
    # 43. HOMA BAY
    # ------------------------------------------------------

    "Homa Bay": [
        "Homa Bay Town",
        "Kabondo",
        "Karachuonyo",
        "Kasipul",
        "Mbita",
        "Ndhiwa",
        "Rangwe",
        "Suba",
    ],


    # ------------------------------------------------------
    # 44. MIGORI
    # ------------------------------------------------------

    "Migori": [
        "Awendo",
        "Kuria East",
        "Kuria West",
        "Mabera",
        "Ntimaru",
        "Rongo",
        "Suna East",
        "Suna West",
        "Uriri",
    ],


    # ------------------------------------------------------
    # 45. KISII
    # ------------------------------------------------------

    "Kisii": [
        "Bobasi",
        "Bomachoge Borabu",
        "Bomachoge Chache",
        "Bonchari",
        "Kitutu Chache North",
        "Kitutu Chache South",
        "Nyaribari Chache",
        "Nyaribari Masaba",
        "South Mugirango",
    ],


    # ------------------------------------------------------
    # 46. NYAMIRA
    # ------------------------------------------------------

    "Nyamira": [
        "Borabu",
        "Manga",
        "Masaba North",
        "Nyamira North",
        "Nyamira South",
    ],


    # ------------------------------------------------------
    # 47. NAIROBI
    # ------------------------------------------------------

    "Nairobi": [
        "Dagoretti North",
        "Dagoretti South",
        "Embakasi Central",
        "Embakasi East",
        "Embakasi North",
        "Embakasi South",
        "Embakasi West",
        "Kamukunji",
        "Kasarani",
        "Kibra",
        "Lang'ata",
        "Makadara",
        "Mathare",
        "Roysambu",
        "Ruaraka",
        "Starehe",
        "Westlands",
    ],
}


# ==========================================================
# RELIGIONS
# ==========================================================
#
# Main religion categories available for student records.
#
# "Other" allows the school to record a religion that is
# not included in the standard list.
#
# "Prefer not to say" allows the field to remain explicit
# without forcing the user to disclose a religion.
#
# ==========================================================

RELIGION_CHOICES = [
    ("christianity", "Christianity"),
    ("islam", "Islam"),
    ("hinduism", "Hinduism"),
    ("sikhism", "Sikhism"),
    ("buddhism", "Buddhism"),
    ("bahai", "Baháʼí Faith"),
    ("judaism", "Judaism"),
    (
        "traditional_african_religions",
        "African Traditional Religions",
    ),
    ("other", "Other"),
    ("prefer_not_to_say", "Prefer not to say"),
]


# ==========================================================
# COMMON COUNTS
# ==========================================================

NUMBER_OF_PAYMENT_METHODS = len(PAYMENT_METHODS)

NUMBER_OF_UNITS = len(UNIT_CHOICES)

NUMBER_OF_COUNTIES = len(KENYA_COUNTIES)

NUMBER_OF_RELIGIONS = len(RELIGION_CHOICES)
