# BuildInfra

> **BuildInfra** is a web application designed to simplify construction material management. It enables users to efficiently track, organize, and manage their construction materials.
> BuildInfra empowers users with features like exporting data to Excel and CSV for reporting and analysis, as well as importing data from Excel to streamline material data entry processes.

## Technologies Used

- **Frontend:**

  - [`React`](https://reactjs.org/) - A JavaScript library for building user interfaces.
  - [`Next.js`](https://nextjs.org/) - React framework for building web applications with server-side rendering and more.
  - [`Tailwind CSS`](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
  - [`shadcn/ui`](https://ui.shadcn.com) - A library of accessible and reusable components for building modern web applications with Radix UI and Tailwind CSS, used for tabbed navigation and other UI elements.
  - [`sonner`](https://sonner.emilkowalski.com/) - For displaying user-friendly toast notifications (e.g., success/error messages for file downloads).
  - [`axios`](https://axios-http.com/) - For making HTTP requests to the backend API.

- **Backend:**

  - [Node.js](https://nodejs.org/) with [Express.js](https://www.google.com/url?sa=E&source=gmail&q=https://expressjs.com/) - A popular Node.js framework for building web applications and APIs.
  - [PostgreSQL](https://www.google.com/url?sa=E&source=gmail&q=https://www.postgresql.org/) - A robust open-source relational database system.

## Getting Started

Follow these steps to run the project locally:

**Prerequisites:**

- [Node.js](https://nodejs.org/) (version **18 or higher** recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) package manager
- **PostgreSQL** - Make sure you have PostgreSQL installed and a database instance is running.

**Frontend Setup:**

1.  **Clone the repository:**

    ```bash
    git clone git@github.com:synntx/construction-material-management.git
    cd construction-material-management/frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install # or yarn install
    ```

3.  **Environment Variables:**

    - Create a `.env.local` file in the root of your `frontend` directory.

    - Add the necessary environment variables. At a minimum, set the API base URL:

      ```env
      NEXT_PUBLIC_API_BASE_URL=http://localhost:3000  # update port accordingly
      ```

4.  **Run the development server:**

    ```bash
    npm run dev # or yarn dev
    ```

    The frontend application will be accessible at `http://localhost:3000`.

**Backend Setup :**

1.  **Navigate to the backend directory:**

    ```bash
    cd ../backend
    ```

2.  **Install backend dependencies:**

    ```bash
    npm install # or yarn install
    ```

    - migrate the schema

    ```bash
    npx prisma migrate dev --name init
    ```

3.  **Database Setup:**

    - This application is designed to connect to a PostgreSQL database.

    - **Option 1: Local PostgreSQL:**

      - Ensure you have PostgreSQL installed and running locally.
      - Create a database named `buildinfra_db` (or your preferred name).
      - Set the `DATABASE_URI` environment variable in your **backend's `.env` file** to your local PostgreSQL connection string. Example: `DATABASE_URI="postgresql://user:password@localhost:5432/buildinfra_db"`.

    - **Option 2: Supabase (or other cloud DB):**

      - If using Supabase (or another cloud database provider), obtain your `DATABASE_URI` and `DIRECT_URL` from your database provider's dashboard.
      - Set these environment variables in your **backend's `.env` file\`.**

    - **Backend Environment Variables:**

      - Create a `.env` file in the root of your `backend` directory.
      - Add the `DATABASE_URI` (and `DIRECT_URL` if using Supabase or similar) environment variables as described below.

      ```env
        LOG_LEVEL="info"

        JWT_SECRET=""

        DATABASE_URI="postgresql://postgres.adfahfiuahsfdij:PASSWORD@somewhere.com:6543/postgres?pgbouncer=true"

        JWT_SECRET="ahuahauh"

        PORT=5000

        APP_ORIGIN=""

        NODE_ENV="production"
      ```

4.  **Run the backend server:**

    ```bash
    npm run dev # or yarn dev
    ```

    The backend API will be accessible at `http://localhost:5000/`

## Data Import and Export

**File Download Functionality:**

The application allows users to download data in the following formats:

- **Excel (.xlsx):** Suitable for structured data with multiple sheets and rich formatting, ideal for reporting and complex data manipulation.
- **CSV (.csv):** Plain text format, comma-separated values, excellent for data import into other spreadsheet software, databases, and scripting.

To download a file:

1.  Click the 'Download Excel' or 'Download CSV' button within the application interface, typically found on pages displaying data tables or reports.
2.  Your browser will prompt you to save the file to your desired location.

**Excel Import Functionality:**

The application also supports importing data from Excel files, making it easy to populate your material database or update existing information.

To import an Excel file:

1.  Navigate to the "Projects" section click on any project or create a new one.
2.  Click the "Import Excel" button to open a file selection dialog, or drag and drop your Excel file directly onto the designated area.

## Usage

Here's a quick example of how to use BuildInfra:

1.  **Search for Materials:** In the main dashboard, use the search input to find specific construction materials (e.g., "cement," "bricks," "steel").
2.  **Explore Material Details:** Browse the search results in the "Items" tab. Click on a material item to view child Items.
3.  **Export Material Data:** On the item details page locate the "Download Excel" or "Download CSV" buttons. Click a button to download a report of the displayed material data in your chosen format.
4.  **Import Material Data from Excel:** In the project's item section, click the "Import Excel" button or drag and drop anywhere on page to quickly add a list of items from an Excel file.

## Contact

- **Twitter (X):** [@harsh](https://x.com/harshyadavone)

---
