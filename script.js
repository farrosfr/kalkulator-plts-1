document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('plts-form');
    const hasilContainer = document.getElementById('hasil-analisis');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // --- 1. MENGAMBIL NILAI INPUT DARI PENGGUNA (VERSI BARU) ---
        const konsumsiBulanan = parseFloat(document.getElementById('konsumsi-bulanan').value);
        // Input baru untuk WBP/LWBP
        const persentaseLwbp = parseFloat(document.getElementById('persentase-lwbp').value);
        const tarifLwbp = parseFloat(document.getElementById('tarif-lwbp').value);
        const tarifWbp = parseFloat(document.getElementById('tarif-wbp').value);
        // Input spesifikasi PLTS
        const kapasitasPlts = parseFloat(document.getElementById('kapasitas-plts').value);
        const biayaInvestasiPerKwp = parseFloat(document.getElementById('biaya-investasi').value);

        // --- 2. KONSTANTA & ASUMSI PERHITUNGAN ---
        const PRODUKSI_PER_KWP = 100; // kWh per bulan
        const USIA_TEKNIS_PANEL = 25; // dalam tahun

        // --- 3. LOGIKA PERHITUNGAN BARU DENGAN WBP/LWBP ---
        
        // A. Hitung dulu tagihan listrik awal sebelum ada PLTS
        const konsumsiKwhLwbp = konsumsiBulanan * (persentaseLwbp / 100);
        const konsumsiKwhWbp = konsumsiBulanan * (1 - (persentaseLwbp / 100));
        const biayaAwal = (konsumsiKwhLwbp * tarifLwbp) + (konsumsiKwhWbp * tarifWbp);

        // B. Hitung investasi dan produksi PLTS
        const totalInvestasi = kapasitasPlts * biayaInvestasiPerKwp;
        const estimasiProduksiBulananPlts = kapasitasPlts * PRODUKSI_PER_KWP;
        
        // C. Hitung penghematan. PLTS mengurangi pemakaian di jam LWBP.
        // Penghematan tidak bisa lebih besar dari total konsumsi pada jam LWBP.
        const kwhYangDihemat = Math.min(konsumsiKwhLwbp, estimasiProduksiBulananPlts);
        
        // Penghematan dihitung menggunakan TARIF LWBP
        const penghematanBulanan = kwhYangDihemat * tarifLwbp;
        const penghematanTahunan = penghematanBulanan * 12;
        
        // D. Hitung ROI
        let paybackPeriodTahun;
        if (penghematanTahunan > 0) {
            paybackPeriodTahun = totalInvestasi / penghematanTahunan;
        } else {
            paybackPeriodTahun = Infinity;
        }

        const potensiProfit = (USIA_TEKNIS_PANEL - paybackPeriodTahun) * penghematanTahunan;

        // --- 4. FORMATTING & MENAMPILKAN HASIL ---
        const formatRupiah = (angka) => {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(angka);
        };
        
        const formatAngka = (angka) => {
            return new Intl.NumberFormat('id-ID').format(angka);
        };

        // Memasukkan hasil perhitungan ke dalam elemen HTML
        document.getElementById('hasil-tagihan-awal').textContent = formatRupiah(biayaAwal);
        document.getElementById('hasil-investasi').textContent = formatRupiah(totalInvestasi);
        document.getElementById('hasil-produksi-kwh').textContent = `${formatAngka(estimasiProduksiBulananPlts)} kWh / Bulan`;
        document.getElementById('hasil-hemat-bulan').textContent = formatRupiah(penghematanBulanan);
        document.getElementById('hasil-hemat-tahun').textContent = formatRupiah(penghematanTahunan);

        if (paybackPeriodTahun === Infinity) {
             document.getElementById('hasil-payback').textContent = "Tidak Terhingga";
             document.getElementById('hasil-profit').textContent = "Tidak ada";
        } else {
             document.getElementById('hasil-payback').textContent = `${paybackPeriodTahun.toFixed(1)} Tahun`;
             document.getElementById('hasil-profit').textContent = formatRupiah(Math.max(0, potensiProfit));
        }

        hasilContainer.classList.remove('hidden');
    });
});