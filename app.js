// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Registration Failed', err));
    });
}

const video = document.getElementById('camera-stream');
const imageLoader = document.getElementById('image-loader');
const traceImage = document.getElementById('trace-image');
const opacitySlider = document.getElementById('opacity-slider');
const scaleSlider = document.getElementById('scale-slider');

// Start Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" },
            audio: false 
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Please allow camera access to use this app.");
    }
}

// Image Loader
imageLoader.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (f) => {
        traceImage.src = f.target.result;
        traceImage.style.display = 'block';
    };
    reader.readAsDataURL(e.target.files[0]);
});

// Fit to Screen
const fitBtn = document.getElementById('fit-btn');
fitBtn.addEventListener('click', () => {
    const isFit = traceImage.classList.toggle('fit-screen');
    fitBtn.textContent = isFit ? 'Original Size' : 'Fit to Screen';
    if (isFit) {
        scaleSlider.value = 1;
        traceImage.style.transform = '';
    }
});

// Controls
opacitySlider.addEventListener('input', (e) => traceImage.style.opacity = e.target.value);
scaleSlider.addEventListener('input', (e) => {
    traceImage.classList.remove('fit-screen');
    fitBtn.textContent = 'Fit to Screen';
    traceImage.style.transform = `scale(${e.target.value})`;
});

startCamera();