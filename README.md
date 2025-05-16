# Mini ERP System for NetSuite Integration

A demonstration project showcasing my understanding of NetSuite's architecture and SuiteScript capabilities, implemented as a standalone manufacturing ERP system. This project serves as a portfolio piece for positions that build on top of NetSuite.

## NetSuite Knowledge Demonstrated

## Technology Stack

- **Backend**: Node.js + Express serving a RESTful API
- **Database**: PostgreSQL with Prisma ORM for data modeling
- **Frontend**: React with TailwindCSS for responsive UI
- **Authentication**: JWT-based with role-based permissions (similar to NetSuite roles)
- **Infrastructure**: Express middleware for SuiteScript-like functionality

## Getting Started

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment
cd ../backend
cp .env.example .env

# Run migrations and seed data
npx prisma migrate dev
npx prisma db seed

# Start servers
npm run dev     # Backend
cd ../frontend && npm run dev  # Frontend
```


## Screenshot
![8315209E-5957-4678-998D-D0B4691308CD](https://github.com/user-attachments/assets/a8286c5d-1ea1-4e46-ac90-6d1ebd864370)


## License

MIT License 
