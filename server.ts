import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleApiRoute } from './server/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(async (req, res, next) => {
  if (req.url.startsWith('/api/')) {
    const handled = await handleApiRoute(req, res);
    if (handled) return;
  }
  next();
});

const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LeadPilot AI server running on port ${PORT}`);
});
