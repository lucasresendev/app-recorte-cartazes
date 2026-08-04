// --- CONFIGURAÇÕES GLOBAIS ---
const SIZES = { 'a4': { w: 210, h: 297 }, 'a3': { w: 297, h: 420 } };
const PXM = 3; 

let canvas;
let isHandMode = false; 
let grid = { w:0, h:0, cols:2, rows:1, orient:'portrait', size: 'a3' };
let bgObj = null;
let isEditing = false; 

let _clipboard = null;
let historyUndo = [];
let historyRedo = [];
let isHistoryProcessing = false;
let pasteCount = 0;
let lastCopiedText = ""; 

let cropper;
let activeImageObj = null;

const fonts = [
  "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Inter",
  "Oswald", "Anton", "Bangers", "Bebas Neue", "Archivo Black",
  "Merriweather", "Playfair Display", "Lora", "Abril Fatface",
  "Lobster", "Pacifico", "Dancing Script", "Satisfy", "Permanent Marker",
  "Caveat", "Shadows Into Light", "Amatic SC", "Courgette"
];

let tempLoadedPDF = null;

// --- Dicionário de caminhos SVG (Sem a seta) ---
const SHAPE_PATHS = {
  'heart': 'M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z',
  'bubble': 'M 20 20 H 80 A 10 10 0 0 1 90 30 V 70 A 10 10 0 0 1 80 80 H 40 L 20 95 V 80 H 20 A 10 10 0 0 1 10 70 V 30 A 10 10 0 0 1 20 20 Z',
  'star': 'M 50 10 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z'
};
