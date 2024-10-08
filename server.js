import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Serve static files (like index.html) from a directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public'))); // Assuming you have a 'public' folder with your index.html

app.use(express.json());
app.use(cors());

const MESHY_API_URL = 'https://api.meshy.ai/v2/text-to-3d';

// Handle POST request to generate the model
app.post('/generate-3d-model', async (req, res) => {
    const { prompt } = req.body;
    const headers = { Authorization: `Bearer ${process.env.MESHY_API_KEY}` };

    const payload = {
        mode: 'preview',
        prompt: prompt,
        art_style: 'pbr',
        negative_prompt: 'high quality, high resolution, high poly, ugly',
    };

    try {
        const response = await axios.post(MESHY_API_URL, payload, { headers });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating 3D model' });
    }
});

// Handle GET request to fetch model details
app.get('/get-model/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const headers = { Authorization: `Bearer ${process.env.MESHY_API_KEY}` };

    try {
        const response = await axios.get(`https://api.meshy.ai/v2/text-to-3d/${taskId}`, { headers });

        // Determine the filename and path where the model will be saved
        const filename = `${taskId}.glb`; // or any other appropriate extension
        const filePath = path.join(__dirname, 'public', filename);
        console.log('filePath ', filePath);

        if (response && response.data && response.data.model_urls && response.data.model_urls.glb) {
            const glbUrl = response.data.model_urls.glb;
            // console.log('glbUrl', glbUrl);

            const glbResponse = await axios.get(glbUrl, { responseType: 'arraybuffer' });

            fs.writeFileSync(filePath, glbResponse.data);
        }

        res.json({ data: response.data, fname: filename });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching model details' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
