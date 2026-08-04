const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use('/download', express.static('files'));

app.get('/api/search', (req, res) => {
    const searchEmail = req.query.email ? req.query.email.trim().toLowerCase() : '';
    
    // process.cwd() resolves correctly in Vercel's serverless environment
    const filesDirectory = path.join(process.cwd(), 'files');

    if (!fs.existsSync(filesDirectory)) {
        return res.json({ success: false, message: 'Files directory not found.' });
    }

    fs.readdir(filesDirectory, (err, files) => {
        if (err) {
            console.error("Could not read directory", err);
            return res.json({ success: false, message: 'Server error reading files.' });
        }

        const matchedFile = files.find(file => {
            const fileNameWithoutExtension = path.parse(file).name.toLowerCase();
            return fileNameWithoutExtension === searchEmail;
        });

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

// Run app locally if executed directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

// Export app for Vercel serverless environment
module.exports = app;
