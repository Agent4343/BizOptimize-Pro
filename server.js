const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Serve the HTML file
    if (req.url === '/' || req.url === '/questions.html') {
        const filePath = path.join(__dirname, 'questions.html');
        
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading HTML file');
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Server is running!`);
    console.log(`========================================`);
    console.log(`\nOpen your browser and visit:`);
    console.log(`\n  http://localhost:${PORT}`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
});
