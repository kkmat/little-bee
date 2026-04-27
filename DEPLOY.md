# Deploy Guide — Little Bee 🐝

The frontend is live the moment you push to `master` — GitHub Pages picks it up
automatically:

→ **https://kkmat.github.io/little-bee/**

The backend (Cloudflare Worker + D1) needs a one-time deploy from your machine.

---

## 1. Deploy the Cloudflare Worker

```bash
cd ~/little-bee/worker

# 1) Install wrangler if you don't have it
npm install -g wrangler

# 2) Authenticate with Cloudflare (browser pops open)
wrangler login

# 3) Create the D1 database — copy the database_id it prints
wrangler d1 create little-bee
#   → 'database_id = "<UUID>"'

# 4) Paste that ID into wrangler.toml in place of REPLACE_WITH_D1_ID

# 5) Apply the schema to the live D1 database
wrangler d1 execute little-bee --remote --file=./schema.sql

# 6) Deploy the worker
wrangler deploy
#   → 'Published little-bee-api → https://little-bee-api.<sub>.workers.dev'
```

Copy that final URL. You'll paste it into the front-end next.

## 2. Wire the front-end to the worker

Open `js/api.js` and change the `DEFAULT_API` constant:

```javascript
const DEFAULT_API = 'https://little-bee-api.<your-subdomain>.workers.dev';
```

Commit and push:

```bash
cd ~/little-bee
git add js/api.js
git commit -m "Point front-end at deployed worker"
git push
```

GitHub Pages redeploys in ~30 seconds.

## 3. Smoke-test on your phone

1. Open https://kkmat.github.io/little-bee/ on your phone
2. Tap the wax seal → invitation reveals
3. Tap "Play the Games" → join with a nickname
4. Play one game → check `/leaderboard.html` — your score should appear
5. Switch language to Arabic — verify the layout flips

If the leaderboard says "Could not load yet" forever, the worker URL in
`api.js` is wrong or the worker isn't deployed.

## 4. Reset before the party

If you've been testing and want to wipe all data the night before:

```bash
cd ~/little-bee/worker
wrangler d1 execute little-bee --remote --command \
  "DELETE FROM scores; DELETE FROM advice; DELETE FROM predictions; \
   DELETE FROM due_date_guesses; DELETE FROM name_suggestions; \
   DELETE FROM onesies; DELETE FROM players; DELETE FROM rate_limits;"
```

## 5. Optional — custom subdomain for the API

If you want the API on a clean URL like `babyshower-api.nexus.com.kw`,
add to `worker/wrangler.toml`:

```toml
routes = [{ pattern = "babyshower-api.nexus.com.kw", custom_domain = true }]
```

Then `wrangler deploy` again. Cloudflare will create the DNS record for you
automatically (your domain has to be on Cloudflare).

---

## Troubleshooting

**"Unknown player" on every score submit** — the worker rejected the player_id
because the D1 was reset after a join. The front-end auto-recovers by
re-joining with the stored nickname; just refresh the page.

**The envelope animation only plays once** — that's intentional. We cache
"opened" in `sessionStorage` so guests don't tap-to-open on every reload.
Open in a new browser tab / incognito to see it again.

**Onesie image too large** — the canvas is capped at 400×500 PNG ≤ 600KB. If
someone fills it edge-to-edge with full-color brushstrokes the export can
exceed the limit. Suggest "fewer details" — already handled in the UI.

---

## QR code for sharing

Generate a QR pointing to the site so guests can scan from a printed card:

```bash
# Option A: a free online generator (no install needed)
#   https://qrcode.tec-it.com/?data=https%3A%2F%2Fkkmat.github.io%2Flittle-bee%2F

# Option B: locally with qrencode
sudo apt install qrencode
qrencode -o ~/little-bee.png -s 12 -m 2 "https://kkmat.github.io/little-bee/"
```

🐝
