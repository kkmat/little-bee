# Little Bee — Worker

Cloudflare Worker + D1 database powering the shared scoreboard, advice wall,
predictions, baby-name suggestions, due-date guesses, and onesie gallery.

## One-time setup

```bash
cd worker
npm install -g wrangler   # if you don't already have it

# 1. Authenticate
wrangler login

# 2. Create the D1 database
wrangler d1 create little-bee
# → copy the database_id into wrangler.toml (REPLACE_WITH_D1_ID)

# 3. Apply schema
wrangler d1 execute little-bee --file=./schema.sql --remote

# 4. Deploy
wrangler deploy
```

After the first deploy, your API will be live at:
`https://little-bee-api.<your-subdomain>.workers.dev`

Set that URL in `js/api.js` (front-end). For a custom domain you can add a
`routes` block in `wrangler.toml` and point a subdomain like
`babyshower-api.nexus.com.kw` at the worker.

## Day-of-event resets

```bash
# Wipe all guest data and start fresh (won't drop tables)
wrangler d1 execute little-bee --remote --command \
  "DELETE FROM scores; DELETE FROM advice; DELETE FROM predictions; \
   DELETE FROM due_date_guesses; DELETE FROM name_suggestions; \
   DELETE FROM onesies; DELETE FROM players; DELETE FROM rate_limits;"
```
