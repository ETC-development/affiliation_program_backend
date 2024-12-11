require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

// Google OAuth2 credentials
var clientId =  process.env.GOOGLE_CLIENT_ID;
var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
var redirectUri = process.env.GOOGLE_REDIRECT_URI;
var refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
var rootFolderId = process.env.ROOT_FOLDER_ID;


// Initialize OAuth2 client
const oauth2client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
oauth2client.setCredentials({ refresh_token: refreshToken });

// Initialize Google Drive API client
const drive = google.drive({
    version: 'v3',
    auth: oauth2client
});

// Helper function to list files inside a folder
async function listFilesInFolder(folderId) {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
            pageSize: 100
        });

        return response.data.files || [];
    } catch (error) {
        console.error('Error retrieving files:', error);
        return [];
    }
}

async function listFilesInFolderConfig() {
    try {
        const response = await drive.files.list({
            fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
            pageSize: 100
        });

        return response.data.files || [];
    } catch (error) {
        console.error('Error retrieving files:', error);
        return [];
    }
}


// API to list files in the root folder (Affiliation)
app.get('/api/files', async (req, res) => {
    try {
        const files = await listFilesInFolder(rootFolderId);

        // Return the list of files and folders with view and download links
        res.json({ files });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve files.' });
    }
});

app.get('/api/files/config', async (req, res) => {
    try {
        const files = await listFilesInFolderConfig();

        // Return the list of files and folders with view and download links
        res.json({ files });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve files.' });
    }
});

// API to list files in a subfolder
app.get('/api/files/:folderId', async (req, res) => {
    const { folderId } = req.params;

    try {
        const files = await listFilesInFolder(folderId);

        // Return the list of files and folders with view and download links
        res.json({ files });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve files.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});