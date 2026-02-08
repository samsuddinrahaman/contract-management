# Contract Management Platform

A full-stack contract management system with blueprint templates, contract lifecycle management, and a clean dashboard interface.

## Features

- **Blueprint Management**: Create contract templates with custom fields (Text, Date, Signature, Checkbox)
- **Contract Lifecycle**: Full state machine with transitions (Created → Approved → Sent → Signed → Locked)
- **Dashboard**: Overview of contracts, statistics, and recent activity
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Type Safety**: Full TypeScript support throughout the stack

## Tech Stack

### Backend
- **Runtime**: Node.js 22 LTS
- **Framework**: Express.js 5.x
- **Database**: Supabase (PostgreSQL 16+)
- **ORM**: Prisma 6.x
- **Validation**: Zod 3.25+
- **Type Safety**: TypeScript 5.7+

### Frontend
- **Framework**: Next.js 16 (App Router)
- **React**: React 19+
- **Build Tool**: Turbopack
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui 2.x
- **State Management**: TanStack Query v6

### Infrastructure
- **Package Manager**: pnpm 10.x
- **Monorepo**: Turborepo 2.x

## Project Structure

```
contract-management-platform/
├── apps/
│   ├── backend/          # Express API
│   │   ├── src/
│   │   │   ├── config/   # Database & env config
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── prisma/
│   │       └── schema.prisma
│   └── frontend/         # Next.js 16 App
│       ├── src/
│       │   ├── app/      # Next.js App Router
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── types/
│       └── next.config.ts
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

## Quick Start

### Prerequisites

- Node.js 22+ 
- pnpm 10+
- Supabase account (free tier works fine)

### 1. Clone and Install

```bash
git clone <repository-url>
cd contract-management-platform
pnpm install
```

### 2. Setup Environment Variables

#### Backend (apps/backend/.env)

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` with your Supabase credentials:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Get these values from your Supabase project dashboard:
1. Go to Settings → Database
2. Copy the connection strings
3. Replace `[ref]` with your project reference
4. Replace `[password]` with your database password
5. Replace `[region]` with your project region

#### Frontend (apps/frontend/.env.local)

```bash
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Setup Database

```bash
cd apps/backend
pnpm db:generate
pnpm db:migrate
```

This will create all necessary tables in your Supabase database.

### 4. Run Development Servers

From the root directory:

```bash
pnpm dev
```

This will start both servers:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Available Scripts

### Root (Turborepo)

```bash
pnpm dev        # Start all apps in development mode
pnpm build      # Build all apps for production
pnpm lint       # Run ESLint on all apps
pnpm typecheck  # Run TypeScript type checking
```

### Backend

```bash
cd apps/backend

pnpm dev          # Development with hot reload
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
pnpm db:push      # Push schema changes (dev only)
pnpm build        # Build for production
pnpm start        # Start production server
```

### Frontend

```bash
cd apps/frontend

pnpm dev      # Development with Turbopack
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Contract Lifecycle

The system enforces a strict state machine for contracts:

```
CREATED → APPROVED → SENT → SIGNED → LOCKED
   ↓         ↓         ↓
REVOKED   REVOKED   REVOKED
```

### Valid Transitions

- **CREATED** → APPROVED, REVOKED
- **APPROVED** → SENT, REVOKED
- **SENT** → SIGNED, REVOKED
- **SIGNED** → LOCKED
- **LOCKED** → (terminal state)
- **REVOKE** → (terminal state)

## API Endpoints

### Blueprints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blueprints` | List all blueprints |
| GET | `/api/blueprints/:id` | Get blueprint by ID |
| POST | `/api/blueprints` | Create new blueprint |
| PUT | `/api/blueprints/:id` | Update blueprint |
| DELETE | `/api/blueprints/:id` | Delete blueprint |

### Contracts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contracts` | List all contracts (with optional `?status=` filter) |
| GET | `/api/contracts/:id` | Get contract by ID |
| POST | `/api/contracts` | Create contract from blueprint |
| PATCH | `/api/contracts/:id/status` | Update contract status |
| PATCH | `/api/contracts/:id/values` | Update contract field values |
| DELETE | `/api/contracts/:id` | Delete contract |
| GET | `/api/contracts/:id/audit-logs` | Get contract audit logs |

## Database Schema

### Blueprints
- `id`: UUID (PK)
- `name`: String
- `description`: String (optional)
- `fields`: BlueprintField[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Blueprint Fields
- `id`: UUID (PK)
- `blueprintId`: UUID (FK)
- `type`: Enum (TEXT, DATE, SIGNATURE, CHECKBOX)
- `label`: String
- `positionX`: Int
- `positionY`: Int
- `required`: Boolean

### Contracts
- `id`: UUID (PK)
- `name`: String
- `blueprintId`: UUID (FK)
- `status`: Enum (CREATED, APPROVED, SENT, SIGNED, LOCKED, REVOKED)
- `values`: ContractValue[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Development

### Adding shadcn Components

```bash
cd apps/frontend
pnpm dlx shadcn@latest add [component-name]
```

### Database Migrations

After modifying `schema.prisma`:

```bash
cd apps/backend
pnpm db:migrate --name [migration-name]
```

## Deployment

### Backend Options

1. **Railway** (Recommended for Node.js)
2. **Render** (Good free tier)
3. **Fly.io** (Great performance)
4. **AWS ECS/Fargate** (Enterprise scale)

### Frontend (Vercel)

1. Connect your GitHub repository
2. Set build command: `cd apps/frontend && pnpm build`
3. Set output directory: `apps/frontend/.next`
4. Add environment variables

### Environment Variables for Production

```env
# Backend
DATABASE_URL=postgresql://... # Use Supabase pooler
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Frontend
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
```

## Troubleshooting

### Database Connection Issues

1. Verify Supabase credentials in `.env`
2. Ensure Connection Pooler is enabled in Supabase
3. Check firewall settings allow connections from your IP

### Prisma Issues

```bash
# Regenerate client
cd apps/backend
pnpm db:generate

# Reset database (development only!)
pnpm db:push --force-reset
```

### Build Errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
