// src/constants/schoolConstants.js

// ============================================================
// DEPARTMENTS
// ============================================================

export const DEPARTMENTS = [
  ["ecd", "ECD"],
  ["lower_primary", "Lower Primary"],
  ["middle_primary", "Middle Primary"],
  ["jss", "JSS"],

  ["catering_dining", "Catering / Dining"],
  ["transport", "Transport"],
  ["cleaning_hygiene", "Cleaning / Hygiene"],
  ["school_maintenance", "School Maintenance"],
  ["security", "Security"],
  ["ict", "ICT"],
  ["library", "Library"],
  ["laboratory_science", "Laboratory / Science"],
  ["boarding", "Boarding"],
  ["sports", "Sports"],
  ["music", "Music"],
  ["drama", "Drama"],
  ["art", "Art"],
  ["Educational trips","Educational trips"]

  ["administration", "Administration"],
  ["office", "Office"],
  ["payroll", "Payroll"],
  ["human_resource", "Human Resource"],
  ["staff_welfare_motivation", "Staff Welfare / Motivation"],

  ["guidance_counselling", "Guidance and Counselling"],
  ["spiritual_welfare", "Spiritual Welfare"],
  ["clubs", "Clubs"],

  ["farming", "Farming"],
  ["animals", "Animals"],
  ["construction", "Construction"],
  ["utilities", "Utilities"],

  ["medical", "Medical"],

  ["others", "Others"],
];


// ============================================================
// INVENTORY UNITS
// ============================================================

export const UNITS = [
  // Countable items
  ["pieces", "Pieces"],
  ["units", "Units"],
  ["pairs", "Pairs"],
  ["sets", "Sets"],
  ["boxes", "Boxes"],
  ["packs", "Packs"],
  ["dozens", "Dozens"],
  ["rolls", "Rolls"],
  ["bundles", "Bundles"],
  ["cartons", "Cartons"],
  ["bags", "Bags"],
  ["sacks", "Sacks"],
  ["bottles", "Bottles"],
  ["cans", "Cans"],
  ["tins", "Tins"],
  ["containers", "Containers"],

  // Weight
  ["kg", "Kilograms"],
  ["g", "Grams"],
  ["mg", "Milligrams"],
  ["tonnes", "Tonnes"],

  // Volume
  ["liters", "Liters"],
  ["ml", "Milliliters"],
  ["cl", "Centiliters"],
  ["gallons", "Gallons"],

  // Length
  ["meters", "Meters"],
  ["cm", "Centimeters"],
  ["mm", "Millimeters"],
  ["km", "Kilometers"],
  ["inches", "Inches"],
  ["feet", "Feet"],
  ["yards", "Yards"],

  // Area
  ["square_meters", "Square Meters"],
  ["square_feet", "Square Feet"],

  // Stationery / Other
  ["reams", "Reams"],
  ["sheets", "Sheets"],
  ["hours", "Hours"],
  ["days", "Days"],

  // Flexible
  ["other", "Other"],
];


// ============================================================
// PAYMENT METHODS
// ============================================================

export const PAYMENT_METHODS = [
  ["cash", "Cash"],
  ["mpesa", "M-Pesa"],
  ["bank_transfer", "Bank Transfer"],
  ["cheque", "Cheque"],
  ["card", "Card"],
  ["eft", "EFT"],
  ["other", "Other"],
];


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get the display name for a constant value.
 *
 * Example:
 * getChoiceLabel(DEPARTMENTS, "transport")
 * => "Transport"
 */
export const getChoiceLabel = (choices, value) => {
  const choice = choices.find(
    ([key]) => key === value
  );

  return choice ? choice[1] : value;
};