// Color name mapping
const colorNames = {
  "#000000": "Black",
  "#0c816e": "Dark Teal",
  "#0eb968": "Dark Green",
  "#0f799f": "Dark Cyan",
  "#10aea6": "Teal",
  "#13e1be": "Light Teal",
  "#13e67b": "Green",
  "#28509e": "Dark Blue",
  "#333941": "Dark Slate",
  "#3c3c3c": "Dark Gray",
  "#4093e4": "Blue",
  "#4a4284": "Dark Slate Blue",
  "#4a6b3a": "Dark Olive",
  "#4d31b8": "Dark Indigo",
  "#5a944a": "Olive",
  "#600018": "Deep Red",
  "#60f7f2": "Cyan",
  "#684634": "Dark Brown",
  "#6b50f6": "Indigo",
  "#6d643f": "Dark Stone",
  "#6d758d": "Slate",
  "#780c99": "Dark Purple",
  "#787878": "Gray",
  "#7a71c4": "Slate Blue",
  "#7b6352": "Dark Tan",
  "#7dc7ff": "Light Blue",
  "#84c573": "Light Olive",
  "#87ff5e": "Light Green",
  "#948c6b": "Stone",
  "#95682a": "Brown",
  "#99b1fb": "Light Indigo",
  "#9b5249": "Dark Peach",
  "#9c8431": "Dark Goldenrod",
  "#9c846b": "Tan",
  "#a50e1e": "Dark Red",
  "#aa38b9": "Purple",
  "#aaaaaa": "Medium Gray",
  "#b3b9d1": "Light Slate",
  "#b5aef1": "Light Slate Blue",
  "#bbfaf2": "Light Cyan",
  "#c5ad31": "Goldenrod",
  "#cb007a": "Dark Pink",
  "#cdc59e": "Light Stone",
  "#d18051": "Dark Beige",
  "#d18078": "Peach",
  "#d2d2d2": "Light Gray",
  "#d6b594": "Light Tan",
  "#dba463": "Light Brown",
  "#e09ff9": "Light Purple",
  "#e45c1a": "Dark Orange",
  "#e8d45f": "Light Goldenrod",
  "#ec1f80": "Pink",
  "#ed1c24": "Red",
  "#f38da9": "Light Pink",
  "#f6aa09": "Gold",
  "#f8b277": "Beige",
  "#f9dd3b": "Yellow",
  "#fa8072": "Light Red",
  "#fab6a4": "Light Peach",
  "#ff7f27": "Orange",
  "#ffc5a5": "Light Beige",
  "#fffabc": "Light Yellow",
  "#ffffff": "White",
  // transparent: "Transparent",  //?
};

const imageLoader = document.getElementById('imageLoader');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

let img = new Image();
let scale = 1;
let originalImage = null;

// Selected pixel coordinates
let selectedX = 0;
let selectedY = 0;

let chunkSize = 20;
let rootWplaceX = 1138;
let rootWplaceY = 2759;
let wplaceName = "Biên Hòa";

const chunkCanvas = document.getElementById('chunkCanvas');
const chunkCtx = chunkCanvas.getContext('2d');
const canvasContainer = document.getElementById('canvasContainer');

// Preload default image
window.addEventListener('load', () => {
  img.onload = function() {
    const containerWidth = canvasContainer.clientWidth;

    // Calculate scale to fit within container
    scale = Math.min(
      containerWidth / img.width
    );

    // Draw at native resolution to get original pixels
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0);
    originalImage = ctx.getImageData(0, 0, img.width, img.height);

    redraw();

    chunkCanvas.width = chunkSize * 10;
    chunkCanvas.height = chunkSize * 10;
  };
  img.src = './images/triple-baka.png'; // your default image file
});

// Zoom buttons
document.getElementById('zoomIn').addEventListener('click', () => {
  scale *= 1.2;
  redraw();
});
document.getElementById('zoomOut').addEventListener('click', () => {
  scale /= 1.2;
  redraw();
});

function redraw() {
  if (!originalImage) return;
  canvas.width = originalImage.width * scale;
  canvas.height = originalImage.height * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (selectedX !== null && selectedY !== null) {
    drawSelection();
  }
}

// Get pixel color at coordinates
function updatePixelInfo(x, y) {
  if (!originalImage) return;
  const index = (y * originalImage.width + x) * 4;
  const pixel = originalImage.data;
  
  const r = pixel[index];
  const g = pixel[index + 1];
  const b = pixel[index + 2];
  const hex = rgbToHex(r, g, b);
  
  document.getElementById('coords').textContent = `${x}, ${y}`;
  document.getElementById('wplaceCoords').textContent = `${x + rootWplaceX}, ${y + rootWplaceY} ${wplaceName}`;
  document.getElementById('colorValue').textContent = `${hex} (RGB: ${r},${g},${b})`;
  document.getElementById('colorBox').style.backgroundColor = hex;
  document.getElementById('colorName').textContent =
    colorNames[hex.toLowerCase()] ? ` - ${colorNames[hex.toLowerCase()]}` : '';
}

// Draw selection border
function drawSelection() {
  const px = selectedX * scale;
  const py = selectedY * scale;

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, scale, scale);
}

// Show chunk viewer
function showChunkForPixel(x, y) {
  if (!originalImage) return;

  const chunkX = Math.floor(x / chunkSize);
  const chunkY = Math.floor(y / chunkSize);
  
  const x1 = Math.min(chunkX * chunkSize, originalImage.width - chunkSize);
  const y1 = Math.min(chunkY * chunkSize, originalImage.height - chunkSize);
  const x2 = Math.min(x1 + chunkSize, originalImage.width) - 1;
  const y2 = Math.min(y1 + chunkSize, originalImage.height) - 1;

  const width = x2 - x1 + 1;
  const height = y2 - y1 + 1;
  const chunkData = ctx.createImageData(width, height);

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const srcIndex = ((y1 + row) * originalImage.width + (x1 + col)) * 4;
      const dstIndex = (row * width + col) * 4;
      chunkData.data[dstIndex] = originalImage.data[srcIndex];
      chunkData.data[dstIndex + 1] = originalImage.data[srcIndex + 1];
      chunkData.data[dstIndex + 2] = originalImage.data[srcIndex + 2];
      chunkData.data[dstIndex + 3] = originalImage.data[srcIndex + 3];
    }
  }

  chunkCtx.imageSmoothingEnabled = false;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCanvas.getContext('2d').putImageData(chunkData, 0, 0);
  chunkCtx.drawImage(tempCanvas, 0, 0, chunkCanvas.width, chunkCanvas.height);

  // Highlight the selected pixel in chunk view
  // console.log(`Selected pixel: (${x}, ${y}) in chunk (${chunkX}, ${chunkY})`);
  // console.log(originalImage.width - x, originalImage.height - y);
  // const offsetXAtEdge = (originalImage.width - x) < chunkSize ? (originalImage.width - x) % chunkSize : 0;
  // const offsetYAtEdge = (originalImage.height - y) < chunkSize ? (originalImage.height - y) % chunkSize : 0;
  // console.log(`Offset X: ${offsetXAtEdge}, Offset Y: ${offsetYAtEdge}`);
  const selChunkX = (x - x1) * 10;
  const selChunkY = (y - y1) * 10;
  chunkCtx.strokeStyle = 'red';
  chunkCtx.lineWidth = 1;
  chunkCtx.strokeRect(selChunkX, selChunkY, 10, 10);

  document.getElementById('chunkInfo').textContent = `Chunk: (${x1},${y1}) -> (${x2},${y2})`;
}

// Click to select pixel
canvas.addEventListener('click', function(e) {
  if (!originalImage) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / scale);
  const y = Math.floor((e.clientY - rect.top) / scale);
  
  if (x < 0 || y < 0 || x >= originalImage.width || y >= originalImage.height) return;
  
  selectedX = x;
  selectedY = y;
  redraw();
  updatePixelInfo(x, y);
  showChunkForPixel(x, y);
});

// Keyboard navigation
window.addEventListener('keydown', function(e) {
  if (selectedX === null || selectedY === null) return;
  
  if (e.key === 'ArrowUp' && selectedY > 0) selectedY--;
  else if (e.key === 'ArrowDown' && selectedY < originalImage.height - 1) selectedY++;
  else if (e.key === 'ArrowLeft' && selectedX > 0) selectedX--;
  else if (e.key === 'ArrowRight' && selectedX < originalImage.width - 1) selectedX++;
  else return;
  
  redraw();
  updatePixelInfo(selectedX, selectedY);
  showChunkForPixel(selectedX, selectedY);
  e.preventDefault();
});

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => {
    const h = v.toString(16);
    return h.length === 1 ? "0" + h : h;
  }).join('');
}

// Allow clicking inside the chunk viewer
chunkCanvas.addEventListener('click', function(e) {
  if (!originalImage || selectedX === null || selectedY === null) return;

  const rect = chunkCanvas.getBoundingClientRect();
  const clickX = Math.floor((e.clientX - rect.left) / 10); // 10 = scale factor in chunk view
  const clickY = Math.floor((e.clientY - rect.top) / 10);

  // Find current chunk bounds
  const chunkX = Math.floor(selectedX / chunkSize);
  const chunkY = Math.floor(selectedY / chunkSize);
  const x1 = chunkX * chunkSize;
  const y1 = chunkY * chunkSize;

  // New selected pixel in full image
  const newX = x1 + clickX;
  const newY = y1 + clickY;

  if (newX >= originalImage.width || newY >= originalImage.height) return;

  selectedX = newX;
  selectedY = newY;
  redraw();
  updatePixelInfo(newX, newY);
  showChunkForPixel(newX, newY);
});

// Toggle advanced options
document.getElementById('toggleAdvanced').addEventListener('click', () => {
  const adv = document.getElementById('advancedOptions');
  const btn = document.getElementById('toggleAdvanced');
  if (adv.style.display === 'none') {
    adv.style.display = 'block';
    btn.textContent = 'Hide Advanced Options ▲';
  } else {
    adv.style.display = 'none';
    btn.textContent = 'Show Advanced Options ▼';
  }
});

// Listen to changes
document.getElementById('chunkSizeInput').addEventListener('input', e => {
  const val = parseInt(e.target.value, 10);
  if (val > 0) {
    chunkSize = val;
    if (selectedX !== null && selectedY !== null) {
      showChunkForPixel(selectedX, selectedY);
    }
  }
});

document.getElementById('rootWplaceXInput').addEventListener('input', e => {
  rootWplaceX = parseInt(e.target.value, 10) || 0;
  if (selectedX !== null && selectedY !== null) {
    updatePixelInfo(selectedX, selectedY);
  }
});

document.getElementById('rootWplaceYInput').addEventListener('input', e => {
  rootWplaceY = parseInt(e.target.value, 10) || 0;
  if (selectedX !== null && selectedY !== null) {
    updatePixelInfo(selectedX, selectedY);
  }
});

document.getElementById('wplaceNameInput').addEventListener('input', e => {
  wplaceName = e.target.value;
  if (selectedX !== null && selectedY !== null) {
    updatePixelInfo(selectedX, selectedY);
  }
});

// Handle custom image upload
document.getElementById('imageLoader').addEventListener('change', e => {
  const reader = new FileReader();
  reader.onload = function(event) {
    img.onload = function() {
      scale = 5;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      originalImage = ctx.getImageData(0, 0, img.width, img.height);
      redraw();
    };
    img.src = event.target.result;
  };
  if (e.target.files[0]) {
    reader.readAsDataURL(e.target.files[0]);
  }
});
