document.addEventListener('DOMContentLoaded', () => {
    // Deklarasi semua elemen yang dibutuhkan
    const form = document.getElementById('plts-form');
    const hasilContainer = document.getElementById('hasil-analisis');
    const aiContainer = document.getElementById('ai-insight-container');
    const aiLoadingIndicator = document.getElementById('ai-loading-indicator');
    const aiCheckMark = document.getElementById('ai-check-mark');
    const aiResult = document.getElementById('ai-insight-result');
    const aiText = document.getElementById('ai-text');

    async function getAiInsights(data) {
        // 1. Tampilkan kontainer & status loading awal
        aiContainer.classList.remove('hidden');
        aiCheckMark.classList.add('hidden');
        aiLoadingIndicator.classList.remove('hidden');
        aiResult.classList.add('hidden');

        try {
            const response = await fetch('/api/get-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Terjadi kesalahan pada server.');
            }

            const result = await response.json();
            aiText.innerHTML = marked.parse(result.insight);

        } catch (error) {
            console.error('Fetch error:', error);
            aiText.textContent = `Error: ${error.message}`;
        } finally {
            // 2. Sembunyikan loading, tampilkan centang, dan tampilkan hasil
            aiLoadingIndicator.classList.add('hidden');
            aiCheckMark.classList.remove('hidden');
            aiResult.classList.remove('hidden');
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hasilContainer.classList.add('hidden');
        aiContainer.classList.add('hidden');

        const lokasi = document.getElementById('lokasi').value; 
        const konsumsiBulanan = parseFloat(document.getElementById('konsumsi-bulanan').value);
        const persentaseLwbp = parseFloat(document.getElementById('persentase-lwbp').value);
        const tarifLwbp = parseFloat(document.getElementById('tarif-lwbp').value);
        const tarifWbp = parseFloat(document.getElementById('tarif-wbp').value);
        const kapasitasPlts = parseFloat(document.getElementById('kapasitas-plts').value);
        const biayaInvestasiPerKwp = parseFloat(document.getElementById('biaya-investasi').value);

        const PRODUKSI_PER_KWP = 100;
        const USIA_TEKNIS_PANEL = 25;

        const konsumsiKwhLwbp = konsumsiBulanan * (persentaseLwbp / 100);
        const konsumsiKwhWbp = konsumsiBulanan * (1 - (persentaseLwbp / 100));
        const biayaAwal = (konsumsiKwhLwbp * tarifLwbp) + (konsumsiKwhWbp * tarifWbp);
        const totalInvestasi = kapasitasPlts * biayaInvestasiPerKwp;
        const estimasiProduksiBulananPlts = kapasitasPlts * PRODUKSI_PER_KWP;
        const kwhYangDihemat = Math.min(konsumsiKwhLwbp, estimasiProduksiBulananPlts);
        const penghematanBulanan = kwhYangDihemat * tarifLwbp;
        const penghematanTahunan = penghematanBulanan * 12;
        let paybackPeriodTahun = penghematanTahunan > 0 ? totalInvestasi / penghematanTahunan : Infinity;

        const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
        const formatAngka = (angka) => new Intl.NumberFormat('id-ID').format(angka);
        
        document.getElementById('hasil-tagihan-awal').textContent = formatRupiah(biayaAwal);
        document.getElementById('hasil-investasi').textContent = formatRupiah(totalInvestasi);
        document.getElementById('hasil-produksi-kwh').textContent = `${formatAngka(estimasiProduksiBulananPlts)} kWh / Bulan`;
        document.getElementById('hasil-hemat-bulan').textContent = formatRupiah(penghematanBulanan);
        document.getElementById('hasil-hemat-tahun').textContent = formatRupiah(penghematanTahunan);

        if (paybackPeriodTahun === Infinity) {
             document.getElementById('hasil-payback').textContent = "Tidak Terhingga";
             document.getElementById('hasil-profit').textContent = "Tidak ada";
        } else {
             const potensiProfit = (USIA_TEKNIS_PANEL - paybackPeriodTahun) * penghematanTahunan;
             document.getElementById('hasil-payback').textContent = `${paybackPeriodTahun.toFixed(1)} Tahun`;
             document.getElementById('hasil-profit').textContent = formatRupiah(Math.max(0, potensiProfit));
        }

        hasilContainer.classList.remove('hidden');

        if (paybackPeriodTahun !== Infinity) {
            getAiInsights({ paybackPeriodTahun, totalInvestasi, penghematanBulanan, lokasi });
        }
    });
});