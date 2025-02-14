async function checkFiles() {
    const paths = [
        '/data/cv.en.json',
        '/data/cv.fr.json',
        '/assets/js/main.js',
        '/assets/js/cv.js'
    ];

    console.group('File Access Check');
    for (const path of paths) {
        try {
            const response = await fetch(path);
            console.log(`${path}:`, {
                exists: response.ok,
                status: response.status,
                contentType: response.headers.get('content-type')
            });
        } catch (error) {
            console.error(`Error accessing ${path}:`, error);
        }
    }
    console.groupEnd();
}

checkFiles(); 