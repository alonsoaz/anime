const videoElement = document.getElementById('videoElement');
const resultDiv = document.getElementById('resultDiv');
const skipIntroButton = document.getElementById('skipIntroButton');
const skipOutroButton = document.getElementById('skipOutroButton');

const introEnd = 89; // Tiempo de finalización del intro
const outroStart = 1325; // Tiempo de inicio del outro

// Cargar fuentes y reproducir video al cargar la página
window.onload = () => {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent("https://api-anime-rouge.vercel.app/aniwatch/episode-srcs?id=solo-leveling-18718?ep=120094&server=vidstreaming&category=sub")}`;

    fetch(url)
    .then(response => response.json())
        .then(data => {
            const apiData = JSON.parse(data.contents); // Parsear el contenido de la API
            const videoUrl = apiData.sources[0].url; // Asumiendo que el primer source es el que quieres usar
            const tracks = apiData.tracks.map(track => ({
                file: `https://api.allorigins.win/raw?url=${encodeURIComponent(track.file)}`, // Usar proxy para los subtítulos
                label: track.label,
                kind: track.kind || 'captions',
                default: track.default || false
            }));

            playVideo(videoUrl, tracks);
            console.log(`Enlace del video: ${videoUrl}`); // Log del enlace del video
            console.log("Array de subtítulos guardado:", tracks); // Log del array de subtítulos
        })
        .catch(error => {
            console.error('Error al consumir la API:', error);
            resultDiv.innerHTML = '<p class="error">Error al consumir la API.</p>';
        });
};

function playVideo(url, tracks) {
    // Limpiar resultados anteriores
    resultDiv.innerHTML = '';

    // Configuración de HLS.js para reproducir el video
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoElement.play();
        });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = url;
        videoElement.addEventListener('loadedmetadata', function () {
            videoElement.play();
        });
    } else {
        resultDiv.innerHTML = '<p class="error">El navegador no es compatible con HLS.</p>';
    }

    // Agregar subtítulos
    if (tracks) {
        tracks.forEach(track => {
            if (track.label && track.file) {
                console.log(`Intentando agregar subtítulo: ${track.label} (${track.file})`); // Log para depuración
                const trackElement = document.createElement('track');
                trackElement.kind = track.kind; // Tipo de subtítulos por defecto
                trackElement.src = track.file; // URL de subtítulos (con proxy)
                trackElement.srclang = track.label.toLowerCase(); // Idioma de los subtítulos (en minúscula)
                trackElement.label = track.label; // Etiqueta para los subtítulos

                // Verificar si se debe establecer como predeterminado
                if (track.default) {
                    trackElement.default = true; // Establecer subtítulos por defecto
                }

                videoElement.appendChild(trackElement);
            } else {
                console.warn('Subtítulo faltante: ', track); // Advertencia si falta información
            }
        });
    }

    // Reproducir desde el inicio
    videoElement.currentTime = 0; // Comienza desde 0.0

    // Saltar la intro
    skipIntroButton.addEventListener('click', () => {
        videoElement.currentTime = introEnd; // Salta al final del intro
    });

    // Saltar automáticamente al outro al final del video
    videoElement.addEventListener('timeupdate', function () {
        if (videoElement.currentTime >= outroStart) {
            videoElement.pause(); // Pausa el video al entrar en el outro
        }
    });

    // Saltar el outro al hacer clic en el botón
    skipOutroButton.addEventListener('click', () => {
        videoElement.currentTime = outroStart; // Salta al inicio del outro
        videoElement.play(); // Reanuda la reproducción
    });
}
