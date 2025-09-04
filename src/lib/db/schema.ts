import { pgTable, uuid, varchar, text, boolean, timestamp, date, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Teams table
export const teams = pgTable('teams', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    adminName: varchar('admin_name', { length: 100 }),
    adminPhone: varchar('admin_phone', { length: 20 }),
    color: varchar('color', { length: 7 }).default('#3B82F6'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
    isActiveIdx: index('idx_teams_is_active').on(table.isActive),
}))

// Members table
export const members = pgTable('members', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
    teamIdIdx: index('idx_members_team_id').on(table.teamId),
    teamActiveIdx: index('idx_members_team_active').on(table.teamId, table.isActive),
}))

// Events table
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 200 }).notNull(),
    eventDate: date('event_date').notNull(),
    eventType: varchar('event_type', { length: 20 }).default('sunday'),
    teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    isArchived: boolean('is_archived').default(false),
    createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
    teamIdIdx: index('idx_events_team_id').on(table.teamId),
    teamArchivedIdx: index('idx_events_team_archived').on(table.teamId, table.isArchived),
    teamDateIdx: index('idx_events_team_date').on(table.teamId, table.eventDate),
    isArchivedIdx: index('idx_events_is_archived').on(table.isArchived),
    activeDateIdx: index('idx_events_active_date').on(table.isArchived, table.eventDate),
}))

// Assignments table
export const assignments = pgTable('assignments', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
    eventIdIdx: index('idx_assignments_event_id').on(table.eventId),
    memberIdIdx: index('idx_assignments_member_id').on(table.memberId),
    uniqueAssignment: uniqueIndex('unique_event_member').on(table.eventId, table.memberId),
}))

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
    members: many(members),
    events: many(events),
}))

export const membersRelations = relations(members, ({ one, many }) => ({
    team: one(teams, {
        fields: [members.teamId],
        references: [teams.id],
    }),
    assignments: many(assignments),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
    team: one(teams, {
        fields: [events.teamId],
        references: [teams.id],
    }),
    assignments: many(assignments),
}))

export const assignmentsRelations = relations(assignments, ({ one }) => ({
    event: one(events, {
        fields: [assignments.eventId],
        references: [events.id],
    }),
    member: one(members, {
        fields: [assignments.memberId],
        references: [members.id],
    }),
}))

// Types
export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
export type Member = typeof members.$inferSelect & { team?: Team }
export type NewMember = typeof members.$inferInsert
export type Event = typeof events.$inferSelect & { team?: Team }
export type NewEvent = typeof events.$inferInsert
export type Assignment = typeof assignments.$inferSelect & { member?: Member; event?: Event }
export type NewAssignment = typeof assignments.$inferInsert