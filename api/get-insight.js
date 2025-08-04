import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // --- 👇 MENERIMA LOKASI DARI FRONTEND 👇 ---
    const { paybackPeriodTahun, totalInvestasi, penghematanBulanan, lokasi } = req.body;

    // --- 👇 VALIDASI INPUT LOKASI 👇 ---
    if (typeof paybackPeriodTahun !== 'number' || isNaN(paybackPeriodTahun) ||
        typeof totalInvestasi !== 'number' || isNaN(totalInvestasi) ||
        typeof penghematanBulanan !== 'number' || isNaN(penghematanBulanan) ||
        !lokasi || typeof lokasi !== 'string') { // Validasi lokasi tidak boleh kosong
      
      return res.status(400).json({ 
        error: 'Input tidak valid. Pastikan semua field perhitungan terisi dengan benar.' 
      });
    }

    // --- 👇 MEMPERBARUI PROMPT UNTUK AI DENGAN KONTEKS LOKASI 👇 ---
    const prompt = `
      Anda adalah seorang penasihat ahli energi terbarukan dan keuangan untuk wilayah Indonesia.
      Analisis data berikut dari sebuah kalkulator kelayakan PLTS (Pembangkit Listrik Tenaga Surya).

      Data Hasil Perhitungan:
      - Lokasi Proyek: ${lokasi}
      - Payback Period: ${paybackPeriodTahun.toFixed(1)} tahun
      - Total Investasi: Rp ${new Intl.NumberFormat('id-ID').format(totalInvestasi)}
      - Estimasi Penghematan Bulanan: Rp ${new Intl.NumberFormat('id-ID').format(penghematanBulanan)}

      Berikan wawasan (insight) yang tajam dan profesional menggunakan format Markdown.
      PENTING: Dalam analisis Anda, pertimbangkan konteks **${lokasi}**. Singgung faktor-faktor seperti potensi iradiasi matahari di wilayah tersebut (misalnya, 'sebagai wilayah di pesisir, potensi mataharinya sangat baik' atau 'untuk daerah dataran tinggi, perlu diperhatikan potensi hari berawan') dan mungkin kondisi ekonomi atau UMR setempat jika relevan dengan skala investasi.

      Struktur jawaban Anda harus mencakup:
      1.  **Evaluasi Umum**: Penilaian singkat terhadap hasil dengan mempertimbangkan lokasi.
      2.  **Analisis Mendalam**: Jelaskan angka-angka yang ada.
      3.  **Rekomendasi Strategis**: Berikan 1-2 langkah konkret.

      Jaga agar jawaban tetap ringkas namun padat informasi. 

      Hindari peminjaman bank atau kredit, fokus pada analisis data yang diberikan.
    `;

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4.1',
    });

    const insight = chatCompletion.choices[0].message.content;

    res.status(200).json({ insight: insight });

  } catch (error) {
    console.error('Terjadi error saat memproses permintaan AI:', error);
    res.status(500).json({ error: 'Gagal menghubungi AI. Silakan coba lagi.' });
  }
}