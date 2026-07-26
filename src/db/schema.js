/**
 * @description Single source of truth skema database Drizzle ORM (users, pasar, ruangDagang, perizinan).
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { pgTable, pgEnum, uuid, varchar, text, timestamp, date, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const roleEnum = pgEnum("role", ['admin', 'petugas']);
export const ruangJenisEnum = pgEnum("jenis_ruang", ['kios', 'los', 'lapak', 'toko']);
export const ruangStatusEnum = pgEnum("status_ruang", ['kosong', 'terisi']);
export const perizinanStatusEnum = pgEnum("status_izin", ['aktif', 'kedaluwarsa', 'dicabut', 'diperpanjang']);
export const teguranStatusEnum = pgEnum("status_teguran", ['none', 'sp1', 'sp2', 'sp3']);

// Postgres v18 has native uuidv7() function
const defaultUuidV7 = sql`uuidv7()`;

export const pasar = pgTable("pasar", {
  id: uuid("id").primaryKey().default(defaultUuidV7),

  namaPasar: varchar("nama_pasar", { length: 255 }).notNull(),
  alamat: text("alamat").notNull(),
  nomorPasar: varchar("nomor_pasar", { length: 50 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(defaultUuidV7),

  pasarId: uuid("pasar_id").references(() => pasar.id),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").default('petugas'),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pedagang = pgTable("pedagang", {
  id: uuid("id").primaryKey().default(defaultUuidV7),

  nik: varchar("nik", { length: 16 }).notNull().unique(),
  namaLengkap: varchar("nama_lengkap", { length: 255 }).notNull(),
  alamat: text("alamat").notNull(),
  nomorHp: varchar("nomor_hp", { length: 20 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ruangDagang = pgTable("ruang_dagang", {
  id: uuid("id").primaryKey().default(defaultUuidV7),

  pasarId: uuid("pasar_id").references(() => pasar.id).notNull(),
  kodeRuang: varchar("kode_ruang", { length: 50 }).notNull().unique(),
  jenis: ruangJenisEnum("jenis").notNull(),
  panjang: real("panjang"),
  lebar: real("lebar"),
  status: ruangStatusEnum("status").default('kosong'),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const perizinan = pgTable("perizinan", {
  id: uuid("id").primaryKey().default(defaultUuidV7),

  ruangDagangId: uuid("ruang_dagang_id").references(() => ruangDagang.id).notNull(),
  pedagangId: uuid("pedagang_id").references(() => pedagang.id).notNull(),
  nomorKartu: varchar("nomor_kartu", { length: 100 }).notNull().unique(),

  jenisDagangan: varchar("jenis_dagangan", { length: 255 }).notNull(),
  tanggalTerbit: date("tanggal_terbit").notNull(),
  tanggalKedaluwarsa: date("tanggal_kedaluwarsa").notNull(),
  statusIzin: perizinanStatusEnum("status_izin").default('aktif'),

  statusTeguran: teguranStatusEnum("status_teguran").default('none'),
  tanggalTeguran: date("tanggal_teguran"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
