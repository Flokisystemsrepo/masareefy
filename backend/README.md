# Pulse Finance Backend

A robust SaaS financial management platform backend built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

- **Multi-tenant Architecture**: Support for multiple brands/organizations
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Subscription Management**: Stripe integration with trial periods
- **Financial Tracking**: Receivables, payables, revenues, costs
- **Inventory Management**: Product tracking and stock management
- **Project Targets**: Goal setting and progress tracking
- **Real-time Updates**: WebSocket support for live dashboard updates
- **File Upload**: Secure file storage with AWS S3
- **Audit Logging**: Complete audit trail for all operations

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Payment**: Stripe
- **Real-time**: Socket.io
- **Email**: SendGrid
- **File Storage**: AWS S3
- **Validation**: Joi
- **Testing**: Jest + Supertest

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pulse_finance"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Add other required environment variables...
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith"
}
```

#### Change Password

```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Health Check

```http
GET /health
```

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: User accounts and authentication
- **Brands**: Multi-tenant organizations
- **BrandUsers**: User-brand relationships with roles
- **Subscriptions**: User subscription plans
- **Plans**: Available subscription tiers
- **Receivables/Payables**: Money owed to/by the business
- **Revenues/Costs**: Income and expenses
- **Inventory**: Product stock management
- **ProjectTargets**: Goal setting and tracking
- **AuditLogs**: Complete audit trail

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Joi schema validation for all inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Helmet.js security headers
- **Role-based Access Control**: Fine-grained permissions

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed initial data
- `npm run db:studio` - Open Prisma Studio

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Database seeding
│   └── migrations/      # Database migrations
├── tests/               # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Development Workflow

1. **Feature Development**:

   - Create feature branch
   - Implement changes
   - Add tests
   - Update documentation
   - Submit pull request

2. **Database Changes**:

   - Update Prisma schema
   - Generate migration: `npm run db:migrate`
   - Update seed data if needed
   - Test migrations

3. **API Development**:
   - Define types in `src/types/`
   - Create service in `src/services/`
   - Implement controller in `src/controllers/`
   - Add routes in `src/routes/`
   - Add validation schemas

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set in production:

- Database connection string
- JWT secrets
- Stripe API keys
- AWS S3 credentials
- SendGrid API key
- Redis connection string

### Database Migration

```bash
npm run db:migrate
npm run db:seed
```

### Build and Start

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the documentation
- Review the progress tracking file
- Create an issue in the repository

---

**Pulse Finance Backend** - Building the future of financial management 🚀
