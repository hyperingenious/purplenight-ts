import imagemin from 'imagemin';
import * as fs from 'fs';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';

async function compress_image() {
    // Convert `import.meta.url` to a file path
    const [{ data }] = await imagemin(['src/ai/*.{jpeg,jpg,png}'], {
        destination: `src/parser`, // specify the destination folder
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.3, 0.5],
            }),
        ],
    });

    // // Saving the image data to a file
    // fs.writeFile(`${__dirname}/src/parser/output.png`, data, (err) => {
    //     if (err) {
    //         console.error('Error saving image:', err);
    //     } else {
    //         console.log(`Image saved successfully to `);
    //     }
    // })
}

export { compress_image };