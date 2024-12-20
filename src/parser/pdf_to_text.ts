import * as fs from 'fs'
import PdfParse from 'pdf-parse';

const parsePDF = async (filepath: string) => {
    try {
        const dataBuffer = fs.readFileSync(filepath);
        return PdfParse(dataBuffer).then((data) => data.text);
    } catch (error) {
        console.error("Problem in parsing text");
        throw error;
    }
};

export {
    parsePDF,
};
