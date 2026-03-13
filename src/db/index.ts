import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from './schema'

export const client = new PGlite('idb://sql-learning-db')
export const db = drizzle(client, { schema })

export async function initDb() {
  await client.waitReady

  const res = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'employees'
    );
  `)
  const exists = (res.rows[0] as { exists: boolean }).exists

  if (!exists) {
    await client.exec(`
      CREATE TABLE IF NOT EXISTS "departments" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "employees" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "department_id" integer NOT NULL,
        "salary" integer NOT NULL,
        "joined_at" timestamp DEFAULT now() NOT NULL
      );
    `)

    await db.insert(schema.departments).values([
      { id: 1, name: 'IT' },
      { id: 2, name: 'HR' },
      { id: 3, name: 'Sales' },
    ])

    await db.insert(schema.employees).values([
      { name: 'Alice', departmentId: 1, salary: 6000000 },
      { name: 'Bob', departmentId: 1, salary: 5500000 },
      { name: 'Charlie', departmentId: 2, salary: 4000000 },
      { name: 'Dave', departmentId: 3, salary: 4500000 },
      { name: 'Eve', departmentId: 1, salary: 7000000 },
    ])
  }
}
