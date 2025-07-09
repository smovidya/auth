import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core';
import * as authSchema from "./auth.schema"; // This will be generated in a later step

const faculties = sqliteTable("faculties", {
  id: int("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  thainame: text("thai_name").notNull(),
  shortName: text("short_name"),
  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

const departments = sqliteTable("departments", {
  id: int("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  thainame: text("thai_name").notNull(),
  shortName: text("short_name"),
  facultyId: int("faculty_id")
    .notNull()
    .references(() => faculties.id, { onDelete: "cascade" }),
  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

const programs = sqliteTable("programs", {
  id: int("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  thainame: text("thai_name").notNull(),
  shortName: text("short_name"),
  facultyId: int("faculty_id")
    .notNull()
    .references(() => faculties.id, { onDelete: "cascade" }),
  departmentId: int("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const schema = {
  ...authSchema,
  faculties,
  departments,
  programs,
} as const;
