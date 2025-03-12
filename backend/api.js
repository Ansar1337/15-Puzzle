const http = require('http');
const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'top_players.json');
const MAX_PLAYERS = 15;

function loadPlayers() {
    if (!fs.existsSync(FILE_PATH)) {
        return [];
    }
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(data) || [];
    } catch (error) {
        return [];
    }
}

function savePlayers(players) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(players, null, 2), 'utf-8');
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === 'POST' && req.url === '/api/add_player') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                const player = JSON.parse(body);
                if (!player.name || typeof player.scores !== 'number') {
                    throw new Error('Invalid data');
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                let players = loadPlayers();
                if (!players.some(knownPlayer => knownPlayer.name === player.name && knownPlayer.scores === player.scores)) {
                    players.push({ name: player.name, scores: player.scores });
                    players.sort((a, b) => a.scores - b.scores);
                    players = players.slice(0, MAX_PLAYERS);
                    savePlayers(players);
                    res.end(JSON.stringify({ message: 'Player added successfully' }));
                } else {
                    res.end(JSON.stringify({message: 'Player can\'t be added'}));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON or data format' }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/api/get_top_players') {
        const players = loadPlayers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(players));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
