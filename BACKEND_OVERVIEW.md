\# Backend Overview (FastAPI, SQLAlchemy, Alembic, Postgres)
\
This document summarizes the backend of the Code Review System: tech stack, key files, API endpoints, database and Docker setup, environment variables, and useful notes for explaining or debugging the backend.
\
Quick facts
- Framework: FastAPI
- Python: 3.11 (Dockerfile base image)
- ORM: SQLAlchemy 2.x
- DB migrations: Alembic
- Database: PostgreSQL (docker-compose uses postgres:15)
- Auth: JWT (python-jose) with OAuth2PasswordBearer helper
- Rate limiting: slowapi (Limiter)
- Logging: simple std-out logger in `app/core/logger.py`
\
Run locally (development)
\
1. Create and activate a virtual environment (Windows example):
\
```powershell
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
```
\
2. Create a `.env` (or use `.env.example`) and configure `DATABASE_URL`, `SECRET_KEY`, etc.
\
3. Run the app with Uvicorn:
\
```bash
# from repo root
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
\
Run with Docker (recommended for parity)
\
```bash
# builds the image and starts web + db as defined in docker-compose.yml
docker compose up --build
```
\
Files of interest
- `requirements.txt` — pinned Python dependencies
- `docker/Dockerfile` — image: python:3.11-slim; installs `requirements.txt` and runs `uvicorn`
- `docker-compose.yml` — brings up `web` and `db` (Postgres). `web` mounts the repo into `/app` and exposes 8000.
- `alembic.ini` + `alembic/` — migration scripts and env configuration
- `app/main.py` — FastAPI app setup, middleware (CORS), router registration, health endpoint
- `app/config.py` — `pydantic-settings` for `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, etc.
- `app/database.py` — SQLAlchemy engine/session factory and `get_db()` dependency
- `app/oauth2.py` — JWT helpers: `create_access_token`, `verify_access_token`, `get_current_user`
- `app/api/routes/*.py` — route modules: `auth.py`, `submissions.py`, `reviews.py`, `notifications.py`, `tags.py`
- `app/models/*.py` — SQLAlchemy models: `User`, `Submission`, `Review`, `Annotation`, `Tag`, `SubmissionTag`, `Notification`
- `app/schemas/*.py` — Pydantic models for request/response validation
- `app/utils/*` — helpers: password hashing and validators
- `app/core/*` — rate limiter, logger, (empty `security.py` and `dependencies.py` files present)
\
Environment variables (from `app/config.py`)
- `DATABASE_URL` — SQLAlchemy connection URL (e.g., `postgresql://postgres:pass12345@db:5432/code_review_db` for Docker)
- `SECRET_KEY` — used to sign JWT tokens
- `ALGORITHM` — JWT algorithm (default HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` — token TTL
\
Docker-compose specifics
- `web` service:
  - Builds from `docker/Dockerfile`
  - Mounts project into container (`.:/app`) so edits reflect immediately (dev-friendly)
  - Runs: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
  - Uses env file `.env.docker` (check repo for file or create one)
- `db` service: Postgres 15; creates volume `postgres_data` for persistence
\
Authentication & Authorization
- `app/api/routes/auth.py` exposes `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- Login returns `access_token` which is saved by the frontend and sent in `Authorization: Bearer <token>` for protected endpoints.
- `app/oauth2.py` handles token creation and verification. `get_current_user` is used as a dependency in protected routes.
\
Rate limiting
- `slowapi` is used with a global `limiter` object found at `app/core/rate_limiter.py`.
- `auth` routes use `@limiter.limit(...)` decorators to limit register and login attempts.
\
Database & models
- Models live under `app/models/` and map to tables created by Alembic migrations in `alembic/versions`.
- Notable models and relationships:
  - `User` — `submissions` (one-to-many), `reviews` (one-to-many)
  - `Submission` — `user` (owner), `reviews` (one-to-many), `tags` (many-to-many via `submission_tags`)
  - `Tag` — many-to-many `submissions`
  - `Review` — `annotations` (one-to-many)
  - `Notification` — `user_id`, `message`, `is_read`
\
API surface (high level)
- Auth
  - POST `/api/auth/register` — register user (rate-limited)
  - POST `/api/auth/login` — login returns `access_token` and `user`
  - GET `/api/auth/me` — current authenticated user
- Submissions
  - POST `/api/submissions` — create (students only)
  - GET `/api/submissions` — list (students see own, mentors see all)
  - GET `/api/submissions/{id}` — detail (access controlled)
  - PUT `/api/submissions/{id}` — update (owner & pending only)
  - DELETE `/api/submissions/{id}` — delete (owner & pending only)
- Reviews
  - POST `/api/reviews` — create review (mentors only)
  - GET `/api/reviews/submission/{submission_id}` — list reviews for a submission
- Notifications
  - GET `/api/notifications` — list user notifications
  - PUT `/api/notifications/{id}/read` — mark as read
- Tags
  - GET `/api/tags` — list available tags
\
Validation & security helpers
- `app/utils/validators.py` — input sanitization (bleach) and code length checks.
- `app/utils/helpers.py` — password hashing/verification using passlib/bcrypt.
\
Migrations
- Alembic is configured; migration scripts are under `alembic/versions/`. Use Alembic CLI to create/run migrations.
\
Tests
- Basic tests exist under `tests/` (auth, review, submission). They use pytest and `conftest.py` provides setup. Review tests to understand expected behaviors.
\
Common troubleshooting / explanation points
- CORS: `app/main.py` permits `http://localhost:3000` and `http://127.0.0.1:3000` — update when frontend origin changes.
- API_BASE in frontend points by default to `http://localhost:8000` — adjust if backend runs elsewhere.
- Token expiration: default 1440 minutes (1 day); configured in `app/config.py`/env.
- DB URL for Docker-compose: either use the provided service name `db` in Docker network or point to a local DB for development.
\
Suggested improvements (optional to implement)
- Use `importlib.metadata.version` or a central place to keep app version and expose in `/health` or `/info`.
- Add structured request/response logging (middleware) for better auditability.
- Add tests for rate-limiter behavior and CORS config.
- Add a `Makefile` or `scripts/` to simplify common commands (run, migrate, test, docker-up).
\