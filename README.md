# 🎮 LoL Esports Tournament & Match Analytics System

[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A comprehensive database management system for tracking League of Legends esports tournaments, teams, players, matches, and performance analytics.

---

## 📄 Project Overview

### Problem Statement

The esports industry generates massive amounts of match data, player statistics, and tournament information. However, there is no centralized, accessible system for fans, analysts, and tournament organizers to:

- Track player and team performance across multiple tournaments
- Analyze historical match statistics and trends
- Generate comprehensive reports on player/team rankings
- Manage tournament schedules and results efficiently

### Solution

Our system provides a **full-stack database application** that:

- ✅ Stores and manages esports tournament data in a normalized MySQL database
- ✅ Offers real-time analytics on player performance (KDA, win rates, champion statistics)
- ✅ Provides interactive dashboards with data visualizations
- ✅ Supports role-based access control (Admin, Analyst, Public User)
- ✅ Ensures data integrity through triggers, stored procedures, and constraints

---

## 🎯 Requirements

### Functional Requirements

#### 1. **Team Management**

- Create, read, update, and delete (CRUD) team profiles
- Track team region, creation date, and active roster
- View team performance history and statistics

#### 2. **Player Management**

- CRUD operations for player profiles
- Track player roles (Top, Jungle, Mid, Bot, Support)
- View individual player statistics (KDA, games played, champions)

#### 3. **Tournament Management**

- Create and manage tournaments with metadata (title, dates, prize pool, region)
- Track tournament stages (Group Stage, Playoffs, Finals)
- Associate multiple teams with tournaments

#### 4. **Match Tracking**

- Record match results with date, stage, and winner
- Store detailed player statistics per match (kills, deaths, assists, gold, damage, CS, vision score)
- Track champion picks and bans

#### 5. **Analytics & Reporting**

- **Player Analytics:**
  - Top players by KDA ratio
  - Performance trends over time
  - Head-to-head comparisons
- **Team Analytics:**
  - Win rate calculations
  - Team vs team historical records
  - Tournament performance summaries
- **Tournament Analytics:**
  - Participation statistics
  - Match count per tournament

#### 6. **User Authentication & Authorization**

- Role-based access:
  - **Admin:** Full CRUD permissions, user management
  - **Analyst:** Read-only access with advanced analytics tools
  - **Public User:** View-only access to public data

#### 7. **Data Visualization**

- Interactive charts (bar, line, pie) for statistics
- Real-time dashboard with key metrics
- Export reports to PDF/CSV

### Non-Functional Requirements

#### 1. **Performance**

- Query response time < 500ms for most operations
- Optimized indexing on frequently queried columns

#### 2. **Security**

- Password hashing using SHA-256
- SQL injection prevention via prepared statements
- Role-based privilege enforcement at database level
- Secure API endpoints with JWT authentication

#### 3. **Scalability**

- Database design supports horizontal scaling
- Partitioning strategy for large match history tables

#### 4. **Usability**

- Responsive web interface (mobile & desktop)
- Intuitive navigation with clear UI/UX
- Fast page load times (< 2 seconds)

#### 5. **Maintainability**

- Clean, documented code following best practices
- Modular architecture with separation of concerns
- Comprehensive API documentation (Swagger/OpenAPI)

#### 6. **Reliability**

- Data integrity enforced through foreign keys and constraints
- Automated backups and transaction logging
- Error handling with graceful degradation
---
## 🧱 Core Entities

Our database schema consists of **6 core entities** with proper normalization (3NF):

### 1. **Team**

```
team_id (PK), name, region, created_at
```

Stores information about esports teams.

### 2. **Player**

```
player_id (PK), team_id (FK), nickname, real_name, role, join_date
```

Tracks individual players and their team affiliations.

### 3. **Tournament**

```
tournament_id (PK), title, game_title, start_date, end_date, prize_pool, region
```

Represents esports tournaments and events.

### 4. **Match**

```
match_id (PK), tournament_id (FK), match_date, stage, patch, game_length, winner_team_id (FK)
```

Records individual matches within tournaments.

### 5. **Team_Tournament** (Associative Entity)

```
team_id (FK), tournament_id (FK), seed
PK(team_id, tournament_id)
```

Many-to-many relationship: teams participate in multiple tournaments.

### 6. **Match_Player_Stats** (Associative Entity)

```
match_id (FK), player_id (FK), champion, kills, deaths, assists, gold_earned, damage_dealt, cs_total, vision_score
PK(match_id, player_id)
```

Many-to-many relationship: tracks player performance in each match.

### Entity Relationship Diagram (ERD)

![ERD Placeholder](docs/erd_diagram.png)  
_Full ERD will be included in the design document (Dec 15 submission)._

---

## 🔧 Tech Stack

### **Backend**

- **FastAPI** (Python 3.10+)

  - High-performance async framework
  - Automatic OpenAPI documentation
  - Built-in data validation with Pydantic

- **MySQL 8.0+**

  - Relational database with full ACID compliance
  - Stored procedures for business logic
  - Triggers for audit logging and validation
  - Indexing and partitioning for performance

- **Supporting Libraries:**
  - `mysql-connector-python` - MySQL database connector
  - `SQLAlchemy` - ORM for database interactions
  - `PyJWT` - JWT token authentication
  - `passlib` - Password hashing

### **Frontend**

- **React 18+**

  - Component-based UI architecture
  - React Router for navigation
  - Context API for state management

- **UI/UX Libraries:**
  - **Tailwind CSS** - Utility-first styling
  - **Recharts** - Data visualization library
  - **Axios** - HTTP client for API calls
  - **React Hook Form** - Form validation

### **DevOps & Tools**

- **GitHub** - Version control and collaboration
- **MySQL Workbench** - Database design and management
- **Postman** - API testing
- **VS Code** - Primary IDE

### **Data Source**

- **Oracle's Elixir** - Historical LoL esports match data (CSV format)
- https://oracleselixir.com/tools/downloads

---

## 👥 Team Members & Roles

| Name            | Student ID | Role                                 | Responsibilities                                                                |
| --------------- | ---------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| **Luu Nguyen Chi Duc** | [ID]       | **Project Lead & Backend Developer** | Database design (ERD, DDL), FastAPI implementation, stored procedures, triggers |
| **Nguyen Dai Nghia**  | [ID]       | **Frontend Developer**               | React UI development, data visualization, responsive design                     |
| **Nguyen Tuan Minh**  | [ID]       | **Database Administrator**           | Data import, indexing, query optimization, security configuration               |
| **Nguyen Pham Tuan Anh**  | V202401425       | **QA & Documentation**               | Testing (CRUD, analytics), documentation, presentation slides                   |

_Note: Roles are flexible and team members will collaborate across all areas._

---

## 📅 Project Timeline

| Milestone                                    | Deadline  | Deliverables                                                        | Status         |
| -------------------------------------------- | --------- | ------------------------------------------------------------------- | -------------- |
| **Week 1:** Team Formation & Topic Selection | Dec 1     | GitHub repo, README.md, Team registration                           | 🟢 Done |
| **Week 2:** Peer Review                      | Dec 8     | Review other teams' proposals, incorporate feedback                 | ⬜ Pending     |
| **Week 3:** Design Document                  | Dec 15    | Complete ERD, DDL scripts, normalized schema, task division         | ⬜ Pending     |
| **Week 4:** Backend Implementation           | Dec 16-18 | FastAPI setup, database deployment, stored procedures, triggers     | ⬜ Pending     |
| **Week 5:** Frontend Development             | Dec 18-20 | React components, CRUD pages, analytics dashboard                   | ⬜ Pending     |
| **Week 6:** Integration & Testing            | Dec 20-21 | Connect frontend to backend, end-to-end testing, performance tuning | ⬜ Pending     |
| **Week 7:** Final Submission & Presentation  | Dec 22    | Slides, final report, GitHub repo, live demo                        | ⬜ Pending     |

---

## 📂 Project Structure

```
lol-esports-analytics/
│
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── database.py        # MySQL connection setup
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routers/           # API endpoints
│   │   │   ├── teams.py
│   │   │   ├── players.py
│   │   │   ├── tournaments.py
│   │   │   ├── matches.py
│   │   │   └── analytics.py
│   │   └── utils/             # Helper functions
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Teams.jsx
│   │   │   ├── Players.jsx
│   │   │   ├── Tournaments.jsx
│   │   │   ├── Matches.jsx
│   │   │   └── Analytics.jsx
│   │   ├── services/          # API service layer
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── README.md
│
├── database/                   # MySQL scripts
│   ├── schema.sql             # DDL (CREATE TABLE statements)
│   ├── procedures.sql         # Stored procedures
│   ├── triggers.sql           # Triggers
│   ├── views.sql              # Analytics views
│   ├── indexes.sql            # Performance indexes
│   ├── security.sql           # User roles and privileges
│   ├── seed_data.sql          # Sample data
│   └── import_scripts/        # Data import utilities
│
├── docs/                       # Documentation
│   ├── erd_diagram.png
│   ├── api_documentation.md
│   ├── database_design.md
│   └── user_manual.md
│
├── tests/                      # Test cases
│   ├── test_api.py
│   └── test_database.sql
│
├── .gitignore
├── README.md                   # This file
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

- **MySQL 8.0+** installed and running
- **Python 3.10+** installed
- **Node.js 18+** and npm installed

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/your-team/lol-esports-analytics.git
cd lol-esports-analytics
```

#### 2. Set up the database

```bash
# Create database
mysql -u root -p < database/schema.sql

# Import sample data
mysql -u root -p esports_db < database/seed_data.sql

# Create stored procedures and triggers
mysql -u root -p esports_db < database/procedures.sql
mysql -u root -p esports_db < database/triggers.sql
```

#### 3. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure database connection in .env file
cp .env.example .env
# Edit .env with your MySQL credentials

# Run the FastAPI server
uvicorn app.main:app --reload
```

Backend will run at: `http://localhost:8000`  
API docs available at: `http://localhost:8000/docs`

#### 4. Set up the frontend

```bash
cd frontend
npm install

# Configure API endpoint
cp .env.example .env
# Edit .env with your backend URL

# Run the development server
npm start
```

Frontend will run at: `http://localhost:3000`

---

## 📊 Database Features

### Stored Procedures (Minimum 2 required)

1. `AddNewPlayer(team_id, nickname, role, real_name)` - Insert player with validation
2. `RecordMatchWinner(match_id, winner_team_id)` - Update match result
3. `GetPlayerKDA(player_id)` - Calculate player's KDA ratio
4. `GetTeamWinRate(team_id, tournament_id)` - Calculate team win percentage

### Triggers (Minimum 1 required)

1. `validate_match_winner` - Ensure winner is a valid participant
2. `audit_log_trigger` - Log all data modifications

### Views (Minimum 1 required)

1. `player_performance_view` - Aggregated player statistics
2. `team_rankings_view` - Team rankings by win rate

### Indexes (Performance Optimization)

- `idx_player_nickname` on `player(nickname)`
- `idx_match_date` on `match(match_date)`
- `idx_player_stats` on `match_player_stats(player_id)`

---

## 🔐 Security Implementation

### Database Level

- **User Roles:**
  - `admin_user` - Full privileges
  - `app_user` - CRUD operations only
  - `report_user` - SELECT only
- **Password Encryption:** SHA-256 hashing
- **Prepared Statements:** Prevent SQL injection

### Application Level

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- HTTPS enforcement (production)

---

## 📈 Performance Optimization

- **Indexing Strategy:** Indexes on foreign keys and frequently queried columns
- **Query Optimization:** Use of EXPLAIN to analyze query plans
- **Connection Pooling:** Efficient database connection management
- **Partitioning:** (Optional) Partition `match` table by year

---

## 🧪 Testing

### Database Testing

- Constraint validation
- Trigger functionality
- Stored procedure execution
- Performance benchmarks

### API Testing

- CRUD operations for all entities
- Authentication and authorization
- Error handling
- Response time measurements

### Frontend Testing

- Component rendering
- User interactions
- Data visualization accuracy

---

## 📚 Documentation

- **Database Design Document:** `docs/database_design.md`
- **API Documentation:** Auto-generated at `/docs` endpoint (Swagger UI)
- **User Manual:** `docs/user_manual.md`
- **Presentation Slides:** `docs/presentation.pdf` (Final submission)

---

## 🤝 Contributing

This is an academic project for VinUniversity Database Course. Team members should:

1. Create feature branches (`git checkout -b feature/your-feature`)
2. Commit with clear messages (`git commit -m "Add player CRUD endpoints"`)
3. Push to GitHub and create Pull Requests
4. Code review before merging to `main`

---

## 📝 License

This project is developed for educational purposes as part of the VinUniversity Database Final Project.

---

## 📧 Contact

For questions or feedback:

- **Team Email:** [22duc.lnc@vinuni.edu.vn.com]
- **Instructor:** Dr. Le Duy Dung
- **Course:** Database Systems (Fall 2024)

---

## 🙏 Acknowledgments

- **Data Source:** Oracle's Elixir (https://oracleselixir.com)
- **Riot Games:** League of Legends esports data
- **VinUniversity CECS Department**

---

**Last Updated:** December 1, 2024
