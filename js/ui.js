// --- EVENTOS DE INTERFACE, NAVEGAÇÃO, ATALHOS E UTILITÁRIOS ---

function toggleExportMenu() {
  const menu = document.getElementById('export-menu');
  menu.classList.toggle('show');
}

function handleOutsideClick(e) {
  if (!e.target.closest('.export-container')) {
      document.getElementById('export-menu').classList.remove('show');
  }
  if(!e.target.closest('.sheet') && !e.target.closest('#toolbar') && !e.target.closest('.crop-window')) {
     if(e.target.tagName === 'CANVAS') closeSheets();
  }
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
       const active = canvas.getActiveObject();
       if (active && !active.isEditing) deleteActiveObject();
    }
    if (e.key === 'Escape') {
        canvas.discardActiveObject(); 
        canvas.requestRenderAll(); 
        closeSheets();
    }
    if (e.ctrlKey || e.metaKey) {
        switch(e.code) {
            case 'KeyC': copyObject(); break;
            case 'KeyZ': e.preventDefault(); undo(); break;
            case 'KeyY': e.preventDefault(); redo(); break;
        }
    }
    if(e.code === 'Space' && !e.repeat && !isHandMode) toggleHandMode();
  });

  window.addEventListener('keyup', (e) => {
    if(e.code === 'Space' && isHandMode) toggleHandMode();
  });
}

function showAlertModal(title, message) {
  const modal = document.getElementById('alert-modal');
  const titleEl = document.getElementById('alert-title');
  const msgEl = document.getElementById('alert-msg');
  if (modal && titleEl && msgEl) {
    titleEl.innerText = title;
    msgEl.innerText = message;
    modal.style.display = 'flex';
  } else {
    alert(`${title}\n\n${message}`);
  }
}

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function processUploadedFile(file) {
  if (!file) return;

  // Validação de Tamanho Máximo com Alerta Visual para o Usuário
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    showAlertModal(
      "Arquivo Muito Grande",
      `O arquivo "${file.name}" possui ${sizeInMB} MB. O limite máximo recomendado para evitar o travamento da memória do seu navegador é de ${MAX_FILE_SIZE_MB} MB.`
    );
    return;
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    processPDFFile(file);
  } else if (fileType === 'image/svg+xml' || fileName.endsWith('.svg')) {
    processSVGFile(file);
  } else if (fileType.startsWith('image/')) {
    processImageFile(file);
  } else {
    showAlertModal(
      "Formato Não Suportado",
      `O formato do arquivo "${file.name}" não é suportado. Por favor, envie imagens (JPG, PNG, WEBP), vetores SVG ou PDFs.`
    );
  }
}

function processImageFile(file) {
  const r = new FileReader(); 
  r.onload = (e) => { 
    fabric.Image.fromURL(e.target.result, (img) => { addToCanvas(img); }); 
  };
  r.readAsDataURL(file);
}

function sanitizeSVG(svgString) {
  if (!svgString) return '';
  // Remove tags <script>
  svgString = svgString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove manipuladores de eventos inline (onload, onerror, onclick, etc.)
  svgString = svgString.replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, '');
  svgString = svgString.replace(/href\s*=\s*(['"])\s*javascript:[^\1]*?\1/gi, '');
  return svgString;
}

function processSVGFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    let svgContent = sanitizeSVG(e.target.result);
    fabric.loadSVGFromString(svgContent, (objects, options) => { 
      if (objects && objects.length) {
        addToCanvas(fabric.util.groupSVGElements(objects, options)); 
      } else {
        showAlertModal("Erro no Arquivo SVG", "Não foi possível carregar o arquivo SVG selecionado.");
      }
    });
  };
  reader.readAsText(file);
}

function handleGlobalPaste(e) { 
  const clipboardData = (e.clipboardData || e.originalEvent.clipboardData);
  const items = clipboardData.items;
  let handled = false;
  for (let index in items) {
      const item = items[index];
      if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) { processUploadedFile(file); handled = true; }
      }
  }
  if (!handled) {
      for (let index in items) {
          const item = items[index];
          if (item.kind === 'string' && item.type.match('^text/plain')) {
              item.getAsString((s) => { processPasteText(s); });
              handled = true; break; 
          }
      }
  }
  if (!handled && _clipboard) { pasteObject(); e.preventDefault(); }
}

function processPasteText(text) {
  const isInternalMatch = (_clipboard && text === lastCopiedText);
  const isShapePlaceholder = (_clipboard && text === "Elemento Gráfico");
  if (isInternalMatch || isShapePlaceholder) { pasteObject(); } 
  else {
      if (text && text.trim().length > 0) {
          const t = new fabric.IText(text, { 
            fontFamily: 'Roboto', 
            fontSize: 60, 
            left: grid.w/2, 
            top: grid.h/2, 
            originX: 'center', 
            originY: 'center', 
            fill: '#000000' 
          });
          addToCanvas(t);
      }
  }
}

function setupDragDrop() {
  const dropZone = document.body;
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
  dropZone.addEventListener('drop', (e) => {
      e.preventDefault(); 
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          closeSheets();
          Array.from(e.dataTransfer.files).forEach(file => processUploadedFile(file));
      }
  });
}

async function copyObject() {
  const active = canvas.getActiveObject();
  if (active) {
      active.clone((cloned) => { _clipboard = cloned; pasteCount = 0; });
      let textToCopy = "Elemento Gráfico"; 
      if (active.type === 'i-text' || active.type === 'text' || active.type === 'textbox') textToCopy = active.text;
      lastCopiedText = textToCopy;
      try { await navigator.clipboard.writeText(textToCopy); } catch (err) { console.log("Erro clipboard", err); }
  }
}

function pasteObject() {
  if (!_clipboard) return;
  _clipboard.clone((clonedObj) => {
      canvas.discardActiveObject();
      pasteCount++;
      const offset = pasteCount * 20; 
      clonedObj.set({ left: _clipboard.left + offset, top: _clipboard.top + offset, evented: true });
      if(clonedObj.left > grid.w || clonedObj.top > grid.h) { clonedObj.set({ left: grid.w/2, top: grid.h/2 }); pasteCount = 0; }
      if (clonedObj.type === 'activeSelection') {
          clonedObj.canvas = canvas;
          clonedObj.forEachObject((obj) => { canvas.add(obj); });
          clonedObj.setCoords();
      } else { canvas.add(clonedObj); }
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
      saveHistory();
  });
}

function deleteActiveObject() {
  const active = canvas.getActiveObjects();
  if (active.length) {
      canvas.discardActiveObject();
      active.forEach((obj) => { canvas.remove(obj); });
      canvas.requestRenderAll();
      saveHistory();
      closeSheets();
  }
}

function handleFile(input) {
  const file = input.files[0]; 
  if(!file) return;
  toggleAddMenu(); 
  processUploadedFile(file); 
  input.value = '';
}

function processImageFile(file) {
  const r = new FileReader(); 
  r.onload = (e) => { 
    fabric.Image.fromURL(e.target.result, (img) => { addToCanvas(img); }); 
  };
  r.readAsDataURL(file);
}

function processSVGFile(file) {
  const url = URL.createObjectURL(file);
  fabric.loadSVGFromURL(url, (objects, options) => { 
    addToCanvas(fabric.util.groupSVGElements(objects, options)); 
    URL.revokeObjectURL(url); 
  });
}

function toggleAddMenu() {
  const main = document.getElementById('toolbar-main'); 
  const add = document.getElementById('toolbar-add');
  if(main.style.display === 'none') { 
    main.style.display = 'flex'; 
    add.style.display = 'none'; 
  } else { 
    main.style.display = 'none'; 
    add.style.display = 'flex'; 
    add.classList.remove('hidden-group'); 
  }
}

function setupDraggableSheets() {
  document.querySelectorAll('.sheet').forEach(sheet => {
    const handle = sheet.querySelector('.drag-zone');
    let startY = 0;
    let currentY = 0;
    let isDraggingSheet = false;

    sheet.addEventListener('touchstart', (e) => {
      if (e.target.closest('.font-scroll-box')) {
        isDraggingSheet = false;
        return;
      }
    }, { passive: true });

    handle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDraggingSheet = true;
    }, { passive: false });

    handle.addEventListener('touchmove', (e) => {
      if (!isDraggingSheet) return;
      const diff = e.touches[0].clientY - startY;
      if (diff > 0) sheet.style.transform = `translateY(${diff}px)`;
      currentY = diff;
      e.preventDefault();
    }, { passive: false });

    handle.addEventListener('touchend', () => {
      isDraggingSheet = false;
      sheet.style.transform = '';
      if (currentY > 80) closeSheets();
      else sheet.classList.add('open');
      currentY = 0;
    });
  });
}

function openSheet(id) {
  closeSheets();
  document.getElementById(id).classList.add('open');
  
  // Esconde o botão de alterar texto quando abrir qualquer menu
  const btn = document.getElementById('floating-edit-btn');
  if(btn) btn.classList.remove('visible');
}

function closeSheets() {
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
  setTimeout(updateFloatingButton, 300);
}

function getDist(t1, t2) { 
  const dx = t1.clientX - t2.clientX; 
  const dy = t1.clientY - t2.clientY; 
  return Math.hypot(dx, dy); 
}

function toggleHandMode() {
  isHandMode = !isHandMode;
  const btn = document.getElementById('mode-toggle'); 
  const ico = document.getElementById('mode-icon');
  if(isHandMode) {
    btn.classList.add('active-hand'); 
    ico.innerText = "pan_tool"; 
    canvas.selection = false; 
    canvas.defaultCursor = 'grab'; 
    canvas.forEachObject(o => o.selectable = false); 
    closeSheets(); 
    setMaskMode('idle'); 
  } else {
    btn.classList.remove('active-hand'); 
    ico.innerText = "touch_app"; 
    canvas.selection = true; 
    canvas.defaultCursor = 'default'; 
    canvas.forEachObject(o => { if(o!==bgObj && !o.isDimensionIndicator) o.selectable = true; });
  } 
  canvas.requestRenderAll();
}

function triggerTextEdit() {
  const active = canvas.getActiveObject();
  if (active && (active.type === 'i-text' || active.type === 'text')) {
      canvas.setActiveObject(active);
      active.enterEditing();
      active.selectAll();
      document.getElementById('floating-edit-btn').classList.remove('visible');
      canvas.requestRenderAll();
  }
}

function updateFloatingButton() {
  const active = canvas.getActiveObject();
  const btn = document.getElementById('floating-edit-btn');
  
  if (active && (active.type === 'i-text' || active.type === 'text') && !active.isEditing) {
      btn.classList.add('visible');
  } else {
      btn.classList.remove('visible');
  }
}
