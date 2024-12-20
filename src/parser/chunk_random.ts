function getRandomChunks(chunkArray: string[], count: number) {
    const randomChunks = [];

    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * chunkArray.length);
        const randomChunk = chunkArray[randomIndex];
        randomChunks.push(randomChunk);
    }

    return randomChunks;
}

function random_chunk(chunk_array: string[]) {
    const count: number = 32;
    return getRandomChunks(chunk_array, count);
}

export  {
    random_chunk,
};
