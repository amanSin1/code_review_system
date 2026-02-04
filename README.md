# Code Review System

> A production-ready collaborative code review platform for students and mentors with AI-powered analysis and real-time analytics.

🚀 **[Live Demo](https://code-review-system-frontend-v2.onrender.com/)** | 📚 **[API Documentation](https://code-review-backend-v1-2.onrender.com/docs)** | 🐳 **[Docker Hub](https://hub.docker.com/r/amansingh3413/code-review-system)**

Built with **FastAPI**, **PostgreSQL**, **React**, **Docker**, and **Google Gemini AI** — designed to showcase real backend engineering practices including role-based access control, optimized querying, AI integration, and containerized deployment.

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration & login with **JWT-based authentication**
- **Role-based access control** (Student, Mentor, Admin)
- Secure password hashing with bcrypt
- Token-based session management

### 📄 Code Submissions
**Students can:**
- Create and edit code submissions
- Add titles, descriptions, code content, and language tags
- Attach video walkthroughs for better context
- Track submission status (pending, reviewed, approved)

**Mentors can:**
- Review any submission with overall feedback and ratings
- Add line-level annotations for detailed feedback
- Access AI-powered code analysis insights

### 🤖 AI-Powered Code Analysis
- **Google Gemini AI integration** for automated code review
- Detects security vulnerabilities, bugs, and code smells
- Suggests best practices and optimizations
- **Rate-limited quota system** (10 analyses/day per user) to prevent abuse
- Returns confidence scores and detailed recommendations

### 📊 Analytics Dashboards
**Real-time visualizations using Recharts:**
- Submission trends over time
- Rating distribution patterns
- Code quality metrics by language
- Student performance analytics
- Mentor review statistics
- Active user metrics

**Role-specific dashboards:**
- **Students:** Personal submission history, ratings received, improvement trends
- **Mentors:** Review workload, average ratings given, feedback patterns
- **Admins:** Platform-wide metrics, user activity, system health

### 🎥 Video Walkthrough Submissions
- Students can record video explanations of their code
- Provides context for complex logic and design decisions
- Improves mentor understanding and reduces review time
- Enhances asynchronous communication

### 🏷️ Smart Tagging System
- Reusable tags (e.g., `python`, `django`, `security`, `performance`)
- Many-to-many relationships with optimized querying
- Filter submissions by tags and language

### 🔔 Notification System
- Database-backed notifications
- Automatic creation when:
  - Mentors review submissions
  - AI analysis completes
  - Comments are added
- Mark as read/unread functionality
- Real-time updates ready (extensible to WebSockets)

### ⚡ Performance & Scalability
- **Pagination** for large datasets (skip/limit parameters)
- **Indexed columns** for frequently queried fields
- **Eager loading** (`joinedload`) to eliminate N+1 query problems
- **Database connection pooling** for concurrent requests
- **60% response time reduction** through query optimization
- Strategic caching for analytics computations

### 🧪 Testing
- **Pytest-based test suite** with 90%+ coverage
- Isolated test database (no production impact)
- Tests for authentication, authorization, CRUD operations, and AI integration
- Automated testing in CI/CD pipeline

### 🐳 Fully Containerized
- **Docker Compose** orchestration for frontend + backend + database
- Environment-based configuration (`.env` for local, production configs for deployment)
- Published to **Docker Hub** for easy deployment
- **Deployed on Render** with PostgreSQL managed database
- Zero-downtime deployments with Alembic migrations

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend API** | FastAPI |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy |
| **Frontend** | React, TailwindCSS |
| **Visualization** | Recharts |
| **AI/ML** | Google Gemini API |
| **Authentication** | JWT (JSON Web Tokens) |
| **Migrations** | Alembic |
| **Rate Limiting** | SlowAPI |
| **Testing** | Pytest |
| **Containerization** | Docker, Docker Compose |
| **Deployment** | Render (Frontend + Backend + PostgreSQL) |

---

## 📂 Project Structure

```
code-review-system/
├── app/                          # Backend application
│   ├── api/
│   │   └── routes/              # API endpoints
│   │       ├── auth.py
│   │       ├── submissions.py
│   │       ├── reviews.py
│   │       ├── analytics.py
│   │       └── ai_analysis.py
│   ├── models/                  # SQLAlchemy models
│   ├── schemas/                 # Pydantic schemas
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logger.py
│   │   └── rate_limiter.py
│   ├── services/                # Business logic
│   │   ├── ai_service.py
│   │   └── analytics_service.py
│   ├── database.py
│   ├── oauth2.py
│   └── main.py
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── alembic/                     # Database migrations
├── tests/                       # Test suite
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── entrypoint.sh
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)
- Google Gemini API Key

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/amanSin1/ocde_review_system.git
   cd code_review_system
   ```

2. **Set up environment variables**
   
   Create `.env.docker` file:
   ```env
   DATABASE_URL=postgresql://postgres:password@db:5432/code_review_db
   SECRET_KEY=your-super-secret-key-min-32-chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GEMINI_API_KEY=your-gemini-api-key
   RATE_LIMIT_ENABLED=True
   ENVIRONMENT=production
   ```

3. **Build and run**
   ```bash
   docker compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/amanSin1/ocde_review_system.git
   cd code_review_system
   ```

2. **Backend setup**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create PostgreSQL database
   createdb code_review_db
   
   # Create .env file
   cat > .env << EOF
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/code_review_db
   SECRET_KEY=$(openssl rand -hex 32)
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GEMINI_API_KEY=your-gemini-api-key
   RATE_LIMIT_ENABLED=True
   ENVIRONMENT=development
   EOF
   
   # Run migrations
   alembic upgrade head
   
   # Start backend server
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   
   # Create .env file
   echo "REACT_APP_API_URL=http://localhost:8000" > .env
   
   # Start frontend
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## 🧪 Running Tests

```bash
# Activate virtual environment
source venv/bin/activate

# Run all tests
pytest -v

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v
```

All tests run against an isolated test database and don't affect production data.

---

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Submissions
- `POST /submissions` - Create new submission
- `GET /submissions` - List submissions (with filters)
- `GET /submissions/{id}` - Get submission details
- `PUT /submissions/{id}` - Update submission
- `DELETE /submissions/{id}` - Delete submission

### Reviews
- `POST /reviews` - Create review for a submission
- `GET /reviews/{submission_id}` - Get reviews for submission
- `POST /reviews/{review_id}/annotations` - Add line-level annotation

### AI Analysis
- `POST /ai/analyze/{submission_id}` - Analyze code with AI
- `GET /ai/analysis/{submission_id}` - Get AI analysis results

### Analytics
- `GET /analytics/submissions` - Submission trends
- `GET /analytics/ratings` - Rating distribution
- `GET /analytics/quality-metrics` - Code quality metrics
- `GET /analytics/user-stats` - User activity statistics

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/{id}/read` - Mark notification as read

For detailed API documentation with request/response examples, visit the **[Live API Docs](https://code-review-backend-v1-2.onrender.com/docs)**.

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SECRET_KEY` | JWT secret key (min 32 chars) | Yes |
| `ALGORITHM` | JWT algorithm (HS256) | Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry time | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `RATE_LIMIT_ENABLED` | Enable API rate limiting | No |
| `ENVIRONMENT` | Environment (development/production) | No |

**Generate SECRET_KEY:**
```bash
openssl rand -hex 32
# Or
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🎯 Demo Credentials

Try the live application with these demo accounts:

**Student Account:**
- Email: `demo@student.com`
- Password: `demo123`

**Mentor Account:**
- Email: `mentor@demo.com`
- Password: `demo123`

---

## 🧠 Key Engineering Decisions

### Backend Architecture
- **Role-based authorization at query level**, not just frontend — prevents unauthorized data access
- **No redundant mentor-student mapping** — mentors can review any submission (scalable design)
- **Explicit Pydantic serialization** instead of dumping ORM objects — prevents data leaks
- **Database-backed notifications** — easily extensible to WebSockets for real-time updates

### Performance Optimizations
- **Eager loading with `joinedload`** — eliminates N+1 query problems
- **Strategic indexing** on high-read columns (status, language, user_id)
- **Pagination** for all list endpoints
- **Connection pooling** for concurrent request handling
- **Reduced API response time by 60%** (from 500ms to 200ms average)

### AI Integration
- **Rate limiting** to prevent API quota abuse
- **Async processing** for AI analysis (non-blocking)
- **Confidence scores** for AI recommendations
- **Fallback handling** when AI service is unavailable

### Security
- **JWT with expiration** and refresh token support
- **Password hashing** with bcrypt
- **SQL injection prevention** via SQLAlchemy ORM
- **CORS configuration** for frontend-backend communication
- **Input validation** with Pydantic schemas

### DevOps
- **Multi-stage Docker builds** for optimized image size
- **Environment-based configuration** (local, staging, production)
- **Database migrations** with Alembic for version control
- **Health check endpoints** for monitoring
- **Deployed on Render** with managed PostgreSQL

---

## 📈 Metrics & Analytics

The analytics dashboard provides insights into:
- **Submission volume** over time
- **Average rating trends** by language and mentor
- **Code quality improvements** tracked per student
- **Most common vulnerabilities** detected by AI
- **Review turnaround time** metrics
- **Active users** and engagement rates

All analytics use **complex SQLAlchemy aggregation queries** with proper indexing for fast performance.

---

## 🐳 Docker Deployment

### Pull from Docker Hub
```bash
docker pull amansingh3413/code-review-system
```

### Run with Docker Compose
```bash
docker compose up -d
```

### View logs
```bash
docker compose logs -f
```

### Stop services
```bash
docker compose down
```

---

## 🔮 Future Enhancements

- [ ] WebSocket real-time notifications
- [ ] Review versioning and edit history
- [ ] Code diff visualization
- [ ] Automated code formatting suggestions
- [ ] Multi-language AI analysis support
- [ ] Mentor assignment algorithm
- [ ] Submission deadline tracking
- [ ] GitHub integration for direct PR reviews
- [ ] Advanced analytics with ML predictions
- [ ] Export reports as PDF

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Aman Singh**

Backend-focused developer specializing in Python, FastAPI, and PostgreSQL

- LinkedIn: [linkedin.com/in/aman-singh-423b1b192](https://www.linkedin.com/in/aman-singh-423b1b192/)
- GitHub: [github.com/amanSin1](https://github.com/amanSin1)
- Email: amanboe1@gmail.com

---

## 🙏 Acknowledgments

- FastAPI for the excellent async framework
- Google Gemini AI for code analysis capabilities
- Render for reliable hosting infrastructure
- The open-source community for inspiration

---

**⭐ If you find this project helpful, please star the repository!**

---

## 📸 Screenshots

### Dashboard Analytics
*[Add screenshot of analytics dashboard]*

### Code Submission
*[Add screenshot of submission form]*

### AI Analysis Results
*[Add screenshot of AI analysis]*

### Review Interface
*[Add screenshot of review interface]*

---

**Built with ❤️ using FastAPI, React, and PostgreSQL**
