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
const rotateSlider = document.getElementById('rotate-slider');
const rotateReset = document.getElementById('rotate-reset');

// Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const uiContent = document.querySelector('.ui-content');
menuToggle.addEventListener('click', () => {
    uiContent.classList.toggle('collapsed');
});

// Start Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment",
                width:  { ideal: 4096 },
                height: { ideal: 4096 }
            },
            audio: false 
        });
        video.srcObject = stream;

        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.log(`Camera resolution: ${settings.width}x${settings.height}`);
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
    fitBtn.innerHTML = isFit ? '<span class="material-symbols-rounded">fullscreen_exit</span> Original Size' : '<span class="material-symbols-rounded">fit_screen</span> Fit to Screen';
    if (isFit) {
        scaleSlider.value = 1;
        rotateSlider.value = 0;
        updateTransform();
    }
});

// Drag
const overlay = document.getElementById('overlay');
let posX = 0, posY = 0;
let dragStartX = 0, dragStartY = 0;
let isDragging = false;
let locked = false;

const lockBtn = document.getElementById('lock-btn');
lockBtn.addEventListener('click', () => {
    locked = !locked;
    lockBtn.innerHTML = locked ? '<span class="material-symbols-rounded">lock</span> Unlock Position' : '<span class="material-symbols-rounded">lock_open</span> Lock Position';
    lockBtn.classList.toggle('lock-active', locked);
    overlay.style.pointerEvents = locked ? 'none' : 'auto';
    traceImage.style.cursor = locked ? 'default' : 'grab';
});

overlay.style.pointerEvents = 'auto';

function getPointerPos(e) {
    const pt = e.touches ? e.touches[0] : e;
    return { x: pt.clientX, y: pt.clientY };
}

function onDragStart(e) {
    if (locked) return;
    isDragging = true;
    const p = getPointerPos(e);
    dragStartX = p.x - posX;
    dragStartY = p.y - posY;
    traceImage.style.cursor = 'grabbing';
    e.preventDefault();
}

function onDragMove(e) {
    if (!isDragging) return;
    const p = getPointerPos(e);
    posX = p.x - dragStartX;
    posY = p.y - dragStartY;
    updateTransform();
    e.preventDefault();
}

function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    traceImage.style.cursor = locked ? 'default' : 'grab';
}

overlay.addEventListener('mousedown', onDragStart);
overlay.addEventListener('mousemove', onDragMove);
overlay.addEventListener('mouseup', onDragEnd);
overlay.addEventListener('touchstart', onDragStart, { passive: false });
overlay.addEventListener('touchmove', onDragMove, { passive: false });
overlay.addEventListener('touchend', onDragEnd);

function updateTransform() {
    const scale = scaleSlider.value;
    const rotate = rotateSlider.value;
    traceImage.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotate}deg)`;
}

// Controls
opacitySlider.addEventListener('input', (e) => traceImage.style.opacity = e.target.value);
scaleSlider.addEventListener('input', (e) => {
    traceImage.classList.remove('fit-screen');
    fitBtn.innerHTML = '<span class="material-symbols-rounded">fit_screen</span> Fit to Screen';
    updateTransform();
});

rotateSlider.addEventListener('input', () => updateTransform());
rotateReset.addEventListener('click', () => {
    rotateSlider.value = 0;
    updateTransform();
});

startCamera();