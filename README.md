<div align="center">

  🇧🇷 **[Versão em Português](README.pt-BR.md)**
  <br>

  # 🖼️ Poster & Mural Slicer (A3/A4) — Smart Grid Layout & High-Res Export

  ### **A responsive Single Page Application (SPA) for slicing, designing, and exporting images and PDFs across A3 and A4 paper formats for large-scale poster and mural printing.**

  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://recorte-cartazes.vercel.app)
  [![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue.svg?style=for-the-badge)](LICENSE)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
  [![Fabric.js](https://img.shields.io/badge/Fabric.js-5.3.1-blue?style=for-the-badge)](#)

  [🔗 **Live Demo**](https://recorte-cartazes.vercel.app) · [📖 **Architecture Documentation**](ARCHITECTURE.md)

</div>

---

## 📌 Overview & The Problem

In institutional and educational settings (such as schools, administrative departments, and event coordination teams), producing **large-format posters, wall displays, and informational murals** (often exceeding 1 meter in width) is a frequent necessity.

However, **standard office printers are strictly limited to standard A4 or A3 paper sizes**.

### ⚠️ Key Observed Challenges:
* **Error-Prone Manual Process:** Without specialized tools, teams attempted to slice images "by eye" using generic photo editors or manual measurements.
* **Resource & Financial Waste:** Misaligned prints led to direct waste of paper, toner/ink, and valuable staff hours.
* **Visual Inconsistencies:** Distorted proportions, uneven overlaps, and misaligned cut margins compromised final wall mounting.

### 💡 The Solution
**A3/A4 Poster Slicer** is a lightweight, free, and intuitive Single Page Application (SPA) engineered to remove the need for complex, expensive desktop graphic software (such as Photoshop or CorelDRAW) by solving the problem directly in the browser.

Users can import images or multi-page PDFs, configure an interactive grid in real time, customize visual elements, and export print-ready, sequentially ordered files in seconds.

---

## ✨ Key Features

### 📐 Configurable Grid & Real-Time Scale
* **Standard Paper Sizes:** Complete support for **A3** and **A4** standards in **Portrait** and **Landscape** orientations.
* **Dynamic Grid Controls:** Fluid row and column count adjustment via real-time sliders.
* **Real-World Dimension Calculation:** Automatically calculates and displays real physical dimensions in centimeters (e.g., `120 cm × 80 cm`), eliminating manual ruler math.

### 📄 Smart PDF Processing & Multi-Page Import (`PDF.js`)
* Client-side PDF ingestion directly in the browser without server uploads.
* **Auto-Distribution:** Automatically calculates optimal grid arrangements and distributes multi-page PDF documents across corresponding grid cells.
* **Single-Page Selector:** High-definition rendering of individual selected pages directly onto the canvas.

### 🎨 Interactive Graphics Engine (`Fabric.js` & `Cropper.js`)
* **Rich-Text Editing:** On-demand loading of 20+ Google Fonts, letter spacing, sizing, alignment, and color palette customizer.
* **Vector Shapes Library:** Built-in primitives including rectangles, circles, triangles, stars, hearts, pentagons, and speech bubbles.
* **Image Cropping:** Integrated cropping tool powered by `Cropper.js` for lossless image adjustments prior to placement.
* **Layer Hierarchy:** Z-index stack management (bring forward, send backward, bring to front, send to back).

### 🖐️ Mobile-First UX & Touch Gestures (`Hammer.js`)
* Intuitive **Pinch-to-Zoom** and **Two-Finger Pan (Hand mode)** touch gestures.
* Touch-optimized interface featuring draggable bottom-sheets for mobile editing workflows.
* Full adherence to iOS viewport guidelines (`env(safe-area-inset-top/bottom)`) and dynamic viewport height (`100dvh`).

### 🖨️ Flexible Export & Project Storage (`jsPDF` + `JSZip`)
* **Single Compiled PDF:** Generates a unified multi-page PDF with all grid pages sequentially ordered for printing.
* **ZIP Archive Packaging:** Batch export individual high-resolution JPG images or standalone single-page PDFs.
* **Editable JSON Projects:** Save and reload complete project states (layers, fonts, and grid geometry) for future editing.
* **State Management:** Complete Undo/Redo history stack (Ctrl+Z / Ctrl+Y), keyboard shortcuts, and direct Clipboard paste (Ctrl+V).

---

## 📈 Impact & Measurable Results

* 👥 **Operational Adoption:** Established as the standard layout tool by **50+ staff members** across schools, secretariats, and pedagogical teams.
* ⏱️ **Time Efficiency:** Slashed mural layout preparation from **hours of trial and error to just a few minutes**.
* ♻️ **Sustainability & Cost Savings:** Eliminated wasted print runs caused by incorrect scaling, cut lines, or misaligned margins.
* 💡 **Staff Autonomy:** Empowered non-technical staff to create high-impact, professional large-format materials independently.

---

## 🛠️ Technology Stack

The application was built with a strict focus on **high performance and zero build/bundling overhead**, allowing instant static hosting on any CDN.

| Category | Technologies / Libraries |
| :--- | :--- |
| **Core Frontend** | Semantic HTML5, Vanilla CSS3 (Custom Properties / Design Tokens), Modular JavaScript (ES6+) |
| **Canvas Graphics Engine** | [Fabric.js 5.3.1](https://fabricjs.com/) (2D Canvas manipulation & interactive object model) |
| **PDF Processing** | [PDF.js 3.4.120](https://mozilla.github.io/pdf.js/) (Client-side render) & [jsPDF 2.5.1](https://github.com/parallax/jsPDF) (PDF generation) |
| **Utilities & Export** | [Cropper.js](https://fengyuanchen.github.io/cropperjs/) (Crop), [Hammer.js](https://hammerjs.github.io/) (Touch Gestures), [JSZip](https://stuk.github.io/jszip/) (ZIP Packaging), [FileSaver.js](https://github.com/eligrey/FileSaver.js/) |
| **Typography & Icons** | Google Fonts (WebFont Loader) & Material Icons Round |
| **Deployment & CI/CD** | GitHub, Vercel (Automatic Deployments) |

---

## 🧠 AI-Assisted Engineering & Architecture

This project served as a practical testbed for **AI-assisted Software Engineering**.

Moving beyond generic chatbot usage, development leveraged **IDE and CLI workflows**, disciplined architectural mapping ([ARCHITECTURE.md](ARCHITECTURE.md)), and structured system contexts to accelerate delivery while ensuring clean code quality.

### Key Engineering Highlights:
* **State & Memory Modeling:** Structured Undo/Redo serialization while preserving background/grid lock metadata and Fabric.js canvas state.
* **Touch Event Coordination:** Resolved event collision between native mobile page scrolling (`touch-action`) and multi-touch canvas manipulation.
* **Zero-Bundler Modular Architecture:** Maintained strict modular separation and dependency ordering in pure JavaScript for near-instant cold loads without Webpack or Vite.

---

## 📂 Project Structure

```text
.
├── css/
│   ├── components.css     # Component styles (Modals, Draggable Sheets, Floating Buttons)
│   ├── layout.css         # Structural layout (Header, Canvas Wrapper, Toolbar, Mode Toggle)
│   └── variables.css      # Design tokens, CSS variables (:root), and global resets
├── js/
│   ├── app.js             # Main application bootstrap (window.onload & lifecycle init)
│   ├── canvas.js          # Fabric.js engine, custom controls, grid renderers, and history
│   ├── config.js          # Constants, paper dimensions, global state, and SVG paths
│   ├── export.js          # PDF, JPG, and ZIP export pipelines & JSON project serialization
│   ├── pdf.js             # Multi-page PDF parsing, page picker, and auto-grid distributor
│   ├── shapes.js          # Vector shapes factory, text handling, typography, and crop
│   └── ui.js              # UI controllers, keyboard shortcuts, drag & drop, clipboard
├── ARCHITECTURE.md        # Detailed system architecture document
├── LICENSE                # GNU GPL v3.0 license terms
├── README.md              # English documentation
├── README.pt-BR.md        # Portuguese documentation
├── index.html             # SPA entry point (compatible with Vercel & GitHub Pages)
└── vercel.json            # Vercel deployment and routing configuration
```

---

## 🚀 How to Run Locally

Because this is a 100% static client-side web application, **no backend dependencies or build steps (`npm install` or `npm run build`) are required**.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lucasresendev/app-recorte-cartazes.git
   cd app-recorte-cartazes
   ```

2. **Open the application:**
   * Open `index.html` directly in any modern web browser.
   * Or run any local static HTTP server of your choice (e.g., VS Code *Live Server* extension or `npx serve .`).

---

## 👤 Author

<div align="center">

  ### **Lucas Resende** (`@lucasresendev`)
  *Software Developer & Systems Analysis and Development Student (Fatec Taubaté)*

  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/lucasresendev)
  [![Web Portfolio](https://img.shields.io/badge/Web_Portfolio-0f4c80?style=for-the-badge&logo=astro&logoColor=white)](https://lucasresende.pages.dev)
  [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/lucasresendev)

  > *"I don't see code as an end in itself, but as a tool to break down needs and craft meaningful solutions."*

</div>

---

## 📄 License & Open Source (Copyleft)

This project is free software licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

### 🔓 What does this mean?
* **Freedom to use and modify:** Anyone is free to run, study, modify, and distribute this software.
* **Copyleft (Reciprocal License):** If you modify or build a derivative work based on this codebase, **you must also distribute your modifications openly under the exact same GPL-3.0 license**, ensuring the community continues to benefit.

See the [LICENSE](LICENSE) file for the full license text.

---

<div align="center">
  Developed by <b><a href="https://github.com/lucasresendev">Lucas Resende</a></b> under the <a href="LICENSE">GNU GPL v3.0</a> license. 🚀
</div>
