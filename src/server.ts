import app from './app';
import { env } from './config/env';
import { seedAdmin } from './db/seed';

const startServer = async () => {
  // Ensure initial admin exists
  await seedAdmin();

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};

startServer();
