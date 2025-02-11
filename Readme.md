# BuildInfra

**BuildInfra** simplifies construction materials management by letting you track, organize, and manage your materials, supporting Excel/CSV/PDF import-export for reporting and quick data entry.

## Tech Stack

**Frontend:**

- React, Next.js
- Tailwind CSS, shadcn/ui
- sonner, axios

**Backend:**

- Node.js, Express.js
- PostgreSQL

## Setup

### Prerequisites

- Node.js
- npm / pnpm or Yarn
- PostgreSQL

### Frontend

1. **Clone & Install:**
   ```bash
   git clone git@github.com:synntx/construction-material-management.git
   cd construction-material-management/frontend
   npm install
   ```
2. **Configure:**
   - Create a `.env.local` in the `frontend` root:
     ```env
     NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
     ```
3. **Run:**
   ```bash
   npm run dev
   ```
   The app runs at [http://localhost:3000](http://localhost:3000).

### Backend

1. **Navigate & Install:**
   ```bash
   cd ../backend
   npm install
   ```
2. **Migrate Database:**
   ```bash
   npx prisma migrate dev --name init
   ```
3. **Configure:**
   - Create a `.env` in the `backend` root with:
     ```env
     LOG_LEVEL=info
     JWT_SECRET=your_jwt_secret
     DATABASE_URI=postgresql://user:password@localhost:5432/buildinfra_db
     PORT=5000
     NODE_ENV=production
     REDIS_URL="redis://127.0.0.1:6379"
     PDF_SERVICE_URL="http://localhost:3002"
     ```
4. **Run:**
   ```bash
   npm run dev
   ```
   The backend is available at [http://localhost:5000](http://localhost:5000).

## Data Import & Export

- **Download:**
  - Excel (.xlsx), PDF (.pdf) and CSV (.csv) files via UI buttons.
- **Import:**
  - Upload Excel files from the Projects section using the "Import Excel" button or drag-and-drop
    excel(.xlsx) file directly anywhere in items section.

## Usage

- **Search:**
  - Find projects via the search bar in home tab.
  - Find materials in a specific project by search (used debounce)
- **Details:**
  - View material details by clicking projects in the home tab.
- **Export/Import:**
  - Use provided buttons to download or upload material data.

## Contact

- **Twitter (X):** [@harsh](https://x.com/harshyadavone)
