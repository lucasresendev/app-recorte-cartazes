// --- CANVAS INIT & CONTROLS ---

function initCanvas() {
  canvas = new fabric.Canvas('c', {
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 'transparent',
    preserveObjectStacking: true,
    selection: true,
    centeredScaling: true,
    uniScaleTransform: true,
    allowTouchScrolling: false 
  });

  let resizeTick = false;
  window.addEventListener('resize', () => {
    if (!resizeTick) {
      resizeTick = true;
      requestAnimationFrame(() => {
        if (canvas) {
          canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
          canvas.requestRenderAll();
        }
        resizeTick = false;
      });
    }
  });

  saveHistory();

  canvas.on('object:added', (e) => { 
    if(!isHistoryProcessing && e.target !== bgObj) saveHistory(); 
  });

  canvas.on('object:modified', (e) => { 
    if(!isHistoryProcessing) saveHistory(); 
    updateFloatingButton(); // Garante o botão no lugar certo após a edição
  });

  canvas.on('object:removed', (e) => { 
    if(!isHistoryProcessing) saveHistory(); 
    updateFloatingButton();
  });

  canvas.on('object:moving', (opt) => {
    if (opt.e.touches && opt.e.touches.length > 1) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        return;
    }
    // Esconde o botão ao mover para não poluir a tela
    const btn = document.getElementById('floating-edit-btn');
    if(btn) btn.classList.remove('visible');

    document.getElementById('toolbar').classList.add('ui-faded');
    document.getElementById('header').classList.add('ui-faded');
    document.getElementById('mode-toggle').classList.add('ui-faded');
  });

  canvas.on('mouse:up', () => { 
    document.getElementById('toolbar').classList.remove('ui-faded');
    document.getElementById('header').classList.remove('ui-faded');
    document.getElementById('mode-toggle').classList.remove('ui-faded');
    
    if(!canvas.getActiveObject()) {
        setMaskMode('idle');
    }
    updateFloatingButton();
  });

  canvas.on('mouse:down', (opt) => {
      if (opt.e.touches && opt.e.touches.length > 1) {
          canvas.discardActiveObject();
          return;
      }
      if(isHandMode) return;
      if (!opt.target || opt.target === bgObj) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          setMaskMode('idle');
          closeSheets();
          updateFloatingButton();
      } else {
          setMaskMode('editing');
      }
  });

  // LÓGICA DE SELEÇÃO PARA O BOTÃO FLUTUANTE
  canvas.on('selection:created', () => { 
    setMaskMode('editing'); 
    updateFloatingButton();
  });
  
  canvas.on('selection:updated', () => { 
    updateFloatingButton();
  });

  canvas.on('selection:cleared', () => { 
    setMaskMode('idle'); 
    closeSheets(); 
    updateFloatingButton();
  });

  // EVENTOS DE TEXTO (Evita conflitos com o teclado)
  canvas.on('text:editing:entered', () => {
    const btn = document.getElementById('floating-edit-btn');
    if(btn) btn.classList.remove('visible');
  });

  canvas.on('text:editing:exited', () => {
    updateFloatingButton();
  });

  canvas.on('after:render', renderOverlay);
  
  setupHammerGestures();
}

// --- CONTROLES (EDITAR/DELETAR) ---
function setupCustomControls() {
  const BOTAO_SIZE = 40; 
  const renderIcon = (iconName, color) => function(ctx, left, top, styleOverride, fabricObject) {
      const size = this.cornerSize; 
      ctx.save(); ctx.translate(left, top); ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.beginPath(); ctx.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = color; ctx.fill();
      ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 4; ctx.fill(); 
      ctx.shadowBlur = 0; ctx.font = "24px 'Material Icons'"; 
      ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(iconName, 0, 0); ctx.restore();
  };
  
  const clickAreaConfig = { cursorStyle: 'pointer', cornerSize: BOTAO_SIZE, sizeX: BOTAO_SIZE, sizeY: BOTAO_SIZE, touchCornerSize: BOTAO_SIZE, withConnection: false };

  fabric.Object.prototype.controls.editControl = new fabric.Control({
      ...clickAreaConfig, x: -0.5, y: -0.5, offsetY: -24, offsetX: -24, mouseUpHandler: handleEditClick,
      render: function(ctx, left, top, styleOverride, fabricObject) {
          const isImg = fabricObject.type === 'image';
          renderIcon(isImg ? 'content_cut' : 'brush', isImg ? '#f57c00' : '#f57c00').call(this, ctx, left, top, styleOverride, fabricObject);
      }
  });
  fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      ...clickAreaConfig, x: 0.5, y: -0.5, offsetY: -24, offsetX: 24, mouseUpHandler: deleteObject,
      render: renderIcon('close', '#d32f2f')
  });
  fabric.Object.prototype.controls.layerControl = new fabric.Control({
      ...clickAreaConfig, x: -0.5, y: 0.5, offsetY: 24, offsetX: -24, mouseUpHandler: (e, t) => { openSheet('layerSheet'); return true; },
      render: renderIcon('layers', '#6366f1')
  });
  fabric.Object.prototype.set({
      transparentCorners: false, cornerColor: '#10b981', cornerStrokeColor: '#6366f1',
      borderColor: '#6366f1', padding: 15, borderDashArray: [4, 4], centeredScaling: false
  });
}

function deleteObject() { deleteActiveObject(); }

function liveGridUpdate(input, labelId) { 
  document.getElementById(labelId).innerText = input.value; 
  toggleSliderGhostMode(true); 
  updateGrid(); 
}

function gridUpdateEnd() { 
  toggleSliderGhostMode(false); 
  updateGrid(); 
}

function toggleSliderGhostMode(active) {
  const uiElements = [document.getElementById('header'), document.getElementById('toolbar'), document.getElementById('mode-toggle')];
  const sheet = document.getElementById('layoutSheet');
  if (active) { uiElements.forEach(el => el.classList.add('ui-faded')); sheet.classList.add('sheet-ghost'); } 
  else { uiElements.forEach(el => el.classList.remove('ui-faded')); sheet.classList.remove('sheet-ghost'); }
}

function updateGrid() {
  grid.orient = document.getElementById('orient').value;
  grid.size = document.getElementById('pageSize').value;
  grid.cols = parseInt(document.getElementById('cols').value);
  grid.rows = parseInt(document.getElementById('rows').value);
  document.getElementById('cols-txt').innerText = grid.cols;
  document.getElementById('rows-txt').innerText = grid.rows;
  const dims = SIZES[grid.size];
  const wMM = (grid.orient==='landscape') ? dims.h : dims.w;
  const hMM = (grid.orient==='landscape') ? dims.w : dims.h;
  grid.w = wMM * PXM * grid.cols; grid.h = hMM * PXM * grid.rows;
  if(bgObj) canvas.remove(bgObj);
  bgObj = new fabric.Rect({ left: 0, top: 0, width: grid.w, height: grid.h, fill: 'white', selectable: false, evented: false, isBackground: true });
  canvas.add(bgObj); canvas.sendToBack(bgObj);
  setMaskMode('idle'); resetView(); 
}

function resetView() {
  const topSafe = 100; const uiPadding = 80; 
  const availW = Math.max(50, window.innerWidth - (uiPadding * 2));
  const availH = Math.max(50, window.innerHeight - 120 - (uiPadding * 2));
  const scale = Math.min(availW / grid.w, availH / grid.h);
  const leftOffset = (window.innerWidth - grid.w * scale) / 2;
  let topOffset = (window.innerHeight - grid.h * scale) / 2;
  if (topOffset < topSafe) topOffset = topSafe;
  canvas.setViewportTransform([scale, 0, 0, scale, leftOffset, topOffset]);
  canvas.requestRenderAll();
}

function setMaskMode(mode) {
  if(mode === 'idle') { isEditing = false; canvas.clipPath = null; } 
  else { isEditing = true; canvas.clipPath = null; }
  canvas.requestRenderAll();
}

function renderOverlay() {
  const ctx = canvas.getContext(); const vpt = canvas.viewportTransform;
  const pX = vpt[4]; const pY = vpt[5];
  const zoom = vpt[0]; const sW = grid.w * zoom; const sH = grid.h * zoom;
  ctx.save(); const ratio = fabric.devicePixelRatio; ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.beginPath(); ctx.rect(0, 0, canvas.width, canvas.height); ctx.rect(pX, pY, sW, sH); 
  ctx.fillStyle = isEditing ? 'rgba(15, 23, 42, 0.85)' : '#0f172a'; ctx.fill('evenodd');
  const totalW_cm = (grid.w / PXM) / 10; const totalH_cm = (grid.h / PXM) / 10;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.font = 'bold 16px Roboto'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const offset = 40; const topY = pY - offset;
  ctx.beginPath(); ctx.moveTo(pX - 10, topY); ctx.lineTo(pX + sW + 10, topY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pX, topY - 10); ctx.lineTo(pX, topY + 10); ctx.moveTo(pX + sW, topY - 10); ctx.lineTo(pX + sW, topY + 10); ctx.setLineDash([]); ctx.stroke();
  ctx.fillText(`${totalW_cm.toFixed(1).replace('.', ',')} cm`, pX + sW/2, topY - 20);
  const leftX = pX - offset;
  ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(leftX, pY - 10); ctx.lineTo(leftX, pY + sH + 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(leftX - 10, pY); ctx.lineTo(leftX + 10, pY); ctx.moveTo(leftX - 10, pY + sH); ctx.lineTo(leftX + 10, pY + sH); ctx.setLineDash([]); ctx.stroke();
  ctx.save(); ctx.translate(leftX - 20, pY + sH/2); ctx.rotate(-Math.PI / 2); ctx.fillText(`${totalH_cm.toFixed(1).replace('.', ',')} cm`, 0, 0); ctx.restore();
  if(grid.cols > 1 || grid.rows > 1) {
      const cW = sW / grid.cols; const cH = sH / grid.rows;
      ctx.beginPath(); ctx.setLineDash([12, 8]); ctx.strokeStyle = 'white'; ctx.lineWidth = 3;
      for(let c=1; c<grid.cols; c++) { let lx = pX + c*cW; ctx.moveTo(lx, pY); ctx.lineTo(lx, pY+sH); }
      for(let r=1; r<grid.rows; r++) { let ly = pY + r*cH; ctx.moveTo(pX, ly); ctx.lineTo(pX+sW, ly); }
      ctx.stroke();
      ctx.beginPath(); ctx.setLineDash([12, 8]); ctx.strokeStyle = '#d32f2f'; ctx.lineWidth = 1.5;
      for(let c=1; c<grid.cols; c++) { let lx = pX + c*cW; ctx.moveTo(lx, pY); ctx.lineTo(lx, pY+sH); }
      for(let r=1; r<grid.rows; r++) { let ly = pY + r*cH; ctx.moveTo(pX, ly); ctx.lineTo(pX+sW, ly); }
      ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1; ctx.setLineDash([]); ctx.strokeRect(pX, pY, sW, sH);
  const active = canvas.getActiveObject();
  if (active && isEditing) active._renderControls(ctx, { hasControls: true, hasBorders: true });
  ctx.restore();
}

function updateGridConfigInCanvas() { canvas.gridConfig = { ...grid }; }

function saveHistory() {
  if (isHistoryProcessing) return;
  if (historyUndo.length > 10) historyUndo.shift(); 
  updateGridConfigInCanvas(); 
  historyUndo.push(JSON.stringify(canvas.toJSON(['isBackground', 'gridConfig', 'id'])));
  historyRedo = []; 
}

function restoreCanvasState(content) {
  canvas.loadFromJSON(content, () => {
      canvas.renderAll();
      const objs = canvas.getObjects();
      const foundBg = objs.find(o => o.isBackground);
      if (foundBg) { bgObj = foundBg; bgObj.selectable = false; bgObj.evented = false; canvas.sendToBack(bgObj); } 
      else { updateGrid(); }
      if (canvas.gridConfig) {
          grid = canvas.gridConfig;
          document.getElementById('pageSize').value = grid.size;
          document.getElementById('orient').value = grid.orient;
          document.getElementById('cols').value = grid.cols;
          document.getElementById('rows').value = grid.rows;
          document.getElementById('cols-txt').innerText = grid.cols;
          document.getElementById('rows-txt').innerText = grid.rows;
          resetView();
      }
      isHistoryProcessing = false;
  });
}

function undo() {
  if (historyUndo.length > 0) {
      isHistoryProcessing = true; updateGridConfigInCanvas();
      historyRedo.push(JSON.stringify(canvas.toJSON(['isBackground', 'gridConfig'])));
      restoreCanvasState(historyUndo.pop());
  }
}

function redo() {
  if (historyRedo.length > 0) {
      isHistoryProcessing = true; updateGridConfigInCanvas();
      historyUndo.push(JSON.stringify(canvas.toJSON(['isBackground', 'gridConfig'])));
      restoreCanvasState(historyRedo.pop());
  }
}

function setupHammerGestures() {
  let mouseDragging = false, mouseStartAnchor = null; 
  canvas.on('mouse:down', function(opt) {
      if(isHandMode && !opt.target) { 
          mouseDragging = true;
          const inv = fabric.util.invertTransform(canvas.viewportTransform);
          mouseStartAnchor = fabric.util.transformPoint({x: opt.e.clientX, y: opt.e.clientY}, inv);
          canvas.defaultCursor = 'grabbing';
      }
  });
  canvas.on('mouse:move', function(opt) {
      if(mouseDragging && isHandMode && mouseStartAnchor) {
          const zoom = canvas.getZoom();
          const panX = opt.e.clientX - mouseStartAnchor.x * zoom;
          const panY = opt.e.clientY - mouseStartAnchor.y * zoom;
          canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);
          canvas.requestRenderAll();
      }
  });
  canvas.on('mouse:up', () => { mouseDragging = false; if(isHandMode) canvas.defaultCursor = 'grab'; });
  canvas.on('mouse:wheel', function(opt) {
      let z = canvas.getZoom() * (0.999 ** opt.e.deltaY);
      if(z > 10) z = 10; if(z < 0.05) z = 0.05;
      canvas.zoomToPoint({x:opt.e.offsetX, y:opt.e.offsetY}, z);
      opt.e.preventDefault(); opt.e.stopPropagation();
  });
  const hammer = new Hammer.Manager(canvas.upperCanvasEl);
  const pinch = new Hammer.Pinch();
  const pan2 = new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, pointers: 2, threshold: 0 });
  hammer.add([pinch, pan2]);
  pinch.recognizeWith(pan2); pan2.recognizeWith(pinch);
  let gestureStartZoom = 1, gestureAnchor = null, isGesturing = false, latestScale = 1;
  function onGestureStart(ev) {
      if(isGesturing) return; isGesturing = true;
      canvas.discardActiveObject(); canvas.selection = false; canvas.forEachObject(o => o.selectable = false);
      canvas.requestRenderAll(); gestureStartZoom = canvas.getZoom(); latestScale = 1;
      const inv = fabric.util.invertTransform(canvas.viewportTransform);
      gestureAnchor = fabric.util.transformPoint({x: ev.center.x, y: ev.center.y}, inv);
  }
  function onGestureMove(ev) {
      if(!isGesturing || !gestureAnchor) return;
      if (ev.type === 'pinchmove') { latestScale = ev.scale; }
      const currentCenter = ev.center;
      let newZoom = gestureStartZoom * latestScale;
      if(newZoom > 10) newZoom = 10; if(newZoom < 0.05) newZoom = 0.05;
      const panX = currentCenter.x - gestureAnchor.x * newZoom;
      const panY = currentCenter.y - gestureAnchor.y * newZoom;
      canvas.setViewportTransform([newZoom, 0, 0, newZoom, panX, panY]);
      canvas.requestRenderAll();
  }
  function onGestureEnd(ev) {
      isGesturing = false; gestureAnchor = null;
      if(!isHandMode) { canvas.selection = true; canvas.forEachObject(o => { if(o!==bgObj && !o.isDimensionIndicator) o.selectable = true; }); }
  }
  hammer.on('pinchstart panstart', onGestureStart);
  hammer.on('pinchmove panmove', onGestureMove);
  hammer.on('pinchend panend', onGestureEnd);
}
