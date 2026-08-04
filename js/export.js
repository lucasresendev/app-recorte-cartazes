// --- EXPORTAÇÃO E PROJETO JSON ---

function exportPDF() { startExport('pdf'); }

function startExport(type) {
  document.getElementById('export-menu').classList.remove('show');
  document.getElementById('loader').style.display = 'flex'; 
  document.getElementById('loader-msg').innerText = "Processando...";
  requestAnimationFrame(() => setTimeout(() => processExport(type), 100));
}

function saveProject() {
  document.getElementById('export-menu').classList.remove('show');
  updateGridConfigInCanvas();
  const json = JSON.stringify(canvas.toJSON(['isBackground', 'gridConfig', 'id']));
  const blob = new Blob([json], {type: "application/json"});
  
  // GERA DATA LEGÍVEL: Ex: 21-05-2024_15h30
  const d = new Date();
  const dataStr = d.toLocaleDateString('pt-BR').replace(/\//g,'-');
  const horaStr = d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0');
  const nomeFinal = `Projeto_${dataStr}_${horaStr}`;

  saveAs(blob, `${nomeFinal}.json`);
}

function loadProject(input) {
  const file = input.files[0]; 
  if (!file) return;

  const MAX_PROJECT_MB = 20;
  if (file.size > MAX_PROJECT_MB * 1024 * 1024) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    showAlertModal(
      "Projeto Muito Grande",
      `O arquivo de projeto "${file.name}" possui ${sizeInMB} MB. O limite máximo permitido para arquivos de projeto é de ${MAX_PROJECT_MB} MB.`
    );
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.objects)) {
        restoreCanvasState(e.target.result);
      } else {
        showAlertModal("Projeto Inválido", "O arquivo JSON selecionado não é um arquivo de projeto válido do Recorte em A3/A4.");
      }
    } catch (err) {
      showAlertModal("Erro no Arquivo", "Não foi possível carregar o arquivo. O formato JSON está corrompido ou é inválido.");
    }
  };
  reader.readAsText(file); 
  input.value = ''; 
}

async function processExport(type) {
  const loaderMsg = document.getElementById('loader-msg');
  
  // GERA NOME AUTOMÁTICO LIMPO
  const d = new Date();
  const dataStr = d.toLocaleDateString('pt-BR').replace(/\//g,'-');
  const horaStr = d.getHours() + 'h' + String(d.getMinutes()).padStart(2, '0');
  const nomeArquivo = `Cartaz_${dataStr}_${horaStr}`;

  try {
      const { jsPDF } = window.jspdf;
      const savedVpt = [...canvas.viewportTransform]; 
      canvas.discardActiveObject();
      canvas.viewportTransform = [1, 0, 0, 1, 0, 0]; 
      canvas.renderAll(); 
      const dims = SIZES[grid.size]; 
      const pdfW = (grid.orient === 'landscape') ? dims.h : dims.w; 
      const pdfH = (grid.orient === 'landscape') ? dims.w : dims.h; 
      const orientation = (grid.orient === 'landscape') ? 'l' : 'p';
      const cellW = grid.w / grid.cols; 
      const cellH = grid.h / grid.rows;
      const targetWidthPx = 1800; 
      const multiplier = targetWidthPx / cellW;
      let zip = null; 
      if (type === 'img-split' || type === 'pdf-split') zip = new JSZip();
      
      if (type === 'img-single') {
           const dataUrl = canvas.toDataURL({ left: 0, top: 0, width: grid.w, height: grid.h, format: 'jpeg', quality: 0.9, multiplier: 1 });
          saveAs(dataURItoBlob(dataUrl), `${nomeArquivo}.jpg`); 
          finishExport(savedVpt); 
          return;
      }
      
      const totalPages = grid.rows * grid.cols; 
      let processed = 0; 
      let doc = null;
      if (type === 'pdf') doc = new jsPDF({ orientation: orientation, unit: 'mm', format: grid.size });
      
      for(let r=0; r<grid.rows; r++) {
          for(let c=0; c<grid.cols; c++) {
              processed++; 
              loaderMsg.innerText = `Gerando ${processed}/${totalPages}...`; 
              await new Promise(resolve => setTimeout(resolve, 10));
              const regionLeft = c * cellW; 
              const regionTop = r * cellH;
              const dataUrl = canvas.toDataURL({ left: regionLeft, top: regionTop, width: cellW, height: cellH, format: 'jpeg', quality: 0.92, multiplier: multiplier });
              if (type === 'pdf') { 
                if (processed > 1) doc.addPage(); 
                doc.addImage(dataUrl, 'JPEG', 0, 0, pdfW, pdfH); 
              } 
              else if (type === 'img-split') { 
                zip.file(`Pagina_${processed}.jpg`, dataURItoBlob(dataUrl)); 
              }
              else if (type === 'pdf-split') {
                  const tempDoc = new jsPDF({ orientation: orientation, unit: 'mm', format: grid.size });
                  tempDoc.addImage(dataUrl, 'JPEG', 0, 0, pdfW, pdfH); 
                  zip.file(`Pagina_${processed}.pdf`, tempDoc.output('blob'));
              }
          }
      }
      loaderMsg.innerText = "Salvando..."; 
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (type === 'pdf') doc.save(`${nomeArquivo}.pdf`);
      else if (zip) { 
        const content = await zip.generateAsync({type:"blob"}); 
        saveAs(content, `${nomeArquivo}.zip`); 
      }
      
      finishExport(savedVpt);
  } catch(e) { 
    console.error(e); 
    alert("Erro: " + e.message); 
    document.getElementById('loader').style.display = 'none'; 
    if(typeof savedVpt !== 'undefined') { 
      canvas.viewportTransform = savedVpt; 
      canvas.requestRenderAll(); 
    } 
  }
}

function finishExport(savedVpt) { 
  canvas.viewportTransform = savedVpt; 
  setMaskMode('idle'); 
  canvas.requestRenderAll(); 
  document.getElementById('loader').style.display = 'none'; 
}

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]); 
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var ab = new ArrayBuffer(byteString.length); 
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) { 
    ia[i] = byteString.charCodeAt(i); 
  }
  return new Blob([ab], {type: mimeString});
}
