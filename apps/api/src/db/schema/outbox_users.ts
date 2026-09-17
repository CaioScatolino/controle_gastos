import { mysqlTable, varchar, timestamp, int, json, boolean } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const outbox_users = mysqlTable('outbox_users', {
    id: int('id').autoincrement().primaryKey(),
    user_id: int('user_id').notNull().references(() => users.id),
    type: varchar('type', { length: 100 }).notNull(),
    data: json('data').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    processed: boolean('processed').default(false).notNull(),
})

export type OutboxUser = typeof outbox_users.$inferSelect;
export type NewOutboxUser = typeof outbox_users.$inferInsert;