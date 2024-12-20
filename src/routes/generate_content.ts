import { get_all_chunk_ids_with_book_id } from "../appwrite/appwrite";
import { ai_blog_generator } from "../ai/ai_blog_generator"
import * as crypto from 'crypto'
import { createFileFromRandomChunksGenerateContent } from "../parser/createFileFromRandomChunks";
import * as fs from 'fs/promises'
import { Request, Response } from "express";

async function generateContent(req: Request, res: Response): Promise<void> {
    console.log(req.query);
    const { id: book_id, user_id
    } = req.query;

    if (!book_id) {
        res.status(400).json({ message: "Book ID is required" });
        return;
    }

    console.log(`Generating content for book with ID: ${book_id}`);

    let random_file_name; // Declare the file name variable outside of try-catch

    try {
        const chunkIds = await get_all_chunk_ids_with_book_id(book_id);
        if (chunkIds.length === 0) {
            console.log(`No chunks found for book with ID: ${book_id}`);
            res.status(404).json({ message: "No chunks found for this book" });
            return;
        }

        const filePath = await createFileFromRandomChunksGenerateContent(chunkIds);

        const random_cache_model_name = `${crypto.randomUUID()}`;
        await ai_blog_generator({
            filePath,
            displayName: random_cache_model_name,
            bookEntryId: book_id.toString(),
            user_id: user_id?.toString() || '',
        });

        console.log(`Content generated successfully for book with ID: ${book_id}`);
        res.status(200).json({ message: "Content generated successfully" });
        return;
    } catch (error: any) {
        console.error(`Error generating content: ${error.message}`);
        res.status(500).json({ message: "Internal server error" });
        return;
    } finally {
        // Cleanup: delete the created file if it exists
        if (random_file_name) {
            try {
                await fs.unlink(random_file_name);
                console.log(`Deleted temporary file: ${random_file_name}`);
            } catch (cleanupError: any) {
                console.error(`Error deleting file: ${cleanupError.message}`);
            }
        }
    }
}

export {
    generateContent,
};
