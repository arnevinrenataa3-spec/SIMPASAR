CREATE TYPE "public"."status_izin" AS ENUM('aktif', 'kedaluwarsa', 'dicabut', 'diperpanjang');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'petugas');--> statement-breakpoint
CREATE TYPE "public"."jenis_ruang" AS ENUM('kios', 'los', 'lapak', 'toko');--> statement-breakpoint
CREATE TYPE "public"."status_ruang" AS ENUM('kosong', 'terisi');--> statement-breakpoint
CREATE TYPE "public"."status_teguran" AS ENUM('none', 'sp1', 'sp2', 'sp3');--> statement-breakpoint
CREATE TABLE "pasar" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"nama_pasar" varchar(255) NOT NULL,
	"alamat" text NOT NULL,
	"nomor_pasar" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pedagang" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"nik" varchar(16) NOT NULL,
	"nama_lengkap" varchar(255) NOT NULL,
	"alamat" text NOT NULL,
	"nomor_hp" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pedagang_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
CREATE TABLE "perizinan" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"ruang_dagang_id" uuid NOT NULL,
	"pedagang_id" uuid NOT NULL,
	"nomor_kartu" varchar(100) NOT NULL,
	"jenis_dagangan" varchar(255) NOT NULL,
	"tanggal_terbit" date NOT NULL,
	"tanggal_kedaluwarsa" date NOT NULL,
	"status_izin" "status_izin" DEFAULT 'aktif',
	"status_teguran" "status_teguran" DEFAULT 'none',
	"tanggal_teguran" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "perizinan_nomor_kartu_unique" UNIQUE("nomor_kartu")
);
--> statement-breakpoint
CREATE TABLE "ruang_dagang" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"pasar_id" uuid NOT NULL,
	"kode_ruang" varchar(50) NOT NULL,
	"jenis" "jenis_ruang" NOT NULL,
	"panjang" real,
	"lebar" real,
	"status" "status_ruang" DEFAULT 'kosong',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ruang_dagang_kode_ruang_unique" UNIQUE("kode_ruang")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"pasar_id" uuid,
	"name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'petugas',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "perizinan" ADD CONSTRAINT "perizinan_ruang_dagang_id_ruang_dagang_id_fk" FOREIGN KEY ("ruang_dagang_id") REFERENCES "public"."ruang_dagang"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perizinan" ADD CONSTRAINT "perizinan_pedagang_id_pedagang_id_fk" FOREIGN KEY ("pedagang_id") REFERENCES "public"."pedagang"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ruang_dagang" ADD CONSTRAINT "ruang_dagang_pasar_id_pasar_id_fk" FOREIGN KEY ("pasar_id") REFERENCES "public"."pasar"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_pasar_id_pasar_id_fk" FOREIGN KEY ("pasar_id") REFERENCES "public"."pasar"("id") ON DELETE no action ON UPDATE no action;