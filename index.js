const axios = require('axios');
require('dotenv').config();

// 🔑 Variáveis do .env
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// 🔑 Gera o token de acesso
async function getAccessToken() {
    const url = 'https://id.twitch.tv/oauth2/token';
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
    });

    const response = await axios.post(url, params);
    return response.data.access_token;
}

// 🔍 Pega o ID da categoria (jogo ou não-jogo, como ASMR)
async function getCategoryId(accessToken, categoryName) {
    const url = 'https://api.twitch.tv/helix/games';
    const response = await axios.get(url, {
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
        },
        params: { name: categoryName }
    });

    const data = response.data.data;
    if (data.length === 0) {
        throw new Error(`Categoria "${categoryName}" não encontrada na Twitch.`);
    }

    return data[0].id;
}

// 🎬 Pega os clips e filtra pelo título
async function getClipsByCategory(accessToken, categoryId, keyword) {
    const url = 'https://api.twitch.tv/helix/clips';
    const response = await axios.get(url, {
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
        },
        params: {
            game_id: categoryId,
            first: 20 // máximo por requisição (até 100)
        }
    });

    const clips = response.data.data;
    const filtered = clips.filter(clip =>
        clip.title.toLowerCase().includes(keyword.toLowerCase())
    );
    return filtered;
}

// 🚀 Executa tudo
(async () => {
    try {
        const accessToken = await getAccessToken();

        const categoryName = 'ASMR'; // Categoria da Twitch
        const keyword = 'relax';     // Palavra-chave no título do clip

        const categoryId = await getCategoryId(accessToken, categoryName);
        const clips = await getClipsByCategory(accessToken, categoryId, keyword);

        console.log(`🔍 Clips encontrados com "${keyword}" na categoria "${categoryName}":\n`);
        if (clips.length === 0) {
            console.log('Nenhum clip encontrado com esse filtro.');
        } else {
            clips.forEach(clip => {
                console.log(`🎥 ${clip.title}`);
                console.log(`🔗 ${clip.url}\n`);
            });
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
})();
