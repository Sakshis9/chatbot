const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;
const AZURE_MAPS_KEY = process.env.AZURE_MAPS_KEY;

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chatbot', async (req, res) => {
    const { message, lat, lon } = req.body;
    if (!message) {
        return res.json({ message: 'Please provide a place to search for.' });
    }

    const latitude = lat || 40.7128; // Default to New York City
    const longitude = lon || -74.0060; // Default to New York City

    try {
        const response = await axios.get('https://atlas.microsoft.com/search/poi/json', {
            params: {
                'api-version': '1.0',
                'subscription-key': AZURE_MAPS_KEY,
                query: message,
                limit: 5,
                radius: 5000,
                lat: latitude,
                lon: longitude
            }
        });

        const places = response.data.results;

        if (places.length === 0) {
            res.json({ message: 'No places found for your query.' });
        } else {
            const placeItems = places.map(place => `<li>${place.poi.name} (${place.address.freeformAddress})</li>`).join('');
            const message = `<ul>${placeItems}</ul>`;
            res.json({ message });
        }
    } catch (error) {
        console.error('Error fetching places data:', error.response ? error.response.data : error.message);
        res.json({ message: 'Sorry, I could not find any places for that query.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
