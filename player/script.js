// Función para crear un reproductor de video compatible con HLS desde la API
function createVideoPlayerFromApi(data) {
    const container = document.getElementById('api-video');

    // Recuperar datos de localStorage
    const serverData = JSON.parse(localStorage.getItem('serverData'));

    if (serverData) {
        const { server, episodeId, category } = serverData;

        // Usar los parámetros según sea necesario
        console.log('Server:', server);
        console.log('Episode ID:', episodeId);
        console.log('Category:', category);

        // Mostrar información en el contenedor
        const videoContainer = document.getElementById('video-container');
        videoContainer.innerHTML = `<p>Reproduciendo desde: ${server} - Episodio: ${episodeId} - Categoría: ${category}</p>`;

        // Opcional: limpiar los datos después de usarlos
        localStorage.removeItem('serverData');
    } else {
        console.log('No hay datos de servidor disponibles.');
    }

    // Agregar título del reproductor
    const title = document.createElement('h2');
    title.innerText = `Reproductor de video (API)`;
    container.appendChild(title);

    // Crear el elemento video
    const video = document.createElement('video');
    video.setAttribute('controls', 'true');
    video.setAttribute('crossorigin', 'anonymous');

    // Verificar si el navegador soporta HLS de forma nativa
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Si el navegador soporta HLS nativamente, cargar la fuente directamente
        video.src = data.sources[0].url;
    } else if (Hls.isSupported()) {
        // Si el navegador no soporta HLS, usar HLS.js
        const hls = new Hls();
        hls.loadSource(data.sources[0].url);
        hls.attachMedia(video);
    } else {
        console.error('HLS no es soportado en este navegador.');
        return;
    }

    // Agregar los subtítulos
    data.tracks.forEach(track => {
        if (track.label) { // Verificar si track.label está definido
            const trackElement = document.createElement('track');
            trackElement.setAttribute('src', track.file);
            trackElement.setAttribute('kind', track.kind);
            
            if (track.label) {
                trackElement.setAttribute('srclang', track.label.substring(0, 2).toLowerCase());
                trackElement.setAttribute('label', track.label);
            }

            if (track.default) {
                trackElement.setAttribute('default', 'true');
            }
            video.appendChild(trackElement);
        } else {
            console.warn('Pista sin label encontrada: ', track);
        }
    });

    // Crear botones para saltar intro y outro
    const skipIntroBtn = document.createElement('button');
    skipIntroBtn.innerText = "Saltar Intro";
    skipIntroBtn.addEventListener('click', () => {
        video.currentTime = data.intro.end;
    });

    const skipOutroBtn = document.createElement('button');
    skipOutroBtn.innerText = "Saltar Outro";
    skipOutroBtn.addEventListener('click', () => {
        video.currentTime = data.outro.start;
    });

    // Agregar el video y los botones al contenedor
    container.appendChild(video);
    container.appendChild(skipIntroBtn);
    container.appendChild(skipOutroBtn);
}

// Función para cargar el JSON de la API usando AllOrigins para evitar CORS
function loadApiJson() {
    const apiUrl = 'https://api-anime-rouge.vercel.app/aniwatch/episode-srcs?id=solo-leveling-18718?ep=120094&server=vidstreaming&category=sub';
    const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    fetch(allOriginsUrl)
        .then(response => response.json())
        .then(data => {
            const parsedData = JSON.parse(data.contents);
            createVideoPlayerFromApi(parsedData);
        })
        .catch(error => console.error('Error al cargar el JSON desde la API:', error));
}

// Crear contenedor de video para la API
const videoContainer = document.getElementById('video-container');

const apiContainer = document.createElement('div');
apiContainer.setAttribute('id', 'api-video');
videoContainer.appendChild(apiContainer);

// Cargar el reproductor desde la API
loadApiJson();
