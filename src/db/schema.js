/**
 * @description Sumber utama definisi tabel Drizzle ORM untuk seluruh data SIMPASAR.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { pgTable, pgEnum, uuid, varchar, text, timestamp, date, real, unique, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enum membatasi nilai langsung di PostgreSQL, bukan hanya saat input diperiksa aplikasi.
export const roleEnum = pgEnum("role", ['admin', 'petugas']);
export const ruangJenisEnum = pgEnum("jenis_ruang", ['kios', 'los', 'lapak', 'toko']);
export const ruangStatusEnum = pgEnum("status_ruang", ['kosong', 'terisi', 'non-fisik']);
export const perizinanStatusEnum = pgEnum("status_izin", ['aktif', 'kedaluwarsa', 'dicabut', 'diperpanjang']);
export const teguranStatusEnum = pgEnum("status_teguran", ['none', 'sp1', 'sp2', 'sp3']);

// PostgreSQL 18 menyediakan UUIDv7 bawaan; ID tetap unik sekaligus cenderung berurutan menurut waktu.
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

  // Scope pasar boleh null untuk admin, tetapi petugas wajib memilikinya menurut aturan aplikasi.
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
  kodeRuang: varchar("kode_ruang", { length: 50 }).notNull(),
  jenis: ruangJenisEnum("jenis").notNull(),
  panjang: real("panjang"),
  lebar: real("lebar"),
  status: ruangStatusEnum("status").default('kosong'),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  // Kode ruang cukup unik di dalam satu pasar; pasar berbeda boleh memakai kode yang sama.
  unqPasarKodeRuang: unique().on(t.pasarId, t.kodeRuang),
}));

export const perizinan = pgTable("perizinan", {
  id: uuid("id").primaryKey().default(defaultUuidV7),

  ruangDagangId: uuid("ruang_dagang_id").references(() => ruangDagang.id).notNull(),
  pedagangId: uuid("pedagang_id").references(() => pedagang.id).notNull(),
  // Serial memberikan nomor urut global yang kemudian dirangkai menjadi nomor kartu resmi.
  nomorUrut: serial("nomor_urut").notNull(),
  nomorKartu: varchar("nomor_kartu", { length: 100 }).notNull().unique(),

  jenisDagangan: varchar("jenis_dagangan", { length: 255 }).notNull(),
  tanggalTerbit: date("tanggal_terbit").notNull(),
  tanggalKedaluwarsa: date("tanggal_kedaluwarsa").notNull(),
  statusIzin: perizinanStatusEnum("status_izin").default('aktif'),

  // Dua kolom ini adalah snapshot teguran terakhir untuk pembacaan cepat.
  statusTeguran: teguranStatusEnum("status_teguran").default('none'),
  tanggalTeguran: date("tanggal_teguran"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teguran = pgTable("teguran", {
  id: uuid("id").primaryKey().default(defaultUuidV7),

  // Berbeda dari snapshot di perizinan, tabel ini menyimpan setiap kejadian sebagai riwayat audit.
  perizinanId: uuid("perizinan_id").references(() => perizinan.id).notNull(),
  status: teguranStatusEnum("status").notNull(),
  tanggalTerbit: date("tanggal_terbit").notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
