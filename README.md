# 🌍 Darukaa.Earth

> **Geospatial Data Analytics Platform for Carbon & Biodiversity Projects**

Darukaa.Earth is a full-stack geospatial analytics platform designed to manage, visualize, and analyze environmental projects involving **carbon sequestration, biodiversity, vegetation health, forest cover, and ecosystem monitoring**.

The platform combines a modern React frontend, FastAPI backend, PostgreSQL/PostGIS database, Mapbox-based geospatial visualization, and geospatial processing libraries to provide an interactive environmental data management and analytics system.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Key Features](#-key-features)
* [Technology Stack](#-technology-stack)
* [High-Level Architecture](#-high-level-architecture)
* [Application Flow](#-application-flow)
* [Project Structure](#-project-structure)
* [Database Schema](#-database-schema)
* [Database Relationships](#-database-relationships)
* [Authentication](#-authentication)
* [Geospatial Data Flow](#-geospatial-data-flow)
* [Analytics Architecture](#-analytics-architecture)
* [API Endpoints](#-api-endpoints)
* [Environment Configuration](#-environment-configuration)
* [Prerequisites](#-prerequisites)
* [Local Setup](#-local-setup)
* [Running the Application](#-running-the-application)
* [Testing](#-testing)
* [CI/CD Pipeline](#-cicd-pipeline)
* [GitHub Actions Workflow](#-github-actions-workflow)
* [Code Quality](#-code-quality)
* [Security Considerations](#-security-considerations)
* [Troubleshooting](#-troubleshooting)
* [Future Improvements](#-future-improvements)

---

# 🌱 Overview

Darukaa.Earth provides a centralized platform for environmental project management and geospatial analytics.

The application allows users to:

* Create and manage environmental projects.
* Add geographically defined sites to projects.
* Draw site boundaries on an interactive map.
* Store polygon geometry using PostGIS.
* Calculate site areas.
* Track carbon stock and carbon sequestration.
* Monitor biodiversity metrics.
* Monitor vegetation and forest-cover indicators.
* Maintain historical analytics records.
* Visualize environmental trends.
* View project-level and site-level analytics.
* Authenticate users using JWT-based authentication.

The application is designed around the following principle:

```text
Environmental Project
        ↓
      Sites
        ↓
Geospatial Boundaries
        ↓
Environmental Metrics
        ↓
Historical Analytics
        ↓
Visualization & Insights
```

---

# 🚀 Key Features

## 1. Project Management

Users can create and manage environmental projects.

Each project contains information such as:

* Project name
* Description
* Project type
* Status
* Location
* Start date
* End date
* Total area
* Project creator

Projects can contain multiple sites.

---

## 2. Geospatial Site Management

Each environmental project can contain one or more geographic sites.

Users can:

* Create sites.
* Draw polygons on the map.
* Store geographic boundaries.
* Calculate site area.
* View site location.
* Search and filter sites.
* Delete sites.

Site geometries are stored using:

```text
PostgreSQL
    +
PostGIS
    +
GeoAlchemy2
```

---

## 3. Interactive Map

The frontend uses:

* Mapbox GL JS
* Mapbox GL Draw
* Turf.js

Users can interactively draw polygons representing environmental sites.

The resulting GeoJSON geometry is sent to the backend.

---

## 4. Carbon Analytics

The platform tracks environmental carbon metrics including:

* Carbon stock
* Carbon sequestered
* Carbon change
* Baseline carbon
* Net carbon gain
* Projected carbon values

---

## 5. Biodiversity Analytics

The application tracks:

* Biodiversity score
* Species count
* Ecosystem health
* Threatened species estimates
* Pollinator index

---

## 6. Vegetation Analytics

The platform provides vegetation-related indicators such as:

* NDVI
* Forest cover
* Healthy canopy area
* Vegetation change rate

---

## 7. Historical Monitoring

Historical environmental observations are stored in the `site_analytics` table.

This allows the platform to maintain a time series:

```text
2024-01
   ↓
2024-04
   ↓
2024-07
   ↓
2024-10
   ↓
2025-01
```

These records can be visualized as charts.

---

## 8. Authentication

The application uses:

```text
Email + Password
        ↓
bcrypt
        ↓
JWT
        ↓
Authorization: Bearer <token>
```

Passwords are stored as bcrypt hashes rather than plaintext passwords.

---

# 🛠 Technology Stack

## Frontend

| Technology     | Purpose                 |
| -------------- | ----------------------- |
| React          | User interface          |
| TypeScript     | Type safety             |
| Vite           | Frontend build tool     |
| Tailwind CSS   | Styling                 |
| Mapbox GL JS   | Interactive maps        |
| Mapbox GL Draw | Polygon drawing         |
| Turf.js        | Geospatial calculations |
| Highcharts     | Analytics visualization |
| Lucide React   | Icons                   |

---

## Backend

| Technology  | Purpose                    |
| ----------- | -------------------------- |
| Python      | Backend language           |
| FastAPI     | REST API framework         |
| SQLAlchemy  | ORM                        |
| Pydantic    | Data validation            |
| GeoAlchemy2 | PostGIS integration        |
| Shapely     | Geometry processing        |
| PostgreSQL  | Relational database        |
| PostGIS     | Spatial database extension |
| bcrypt      | Password hashing           |
| python-jose | JWT handling               |
| Uvicorn     | ASGI server                |

---

## Development & CI

| Technology     | Purpose                |
| -------------- | ---------------------- |
| Git            | Version control        |
| GitHub         | Repository hosting     |
| GitHub Actions | Continuous Integration |
| Pytest         | Backend testing        |
| Prettier       | Code formatting        |
| Husky          | Git hooks              |
| lint-staged    | Staged-file checks     |

---

# 🏗 High-Level Architecture

Darukaa.Earth follows a layered full-stack architecture.

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + TypeScript  │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                        HTTP / REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
          Authentication   Geospatial      Analytics
                │           Services          │
                │              │              │
                └──────────────┼──────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     SQLAlchemy      │
                    │       ORM           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL + PostGIS│
                    └─────────────────────┘
```

---

# 🔄 Application Flow

## General Request Flow

```text
User
 ↓
React UI
 ↓
services/api.ts
 ↓
Vite /api Proxy
 ↓
FastAPI
 ↓
Pydantic Validation
 ↓
Business Logic
 ↓
SQLAlchemy
 ↓
PostgreSQL/PostGIS
 ↓
FastAPI Response
 ↓
React UI
```

---

# 📂 Project Structure

```text
darukaa-earth/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .husky/
│   └── pre-commit
│
├── backend/
│   │
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   └── session.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── site.py
│   │   │   └── site_analytics.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── site.py
│   │   │   └── analytics.py
│   │   │
│   │   ├── services/
│   │   │   └── geospatial_service.py
│   │   │
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       ├── projects.py
│   │   │       ├── sites.py
│   │   │       ├── analytics.py
│   │   │       └── dashboard.py
│   │   │
│   │   └── main.py
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_geospatial.py
│   │
│   ├── init_db.py
│   ├── requirements.txt
│   └── .env
│
├── src/
│   │
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env
├── .gitignore
├── .prettierrc
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# 🗄 Database Schema

Darukaa.Earth uses:

```text
PostgreSQL
     +
PostGIS
```

The main tables are:

```text
users
  │
  │ 1:N
  ▼
projects
  │
  │ 1:N
  ▼
sites
  │
  │ 1:N
  ▼
site_analytics
```

---

# 👤 Users Table

The `users` table stores application users.

### Fields

| Field         | Description                |
| ------------- | -------------------------- |
| id            | Unique user identifier     |
| name          | User name                  |
| email         | Unique user email          |
| password_hash | bcrypt password hash       |
| created_at    | Account creation timestamp |
| updated_at    | Last update timestamp      |

User IDs use a format similar to:

```text
usr_<uuid>
```

The email field is unique and indexed.

---

# 📁 Projects Table

The `projects` table stores environmental projects.

### Fields

| Field        | Description                   |
| ------------ | ----------------------------- |
| id           | Project identifier            |
| name         | Project name                  |
| description  | Project description           |
| project_type | Type of environmental project |
| status       | Project status                |
| location     | Project location              |
| start_date   | Start date                    |
| end_date     | End date                      |
| total_area   | Total project area            |
| created_by   | User who created project      |
| created_at   | Creation timestamp            |
| updated_at   | Last update                   |

Project IDs use:

```text
proj_<uuid>
```

---

# 🗺 Sites Table

The `sites` table represents geographic sites belonging to projects.

### Fields

| Field              | Description            |
| ------------------ | ---------------------- |
| id                 | Site identifier        |
| project_id         | Parent project         |
| name               | Site name              |
| description        | Site description       |
| geometry           | PostGIS polygon        |
| area               | Site area              |
| location           | Site location          |
| status             | Site status            |
| carbon_stock       | Current carbon stock   |
| carbon_sequestered | Carbon sequestered     |
| biodiversity_score | Biodiversity score     |
| vegetation_index   | Vegetation index       |
| forest_cover       | Forest cover           |
| species_count      | Number of species      |
| ecosystem_health   | Ecosystem health       |
| monitoring_date    | Latest monitoring date |
| created_at         | Creation timestamp     |
| updated_at         | Last update            |

The geometry is stored as:

```text
POLYGON
SRID = 4326
```

---

# 📊 Site Analytics Table

`site_analytics` stores historical monitoring records.

### Fields

| Field                 | Description          |
| --------------------- | -------------------- |
| id                    | Analytics record ID  |
| site_id               | Associated site      |
| monitoring_date       | Monitoring date      |
| carbon_stock          | Carbon stock         |
| carbon_sequestered    | Carbon sequestration |
| carbon_change         | Change in carbon     |
| biodiversity_score    | Biodiversity score   |
| species_count         | Species count        |
| vegetation_index      | Vegetation index     |
| forest_cover          | Forest cover         |
| ecosystem_health      | Ecosystem health     |
| soil_organic_carbon   | Soil carbon          |
| water_retention_index | Water retention      |
| canopy_height_m       | Canopy height        |

Analytics IDs use:

```text
an_<uuid>
```

---

# 🔗 Database Relationships

## User → Projects

One user can create multiple projects.

```text
User
 │
 ├── Project 1
 ├── Project 2
 └── Project 3
```

Relationship:

```text
users.id
    ↓
projects.created_by
```

---

## Project → Sites

One project can contain multiple sites.

```text
Project
 │
 ├── Site 1
 ├── Site 2
 └── Site 3
```

Relationship:

```text
projects.id
    ↓
sites.project_id
```

The foreign key uses cascade deletion.

---

## Site → Analytics

One site can have multiple historical analytics records.

```text
Site
 │
 ├── Analytics – Jan 2024
 ├── Analytics – Apr 2024
 ├── Analytics – Jul 2024
 ├── Analytics – Oct 2024
 └── Analytics – Jan 2025
```

Relationship:

```text
sites.id
    ↓
site_analytics.site_id
```

Deleting a site cascades to its analytics records.

---

# 🔐 Authentication

Authentication uses JWT tokens.

## Login Flow

```text
User
 ↓
Email + Password
 ↓
POST /api/auth/login
 ↓
Find user
 ↓
bcrypt.verify()
 ↓
Password valid?
 ↓
Create JWT
 ↓
Return token
 ↓
Frontend stores token
```

The frontend stores the token under:

```text
darukaa_token
```

For authenticated requests:

```http
Authorization: Bearer <JWT>
```

is sent to the backend.

---

# 🗺 Geospatial Data Flow

Darukaa.Earth uses GeoJSON on the frontend and PostGIS geometry on the backend.

## Step 1 — User draws polygon

Mapbox GL Draw allows the user to draw a boundary.

```text
Mapbox
   ↓
Mapbox Draw
   ↓
GeoJSON Polygon
```

---

## Step 2 — Frontend validation

The frontend validates the geometry and can calculate spatial information using Turf.js.

```text
GeoJSON
   ↓
Turf.js
   ↓
Area / Geometry validation
```

---

## Step 3 — Send to backend

The frontend calls:

```http
POST /api/sites
```

with the site information and geometry.

---

## Step 4 — FastAPI validation

FastAPI receives the request.

Pydantic validates the request structure.

```text
Request
 ↓
Pydantic Schema
 ↓
Validated data
```

---

## Step 5 — Shapely processing

The backend converts GeoJSON to a Shapely geometry.

```python
shape(geometry_dict)
```

The geometry is checked using:

```python
geom.is_valid
```

Invalid geometries are rejected.

---

## Step 6 — Convert to PostGIS

The geometry is converted using GeoAlchemy2:

```text
Shapely Polygon
       ↓
GeoAlchemy2
       ↓
PostGIS Geometry
```

---

## Step 7 — Store in PostgreSQL

The polygon is stored with:

```text
Geometry(POLYGON, SRID=4326)
```

---

# 📈 Analytics Architecture

The analytics page retrieves historical monitoring information.

```text
SiteAnalyticsPage
       ↓
GET /api/sites/{site_id}/analytics
       ↓
FastAPI
       ↓
Site + SiteAnalytics
       ↓
SiteAnalyticsDetailResponse
       ↓
Highcharts
       ↓
Charts
```

The analytics response includes:

### Carbon

* Current carbon
* Annual sequestration
* Baseline carbon
* Net gain
* Projected 2030 carbon

### Biodiversity

* Biodiversity score
* Species count
* Threatened species estimate
* Pollinator index

### Vegetation

* NDVI
* Forest cover
* Healthy canopy
* Change rate

> Some dashboard and analytics values in the current implementation are generated using demo/synthetic calculations rather than real environmental sensor or satellite datasets. They should not be interpreted as independently verified environmental measurements.

---

# 🔌 API Endpoints

The backend exposes REST endpoints under:

```text
/api
```

Interactive API documentation is available at:

```text
http://localhost:8000/api/docs
```

---

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

### Current User

```http
GET /api/auth/me
```

---

## Projects

```http
GET    /api/projects
GET    /api/projects/{id}
POST   /api/projects
PUT    /api/projects/{id}
DELETE /api/projects/{id}
```

Project filtering supports parameters such as:

```text
status
type
search
```

---

## Sites

```http
GET    /api/sites
GET    /api/sites/{id}
POST   /api/sites
PUT    /api/sites/{id}
DELETE /api/sites/{id}
```

Sites can be filtered by:

```text
project
status
search
```

---

## Analytics

```http
GET /api/sites/{site_id}/analytics
```

---

## Dashboard

```http
GET /api/dashboard/summary
```

---

## Health Check

```http
GET /api/health
```

Expected response indicates that the API is running.

---

# ⚙️ Environment Configuration

Darukaa.Earth uses separate environment configurations for frontend and backend.

---

## Frontend `.env`

Create:

```text
.env
```

in the project root.

```env
VITE_API_URL=""
VITE_MAPBOX_TOKEN="YOUR_REAL_MAPBOX_TOKEN"
```

Only variables prefixed with `VITE_` should be exposed to the frontend.

Do not place:

```text
DATABASE_URL
JWT_SECRET
database passwords
```

in the frontend `.env`.

---

# Backend `.env`

Create:

```text
backend/.env
```

Example:

```env
PROJECT_NAME="Darukaa.Earth"
API_V1_STR="/api"

JWT_SECRET="YOUR_GENERATED_RANDOM_SECRET"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

DATABASE_URL="postgresql+psycopg2://darukaa_admin:YOUR_PASSWORD@localhost:5432/darukaa_earth"

CORS_ORIGINS='["http://localhost:3000","http://localhost:5173"]'
```

Generate a strong JWT secret using:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

# 💻 Prerequisites

Install the following before running the application.

## Required

* Node.js 20+
* npm
* Python 3.11+
* PostgreSQL
* PostGIS
* Git

---

# 🗄 PostgreSQL Setup

Create the database:

```sql
CREATE DATABASE darukaa_earth;
```

Create the database user if necessary:

```sql
CREATE USER darukaa_admin WITH PASSWORD 'YOUR_PASSWORD';
```

Grant access:

```sql
GRANT ALL PRIVILEGES ON DATABASE darukaa_earth
TO darukaa_admin;
```

Connect to the database and enable PostGIS:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Verify:

```sql
SELECT PostGIS_Version();
```

---

# 🐍 Backend Setup

Open a terminal.

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Upgrade pip:

```bash
python -m pip install --upgrade pip
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Verify important dependencies:

```bash
python -c "import fastapi, sqlalchemy, shapely, geoalchemy2, psycopg2, bcrypt; print('Backend dependencies OK')"
```

---

# 🟢 Running the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

The backend will run at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/api/docs
```

Health check:

```text
http://localhost:8000/api/health
```

---

# 🟢 Running the Frontend

Open a second terminal.

From the project root:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

# 🔑 Demo Login

The seeded development database contains the demo account:

```text
Email:
admin@darukaa.earth

Password:
Admin@123
```

> The demo credentials should not be used in a production deployment.

---

# ▶️ Complete Local Startup

After the initial setup, every time you want to run Darukaa.Earth:

### Terminal 1 — Backend

```bash
cd darukaa-earth/backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### Terminal 2 — Frontend

```bash
cd darukaa-earth
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# 🧪 Testing

Backend tests use Pytest.

Run the geospatial tests:

```bash
pytest backend/tests/test_geospatial.py -v
```

The tests include validation of:

* Valid polygon geometries.
* Invalid/self-intersecting polygons.
* Geospatial validation behavior.

Example:

```text
test_valid_polygon
test_invalid_polygon
```

---

# 🔄 CI/CD Pipeline

Darukaa.Earth uses **GitHub Actions** for Continuous Integration.

The current workflow is:

```text
.github/
└── workflows/
    └── ci.yml
```

The workflow is triggered by:

```yaml
on:
  push:
    branches: [main, develop]

  pull_request:
    branches: [main]
```

Therefore CI runs when:

1. Code is pushed to `main`.
2. Code is pushed to `develop`.
3. A Pull Request targets `main`.

---

# 🧩 CI Architecture

The CI workflow contains two independent jobs:

```text
             GitHub Repository
                     │
                     ▼
          GitHub Actions Workflow
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
 frontend-check           backend-check
          │                     │
          ▼                     ▼
   Node.js 20              Python 3.11
          │                     │
          ▼                     ▼
       npm ci             Install GIS libs
          │                     │
          ▼                     ▼
    Frontend build             pytest
          │                     │
          ▼                     ▼
       PASS/FAIL             PASS/FAIL
```

The jobs run independently and can execute in parallel.

---

# 🎨 Frontend CI Job

The frontend job is:

```yaml
frontend-check:
  name: Frontend Lint & Build
  runs-on: ubuntu-latest
```

It performs the following steps.

### 1. Checkout repository

```yaml
- uses: actions/checkout@v4
```

Downloads the repository onto the GitHub Actions runner.

---

### 2. Setup Node.js

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
```

Uses Node.js 20 and enables npm caching.

---

### 3. Install dependencies

```yaml
- name: Install dependencies
  run: npm ci
```

`npm ci` installs dependencies according to `package-lock.json`.

This makes CI dependency installation more reproducible.

---

### 4. Build frontend

```yaml
- name: TypeScript Check & Build
  run: npm run build
```

This runs:

```bash
vite build
```

and verifies that the frontend can be built successfully.

---

# ⚠️ Frontend CI Note

The current workflow calls the step:

```text
TypeScript Check & Build
```

but executes only:

```bash
npm run build
```

If the project has:

```json
"lint": "tsc --noEmit"
```

then a stronger CI configuration should explicitly execute:

```bash
npm run lint
npm run build
```

This separates TypeScript validation from production building.

---

# 🐍 Backend CI Job

The backend job is:

```yaml
backend-check:
  name: Backend Lint & Tests
  runs-on: ubuntu-latest
```

---

## 1. Checkout repository

```yaml
- uses: actions/checkout@v4
```

---

## 2. Setup Python

```yaml
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
```

Uses Python 3.11.

---

## 3. Install GIS system dependencies

```yaml
- name: Install GDAL & GEOS system dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y libgeos-dev libgdal-dev
```

This prepares the Linux environment for geospatial Python dependencies.

### GDAL

GDAL provides geospatial data processing functionality.

### GEOS

GEOS provides geometry processing capabilities used by geospatial libraries such as Shapely.

---

## 4. Install Python dependencies

```yaml
- name: Install Python dependencies
  run: |
    pip install --upgrade pip
    pip install -r backend/requirements.txt
```

Installs the backend requirements.

---

## 5. Run Pytest

```yaml
- name: Run Pytest Test Suite
  run: |
    pytest backend/tests/test_geospatial.py -v
```

Runs the geospatial test suite.

If the tests pass:

```text
Backend Tests ✅
```

If they fail:

```text
Backend Tests ❌
```

---

# 📄 Current GitHub Actions Workflow

The current workflow configuration is:

```yaml
name: Darukaa.Earth Continuous Integration

on:
  push:
    branches: [main, develop]

  pull_request:
    branches: [main]

jobs:

  frontend-check:
    name: Frontend Lint & Build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript Check & Build
        run: npm run build


  backend-check:
    name: Backend Lint & Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install GDAL & GEOS system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libgeos-dev libgdal-dev

      - name: Install Python dependencies
        run: |
          pip install --upgrade pip
          pip install -r backend/requirements.txt

      - name: Run Pytest Test Suite
        run: |
          pytest backend/tests/test_geospatial.py -v
```

---

# 🔒 Code Quality

The project uses Prettier for consistent frontend formatting.

For the requested pre-commit quality workflow, the intended tooling is:

```text
Husky
   +
lint-staged
   +
Prettier
   +
TypeScript checks
```

The desired flow is:

```text
git commit
    ↓
Husky pre-commit
    ↓
lint-staged
    ↓
Prettier
    ↓
TypeScript check
    ↓
Commit allowed
```

If any required check fails, the commit should be rejected.

A typical configuration contains:

```text
.husky/
└── pre-commit
```

and:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx,json,css,md}": "prettier --write"
}
```

The project should also run the TypeScript check:

```bash
npm run lint
```

before accepting a commit.

---

# 🔐 Security Considerations

## Environment variables

Sensitive information must not be committed.

Do not commit:

```text
backend/.env
```

or production secrets.

The repository should contain an example configuration such as:

```text
.env.example
```

instead.

---

## JWT Secret

Generate a secure secret:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Do not use the development fallback secret in production.

---

## Database Credentials

Never commit database passwords.

Use:

```env
DATABASE_URL="..."
```

in the backend environment.

---

## Mapbox Token

The frontend Mapbox token uses:

```text
VITE_MAPBOX_TOKEN
```

Mapbox public access tokens are expected to be client-visible, but production tokens should be appropriately restricted according to the Mapbox configuration.

---

## Demo Credentials

The seeded:

```text
admin@darukaa.earth
Admin@123
```

credentials are for development/demo use only.

Production environments should use secure credentials and appropriate user management.

---

# 🐛 Troubleshooting

## Backend cannot connect to PostgreSQL

Check:

```text
PostgreSQL service
DATABASE_URL
database name
username
password
port
```

Default PostgreSQL port:

```text
5432
```

---

## PostGIS error

Connect to the database and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Then:

```sql
SELECT PostGIS_Version();
```

---

## Frontend cannot connect to backend

Verify backend:

```text
http://localhost:8000/api/health
```

Then verify Vite is running:

```text
http://localhost:3000
```

The Vite development server proxies:

```text
/api
```

to:

```text
http://localhost:8000
```

---

## Map does not load

Check:

```env
VITE_MAPBOX_TOKEN="YOUR_REAL_MAPBOX_TOKEN"
```

After changing `.env`, restart Vite:

```bash
npm run dev
```

---

## Python dependency installation fails

Make sure the virtual environment is active:

```bash
venv\Scripts\activate
```

Then:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

# 📊 Seed Data

The project contains database initialization logic.

Running the backend initializes the database tables and seed data when configured accordingly.

The development seed includes:

```text
3 Projects
4 Sites
20 Analytics Records
```

The projects include examples related to:

* Western Ghats rainforest and wildlife corridor
* Sundarbans blue carbon and mangrove protection
* Araku Valley regenerative agroforestry

Historical monitoring records cover multiple dates from:

```text
2024-01
2024-04
2024-07
2024-10
2025-01
```

These records are intended for development/demo purposes.

---

# 🧭 Development Workflow

A typical development workflow is:

```text
1. Create feature branch
        ↓
2. Develop feature
        ↓
3. Run local tests
        ↓
4. Run formatting/linting
        ↓
5. git add
        ↓
6. git commit
        ↓
7. Husky + lint-staged
        ↓
8. git push
        ↓
9. GitHub Actions
        ↓
10. Frontend checks
        ↓
11. Backend tests
        ↓
12. Pull Request
        ↓
13. Code review
        ↓
14. Merge into main
```

---

# 🚀 Future Improvements

Potential improvements include:

* Add a complete production CD deployment workflow.
* Add PostgreSQL/PostGIS integration tests using an isolated test database.
* Add backend linting with Ruff.
* Add stronger frontend ESLint configuration.
* Add automated dependency/security scanning.
* Add database migrations using Alembic.
* Add role-based access control.
* Add real satellite/environmental data sources.
* Replace synthetic analytics with verified environmental datasets.
* Add automated API integration tests.
* Improve database query efficiency.
* Add production monitoring and logging.
* Add Docker-based development and deployment.
* Add automated deployment to cloud infrastructure.

---

# 📜 License

Add the project's applicable license here.

For example:

```text
MIT License
```

if the project is released under MIT.

---

# 👥 Contributors

Darukaa.Earth development team.

---

# 🌍 Darukaa.Earth

```text
Geospatial Data
       +
Environmental Analytics
       +
Carbon Monitoring
       +
Biodiversity Monitoring
       +
Interactive Mapping
       ↓
   Darukaa.Earth
```

> **Building technology for better environmental intelligence.**
