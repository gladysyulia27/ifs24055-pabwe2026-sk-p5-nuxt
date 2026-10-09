import Swal from 'sweetalert2'
import { describe, expect, it, vi } from 'vitest'
import {
  formatDate, formatDateTime, formatRupiah, getInitials, showConfirmDialog, showErrorDialog, showSuccessDialog,
} from './toolsHelper'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))
const fire = Swal.fire as unknown as ReturnType<typeof vi.fn>

describe('toolsHelper', () => {
  it('showSuccessDialog menampilkan dialog sukses', async () => {
    fire.mockResolvedValue({})
    await showSuccessDialog('Selesai')
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', title: 'Berhasil', text: 'Selesai' }))
    await showSuccessDialog('Selesai', 'Judul')
    expect(fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Judul' }))
  })

  it('showErrorDialog menampilkan dialog error', async () => {
    fire.mockResolvedValue({})
    await showErrorDialog('Gagal')
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Terjadi Kesalahan', text: 'Gagal' }))
    await showErrorDialog('Gagal', 'Oops')
    expect(fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Oops' }))
  })

  it('showConfirmDialog mengembalikan status konfirmasi', async () => {
    fire.mockResolvedValueOnce({ isConfirmed: true })
    expect(await showConfirmDialog('Hapus?')).toBe(true)
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ showCancelButton: true, confirmButtonText: 'Ya, lanjutkan', title: 'Apakah Anda yakin?' }))
    fire.mockResolvedValueOnce({ isConfirmed: false })
    expect(await showConfirmDialog('Hapus?', 'Hapus', 'Judul')).toBe(false)
    expect(fire).toHaveBeenLastCalledWith(expect.objectContaining({ confirmButtonText: 'Hapus', title: 'Judul' }))
  })

  it('formatRupiah memformat angka dan string', () => {
    expect(formatRupiah(2500000).replace(/\s/g, ' ')).toBe('Rp 2.500.000')
    expect(formatRupiah('1000').replace(/\s/g, ' ')).toBe('Rp 1.000')
    expect(formatRupiah('abc').replace(/\s/g, ' ')).toBe('Rp 0')
  })

  it('formatDate & formatDateTime menangani tanggal valid dan tidak valid', () => {
    expect(formatDate('2024-10-05T12:09:16.000000Z')).toMatch(/2024/)
    expect(formatDateTime('2024-10-05T12:09:16.000000Z')).toMatch(/2024/)
    expect(formatDate('bukan-tanggal')).toBe('-')
    expect(formatDateTime('bukan-tanggal')).toBe('-')
  })

  it('getInitials mengambil maksimal dua huruf awal', () => {
    expect(getInitials('delcom testing user')).toBe('DT')
    expect(getInitials('abdullah')).toBe('A')
    expect(getInitials('')).toBe('?')
  })
})
