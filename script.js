// Menunggu hingga seluruh konten halaman (DOM) selesai dimuat
document.addEventListener('DOMContentLoaded', () => {

    // Mengambil elemen-elemen penting dari HTML
    const form = document.getElementById('plts-form');
    const hasilContainer = document.getElementById('hasil-analisis');

    // Menambahkan event listener saat form disubmit (tombol 'Hitung' diklik)
    form.addEventListener('submit', (e) => {
        // Mencegah form mengirim data dan me-refresh halaman (default behavior)
        e.preventDefault();

        // --- 1. MENGAMBIL NILAI INPUT DARI PENGGUNA ---
        const konsumsiBulanan = parseFloat(document.getElementById('konsumsi-bulanan').value);
        const tarifListrik = parseFloat(document.getElementById('tarif-listrik').value);
        const kapasitasPlts = parseFloat(document.getElementById('kapasitas-plts').value);
        const biayaInvestasiPerKwp = parseFloat(document.getElementById('biaya-investasi').value);

        // --- 2. KONSTANTA & ASUMSI PERHITUNGAN ---
        // Asumsi rata-rata produksi listrik dari 1 kWp PLTS di Indonesia adalah sekitar 110 kWh/bulan.
        // Angka ini bisa disesuaikan. Di contoh Anda 200kWp -> 20.000kWh/bulan, berarti 100 kWh/bulan. Kita pakai 100.
        const PRODUKSI_PER_KWP = 100; // kWh per bulan
        const USIA_TEKNIS_PANEL = 25; // dalam tahun

        // --- 3. LOGIKA PERHITUNGAN ---
        // Perhitungan berdasarkan contoh yang Anda berikan
        const totalInvestasi = kapasitasPlts * biayaInvestasiPerKwp;
        const estimasiProduksiBulanan = kapasitasPlts * PRODUKSI_PER_KWP;
        
        // Penghematan tidak bisa lebih besar dari total konsumsi.
        // Jika produksi PLTS lebih besar dari konsumsi, penghematan maksimal adalah sebesar konsumsi bulanan.
        const kwhYangDihemat = Math.min(konsumsiBulanan, estimasiProduksiBulanan);
        
        const penghematanBulanan = kwhYangDihemat * tarifListrik;
        const penghematanTahunan = penghematanBulanan * 12;
        
        let paybackPeriodTahun;
        if (penghematanTahunan > 0) {
            paybackPeriodTahun = totalInvestasi / penghematanTahunan;
        } else {
            paybackPeriodTahun = Infinity; // Jika tidak ada penghematan, tidak akan pernah balik modal
        }

        const potensiProfit = (USIA_TEKNIS_PANEL - paybackPeriodTahun) * penghematanTahunan;

        // --- 4. FORMATTING & MENAMPILKAN HASIL ---
        // Fungsi untuk format angka ke format Rupiah (Rp)
        const formatRupiah = (angka) => {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(angka);
        };
        
        // Fungsi untuk format angka biasa dengan pemisah ribuan
        const formatAngka = (angka) => {
            return new Intl.NumberFormat('id-ID').format(angka);
        };

        // Memasukkan hasil perhitungan ke dalam elemen HTML
        document.getElementById('hasil-investasi').textContent = formatRupiah(totalInvestasi);
        document.getElementById('hasil-produksi-kwh').textContent = `${formatAngka(estimasiProduksiBulanan)} kWh / Bulan`;
        document.getElementById('hasil-hemat-bulan').textContent = formatRupiah(penghematanBulanan);
        document.getElementById('hasil-hemat-tahun').textContent = formatRupiah(penghematanTahunan);

        if (paybackPeriodTahun === Infinity) {
             document.getElementById('hasil-payback').textContent = "Tidak Terhingga";
             document.getElementById('hasil-profit').textContent = "Tidak ada";
        } else {
             document.getElementById('hasil-payback').textContent = `${paybackPeriodTahun.toFixed(1)} Tahun`;
             document.getElementById('hasil-profit').textContent = formatRupiah(Math.max(0, potensiProfit));
        }

        // Menampilkan container hasil yang sebelumnya disembunyikan
        hasilContainer.classList.remove('hidden');
    });
});