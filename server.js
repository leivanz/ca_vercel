const express = require('express');
const path = require('path');
const fs = require('fs'); // Required to read the file directory
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use('/download', express.static('files'));

app.get('/api/search', (req, res) => {
    // 1. Get the email and format it to lowercase to avoid case-sensitivity issues
    const searchEmail = req.query.email.trim().toLowerCase();
    
    // 2. Define the path to your files folder
    const filesDirectory = path.join(__dirname, 'files');

    // 3. Read everything inside the 'files' folder
    fs.readdir(filesDirectory, (err, files) => {
        if (err) {
            console.error("Could not read directory", err);
            return res.json({ success: false, message: 'Server error reading files.' });
        }

        // 4. Look for a file whose name (without the extension) matches the email
        const matchedFile = files.find(file => {
            // path.parse('test@email.com.pdf').name returns 'test@email.com'
            const fileNameWithoutExtension = path.parse(file).name.toLowerCase();
            return fileNameWithoutExtension === searchEmail;
        });

        // 5. Return the result
        if (matchedFile) {
            res.json({
                success: true,
                fileName: matchedFile,
                downloadUrl: `/download/${matchedFile}`
            });
        } else {
            res.json({
                success: false,
                message: 'No file associated with this email.'
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});