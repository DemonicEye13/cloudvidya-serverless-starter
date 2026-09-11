// EventHub frontend configuration.
// Replace API_BASE_URL with your deployed API Gateway invoke URL
// (find it in the SAM/CloudFormation output after `sam deploy`).
const CONFIG = {
  API_BASE_URL: "https://oa1onhpy62.execute-api.ap-south-1.amazonaws.com/Prod",

  APP_NAME: "EventHub",
  TAGLINE: "Register for college activities and events — all in one place.",

  // Must mirror VALID_CATEGORIES in backend/app.py
  CATEGORIES: [
    "Workshop",
    "Seminar",
    "Cultural",
    "Sports",
    "Technical",
    "Competition",
    "Other",
  ],

  // Must mirror VALID_STATUSES in backend/app.py
  STATUSES: ["PENDING", "CONFIRMED", "CANCELLED", "ATTENDED"],

  THEME_COLOR: "#5b3df6",
};
