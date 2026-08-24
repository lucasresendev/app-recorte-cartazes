<div align="center">

  🇺🇸 **[English Version](README.md)**
  <br>

  # 🖼️ Recorte em A3/A4 — Fatiamento Inteligente de Cartazes e Painéis

  ### **Single Page Application (SPA) responsiva para fatiamento, diagramação e exportação de imagens e PDFs em papéis A3 e A4 para impressão de murais e painéis em grande formato.**

  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://recorte-cartazes.vercel.app)
  [![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue.svg?style=for-the-badge)](LICENSE)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
  [![Fabric.js](https://img.shields.io/badge/Fabric.js-5.3.1-blue?style=for-the-badge)](#)

  [🔗 **Acesse a Aplicação Online**](https://recorte-cartazes.vercel.app) · [📖 **Ver Documentação Arquitetural**](ARCHITECTURE.md)

</div>

---

## 📌 Visão Geral & O Problema de Negócio

Em ambientes institucionais e educacionais (como escolas, secretarias e organizadores de eventos), a criação de **painéis, cartazes e murais decorativos ou informativos** em grande formato (frequentemente superiores a 1 metro de largura) é uma necessidade constante.

Entretanto, as **impressoras disponíveis no local costumam ser limitadas aos formatos padrão A4 ou A3**.

### ⚠️ Principais Desafios Observados:
* **Processo manual suscetível a erros:** Sem uma ferramenta dedicada, as equipes tentavam fatiar imagens "no olho" em editores genéricos ou copiar referências manualmente.
* **Desperdício de recursos:** Múltiplas impressões desalinhadas geravam desperdício direto de papel, tinta e tempo operacional.
* **Desalinhamento visual:** Margens e proporções ficavam tortas durante a montagem física na parede.

### 💡 A Solução
O **Recorte em A3/A4** é uma aplicação web de página única (SPA) leve, gratuita e intuitiva, desenvolvida para eliminar a dependência de softwares profissionais complexos (como Photoshop ou CorelDRAW) e resolver a dor direto na fonte.

Com ela, qualquer colaborador pode importar uma arte ou PDF, configurar um grid de páginas em tempo real e exportar os arquivos fatiados e prontos para impressão em segundos.

---

## ✨ Principais Funcionalidades

### 📐 Grid Configurável & Escala em Tempo Real
* **Formatos de Papel:** Suporte completo aos padrões **A3** e **A4** em orientação **Retrato** ou **Paisagem**.
* **Controle Dinâmico de Células:** Ajuste fluido do número de linhas e colunas através de sliders.
* **Cálculo de Medida Real:** Exibe as dimensões reais finais do painel em centímetros (ex: `120 cm × 80 cm`), eliminando réguas e cálculos manuais.

### 📄 Processamento e Importação Inteligente de PDFs (`PDF.js`)
* Importação nativa de arquivos PDF diretamente do dispositivo sem requisições de backend.
* **Distribuição Automática:** Em documentos PDF multipáginas, a aplicação calcula o grid ideal e distribui automaticamente cada página nas células correspondentes.
* **Seleção Individual:** Opção de selecionar uma página específica do PDF para renderização em alta definição no canvas.

### 🎨 Engine Gráfica Interativa (`Fabric.js` & `Cropper.js`)
* **Edição Rich-Text:** Inserção de texto com integração de +20 fontes do Google Fonts carregadas sob demanda, ajuste de espaçamento de letras e paleta de cores.
* **Formas Vetoriais:** Biblioteca integrada com retângulos, círculos, estrelas, corações, pentágonos e balões de fala.
* **Corte de Imagens (Crop):** Ferramenta de recorte dedicada com `Cropper.js` para ajustar fotos e elementos antes do posicionamento.
* **Organização de Camadas:** Controle de profundidade z-index (trazer para frente, enviar para trás).

### 🖐️ UX Mobile-First & Suporte a Gestos (`Hammer.js`)
* Gestos intuitivos de **Pinch-to-Zoom** e **Pan (Modo Mão com 2 dedos)**.
* Interface otimizada para telas sensíveis ao toque com *bottom-sheets* arrastáveis.
* Respeito às diretrizes de insets do iOS (`env(safe-area-inset-top/bottom)`) e altura com `100dvh`.

### 🖨️ Exportação Flexível & Projetos (`jsPDF` + `JSZip`)
* **PDF Único Compilado:** Gera um PDF único organizando todas as páginas do painel na sequência exata de impressão.
* **Pacote ZIP:** Opção de baixar as páginas fatiadas em imagens JPG individuais ou arquivos PDF separados.
* **Projetos Salváveis em JSON:** Permite salvar e recarregar o estado do projeto para edições futuras.
* **Gestão de Estado:** Pilha de Undo/Redo (Ctrl+Z / Ctrl+Y), suporte a atalhos de teclado e colagem direta via Clipboard (Ctrl+V).

---

## 📈 Impacto & Resultados Medíveis

* 👥 **Adoção Operacional:** Ferramenta adotada como padrão por **50+ profissionais** em secretarias e equipes pedagógicas.
* ⏱️ **Eficiência de Tempo:** Redução do tempo de montagem de murais de **horas de tentativa e erro para poucos minutos** de configuração.
* ♻️ **Sustentabilidade & Economia:** Eliminação de impressões perdidas por erros de escala, corte ou margem.
* 💡 **Autonomia:** Empoderamento de equipes operacionais para criar materiais visuais de alto impacto sem depender de equipes de design.

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi construída com foco em **alta performance e zero dependências de build/compilação**, podendo ser servida diretamente em qualquer hospedagem estática.

| Categoria | Tecnologias / Bibliotecas |
| :--- | :--- |
| **Core Frontend** | HTML5 Semântico, CSS3 (Vanilla / Tokens / CSS Variables), JavaScript (ES6+ Modulado) |
| **Engine Gráfica** | [Fabric.js 5.3.1](https://fabricjs.com/) (Manipulação 2D de Canvas) |
| **Processamento de PDF** | [PDF.js 3.4.120](https://mozilla.github.io/pdf.js/) (Leitura/Render) & [jsPDF 2.5.1](https://github.com/parallax/jsPDF) (Geração PDF) |
| **Utilitários & Export** | [Cropper.js](https://fengyuanchen.github.io/cropperjs/) (Recorte), [Hammer.js](https://hammerjs.github.io/) (Touch), [JSZip](https://stuk.github.io/jszip/) (ZIP), [FileSaver.js](https://github.com/eligrey/FileSaver.js/) |
| **Fontes & Ícones** | Google Fonts (WebFont Loader) & Material Icons Round |
| **Infra & Deploy** | GitHub, Vercel (CI/CD Automático) |

---

## 🧠 Desenvolvimento Assistido por IA & Engenharia de Software

Este projeto serviu como um laboratório prático de **Engenharia de Software assistida por Inteligência Artificial**. 

Superando o uso convencional de chatbots genéricos, o desenvolvimento envolveu o uso de **IDE e CLI integradas**, construindo mapeamentos arquiteturais ([ARCHITECTURE.md](ARCHITECTURE.md)) e contextos direcionados para acelerar a entrega e garantir qualidade de código.

### Pontos Chave do Processo:
* **Modelagem de Estado e Memória:** Estruturação da lógica de Undo/Redo com preservação de propriedades de background e gerenciamento de renderização do Fabric.js.
* **UX & Eventos Sensíveis ao Toque:** Soluções para tratar concorrência de rolagem de página (`touch-action`) versus gestos de edição no Canvas em dispositivos móveis.
* **Arquitetura Modular em JS Puro:** Garantia da ordem de dependências sem a necessidade de bundlers (Webpack/Vite), visando máxima leveza e carregamento instantâneo.

---

## 📂 Estrutura de Arquivos

```text
.
├── css/
│   ├── components.css     # Estilos de componentes (Modais, Sheets arrastáveis, Botões flutuantes)
│   ├── layout.css         # Layout estrutural (Header, Canvas Wrapper, Toolbar, Mode Toggle)
│   └── variables.css      # Design tokens, variáveis CSS (:root) e resets globais
├── js/
│   ├── app.js             # Ponto de entrada principal (bootstrap window.onload)
│   ├── canvas.js          # Engine do Fabric.js, controles customizados, grid e histórico
│   ├── config.js          # Constantes de tamanho, fontes, estado global e caminhos SVG
│   ├── export.js          # Exportação para PDF, JPG, ZIP e salvamento do projeto em JSON
│   ├── pdf.js             # Leitura, seleção e importação de documentos PDF multipáginas
│   ├── shapes.js          # Manipulação de formas geométricas, textos, fontes e recorte
│   └── ui.js              # Controle da interface, atalhos de teclado, drag & drop, clipboard
├── ARCHITECTURE.md        # Mapa arquitetural detalhado do sistema
├── LICENSE                # Termos da licença GNU GPL v3.0
├── README.md              # Documentação em inglês
├── README.pt-BR.md        # Documentação em português
├── index.html             # Ponto de entrada SPA (compatível com Vercel / GitHub Pages)
└── vercel.json            # Configuração de headers e deploy Vercel
```

---

## 🚀 Como Executar o Projeto Localmente

Por ser uma aplicação web 100% estática, **não é necessário instalar dependências de backend ou executar comandos de build** (`npm install` ou `npm run build`).

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/lucasresendev/app-recorte-cartazes.git
   cd app-recorte-cartazes
   ```

2. **Abra a aplicação:**
   * Basta abrir o arquivo `index.html` diretamente no seu navegador de preferência.
   * Ou utilize qualquer servidor HTTP estático local de sua escolha (ex: extensão *Live Server* no VS Code ou `npx serve .`).

---

## 👤 Autor

<div align="center">

  ### **Lucas Resende** (`@lucasresendev`)
  *Desenvolvedor de Software & Estudante de Análise e Desenvolvimento de Sistemas (Fatec Taubaté)*

  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/lucasresendev)
  [![Portfólio Web](https://img.shields.io/badge/Portfólio_Web-0f4c80?style=for-the-badge&logo=astro&logoColor=white)](https://lucasresende.pages.dev)
  [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/lucasresendev)

  > *"Vejo o código não como um fim em si mesmo, mas como uma base para a desconstrução de necessidades e a criação de soluções."*

</div>

---

## 📄 Licença & Código Aberto (Copyleft)

Este projeto é um software livre distribuído sob a licença **GNU General Public License v3.0 (GPL-3.0)**. 

### 🔓 O que isso significa?
* **Liberdade de uso e modificação:** Qualquer pessoa é livre para usar, copiar, modificar, estudar e distribuir este projeto.
* **Cláusula Copyleft (Viral):** Se você modificar ou criar um projeto derivado a partir deste código, **você também é obrigado a mantê-lo 100% aberto e gratuito sob a mesma licença GPL-3.0** para que a comunidade continue se beneficiando.

Consulte o arquivo [LICENSE](LICENSE) para obter o texto completo da licença.

---

<div align="center">
  Desenvolvido por <b><a href="https://github.com/lucasresendev">Lucas Resende</a></b> sob a licença <a href="LICENSE">GNU GPL v3.0</a>. 🚀
</div>
