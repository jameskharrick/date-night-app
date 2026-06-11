# James & Gurleen Date Night

A full-stack web app for planning date nights together. Filter by genre, streaming platform, score, and
release year, get a shuffled set of recommendations from TMDB, and keep a shared watchlist with statuses,
scores, and notes. Also log past trips and plan future ones, with ratings, notes, booking links, and
photo/video memories.

## Stack

- **Frontend:** React + Vite, TailwindCSS
- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Data source:** TMDB API v3
- **Hosting:** Vercel (frontend), Railway (backend)

## 1. Clone the repo

```bash
git clone <your-repo-url>
cd date-night-app
```

## 2. Get a TMDB API key

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/).
2. Go to **Settings → API** and request an API key (the "API Read Access Token" v3 `api_key` works for
   this app).
3. Copy the API key — you'll need it for `server/.env`.

## 3. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com/).
2. Open the **SQL Editor** and run the following schema to create the required tables:

```sql
create table watchlist (
  id uuid primary key default gen_random_uuid(),
  tmdb_id int not null,
  type text not null,
  title text not null,
  poster_path text,
  genres text,
  platforms text,
  tmdb_score numeric,
  status text not null default 'want_to_watch',
  personal_score int,
  note text,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table genre_cache (
  id serial primary key,
  name text not null,
  type text not null,
  fetched_at timestamptz not null default now()
);

create table seen_status (
  id uuid primary key default gen_random_uuid(),
  tmdb_id int not null,
  type text not null,
  seen_james boolean not null default false,
  seen_gurleen boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (tmdb_id, type)
);

create table trips (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  region text,
  country text,
  status text not null default 'want_to_visit',
  start_date date,
  end_date date,
  rating int,
  notes text,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table trip_links (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  category text not null,
  label text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create table trip_media (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  media_type text not null,
  secure_url text not null,
  public_id text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index trip_links_trip_id_idx on trip_links(trip_id);
create index trip_media_trip_id_idx on trip_media(trip_id);
```

3. From **Project Settings → API**, copy:
   - The **Project URL** → `SUPABASE_URL`
   - The **`service_role` secret key** → `SUPABASE_SERVICE_KEY` (keep this secret — it's only used
     server-side)

## 4. Create a Cloudinary account

Trip photos and videos are stored in [Cloudinary](https://cloudinary.com/).

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com/).
2. From your Cloudinary dashboard, copy the **Cloud Name**, **API Key**, and **API Secret** — you'll need
   them for `server/.env`.

## 5. Create Railway and Vercel accounts

You'll need these later for deployment:

- [Railway](https://railway.app/) — hosts the Express backend
- [Vercel](https://vercel.com/) — hosts the React frontend

## 6. Configure environment variables

### Server (`/server/.env`)

Copy `server/.env.example` to `server/.env` and fill in your values:

```
TMDB_API_KEY=your_tmdb_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
APP_PASSWORD=
PORT=3001
```

#### Set a shared password

The app is gated behind a shared password. Set `APP_PASSWORD` in `server/.env` to whatever password you
want — it's compared directly against what's typed on the site. If you leave `APP_PASSWORD` blank, the
server runs in **dev mode** and accepts all requests (it will print a warning on startup).

### Client (`/client/.env`)

```
VITE_API_URL=http://localhost:3001
```

This is already set up for local development.

## 7. Install and run

From the project root:

```bash
npm run install:all   # installs dependencies for both server and client
npm run dev           # runs the server and client together
```

- Backend runs at `http://localhost:3001`
- Frontend runs at `http://localhost:5173`

On first visit, you'll be asked for the shared password (the one set in step 5).

## 8. Deployment

### Backend → Railway

1. Create a new Railway project and link it to your repo (or deploy via the Railway CLI), pointing the
   service at the `/server` directory.
2. Set the environment variables from `server/.env` (`TMDB_API_KEY`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
   `APP_PASSWORD`, `PORT`) in the Railway dashboard.
3. Railway will detect `server/railway.json`, build with Nixpacks, and start the app with
   `node index.js`. The healthcheck hits `GET /api/health`.
4. Once deployed, copy the public Railway URL (e.g. `https://your-app.up.railway.app`).

### Frontend → Vercel

1. Create a new Vercel project pointing at the `/client` directory.
2. Set the environment variable `VITE_API_URL` to your Railway backend URL (see
   `client/.env.production` as a template).
3. Vercel will use `client/vercel.json` to handle SPA routing (rewrites all routes to `index.html`).
4. Deploy — your app will be live at your Vercel URL.

### CORS

The backend allows requests from `http://localhost:5173` (Vite dev server) and any `https://` origin, so
your deployed Vercel frontend will work without additional CORS configuration.

## Project structure

```
/client          → React + Vite app
/server          → Express API
/server/db.js    → Supabase client setup
package.json     → root package with concurrently dev script
```
