import * as crypto from 'crypto';
import multer from 'multer';
import * as fs from 'fs/promises';
import * as path from 'path';
import chunk from 'chunk-text';
import { parsePDF } from "../parser/pdf_to_text";
import { ai_blog_generator } from "../ai/ai_blog_generator";

import {
    upload_pdf,
    add_upload_book_entry,
    upload_pdf_chunk,
} from "../appwrite/appwrite";
import { getTokenCount } from '../parser/text_to_token_len';
import { createFileFromRandomChunks } from '../parser/createFileFromRandomChunks';
import { Request, Response } from 'express';

// Extend Express Request to include file
declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
        }
    }
}

interface UploadRequestBody {
    authorName: string;
    bookTitle: string;
    imageUrl: string;
    user_id: string;
}

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, "src/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

async function handleUpload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
        res.status(400).send("No file uploaded.");
        return
    }
    const {
        authorName: author,
        bookTitle: book_name,
        imageUrl: book_image,
        user_id,
    } = req.body as UploadRequestBody; // Extract additional fields

    const filepath = path.resolve(req.file.path);

    const text = await parsePDF(filepath);
    const tokenCount = await getTokenCount(text);

    console.log(tokenCount);

    if (tokenCount < 50_000) {
        await fs.unlink(filepath);
        res.status(400).send("Your Book is too small, try a bigger one");
        return;
    }

    try {
        const { $id: bookPDFId } = await upload_pdf(filepath);
        const pdf_link = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.BUCKET_ID}/files/${bookPDFId}/view?project=${process.env.APPWRITE_PROJECT_ID}&mode=admin`;
        const book_entry_data = {
            user_id, author, book_image, book_name, pdf_link,
        };

        res.status(200).send(`File uploaded successfully: ${req.file.filename}`);

        setImmediate(async () => {
            try {
                const { $id: bookEntryId } = await add_upload_book_entry(
                    book_entry_data
                );

                const chunked_text = chunk(text, 10000);
                const filePath = await createFileFromRandomChunks(chunked_text);

                const random_cache_model_name = `${crypto.randomUUID()}`;
                await ai_blog_generator({ filePath, displayName: random_cache_model_name, bookEntryId, user_id, });

                await fs.unlink(filepath);

                for (const chunkText of chunked_text) {
                    const chunk_data = {
                        chunk_text: chunkText,
                        books: bookEntryId,
                    };
                    await upload_pdf_chunk(chunk_data);
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error("Error in deferred execution:", error);
            }
        });
    } catch (err: any) {
        res.status(404).json({ error: err.message });
        return;
    }
}

const upload_pdf_route = [upload.single("pdf"), handleUpload];

export {
    upload_pdf_route,
};