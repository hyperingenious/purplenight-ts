import { Request, Response } from 'express';
import {
    get_book_document_by_id,
    get_all_blog_ids_match_book_id,
    delete_book_entry_by_id,
    get_all_chunk_ids_with_book_id,
    add_deletion_entry,
} from "../appwrite/appwrite"

function extractFileId(url: string) {
    const match = url.match(/files\/([^/]+)/);
    return match ? match[1] : '';
}

async function deleteContent(req: Request, res: Response): Promise<void> {
    const id = req.body.id;
    console.log(`Received request to delete content with ID: ${id}`);

    try {
        console.log("Fetching document and associated IDs...");
        const { pdf_link } = await get_book_document_by_id(id);
        console.log(`Fetched document with PDF link: ${pdf_link}`);

        const file_id: string | null = extractFileId(pdf_link);
        console.log(`Extracted file ID: ${file_id}`);

        const chunk_ids = await get_all_chunk_ids_with_book_id(id);
        console.log(`Fetched ${chunk_ids?.length} chunk IDs to delete.`);

        const blog_ids = await get_all_blog_ids_match_book_id(id);
        console.log(`Fetched ${blog_ids?.length} blog IDs to delete.`);

        console.log(`Deleting main book entry with ID: ${id}`);
        await delete_book_entry_by_id(id);
        console.log("Main book entry deleted successfully.");

        console.log("Deletion entry initiated");
        await add_deletion_entry({
            file_id,
            chunk_id_array: chunk_ids,
            blog_id_array: blog_ids,
        });

        console.log("Initial deletions complete, sending response.");
        res.status(200).json({
            message: "Initial tasks complete, background deletions initiated",
        });
    } catch (error: any) {
        console.error("Error in deletion process:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
}

export {
    deleteContent,
};
