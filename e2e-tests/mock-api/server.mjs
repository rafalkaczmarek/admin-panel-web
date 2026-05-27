import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));
const host = '127.0.0.1';
const port = Number(process.env['E2E_API_PORT'] ?? 3000);

const products = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/products-stock.json'), 'utf8'),
);

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.options(/.*/, (_req, res) => {
  res.sendStatus(204);
});

app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    res.sendStatus(404);
    return;
  }
  res.json(product);
});

app.listen(port, host, () => {
  console.log(`E2E mock API listening on http://${host}:${port}`);
});
