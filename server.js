// Mengimpor library yang dibutuhkan
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import insightHandler from './api/get-insight.js'; // Mengimpor handler AI kita

// Inisialisasi awal untuk bekerja dengan ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Membuat aplikasi express
const app = express();
const port = 3000; // Anda bisa ganti port jika 3000 sudah terpakai

// Middleware untuk membaca JSON dari body request
app.use(express.json());

// 1. Membuat endpoint API untuk AI
// Ketika frontend memanggil /api/get-insight, fungsi ini akan dijalankan
app.post('/api/get-insight', insightHandler);

// 2. Menyajikan file frontend (HTML, CSS, JS)
// Ini memberitahu server untuk menyajikan file dari direktori utama
app.use(express.static(path.join(__dirname, '')));

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
  console.log('Tekan CTRL+C untuk menghentikan server.');
});