// --- FORMAS, TEXTO, CROP E CAMADAS ---

function handleEditClick(eventData, transform) {
  const target = transform.target;

  if (target.type === 'i-text' || target.type === 'text') {
    openSheet('textSheet');
    const cleanFont = target.fontFamily.replace(/['"]+/g, '');
    document.getElementById('txtSpacing').value = target.charSpacing;
    document.getElementById('previewText').style.fontFamily = cleanFont;
    document.getElementById('previewText').style.letterSpacing = (target.charSpacing / 20) + 'px';
    highlightFontInList(cleanFont);
    const currentColor = target.fill;
    document.getElementById('textColor').value = currentColor; 
    document.getElementById('previewText').style.color = currentColor;
  } 
  else if (target.type === 'image') {
    startCrop(target);
  } 
  else if (['rect', 'circle', 'triangle', 'polygon', 'path'].includes(target.type)) {
    openShapeEditor(target);
  }
}

function addShape(type) {
  let shape;
  const commonProps = { 
      left: grid.w/2, top: grid.h/2, 
      fill: '#233476', 
      originX: 'center', originY: 'center',
      strokeWidth: 0, stroke: '#000000',
      strokeUniform: true, // Garante que a borda não estique
      noScaleCache: false
  };
  const size = 200;

  if(type === 'rect') {
      shape = new fabric.Rect({ ...commonProps, width: size, height: size, rx: 0, ry: 0 });
  } else if (type === 'circle') {
      shape = new fabric.Circle({ ...commonProps, radius: size/2 });
  } else if (type === 'triangle') {
      shape = new fabric.Triangle({ ...commonProps, width: size, height: size });
  } else if (type === 'pentagon') {
      const points = [];
      for (let i = 0; i < 5; i++) {
         points.push({
             x: (size/2) * Math.cos(i * 2 * Math.PI / 5 - Math.PI/2),
             y: (size/2) * Math.sin(i * 2 * Math.PI / 5 - Math.PI/2)
         });
      }
      shape = new fabric.Polygon(points, { ...commonProps });
  } else if (SHAPE_PATHS[type]) {
      shape = new fabric.Path(SHAPE_PATHS[type], { ...commonProps });
      const scale = size / Math.max(shape.width, shape.height);
      shape.set({ scaleX: scale, scaleY: scale });
  }

  if(shape) {
      addToCanvas(shape);
      toggleAddMenu();
  }
}

function openShapeEditor(obj) {
  openSheet('shapeEditSheet');
  
  const fillCheck = document.getElementById('shapeFillCheck');
  const fillColor = document.getElementById('shapeFillColor');
  const strokeColor = document.getElementById('shapeStrokeColor');
  const strokeWidth = document.getElementById('shapeStrokeWidth');
  const radiusContainer = document.getElementById('radiusContainer');
  const radiusSlider = document.getElementById('shapeRadius');

  // Preenchimento
  if(obj.fill === 'transparent' || !obj.fill) {
      fillCheck.checked = false;
      fillColor.value = '#000000'; 
  } else {
      fillCheck.checked = true;
      fillColor.value = obj.fill; 
  }

  // Borda
  if (obj.stroke && obj.stroke !== 'transparent') {
      strokeColor.value = obj.stroke;
  } else {
      strokeColor.value = '#000000';
  }
  
  strokeWidth.value = obj.strokeWidth || 0;
  document.getElementById('strokeWidthTxt').innerText = strokeWidth.value;

  // Arredondamento (Só para Retângulos)
  if (obj.type === 'rect') {
      radiusContainer.style.display = 'block';
      radiusSlider.value = obj.rx || 0;
  } else {
      radiusContainer.style.display = 'none';
  }
}

function updateShapeProps() {
  const obj = canvas.getActiveObject();
  if(!obj) return;

  const fillCheck = document.getElementById('shapeFillCheck').checked;
  const fillColor = document.getElementById('shapeFillColor').value;
  const strokeColor = document.getElementById('shapeStrokeColor').value;
  const strokeWidth = parseInt(document.getElementById('shapeStrokeWidth').value);
  const radius = parseInt(document.getElementById('shapeRadius').value);
  
  document.getElementById('strokeWidthTxt').innerText = strokeWidth;

  obj.set('fill', fillCheck ? fillColor : 'transparent');
  
  // Lógica da Borda
  if(strokeWidth > 0) {
      obj.set('stroke', strokeColor);
      obj.set('strokeWidth', strokeWidth);
      obj.set('strokeUniform', true);
      obj.set('strokeLineJoin', 'miter'); 
      obj.set('strokeMiterLimit', 10);
  } else {
      obj.set('strokeWidth', 0);
      obj.set('stroke', 'transparent');
  }

  // Arredondamento
  if (obj.type === 'rect') {
      obj.set({ rx: radius, ry: radius });
  } 

  canvas.requestRenderAll();
}

function addToCanvas(obj) {
  const cellW = grid.w / grid.cols; 
  if(obj.width > cellW) obj.scaleToWidth(cellW * 0.8);
  canvas.add(obj); 
  obj.center(); 
  canvas.setActiveObject(obj); 
  setMaskMode('editing');
  canvas.requestRenderAll();
}

function createLabel() {
  const t = new fabric.IText('Escreva aqui', { 
    fontFamily: 'Roboto', fontSize: 100, 
    left: grid.w/2, top: grid.h/2, 
    originX: 'center', originY: 'center', 
    fill: '#000000', charSpacing: 0 
  });
  
  canvas.add(t);
  canvas.setActiveObject(t);
  
  setTimeout(() => {
    t.enterEditing();
    t.selectAll();
    canvas.requestRenderAll();
  }, 100);

  toggleAddMenu();
}

function updateActiveText(prop) {
  const obj = canvas.getActiveObject(); if(!obj) return;
  if(prop === 'spacing') {
      const val = parseInt(document.getElementById('txtSpacing').value); obj.set('charSpacing', val);
      document.getElementById('previewText').style.letterSpacing = (val/20) + 'px';
  }
  canvas.requestRenderAll();
}

function loadFonts() {
  WebFont.load({ google: { families: fonts } });
  
  const container = document.getElementById('font-scroll-container');
  container.innerHTML = ""; 
  const fragment = document.createDocumentFragment();

  fonts.forEach(f => {
    const item = document.createElement('div');
    item.className = 'font-list-item';
    item.innerText = f; 
    item.style.fontFamily = f;
    item.dataset.font = f;

    item.onclick = () => changeFont(f);
    fragment.appendChild(item);
  });

  container.appendChild(fragment);
}

function changeFont(fontName) {
  document.getElementById('previewText').style.fontFamily = fontName;
  const obj = canvas.getActiveObject(); 
  if(obj && (obj.type === 'i-text' || obj.type === 'text')) { 
      obj.set('fontFamily', fontName); 
      canvas.requestRenderAll(); 
  }
  highlightFontInList(fontName);
}

function changeTextColor(color) {
  document.getElementById('previewText').style.color = color;
  const obj = canvas.getActiveObject();
  if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
      obj.set('fill', color);
      canvas.requestRenderAll();
  }
}

function highlightFontInList(fontName) {
  const cleanName = fontName.replace(/['"]+/g, '');
  document.querySelectorAll('.font-list-item').forEach(item => {
      item.classList.remove('selected');
      if(item.dataset.font === cleanName) {
          item.classList.add('selected');
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
  });
}

function startCrop(fabricImg) {
  activeImageObj = fabricImg;
  const dataUrl = fabricImg.toDataURL({ format: 'png', multiplier: 2 });
  const imgEl = document.getElementById('cropper-img'); 
  imgEl.src = dataUrl;
  document.getElementById('cropper-modal').style.display = 'flex';
  setTimeout(() => {
      if(cropper) cropper.destroy();
      cropper = new Cropper(imgEl, { viewMode: 1, background: false, autoCropArea: 0.9, responsive: true });
  }, 50);
}

function cancelCrop() { 
  document.getElementById('cropper-modal').style.display = 'none'; 
  if(cropper) {
    cropper.destroy(); 
    cropper = null;
  }
  const imgEl = document.getElementById('cropper-img');
  if(imgEl) imgEl.src = '';
  activeImageObj = null; 
}

function applyCrop() {
  if(!cropper || !activeImageObj) return;
  const newDataUrl = cropper.getCroppedCanvas().toDataURL();
  fabric.Image.fromURL(newDataUrl, (newImg) => {
    newImg.set({ 
      left: activeImageObj.left, 
      top: activeImageObj.top, 
      scaleX: activeImageObj.scaleX, 
      scaleY: activeImageObj.scaleY, 
      angle: activeImageObj.angle 
    });
    canvas.remove(activeImageObj); 
    canvas.add(newImg); 
    canvas.setActiveObject(newImg); 
    cancelCrop();
  });
}

function layerAction(action) {
  const active = canvas.getActiveObject();
  if (!active) return;
  if (action === 'front') canvas.bringToFront(active);
  else if (action === 'up') canvas.bringForward(active);
  else if (action === 'down') canvas.sendBackwards(active);
  else if (action === 'back') canvas.sendToBack(active);
  if (bgObj) canvas.sendToBack(bgObj);
  canvas.requestRenderAll();
  saveHistory();
}
