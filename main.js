(() => {
    const imageFilePath = "assets/images/";
    const numImages = 41;
    const flipRandomPercent = 2;
    var isEnabled = true;
    var isPreviewing = false; // Estado para controlar la previsualización

    // Observa cambios en el DOM para detectar nuevas miniaturas
    function observeThumbnails() {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        const callback = (mutationsList) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // Evitar cambios durante la previsualización
                    if (!isPreviewing) {
                        getThumbnails();
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    // Obtiene todas las miniaturas de YouTube en la página
    function getThumbnails() {
        const thumbnailQuery = "ytd-thumbnail a > yt-image > img.yt-core-image:only-child";
        const thumbnails = document.querySelectorAll(thumbnailQuery);

        thumbnails.forEach((image) => {
            // Verificar si ya tiene una imagen personalizada aplicada o si está en previsualización
            if (image.classList.contains('custom-thumbnail-applied') || image.closest('.ytd-video-preview')) {
                return;
            }

            const index = getRandomImage();
            let flip = getImageState();
            let url = getImageURL(index);

            applyThumbnails(image, url, flip);

            // Añadir una clase para marcar que ya se ha aplicado
            image.classList.add('custom-thumbnail-applied');
        });
    }

    // Devuelve la URL de una imagen
    function getImageURL(index) {
        return chrome.runtime.getURL(`${imageFilePath}${index}.png`);
    }

    // Aplica las imágenes como superposiciones a las miniaturas
    function applyThumbnails(image, imageUrl, flip = false) {
        if (image.nodeName === "IMG") {
            // Verificar si ya tiene un overlay
            if (!image.parentElement.querySelector(".thumbnail-overlay")) {
                const overlay = document.createElement("img");
                overlay.src = imageUrl;
                overlay.classList.add("thumbnail-overlay");
                overlay.style.position = "absolute";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100%";
                overlay.style.height = "100%";
                overlay.style.zIndex = "0";
                if (flip) {
                    overlay.style.transform = "scaleX(-1)";
                }
                image.style.position = "relative";
                image.parentElement.appendChild(overlay);

                // Escuchar eventos de previsualización para controlar el estado
                image.parentElement.addEventListener('mouseenter', () => {
                    isPreviewing = true; // Cambiar estado al iniciar previsualización
                });
                image.parentElement.addEventListener('mouseleave', () => {
                    isPreviewing = false; // Restaurar estado al salir de la previsualización
                });
            }
        } else if (image.nodeName === "DIV") {
            image.style.backgroundImage = `url("${imageUrl}"), ` + image.style.backgroundImage;
        }
    }

    // Devuelve un número aleatorio del 0 al max
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    // Obtiene un número aleatorio para seleccionar una imagen
    function getRandomImage() {
        return getRandomInt(numImages + 1);
    }

    // Determina aleatoriamente si la imagen se voltea o no
    function getImageState() {
        let random = getRandomInt(flipRandomPercent);
        return random === 1;
    }

    // Inicia la observación del DOM para aplicar las miniaturas
    if (isEnabled) {
        observeThumbnails();
        getThumbnails(); // Ejecutar al cargar por primera vez
    }
})();
