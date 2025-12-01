# 🎮 LoL Esports Tournament & Match Analytics System

[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A comprehensive database management system for tracking League of Legends esports tournaments, teams, players, matches, and performance analytics.

---

## 📄 Project Overview

### Problem Statement

The esports industry generates massive amounts of historical match data, but there is no simple, centralized system for fans and analysts to:

- Browse historical tournament results and standings
- Compare player and team performance across seasons
- Visualize statistical trends and patterns
- Access comprehensive match statistics in one place

### Solution

Our system provides a simple full-stack database application that:

- Stores historical esports tournament data in a normalized MySQL database (sourced from Oracle's Elixir)
- Enables easy browsing of teams, players, tournaments, and match results
- Provides analytics on player performance (KDA, win rates, champion picks)
- Visualizes data through interactive charts and dashboards
- Implements role-based access control for different user types
- Ensures data integrity through database constraints, stored procedures, and triggers

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

- Query response time < 1s for most operations
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
team_id (PK)
team_name
```

Stores information about esports teams.

### 2. **Player**

```
player_id (PK)
team_id (FK)
player_name
role
```

Tracks individual players and their team affiliations.

### 3. **Tournament**

```
tournament_id (PK)
league
year
split
is_playoffs
```

Represents esports tournaments and events.

### 4. **Match**

```
match_id (PK)       -- gameid
tournament_id (FK)
match_date
patch
game_length
winner_team_id (FK)
```

Records individual matches within tournaments.

### 5. **Team_Tournament** (Associative Entity)

```
team_id (FK)
tournament_id (FK)

PK(team_id, tournament_id)
```

Many-to-many relationship: teams participate in multiple tournaments.

### 6. **Match_Player_Stats** (Associative Entity)

```
match_id (FK)
player_id (FK)
champion
kills
deaths
assists
gold_earned
damage_dealt
cs_total
vision_score

PK(match_id, player_id)
```

Many-to-many relationship: tracks player performance in each match.

### Entity Relationship Diagram (ERD)

_Full ERD will be included in the design document (Dec 15 submission)._

---

## 🔧 Planned Tech Stack

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

| Name                     | Student ID | Role                         | Responsibilities                                                                |
| ------------------------ | ---------- | ---------------------------- | ------------------------------------------------------------------------------- |
| **Luu Nguyen Chi Duc**   | V202200664 | **Project Lead & Developer** | Database design (ERD, DDL), FastAPI implementation, stored procedures, triggers |
| **Nguyen Dai Nghia**     | V202200779 | **Full Stack Developer**     | React UI development, data visualization, responsive design                     |
| **Nguyen Tuan Minh**     | V202401627 | **Database Admin**           | Data import, indexing, query optimization, security configuration               |
| **Nguyen Pham Tuan Anh** | V202401425 | **QA & Documentation**       | Testing (CRUD, analytics), documentation, presentation slides                   |

_Note: Roles are flexible and team members will collaborate across all areas._

---

## 📅 Project Timeline

| Milestone                                    | Deadline  | Deliverables                                                        | Status     |
| -------------------------------------------- | --------- | ------------------------------------------------------------------- | ---------- |
| **Week 1:** Team Formation & Topic Selection | Dec 1     | GitHub repo, README.md, Team registration                           | 🟢 Done    |
| **Week 2:** Peer Review                      | Dec 8     | Review other teams' proposals, incorporate feedback                 | ⬜ Pending |
| **Week 3:** Design Document                  | Dec 15    | Complete ERD, DDL scripts, normalized schema, task division         | ⬜ Pending |
| **Week 4:** Backend Implementation           | Dec 16-18 | FastAPI setup, database deployment, stored procedures, triggers     | ⬜ Pending |
| **Week 5:** Frontend Development             | Dec 18-20 | React components, CRUD pages, analytics dashboard                   | ⬜ Pending |
| **Week 6:** Integration & Testing            | Dec 20-21 | Connect frontend to backend, end-to-end testing, performance tuning | ⬜ Pending |
| **Week 7:** Final Submission & Presentation  | Dec 22    | Slides, final report, GitHub repo, live demo                        | ⬜ Pending |

_Note: Milestones are subject to change based on team progress and feedback._

---

## 📝 License

This project is developed for educational purposes as part of the VinUniversity Database Final Project.

---

## 📧 Contact

For questions or feedback:

- **Team Email:** [22duc.lnc@vinuni.edu.vn.com]
- **Instructor:** Dr. Le Duy Dung
- **Course:** Database Systems (Fall 2025)

---

## 🙏 Acknowledgments

- **Data Source:** Oracle's Elixir (https://oracleselixir.com)
- **Riot Games:** League of Legends esports data
- **VinUniversity CECS Department**

---

**Last Updated:** December 1, 2025
