function extractTitleAndAuthor(data: any) {
    let book_name = "Unknown";
    let author = "Unknown";

    // Check in `info` property first
    if (data.info) {
        book_name = data.info.Title || book_name;
        author = data.info.Author || author;
    }

    // Check in `metadata` if not found in `info`
    if (book_name === "Unknown" || author === "Unknown") {
        const metadata = data.metadata?._metadata || {};
        book_name = metadata["dc:title"] || book_name;
        author = metadata["dc:creator"] || author;
    }

    return { book_name, author };
}

export { extractTitleAndAuthor }
