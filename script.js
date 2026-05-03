const scene = document.querySelector('.scene');
const ketchupCanvas = document.querySelector('#ketchupCanvas');
const ketchupCtx = ketchupCanvas.getContext('2d'); // 2D context API
const SCENE_WIDTH = 1456;
const SCENE_HEIGHT = 840;

ketchupCanvas.width = SCENE_WIDTH;
ketchupCanvas.height = SCENE_HEIGHT;
ketchupCtx.lineCap = 'round';
ketchupCtx.lineJoin = 'round';
ketchupCtx.strokeStyle = 'rgba(207, 19, 19, 0.95)';

function getSceneScale() {
  const rect = scene.getBoundingClientRect();
  return rect.width / 1456; 
}

// browser viewport coordinates -> scene coordinates
function clientToScenePos(clientX, clientY) {
  const rect = scene.getBoundingClientRect();
  const scale = getSceneScale();
  const sx = (clientX - rect.left) / scale;
  const sy = (clientY - rect.top) / scale;
  return { sx, sy };
}

const lightSwitch = document.querySelector('.light-switch');
lightSwitch.addEventListener('click', () => {
  document.body.classList.toggle('lights-off');
});

const tap = document.querySelector('.tap');
let flow = 0;
tap.addEventListener('click', () => {
    flow = (flow + 1) % 3;
    tap.dataset.flow = flow;
});

const dials = document.querySelectorAll('.dial.small');
dials.forEach(dial => {
    dial.addEventListener('click', () => {
        dial.classList.toggle('on');
    });
});

const otg = document.querySelector('.otg');
const otgFlat = document.querySelector('.otg-flat');
otg.addEventListener('click', () => {
    if (!otg.classList.contains('opening')) {
        otg.classList.add('opening');
        otg.addEventListener('transitionend', function handleOpen() {
            otg.classList.add('open');
            otg.removeEventListener('transitionend', handleOpen);
        }, { once: true });
    }
});
otgFlat.addEventListener('click', () => {
    otg.classList.remove('opening', 'open');
});


const cups = document.querySelectorAll('.cup');

cups.forEach(cup => {
  let isDragging = false;
  let startX, startY, origX, origY;

  cup.addEventListener('pointerdown', e => {
    isDragging = true;
    cup.setPointerCapture(e.pointerId);
    
    // mouse click 
    startX = e.clientX;
    startY = e.clientY;

    // pos of cup 
    origX = cup.offsetLeft;
    origY = cup.offsetTop;
    
    cup.style.cursor = 'grabbing';
    cup.style.zIndex = 100;
  });

  cup.addEventListener('pointermove', e => {
    if (!isDragging) return;
    
    // how much moved? 
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    cup.style.position = 'absolute';
    cup.style.left = (origX + deltaX) + 'px';
    cup.style.top  = (origY + deltaY) + 'px';
  });

  cup.addEventListener('pointerup', e => {
    isDragging = false;
    cup.releasePointerCapture(e.pointerId);
    cup.style.cursor = 'grab';
    
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    
    if (elementBelow?.closest('.storage')) {
      // Keep it where you dropped it
      cup.classList.add('on-storage');
    } else {
      // Snap back
      cup.style.position = '';
      cup.style.left = '';
      cup.style.top = '';
      cup.classList.remove('on-storage');
    }
  });
});

const ketchup = document.querySelector('.ketchup');
let isDraggingKetchup = false;
let ketchupPointerId = null;
let lastKetchupPoint = null;

function drawKetchupStreak(fromPoint, toPoint) {
  // .beginPath(), to keep as clean and separate frames 
  // .moveTo()
  // .lineTo()
  // .stroke()

  ketchupCtx.beginPath();
  ketchupCtx.moveTo(fromPoint.sx, fromPoint.sy);
  ketchupCtx.lineTo(toPoint.sx, toPoint.sy);
  ketchupCtx.lineWidth = 8 + Math.random() * 3;
  ketchupCtx.stroke();

  ketchupCtx.beginPath();
  ketchupCtx.arc(toPoint.sx, toPoint.sy, 4 + Math.random() * 4, 0, Math.PI * 2);
  ketchupCtx.fillStyle = 'rgba(207, 19, 19, 0.95)';
  ketchupCtx.fill();
}

ketchup.addEventListener('pointerdown', e => {
  e.preventDefault();
  isDraggingKetchup = true;
  ketchupPointerId = e.pointerId;
  ketchup.setPointerCapture(ketchupPointerId);
  ketchup.classList.add('dragging');

  ketchup.style.cursor = 'grabbing';

  // Move the bottle into scene space so it can be placed anywhere on the board.
  if (ketchup.parentElement !== scene) {
    const kRect = ketchup.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const scale = getSceneScale();
    ketchup.style.left = ((kRect.left - sceneRect.left) / scale) + 'px';
    ketchup.style.top = ((kRect.top - sceneRect.top) / scale) + 'px';
    scene.appendChild(ketchup);
  }

  const kRect = ketchup.getBoundingClientRect();
  // nozzle: top: -5px; left: 6px;
  const nozzleClientX = kRect.left + 8; // 6px left + 2px (half of 4px width)
  const nozzleClientY = kRect.top - 2;  // -5px top + 3px (half of 6px height)
  lastKetchupPoint = clientToScenePos(nozzleClientX, nozzleClientY);
});

document.addEventListener('pointermove', e => {
  if (!isDraggingKetchup) return;
  const pointerPoint = clientToScenePos(e.clientX, e.clientY);
  const x = pointerPoint.sx - (ketchup.offsetWidth / 2);
  const y = pointerPoint.sy - (ketchup.offsetHeight / 2);

  ketchup.style.position = 'absolute';
  ketchup.style.left = x + 'px';
  ketchup.style.top = y + 'px';

  // recompute nozzle client coords after the bottle has moved
  const kRectNow = ketchup.getBoundingClientRect();
  const nozzleClientXNow = kRectNow.left + 8;
  const nozzleClientYNow = kRectNow.top - 2;
  const currentPoint = clientToScenePos(nozzleClientXNow, nozzleClientYNow);
  if (lastKetchupPoint) drawKetchupStreak(lastKetchupPoint, currentPoint);
  lastKetchupPoint = currentPoint;
});

document.addEventListener('pointerup', e => {
  if (!isDraggingKetchup) return;
  isDraggingKetchup = false;
  ketchup.style.cursor = 'grab';
  ketchup.classList.remove('dragging');
  ketchup.style.zIndex = '';
  lastKetchupPoint = null;

  if (ketchupPointerId !== null) {
    ketchup.releasePointerCapture(ketchupPointerId);
    ketchupPointerId = null;
  }
});


const cloth = document.querySelector('.cloth');
let isDraggingCloth = false;
let clothPointerId = null;
let lastClothPoint = null;
let clothOffsetX = 0;
let clothOffsetY = 0;

function eraseKetchupStreak(fromPoint, toPoint) {
  ketchupCtx.globalCompositeOperation = "destination-out";

  ketchupCtx.beginPath();
  ketchupCtx.moveTo(fromPoint.sx, fromPoint.sy);
  ketchupCtx.lineTo(toPoint.sx, toPoint.sy);
  ketchupCtx.lineWidth = 25;
  ketchupCtx.stroke();

  ketchupCtx.beginPath();
  ketchupCtx.arc(toPoint.sx, toPoint.sy, 12, 0, Math.PI * 2);
  ketchupCtx.fill();

  ketchupCtx.globalCompositeOperation = "source-over";
}

cloth.addEventListener('pointerdown', e => {
  e.preventDefault();

  isDraggingCloth = true;
  clothPointerId = e.pointerId;
  cloth.setPointerCapture(clothPointerId);

  if (cloth.parentElement !== scene) {
    const clothRect = cloth.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const scale = getSceneScale();
    cloth.style.left = ((clothRect.left - sceneRect.left) / scale) + 'px';
    cloth.style.top = ((clothRect.top - sceneRect.top) / scale) + 'px';
    scene.appendChild(cloth);
  }

  const clothRect = cloth.getBoundingClientRect();
  clothOffsetX = e.clientX - clothRect.left;
  clothOffsetY = e.clientY - clothRect.top;

  cloth.classList.add('dragging');
  cloth.style.cursor = 'grabbing';

  lastClothPoint = clientToScenePos(e.clientX, e.clientY);
});

document.addEventListener('pointermove', e => {
  if (!isDraggingCloth) return;

  const pointerPoint = clientToScenePos(e.clientX, e.clientY);
  const clothX = pointerPoint.sx - (clothOffsetX / getSceneScale());
  const clothY = pointerPoint.sy - (clothOffsetY / getSceneScale());

  cloth.style.position = 'absolute';
  cloth.style.left = clothX + 'px';
  cloth.style.top = clothY + 'px';

  const currentPoint = clientToScenePos(e.clientX, e.clientY);
  eraseKetchupStreak(lastClothPoint, currentPoint);
  lastClothPoint = currentPoint;
});

document.addEventListener('pointerup', e => {
  if (!isDraggingCloth) return;

  isDraggingCloth = false;
  cloth.classList.remove('dragging');
  cloth.style.cursor = 'grab';
  cloth.style.zIndex = '';
  lastClothPoint = null;

  if (clothPointerId !== null) {
    cloth.releasePointerCapture(clothPointerId);
    clothPointerId = null;
  }
});