CREATE TABLE "teguran" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"perizinan_id" uuid NOT NULL,
	"status" "status_teguran" NOT NULL,
	"tanggal_terbit" date NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "teguran" ADD CONSTRAINT "teguran_perizinan_id_perizinan_id_fk" FOREIGN KEY ("perizinan_id") REFERENCES "public"."perizinan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teguran" ADD CONSTRAINT "teguran_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;