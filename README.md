# 🐝 Little Bee

Interactive bilingual web invitation for **Neethu & Kevin's Baby Shower** — Friday, May 1, 2026 · 1:00 PM · Mahboula, Kuwait.

## What's inside

- **Home page** — digital envelope with wax seal, animated reveal of the invitation, live countdown, scratch-off gender teaser, location map, photo album link, and CTA buttons.
- **Games** — Baby Trivia, Word Scramble, Emoji Pictionary, Due Date Guess, Predictions, Design a Onesie, Advice Wall.
- **Live leaderboard** — shared scores across all guests via Cloudflare Worker + D1.
- **Bilingual** — English + Arabic with RTL layout toggle.

## Stack

- Static frontend (HTML + Tailwind CDN + vanilla JS) → GitHub Pages
- Cloudflare Worker + D1 → shared scoreboard, predictions, advice, onesie gallery
- Hosted: https://kkmat.github.io/little-bee/

## Local dev

```bash
# Frontend (just open in a browser or use any static server)
python3 -m http.server 8000

# Worker (requires wrangler)
cd worker
wrangler dev
```

## Deploy

```bash
# Frontend — push to master, GitHub Pages serves automatically
git push

# Worker
cd worker
wrangler deploy
```

## Secrets (set on Cloudflare, never in repo)

```bash
wrangler secret put ADMIN_PIN     # PIN for posting reveal/admin actions
```

---

*"Our little one is on the way!"* 🐝
