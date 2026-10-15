const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Memberitahu server untuk menampilkan folder 'public' sebagai frontend
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/extract', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: 'URL tidak boleh kosong' });
    }

    try {
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const $ = cheerio.load(response.data);

       let mediaUrl = $('meta[property="og:video"]').attr('content') || 
                       $('meta[property="og:image"]').attr('content') ||
                       $('video source').attr('src') || 
                       $('video').attr('src') ||
                       $('img').first().attr('src'); // Fallback ambil gambar pertama

        if (mediaUrl) {
            res.json({ success: true, type: mediaUrl.match(/\.(mp4|webm|mkv)/i) ? 'video' : 'image', mediaUrl });
        } else {
            res.json({ success: false, message: 'Media tidak ditemukan di halaman tersebut.' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat URL (mungkin diblokir oleh target).' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});