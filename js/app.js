// --- PONTO DE ENTRADA PRINCIPAL ---

window.onload = async () => {
  // CAMADA DE VELOCIDADE: Aguarda as fontes (Material Icons e Google Fonts) carregarem
  if (document.fonts) {
    await document.fonts.ready;
  }

  setupCustomControls(); 
  initCanvas();
  loadFonts();
  setupDraggableSheets();
  setupKeyboardShortcuts();
  setupDragDrop(); 

  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('touchstart', handleOutsideClick);
  window.addEventListener('paste', handleGlobalPaste);
  
  // Pequeno delay para garantir o cálculo correto da tela
  setTimeout(() => {
      updateGrid();
      // Força uma renderização final para garantir que os ícones apareçam instantaneamente
      if (canvas) canvas.requestRenderAll();
  }, 100);
};
