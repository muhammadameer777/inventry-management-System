import dotenv from 'dotenv';
import app from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[CampusEvents Server] Core API is live on http://localhost:${PORT}`);
  console.log(`[CampusEvents Server] Health check available at http://localhost:${PORT}/api/health`);
});
