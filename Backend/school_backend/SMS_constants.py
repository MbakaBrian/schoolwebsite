# school_backend/constants.py


# ==========================================================
# SCHOOL GRADES
# ==========================================================

GRADES = [
    ("playgroup", "Playgroup"),
    ("PP1", "PP1"),
    ("PP2", "PP2"),
    ("GRADE_1", "Grade 1"),
    ("GRADE_2", "Grade 2"),
    ("GRADE_3", "Grade 3"),
    ("GRADE_4", "Grade 4"),
    ("GRADE_5", "Grade 5"),
    ("GRADE_6", "Grade 6"),
    ("GRADE_7", "Grade 7"),
    ("GRADE_8", "Grade 8"),
    ("GRADE_9", "Grade 9"),
]


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
# COMMON COUNTS
# ==========================================================

NUMBER_OF_GRADES = len(GRADES)
NUMBER_OF_PAYMENT_METHODS = len(PAYMENT_METHODS)
NUMBER_OF_UNITS = len(UNIT_CHOICES)