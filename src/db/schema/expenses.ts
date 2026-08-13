import { int, mysqlTable, varchar, timestamp, decimal, boolean, datetime } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const expenses = mysqlTable('expenses', {
    id: int('id').autoincrement().primaryKey(),
    user_id: int('user_id').notNull().references(() => users.id),
    description: varchar('description', { length: 255 }).notNull(),
    value: decimal('value', { precision: 10, scale: 2 }).notNull(),
    type: varchar('type', { length: 10 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    expense_date: datetime('expense_date').notNull(),
    status: boolean().default(true).notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
})

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;