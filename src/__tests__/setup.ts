import { beforeAll, afterAll } from '@jest/globals';
import { db, pool } from '../config/db';
import { sql } from 'drizzle-orm';

beforeAll(async () => {
  const tables = ['attendance', 'employees'];
  for (const table of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE;`));
  }
});

afterAll(async () => {
  await pool.end();
});
