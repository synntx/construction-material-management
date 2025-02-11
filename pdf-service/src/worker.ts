import { Worker, JobScheduler, Job } from "bullmq";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import express, {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import cors from "cors";
import "dotenv/config";

// ---------- Type Definitions ----------

interface BasicItem {
  id: number;
  projectId: string;
  code: string;
  name: string;
  unit: string;
  rate: number | string;
  avgLeadTime: number;
  subType: string;
  parentItemId: number | null;
  createdAt: string;
  updatedAt: string;
  childItems?: BasicItem[];
}

interface Project {
  id: string;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string;
  basicItems: BasicItem[];
}

interface PdfJobResult {
  filePath: string;
}

// ---------- Express Setup ----------

const app = express();
const downloadRouter = express.Router();

app.use(cors());
app.use(express.json());
app.use("/api", downloadRouter);
const PORT = process.env.PDF_SERVICE_PORT || 3002;

const connection = {
  host: process.env.UPSTASH_HOST,
  port: process.env.UPSTASH_PORT ? Number(process.env.UPSTASH_PORT) : 6379,
  password: process.env.UPSTASH_TOKEN,
  tls: {},
};

new JobScheduler("pdf-generation", { connection });

// ---------- Download Route ----------

const downloadHandler = async (
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "pdfs", filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "PDF not found" });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : err });
  }
};

downloadRouter.get("/download/:filename", downloadHandler);

// ---------- Worker Setup ----------

const worker = new Worker<Project, PdfJobResult>(
  "pdf-generation",
  async (job: Job<Project>) => {
    console.log(`Processing job ${job.id}`);
    try {
      const project = job.data;
      const filePath = await generatePdf(project);
      return { filePath };
    } catch (error: any) {
      console.error(`Error processing job ${job.id}:`, error.message);
      throw error;
    }
  },
  { connection }
);

worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed. PDF stored at ${result?.filePath}`);
});
worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});

console.log("PDF Worker is listening for jobs...");

// ---------- HTML & PDF Generation ----------

/**
 * Generates an HTML string for the given project.
 * Iterates over projet.basicItems and, fi found, their childItems.
 * @param project Project
 * @returns string
 */
function generateHtml(project: Project): string {
  let rowsHtml = "";

  project.basicItems.forEach((parent) => {
    rowsHtml += `
      <tr>
        <td><span class="code">${parent.code}</span></td>
        <td>${parent.name}</td>
        <td>${parent.unit}</td>
        <td>${parent.rate}</td>
        <td>${parent.avgLeadTime} ${
      parent.avgLeadTime === 1 ? "day" : "days"
    }</td>
        <td><span class="subtype-badge">${parent.subType}</span></td>
      </tr>
    `;

    if (parent.childItems && parent.childItems.length > 0) {
      parent.childItems.forEach((child) => {
        rowsHtml += `
          <tr class="child-row">
            <td><span class="code child-code">${child.code}</span></td>
            <td>${child.name}</td>
            <td>${child.unit}</td>
            <td>${child.rate}</td>
            <td>${child.avgLeadTime} ${
          child.avgLeadTime === 1 ? "day" : "days"
        }</td>
            <td><span class="subtype-badge">${child.subType}</span></td>
          </tr>
        `;
      });
    }
  });

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${project.name} Report</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          margin: 2rem;
          color: #1e293b;
          line-height: 1.5;
        }
        .header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .project-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }
        .report-date {
          font-size: 0.875rem;
          color: #64748b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
        }
        th {
          background-color: #f1f5f9;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #475569;
          font-size: 0.875rem;
          border-bottom: 2px solid #e2e8f0;
        }
        td {
          padding: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.875rem;
        }
        .code {
          font-family: 'Courier New', monospace;
          color: #2563eb;
          font-weight: 500;
        }
        .child-row {
          background-color: #f8fafc;
        }
        .child-row td:first-child {
          padding-left: 2rem;
        }
        .child-code {
          color: #64748b;
        }
        .subtype-badge {
          background-color: #f3e8ff;  
          color: #6b21a8;
        }
        @media print {
          body {
            margin: 1cm;
          }
          .header {
            margin-bottom: 1cm;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="project-title">${project.name}</div>
        <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Avg Lead Time</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
  </html>
`;
}

/**
 * Generates a PDF from the project data.
 *  @param project Project
 * @returns Promise<string>
 */
async function generatePdf(project: Project): Promise<string> {
  const jobId = uuidv4();
  const pdfDir = path.join(__dirname, "pdfs");
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  const filePath = path.join(pdfDir, `${project.name}-report-${jobId}.pdf`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const htmlContent = generateHtml(project);
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  await page.pdf({ path: filePath, format: "A4" });
  await browser.close();

  return filePath;
}

// ---------- Start Server ----------

app.listen(PORT, () => {
  console.log(`PDF service listening on port ${PORT}`);
});
