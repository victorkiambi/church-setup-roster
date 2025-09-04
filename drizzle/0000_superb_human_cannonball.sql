CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"member_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"event_date" date NOT NULL,
	"event_type" varchar(20) DEFAULT 'sunday',
	"team_id" uuid NOT NULL,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20),
	"team_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"admin_name" varchar(100),
	"admin_phone" varchar(20),
	"color" varchar(7) DEFAULT '#3B82F6',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "teams_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assignments_event_id" ON "assignments" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_assignments_member_id" ON "assignments" USING btree ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_event_member" ON "assignments" USING btree ("event_id","member_id");--> statement-breakpoint
CREATE INDEX "idx_events_team_id" ON "events" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_events_team_archived" ON "events" USING btree ("team_id","is_archived");--> statement-breakpoint
CREATE INDEX "idx_events_team_date" ON "events" USING btree ("team_id","event_date");--> statement-breakpoint
CREATE INDEX "idx_events_is_archived" ON "events" USING btree ("is_archived");--> statement-breakpoint
CREATE INDEX "idx_events_active_date" ON "events" USING btree ("is_archived","event_date");--> statement-breakpoint
CREATE INDEX "idx_members_team_id" ON "members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_members_team_active" ON "members" USING btree ("team_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_teams_is_active" ON "teams" USING btree ("is_active");