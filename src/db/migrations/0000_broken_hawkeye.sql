CREATE TABLE "Chat" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp NOT NULL,
	"messages" json NOT NULL,
	"author" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Chunk" (
	"id" text PRIMARY KEY NOT NULL,
	"filePath" text NOT NULL,
	"content" text NOT NULL,
	"embedding" real[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"email" varchar(64) PRIMARY KEY NOT NULL,
	"password" varchar(64)
);
--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_author_User_email_fk" FOREIGN KEY ("author") REFERENCES "public"."User"("email") ON DELETE no action ON UPDATE no action;