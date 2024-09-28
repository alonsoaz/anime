// Función para generar el URL de la API
const generateApiUrl = (episodeId, serverName, category) => {
    return `https://api-anime-rouge.vercel.app/aniwatch/episode-srcs?id=${episodeId}&server=${serverName}&category=${category}`;
};

// Función para generar el URL de fallback
const generateFallbackUrl = (episodeId) => {
    return `https://api-anime-rouge.vercel.app/aniwatch/episode-srcs?id=${episodeId}`;
};

// Función para crear un botón de servidor
const createButton = (server, episodeId, category) => {
    const button = document.createElement('button');
    button.textContent = `${server.serverName} (${category})`;
    button.onclick = () => {
        const apiUrlFull = generateApiUrl(episodeId, server.serverName, category);
        const apiUrlFallback = generateFallbackUrl(episodeId);

        fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrlFull)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.contents) {
                    // Guardar datos en localStorage antes de redirigir
                    localStorage.setItem('serverData', JSON.stringify({
                        server: server.serverName,
                        episodeId: episodeId,
                        category: category
                    }));
                    window.open('https://alonsoaz.github.io/anime/player.html', '_blank');
                } else {
                    throw new Error('Error en el servidor, usando enlace fallback.');
                }
            })
            .catch(error => {
                console.error(error);
                const fallbackUrl = `https://alonsoaz.github.io/anime/player.html`;
                window.open(fallbackUrl, '_blank');
            });
    };
    return button;
};


// Función para renderizar botones de servidores
const renderButtons = (servers, containerId, episodeId) => {
    const container = document.getElementById(containerId);
    // Renderizar botones subtitulados
    servers.sub.forEach(server => {
        const button = createButton(server, episodeId, 'sub');
        container.appendChild(button);
    });
    // Renderizar botones doblados
    servers.dub.forEach(server => {
        const button = createButton(server, episodeId, 'dub');
        container.appendChild(button);
    });
};

// Cargar datos de la API externa usando AllOrigins para evitar CORS
fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://api-anime-rouge.vercel.app/aniwatch/servers?id=solo-leveling-18718?ep=120094')}`)
    .then(response => response.json())
    .then(data => {
        const apiData = JSON.parse(data.contents);
        const episodeId = apiData.episodeId;  // Usamos el episodeId directamente
        renderButtons(apiData, 'api-buttons', episodeId);
    })
    .catch(error => console.error('Error al cargar datos de la API:', error));
