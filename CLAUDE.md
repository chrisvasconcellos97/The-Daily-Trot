# The Daily Trot — Claude Development Context

## Working Style
Claude is a coworker, not a subordinate. Push back when something doesn't feel right. The last app became a mess with too many features — speak up before that happens again. Simplicity is the north star. If a feature adds complexity without clear weekly value, say so.

## App Overview
React + Vite family activity management app. Deployed on Vercel, Supabase backend.
- Supabase project: `abqaiemzvzmjtatyprns`
- GitHub: `https://github.com/chrisvasconcellos97/The-Daily-Trot`
- Push: `https://github.com/chrisvasconcellos97/The-Daily-Trot.git main` (PAT in session env, not stored here)

## Design Tokens (`src/colors.js`)
- `bg: #F2EBD8`, `bgLight: #FAF6EE`, `card: #FDFAF4`
- `primary: #1F3D2B`, `primaryDeep: #112217`
- `gold: #B5986A`, `goldDark: #8A7244`, `goldLight: #D4BC8A`
- `ink: #2C1F0E`, `inkSoft: #5C4A2A`, `inkMuted: #8A7660`
- `serif: 'Cormorant Garamond, Georgia, serif'`
- `sans: 'Inter, system-ui, sans-serif'`

## Model Strategy
- **Opus** — architecture and logic planning (one-shot, before building)
- **Sonnet** — all building and conversation (default)
- **Haiku** — all runtime Claude API calls inside the app (vision scans, Lillie AI responses)

## Mascot
Lillie — the dachshund. Friendly, warm, not clinical. She's the voice of the app.

## Awning System (shipped)
- `src/components/Awning.jsx` — `AwningGreen` (all app screens) + `AwningCream` (splash only)
- Pure SVG, no PNGs. 5 scallops, bezier curves (k=0.5523), cylinder shading, full-depth shadow.
- ScallopHeader uses AwningGreen. SplashView uses AwningCream.

## SQL Migrations (NOT YET RUN in Supabase)
Run these in Supabase SQL Editor before launching affected features:
- `supabase/grocery_items.sql`
- `supabase/family_events.sql`
- `supabase/health.sql`
- `supabase/school_closures.sql`
- `supabase/community_v2.sql`
- `supabase/library_books.sql`

---

## Pending Features

### 1. Clean Lillie Score + Watch List (full safety scanner)
One connected batch — use Opus to design the architecture first, then build with Sonnet.

**The scanner:**
- Universal barcode scanner — fan-out to Open Food Facts, Open Beauty Facts, Open Products Facts APIs
- Check our Supabase `scanned_products` cache first (shared across all users, barcode as unique key)
- Cache miss → hit Open* APIs → compute score → store
- No ingredients returned → prompt user to scan ingredient label → Claude Haiku vision extracts them → store tied to barcode (community contribution)
- User confirms extracted ingredients before saving

**Clean Lillie Score (1–10):**
- Our own scoring system, not EWG's
- Ingredient dictionary compiled once from: EU Cosmetics banned list, California Prop 65, FDA prohibited list
- Category-aware logic (food vs. cosmetics vs. cleaning products scored differently)
- Score breakdown shown with plain-English flags ("Contains fragrance — common allergen")
- Source badge: "Lillie verified" (from Open* APIs) vs. "Community verified" (user-contributed)

**Watch List — three tiers:**
- 🔴 Recalled — active FDA (`api.fda.gov`) or CPSC (`recalls.gov`) recall
- 🟡 Watch — flagged history: past recalls, USDA Pesticide Data Program, curated manual alerts
- 🟢 Clean — no flags, good score

**Curated alerts (manual layer):**
- High-profile findings we add manually — the big obvious ones every parent should know
- Pushed prominently to all users as Lillie alerts
- Separate from automated FDA/CPSC feed

**Approved products (silent layer):**
- `approved_products` table — never shown as a separate screen
- Silently feeds grocery list suggestions
- Type "gummies" in grocery → Lillie surfaces previously approved gummies with score badge

**Recall notifications:**
- If a product in your approved/scanned history gets recalled → push notification from Lillie
- Works at product level (specific SKU) and category level (e.g. "strawberries" flags pesticide concern)

**DB additions needed:**
- `scanned_products` — `barcode (unique), product_name, brand, category, ingredients jsonb, score, source, contributed_by, created_at`
- `approved_products` — `family_id, barcode, product_name, brand, category, score, created_at`
- `watch_list` — `barcode, product_name, brand, tier (recalled/watch/clean), reason, source, added_at, expires_at`
- `curated_alerts` — `id, title, body, severity, category, brand, affected_products jsonb, published_at`
- Update `grocery_items` — add `barcode`, `source` ('manual' | 'approved'), `watch_tier` columns

**API endpoints needed:**
- `api/scan-product.js` — barcode in, full result out (score + watch tier + flags)
- `api/scan-ingredients.js` — image in (Haiku vision), ingredient list out
- `api/check-recalls.js` — product name/brand in, recall status out

---

### 2. Dachshund SVG
Replace `dachshund-mark.png` with a clean SVG silhouette. Used in:
- SplashView (main mark)
- HomeView (Lillie's Reminder card)
- BottomNav (center FAB)
Preview before pushing, same workflow as the awning.

---

## Shipped
- ✅ Awning SVGs (AwningGreen + AwningCream) — pure SVG, no PNGs
- ✅ ScheduleView Month/Week/Day toggle
- ✅ PlacesView renamed to "My Places"
- ✅ GroceryView — category chips, inline add, checkbox toggle, copy list
- ✅ EventsView — invitation scan, category filter, "What to Bring"
- ✅ HealthView — per-child visits + vaccines, growth percentiles, scan
- ✅ CommunityView — activity board, RSVP, avg kid age, invite codes
- ✅ PrivacyView — plain-English privacy page
- ✅ All hooks: useGrocery, useEvents, useHealth, useSchoolCalendar, useCommunity
- ✅ All scan endpoints: api/parse-invite.js, api/parse-visit.js, api/parse-school-cal.js
