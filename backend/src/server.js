import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`[SERVER] NovaMart API running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`[SERVER] Health check available at http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('[FATAL] Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
