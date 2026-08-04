// --- PROCESSAMENTO E IMPORTAÇÃO DE PDF ---

async function processPDFFile(file) {
  document.getElementById('loader').style.display = 'flex'; 
  document.getElementById('loader-msg').innerText = "Lendo PDF...";
  try {
      const ab = await file.arrayBuffer(); 
      const pdf = await pdfjsLib.getDocument(ab).promise; 
      tempLoadedPDF = pdf; 
      if (pdf.numPages > 1) { 
        document.getElementById('loader').style.display = 'none'; 
        document.getElementById('pdf-modal').style.display = 'flex'; 
      } 
      else { 
        renderPDFPage(1, true); 
      }
  } catch(e) { 
    alert("Erro PDF: " + e.message); 
    document.getElementById('loader').style.display = 'none'; 
  }
}

function finishPDFImport(type) {
  document.getElementById('pdf-modal').style.display = 'none';
  if (!tempLoadedPDF) return;
  if (type === 'single') showPDFPageSelection(); 
  else importAllPDFPages();
}

async function showPDFPageSelection() {
  document.getElementById('pdf-selection-modal').style.display = 'flex';
  const container = document.getElementById('pdf-thumb-grid');
  container.innerHTML = '<div style="width:100%; text-align:center; color:#fff;">Carregando...</div>';
  await new Promise(r => setTimeout(r, 50)); 
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const numPages = tempLoadedPDF.numPages;

  for (let i = 1; i <= numPages; i++) {
      const page = await tempLoadedPDF.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 }); 
      const canvasEl = document.createElement('canvas');
      canvasEl.width = viewport.width; 
      canvasEl.height = viewport.height;
      const ctx = canvasEl.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      
      const div = document.createElement('div'); 
      div.className = 'pdf-thumb-card';
      div.onclick = () => selectPDFPage(i);
      const img = document.createElement('img'); 
      img.src = canvasEl.toDataURL();
      const label = document.createElement('span'); 
      label.innerText = `Pág ${i}`;
      div.appendChild(img); 
      div.appendChild(label); 
      fragment.appendChild(div);

      if (typeof page.cleanup === 'function') page.cleanup();
      if (i % 5 === 0) {
        container.appendChild(fragment);
        await new Promise(r => requestAnimationFrame(r));
      }
  }
  container.appendChild(fragment);
}

function selectPDFPage(pageNum) { 
  document.getElementById('pdf-selection-modal').style.display = 'none'; 
  renderPDFPage(pageNum, true); 
}

function renderPDFPage(pageNum, centerOnCanvas, targetX, targetY, targetW, targetH, manageLoader = true) {
  return new Promise(async (resolve, reject) => {
      if(manageLoader) { 
        document.getElementById('loader').style.display = 'flex'; 
        document.getElementById('loader-msg').innerText = "Renderizando PDF..."; 
      }
      try {
          const page = await tempLoadedPDF.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 }); 
          const hc = document.createElement('canvas'); 
          hc.width = viewport.width; 
          hc.height = viewport.height;
          await page.render({ canvasContext: hc.getContext('2d'), viewport: viewport }).promise;
          if (typeof page.cleanup === 'function') page.cleanup();

          fabric.Image.fromURL(hc.toDataURL(), (img) => {
              if (centerOnCanvas) {
                addToCanvas(img);
              } else {
                  img.set({ left: targetX, top: targetY });
                  const scaleX = targetW / img.width; 
                  const scaleY = targetH / img.height; 
                  const scale = Math.min(scaleX, scaleY);
                  img.scale(scale);
                  img.set({ 
                    left: targetX + (targetW - img.getScaledWidth()) / 2, 
                    top: targetY + (targetH - img.getScaledHeight()) / 2 
                  });
                  canvas.add(img); 
                  img.sendToBack(); 
              }
              if(manageLoader) document.getElementById('loader').style.display = 'none'; 
              resolve();
          });
      } catch (error) { 
        if(manageLoader) document.getElementById('loader').style.display = 'none'; 
        alert("Erro ao renderizar página " + pageNum); 
        resolve(); 
      }
  });
}

async function importAllPDFPages() {
  const numPages = tempLoadedPDF.numPages;
  const cols = Math.ceil(Math.sqrt(numPages)); 
  const rows = Math.ceil(numPages / cols);
  document.getElementById('cols').value = cols; 
  document.getElementById('rows').value = rows;
  updateGrid(); 
  const cellW = grid.w / cols; 
  const cellH = grid.h / rows;
  document.getElementById('loader').style.display = 'flex'; 
  document.getElementById('loader-msg').innerText = "Importando páginas...";
  for (let i = 1; i <= numPages; i++) {
      const idx = i - 1; 
      const col = idx % cols; 
      const row = Math.floor(idx / cols);
      const posX = col * cellW; 
      const posY = row * cellH;
      await renderPDFPage(i, false, posX, posY, cellW, cellH, false);
  }
  canvas.sendToBack(bgObj); 
  document.getElementById('loader').style.display = 'none'; 
  saveHistory();
}
