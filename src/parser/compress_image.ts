import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';

async function compress_image() {
    // Convert `import.meta.url` to a file path
    await imagemin(['src/ai/*.{jpeg,jpg,png}'], {
        destination: `src/parser`, // specify the destination folder
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.3, 0.5],
            }),
        ],
    });
}

export { compress_image };