# Project Themes

All of these run on the same frontend–API–Lambda–DynamoDB foundation in this
repo. Assign a different theme to each person so the final projects don't all
look identical — you change `frontend/config.js` (`APP_NAME`,
`APP_THEME_COLOR`), the category options in `index.html`, and whatever
extra fields your idea genuinely needs.

## CampusFix
Report and track campus infrastructure problems (broken equipment, maintenance
requests, facility issues). Target users: students and facilities staff.

## FindIt
Submit and search for lost-and-found items on campus. Target users: anyone
who's lost or found something.

## GreenCampus
Report waste, water leakage, or energy-wastage issues around campus. Target
users: students, sustainability-minded staff.

## EventHub
Register students for college activities and events. Target users: event
organizers and attendees.

## VolunteerConnect
Collect and manage volunteer registrations for campus or community drives.
Target users: NGO/club coordinators and student volunteers.

## IdeaBox
Submit and track student innovation ideas. Target users: students and faculty
mentors reviewing submissions.

## LocalHelp
Post and manage community-support requests (tutoring, errands, small favors).
Target users: students helping each other.

## StudyShare
Submit and discover academic resources (notes, past papers, study guides).
Target users: students across courses.

---

## What you should decide (Challenge 2: Solution design)

For whichever theme you're assigned, work out:

1. **Problem statement** — one or two sentences, specific enough that a
   stranger understands what you're solving and for whom.
2. **Target users** — who actually uses this app, and why they'd bother.
3. **Three to five user stories** — "As a [user], I want to [action], so
   that [benefit]."
4. **Proposed AWS architecture** — usually just this repo's existing
   Frontend → API Gateway → Lambda → DynamoDB shape; note if you're adding
   anything (S3 for file uploads, Cognito for auth, etc. — see Challenge 3
   bonus ideas in `docs/project-guide.md`).
5. **DynamoDB data fields** — start from the sample record in
   `docs/project-guide.md` and add/remove fields your theme needs.
6. **API operations** — which of `GET /health`, `POST /items`,
   `GET /items`, `PATCH /items/{id}` you're using, plus any new ones.
7. **Basic UI plan** — what the form fields and the list view show.
8. **Time plan** — a rough split of your own time across frontend, backend,
   deploy, and the demo.
9. **Expected MVP** — the smallest version that still demonstrates the
   core solution end to end. `POST /items` + `GET /items` working is
   already a valid MVP — everything else is a bonus.
