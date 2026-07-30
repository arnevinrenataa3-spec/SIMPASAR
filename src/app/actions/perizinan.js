'use server';

/**
 * @description Thin Server Action adapter for permit operations.
 * @author Muhamad Hazmi Alfarizqi
 * @contributor Arnevin Renata Ahmad Barkah
 */

import { z } from 'zod';
import { perizinanDbAdapter } from '../../db/adapters/perizinan.js';
import { defineAction } from '../../lib/pipeline.js';
import { terbitkanIzin, terbitkanTeguran, perpanjangIzin, cabutIzin } from '../../lib/perizinan.js';
import { resolveScope } from '../../lib/scope.js';

const schema = z.object({
  ruangDagangId: z.string().uuid('Ruang Dagang tidak valid.'),
  pasarId: z.string().optional(),
  nik: z.string().trim().regex(/^\d{16}$/, 'NIK harus terdiri dari 16 digit.'),
  namaLengkap: z.string().trim().min(2, 'Nama lengkap wajib diisi.'),
  alamat: z.string().trim().min(3, 'Alamat wajib diisi.'),
  nomorHp: z.string().trim().regex(/^\+?[0-9]{8,15}$/, 'Nomor HP tidak valid.'),
  jenisDagangan: z.string().trim().min(2, 'Jenis dagangan wajib diisi.'),
  tanggalTerbit: z.iso.date('Tanggal terbit tidak valid.'),
  tanggalKedaluwarsa: z.iso.date('Tanggal kedaluwarsa tidak valid.'),
});

const reasons = {
  ruang_tidak_tersedia: 'Ruang Dagang sudah terisi atau berada di luar scope Pasar aktif.',
  tanggal_tidak_valid: 'Tanggal kedaluwarsa harus setelah tanggal terbit.',
  izin_tidak_aktif: 'Izin sudah dicabut atau diperpanjang.',
  belum_waktunya: 'Izin belum memasuki periode peneguran.',
  sudah_diterbitkan: 'Surat Peringatan untuk level ini sudah diterbitkan.',
};

export const terbitkanIzinAction = defineAction({
  operasi: 'perizinan:ops',
  scope: 'enforce',
  schema,
  revalidate: ['layout:/dashboard/ruang-dagang', '/dashboard'],
  execute: async (data, ctx) => {
    try {
      const activeScope = await resolveScope(ctx.user);
      const pasarId = activeScope === 'all' ? ctx.pasarId : activeScope;
      if (!pasarId) return { error: 'Pilih Ruang Dagang pada sebuah Pasar.' };
      const result = await terbitkanIzin({
        ...data,
        pasarId,
        pedagang: {
          nik: data.nik,
          namaLengkap: data.namaLengkap,
          alamat: data.alamat,
          nomorHp: data.nomorHp,
        },
      }, perizinanDbAdapter);
      if (!result.ok) return { error: reasons[result.reason] ?? 'Izin gagal diterbitkan.' };
      return { message: `Izin ${result.perizinan.nomorKartu} berhasil diterbitkan.` };
    } catch (error) {
      if (error?.code === '23505') return { error: 'NIK atau nomor kartu sudah terdaftar.' };
      throw error;
    }
  },
});

const teguranSchema = z.object({
  perizinanId: z.string().uuid('Perizinan tidak valid.'),
});

export const terbitkanTeguranAction = defineAction({
  operasi: 'perizinan:ops',
  schema: teguranSchema,
  revalidate: ['/dashboard/teguran', '/dashboard'],
  execute: async (data, ctx) => {
    try {
      const result = await terbitkanTeguran(data.perizinanId, ctx.user.id, perizinanDbAdapter);
      if (!result.ok) return { error: reasons[result.reason] ?? 'Gagal menerbitkan SP.' };
      const label = { sp1: 'SP 1', sp2: 'SP 2', sp3: 'SP 3' }[result.level];
      return { message: `${label} berhasil diterbitkan.` };
    } catch (error) {
      return { error: error.message || 'Gagal memproses peneguran.' };
    }
  },
});

const perpanjangSchema = z.object({
  perizinanId: z.string().uuid('Perizinan tidak valid.'),
  tanggalTerbit: z.iso.date('Tanggal terbit tidak valid.'),
  tanggalKedaluwarsa: z.iso.date('Tanggal kedaluwarsa tidak valid.'),
});

export const perpanjangIzinAction = defineAction({
  operasi: 'perizinan:ops',
  schema: perpanjangSchema,
  revalidate: ['layout:/dashboard/ruang-dagang', '/dashboard'],
  execute: async (data, ctx) => {
    try {
      const result = await perpanjangIzin(data.perizinanId, {
        tanggalTerbit: data.tanggalTerbit,
        tanggalKedaluwarsa: data.tanggalKedaluwarsa,
      }, perizinanDbAdapter);
      if (!result.ok) return { error: reasons[result.reason] ?? 'Gagal memperpanjang izin.' };
      return { message: `Izin ${result.perizinan.nomorKartu} berhasil diperpanjang.` };
    } catch (error) {
      if (error?.code === '23505') return { error: 'Nomor kartu sudah terdaftar.' };
      return { error: error.message || 'Gagal memperpanjang izin.' };
    }
  },
});

const cabutSchema = z.object({
  perizinanId: z.string().uuid('Perizinan tidak valid.'),
});

export const cabutIzinAction = defineAction({
  operasi: 'perizinan:ops',
  schema: cabutSchema,
  revalidate: ['layout:/dashboard/ruang-dagang', '/dashboard'],
  execute: async (data, ctx) => {
    try {
      const result = await cabutIzin(data.perizinanId, perizinanDbAdapter);
      if (!result.ok) return { error: reasons[result.reason] ?? 'Gagal mencabut izin.' };
      return { message: 'Izin berhasil dicabut. Ruang Dagang telah dikosongkan.' };
    } catch (error) {
      return { error: error.message || 'Gagal mencabut izin.' };
    }
  },
});
