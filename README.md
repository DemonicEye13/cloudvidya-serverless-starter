# CloudVidya Serverless Starter

This is the project everyone forks on **Day 2**. It's the same reference
architecture taught on Day 1 — Frontend → API Gateway → Lambda → DynamoDB —
built out into a real, forkable starter with a single Python Lambda function,
a themeable frontend, and room to extend for Challenge 3.

```
Browser / Frontend  →  API Gateway  →  Lambda (backend/app.py)  →  DynamoDB
                              ↓                    ↓
                            IAM              CloudWatch
```

See `docs/project-guide.md` for the full architecture diagram, API design,
sample data record, and extension ideas. Your project theme will be
assigned separately.

## Quick start (Day 2)

```bash
git clone https://github.com/<your-username>/cloudvidya-serverless-starter.git
cd cloudvidya-serverless-starter

# 1. Customize your project
#    edit frontend/config.js -> APP_NAME, APP_THEME_COLOR

# 2. Deploy the backend
sam build
sam deploy --guided
#    -> copy the printed ApiUrl

# 3. Point the frontend at your API
#    edit frontend/config.js -> API_BASE = "<your ApiUrl>"

# 4. Test locally, then push
git add .
git commit -m "Customize app for <your name>"
git push

# 5. In the AWS Console: Amplify -> Host web app -> connect this repo
#    -> point it at the frontend/ folder -> deploy
```

Full step-by-step instructions, including the Amplify connection and the
live testing/troubleshooting steps, are in `docs/project-guide.md`.

## Project structure

```
cloudvidya-serverless-starter/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── config.js           ← edit this: API_BASE, APP_NAME, APP_THEME_COLOR
├── backend/
│   ├── app.py               single Lambda, routes every request
│   └── requirements.txt
├── docs/
│   ├── architecture.png
│   └── project-guide.md     full API design, sample record, deploy steps
├── template.yaml             SAM template (DynamoDB, Lambda, API Gateway)
├── samconfig.toml.example
├── README.md
└── .gitignore
```

## Cleanup (required)

```bash
sam delete --stack-name <your-stack-name>
```

Also delete the connected Amplify app from the AWS Console. Do this as soon
as you have been evaluated — it costs nothing to leave running in the
free tier for a few days, but it's the habit that matters (see the Day 1
"Security and Cost Awareness" section).
