import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core"

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  departmentId: integer("department_id").notNull(),
  salary: integer("salary").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
})

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
})
