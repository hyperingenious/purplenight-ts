import { config } from "dotenv";
config()
import express from "express";
import cors from 'cors'
import cron from 'node-cron'

import { upload_pdf_route } from "./routes/upload";
import { startup } from './startup/startup'
import { generateContent } from "./routes/generate_content";
import { deleteContent } from "./routes/delete_content";
import {
    get_all_deletion_entries,
    delete_blog_by_id,
    delete_chunk_by_id,
    delete_file_by_id,
    delet_deletion_entry,
} from "./appwrite/appwrite"

import { CONTENT_DELETION_GAP } from "./config/config";
import axios from "axios";
const app = express();
const PORT = process.env.PORT || 3000;
const SELF_HOSTED_URL = "https://quotes-server-z2fk.onrender.com/";

// Ping the app every 10 minutes (10 * 60 * 1000 ms)
setInterval(() => {
    axios
        .get(SELF_HOSTED_URL)
        .then(() => console.log(`Self-pinged ${SELF_HOSTED_URL} successfully`))
        .catch((error) => console.error("Self-ping failed:", error.message));
}, 10 * 60 * 1000); // Adjust interval as needed

// Initialize application
startup();

console.log(__dirname);

// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://purplenight.vercel.app",
    "https://hyperingenious.tech",
    "https://purplenight.hyperingenious.tech",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
    })
);

app.use(express.json());

// Function to delete chunks and blogs
async function processDeletion(entry: any) {
    try {
        const chunk_ids = JSON.parse(entry.chunk_ids);
        const blog_ids = JSON.parse(entry.blog_ids);
        const file_id = entry.file_id;

        console.log(`Starting deletion process for file with ID: ${file_id}`);
        await delete_file_by_id(file_id);
        console.log(`File with ID: ${file_id} deleted successfully.`);

        await deleteChunks(chunk_ids, file_id);
        await deleteBlogs(blog_ids, file_id);
        await delet_deletion_entry(entry.$id);
        console.log(`Deletion process completed for file with ID: ${file_id}`);
    } catch (error) {
        console.error(
            `Error processing deletion for entry ID: ${entry.$id}`,
            error
        );
    }
}

// Function to delete chunks
async function deleteChunks(chunk_ids: string, file_id: string) {
    try {
        if (chunk_ids && chunk_ids.length > 0) {
            for (const chunk_id of chunk_ids) {
                console.log(
                    `Deleting chunk with ID: ${chunk_id} for file ID: ${file_id}`
                );
                await delete_chunk_by_id(chunk_id);
                console.log(`Chunk with ID: ${chunk_id} deleted.`);
                // Uncomment the following line for a delay
                await new Promise((resolve) =>
                    setTimeout(resolve, CONTENT_DELETION_GAP)
                );
            }
        } else {
            console.log(`No chunks to delete for file ID: ${file_id}`);
        }
    } catch (error) {
        console.error(`Error deleting chunks for file ID: ${file_id}`, error);
    }
}

// Function to delete blogs
async function deleteBlogs(blog_ids: string, file_id: string) {
    try {
        if (blog_ids && blog_ids.length > 0) {
            for (const blog_id of blog_ids) {
                console.log(
                    `Deleting blog with ID: ${blog_id} for file ID: ${file_id}`
                );
                await delete_blog_by_id(blog_id);
                console.log(`Blog with ID: ${blog_id} deleted.`);
                // Uncomment the following line for a delay
                await new Promise((resolve) =>
                    setTimeout(resolve, CONTENT_DELETION_GAP)
                );
            }
        } else {
            console.log(`No blogs to delete for file ID: ${file_id}`);
        }
    } catch (error) {
        console.error(`Error deleting blogs for file ID: ${file_id}`, error);
    }
}

// Runs from 12am to 6am
cron.schedule("*/10 0-5 * * *", async () => {
    try {
        const deletion_entries = await get_all_deletion_entries();
        if (deletion_entries.length < 1) {
            console.log("No deletion entries found.");
            return;
        }

        for (const entry of deletion_entries) {
            console.log(`Processing entry: ${JSON.stringify(entry)}`);
            await processDeletion(entry);
        }
    } catch (error) {
        console.error("Error in cron job execution:", error);
    }
});

// Route definitions
app.post("/upload", upload_pdf_route);
app.post("/generate-content", generateContent);
app.post("/delete-content", deleteContent);

// Basic route
app.get("/", (_, res) => {
    res.send("<h1>Hello World</h1>");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})