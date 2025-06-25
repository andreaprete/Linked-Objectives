# Linked-Objectives
Transparent, Semantic OKR Tool by the best international team ever!

Technologies we plan to use:

- next js (front, logic and authentication)
- graph db
- serverless (for beckend)
- github + vercel (docker for easy running)
- docker (for easy installation)


## DataBase for Data
- download GraphDB by Ontotex
- get a valid licence and upload it through the workbench
- workbench online (cool): https://graph.openbiodiv.net/
- set it up?
- pupolate?

## Database for Security ()
- Download Postgrers (https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)

## 🚀 User Authentication & Role-Based Access Setup (with Prisma + NextAuth)

Follow these steps to set up PostgreSQL authentication with role-based access using Prisma and NextAuth:

---

### 🔧 Local Setup Instructions

* **Install dependencies**:

  ```bash
  npm install next-auth @prisma/client @auth/prisma-adapter bcrypt
  ```

* **Initialize Prisma**:

  ```bash
  npx prisma init
  ```

* **Configure your `.env`** in the project root:

  ```env
  DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/myappdb"
  NEXTAUTH_SECRET="your-generated-secret"
  ```

* **Create a PostgreSQL user and database** via psql shell:

  ```sql
  DROP DATABASE IF EXISTS myappdb;
  DROP USER IF EXISTS myuser;
  CREATE USER myuser WITH PASSWORD 'mypassword';
  ALTER USER myuser WITH CREATEDB;
  CREATE DATABASE myappdb OWNER myuser;
  GRANT ALL PRIVILEGES ON DATABASE myappdb TO myuser;
  ```

* **Add the following to `prisma/schema.prisma`**:

  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  model User {
    id       String   @id @default(cuid())
    email    String   @unique
    password String
    role     String
    sessions Session[]
    accounts Account[]
  }

  model Session {
    id           String   @id @default(cuid())
    sessionToken String   @unique
    userId       String
    user         User     @relation(fields: [userId], references: [id])
    expires      DateTime
  }

  model Account {
    id                 String  @id @default(cuid())
    userId             String
    user               User    @relation(fields: [userId], references: [id])
    type               String
    provider           String
    providerAccountId  String
    access_token       String?
  }
  ```

* **Run the migration**:

  ```bash
  npx prisma migrate dev --name init
  ```

* **Generate the Prisma client**:

  ```bash
  npx prisma generate
  ```

* **Create a test user** in `prisma/seed.js`:

  ```js
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcrypt');

  const prisma = new PrismaClient();

  async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log("✅ Admin user created.");
  }

  main().finally(() => prisma.$disconnect());
  ```

* **Run the seed script**:

  ```bash
  node prisma/seed.js
  ```

---

Let me know when you're ready for the **NextAuth configuration and login UI instructions** – I’ll bundle that too for the README.
