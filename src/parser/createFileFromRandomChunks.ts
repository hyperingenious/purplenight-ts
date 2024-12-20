import { random_chunk } from "./chunk_random";
import * as crypto from 'crypto'
import * as fs from 'fs/promises'
import * as path from 'path'
import { get_chunk_by_id } from "../appwrite/appwrite";

async function createFileFromRandomChunksGenerateContent(chunkIds: string[]) {
    const random_20_percent_chunkids = random_chunk(chunkIds);
    let random_20_percent_chunk_text = ``;
    const divider = "========================================================";

    for (const chunkId of random_20_percent_chunkids) {
        try {
            const chunk = await get_chunk_by_id(chunkId);
            random_20_percent_chunk_text += `${divider}\n${chunk.chunk_text}\n`;
        } catch (error: any) {
            console.error(
                `Error retrieving chunk with ID ${chunkId}: ${error.message}`
            );
        }
    }

    const fileName = `${crypto.randomUUID()}.txt`;
    const filePath = path.resolve(fileName);
    await fs.writeFile(fileName, random_20_percent_chunk_text);

    return filePath;
}

async function createFileFromRandomChunks(chunked_text: string[]) {
    const random_chunks = random_chunk(chunked_text);
    let random_text = ``;

    for (let i = 0; i < random_chunks.length; i++) {
        const divider = "========================================================";
        random_text += `${divider} ${random_chunks[i]}`;
    }

    const fileName = `${crypto.randomUUID()}.txt`;
    const filePath = path.resolve(fileName);
    await fs.writeFile(fileName, random_text);

    return filePath;
}

export {
    createFileFromRandomChunksGenerateContent,
    createFileFromRandomChunks,
};
