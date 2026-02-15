import { createServer } from 'http';
import { parse } from 'url';

const PORT = 5000;

const categories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Fashion' },
  { id: 3, name: 'Home & Garden' },
  { id: 4, name: 'Industrial' },
  { id: 5, name: 'Healthcare' }
];

const server = createServer((req, res) => {
  const { pathname } = parse(req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (pathname === '/api/categories') {
    res.writeHead(200);
    res.end(JSON.stringify(categories));
    console.log(' Categories API called');
  } else if (pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(' Bell24h API Server running on http://localhost:' + PORT);
});
