const express = require('express');
const data = require('./public/budget-data.json');
const cors = require('cors');
const app = express();
const port = 3001;

app.use('/', express.static('public'));
app.use(cors());

app.get('/budget', (req, res) => {
    res.json(data);
});

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});