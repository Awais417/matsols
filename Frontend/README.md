# Matsols — Source Code

## Project Structure
- `src/` — React frontend
- `backend/` — Node.js + Express backend API
- `backend/prisma/` — Database schema and migrations

## Setup Instructions

### Backend
1. `cd backend`
2. `cp .env.example .env` and fill in your values
3. `npm install`
4. `npx prisma migrate deploy`
5. `node index.js`

### Frontend
1. At project root: `npm install`
2. `npm run dev` (development) or `npm run build` (production)

## Notes
- PostgreSQL is required for the database.
- OpenAI API key is required for the AI chat feature.
- Cloudinary credentials are optional — falls back to local storage if not set.
