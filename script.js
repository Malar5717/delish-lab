
const scene = document.querySelector('.scene');
const SCENE_WIDTH = 1456;
const SCENE_HEIGHT = 840;

function getSceneInfo() {
  const rect = scene.getBoundingClientRect();
  const scale = rect.width / SCENE_WIDTH;
  return { rect, scale };
}

// browser viewport coordinates -> scene coordinates
function clientToScenePos(clientX, clientY) {
  const { rect, scale } = getSceneInfo();
  const sx = (clientX - rect.left) / scale;
  const sy = (clientY - rect.top) / scale;
  return { sx, sy };
}

// Light switch
const lightSwitch = document.querySelector('.light-switch');
lightSwitch.addEventListener('click', () => {
  document.body.classList.toggle('lights-go');
});

// Tap
const tap = document.querySelector('.tap');
let flow = 0;
tap.addEventListener('click', () => {
  flow = (flow + 1) % 3;
  tap.dataset.flow = flow;
});

// Otg
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

// Dials
const dials = document.querySelectorAll('.dial.small');
dials.forEach(dial => {
  dial.addEventListener('click', () => {
    dial.classList.toggle('on');
  });
});

// Boil logic
let isBoiling = false;
const pot = document.querySelector('.pot');
const dial = document.querySelector('.dial.large');
dial.addEventListener('click', () => {
  dial.classList.toggle('on');
  isBoiling = !isBoiling;
  if (pot) {
    if (isBoiling) {
      pot.classList.add('boiling');
    } else {
      pot.classList.remove('boiling');
    }
  }
});

const bubbleCanvas = document.querySelector('#boilBubbles');
const bubbleCtx = bubbleCanvas.getContext('2d');
bubbleCanvas.width = 80;
bubbleCanvas.height = 60;

let bubbles = [];

function createBubble() {
  bubbles.push({
    x: Math.random() * 80,
    y: 60,
    r: Math.random() * 3 + 2,
    speed: Math.random() * 1 + 0.5,
    life: 1
  });
}

function updateBubbles() {
  if (isBoiling && Math.random() < 0.4) {
    createBubble();
  }

  bubbles.forEach(b => {
    b.y -= b.speed;
    b.r += 0.03;
    b.life -= 0.02;
  });

  bubbles = bubbles.filter(b => b.life > 0);
}

function drawBubbles() {
  bubbleCtx.clearRect(0, 0, 80, 60);

  bubbles.forEach(b => {
    bubbleCtx.beginPath();
    bubbleCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    bubbleCtx.strokeStyle = `rgba(255, 149, 0, ${b.life})`;
    bubbleCtx.lineWidth = 1;
    bubbleCtx.stroke();
    bubbleCtx.fillStyle = `rgba(255, 149, 0, ${b.life})`;
    bubbleCtx.fill();
  });
}

function animateBubbles() {
  requestAnimationFrame(animateBubbles);
  updateBubbles();
  drawBubbles();
}

animateBubbles();

// ketchup streak logic
const ketchupCanvas = document.querySelector('#ketchupCanvas');
const ketchupCtx = ketchupCanvas.getContext('2d'); // 2D context API

ketchupCanvas.width = SCENE_WIDTH;
ketchupCanvas.height = SCENE_HEIGHT;
ketchupCtx.lineCap = 'round';
ketchupCtx.lineJoin = 'round';
ketchupCtx.strokeStyle = 'rgba(207, 19, 19, 0.95)';

// items in the rod
const rodItems = document.querySelectorAll('.rod-i');

rodItems.forEach(item => {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  item.addEventListener('pointerdown', e => {
    isDragging = true;
    item.setPointerCapture(e.pointerId);
    
    // Store starting positions
    startX = e.clientX;
    startY = e.clientY;
    startLeft = item.offsetLeft;
    startTop = item.offsetTop;
    
    item.style.cursor = 'grabbing';
    item.style.zIndex = '100';
  });

  item.addEventListener('pointermove', e => {
    if (!isDragging) return;
    
    item.style.position = 'absolute';
    item.style.left = (startLeft + (e.clientX - startX)) + 'px';
    item.style.top = (startTop + (e.clientY - startY)) + 'px';
  });

  item.addEventListener('pointerup', e => {
    isDragging = false;
    item.releasePointerCapture(e.pointerId);
    item.style.cursor = 'grab';
    
    // snap back
    item.style.position = '';
    item.style.left = '';
    item.style.top = '';
    item.style.zIndex = '';
  });
});

// ketchup logic
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

  // Move the bottle into scene space so it can be placed anywhere on the board
  if (ketchup.parentElement !== scene) {
    const kRect = ketchup.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const scale = getSceneInfo().scale;
    ketchup.style.left = ((kRect.left - sceneRect.left) / scale) + 'px';
    ketchup.style.top = ((kRect.top - sceneRect.top) / scale) + 'px';
    scene.appendChild(ketchup);
  }

  const kRect = ketchup.getBoundingClientRect();
  const nozzleClientX = kRect.left + 8;
  const nozzleClientY = kRect.top - 2;
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

// cloth logic - same canvas context as ketchup
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
    const scale = getSceneInfo().scale;
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

  const { scale } = getSceneInfo();
  const pointerPoint = clientToScenePos(e.clientX, e.clientY);
  const clothX = pointerPoint.sx - (clothOffsetX / scale);
  const clothY = pointerPoint.sy - (clothOffsetY / scale);

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


