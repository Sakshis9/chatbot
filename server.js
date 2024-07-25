import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import natural from 'natural';

const app = express();
const port = 3000;
const azureMapsKey = 'CSSRW7OHagtdxkbnhrTWALtkaL800d7RAut31WyDBrsq6bmkQI1UJQQJ99AGAC8vTIn81etPAAAgAZMPSbLd';

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Directory path setup for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chatbot API route
app.post('/api/chatbot', async (req, res) => {
    const { message, lat, lon } = req.body;

    // NLP Processing
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(message.toLowerCase());
    const keywords = tokens.filter(token => !natural.stopwords.includes(token));

    // Azure Maps API request
    const query = keywords.join(' ');
    const url = `https://atlas.microsoft.com/search/poi/json?subscription-key=${azureMapsKey}&api-version=1.0&query=${query}&lat=${lat}&lon=${lon}&radius=5000`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const places = data.results.map(place => `<li>${place.poi.name} - ${place.address.freeformAddress}</li>`).join('');
        res.json({ message: `<ul>${places}</ul>` });
    } catch (error) {
        console.error('Error:', error);
        res.json({ message: 'Sorry, something went wrong.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
