const lightSwitch = document.querySelector('.light-switch');
const scene = document.querySelector('.scene');
lightSwitch.addEventListener('click', () => {
    scene.classList.toggle('lights-off');
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