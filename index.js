const axios = require('axios');
require('dotenv').config();


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;


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


async function getClipsByCategory(accessToken, categoryId, keyword) {
    const url = 'https://api.twitch.tv/helix/clips';
    const response = await axios.get(url, {
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
        },
        params: {
            game_id: categoryId,
            first: 20 
        }
    });

    const clips = response.data.data;
    const filtered = clips.filter(clip =>
        clip.title.toLowerCase().includes(keyword.toLowerCase())
    );
    return filtered;
}


(async () => {
    try {
        const accessToken = await getAccessToken();

        const categoryName = 'Fortnite'; 
        const keyword = 'Gaming';    

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
