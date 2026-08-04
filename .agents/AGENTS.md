# Diretrizes de Desenvolvimento e Regras da Codebase

## 📌 Contexto do Projeto
Este repositório contém o **Recorte em A3/A4**, uma aplicação web estática (Single Page Application) sem necessidade de build/compilação, construída em HTML5, CSS3 Vanilla e JavaScript ES6+ modulado.

---

## 🛠️ Regras de Arquitetura e Estrutura de Arquivos

1. **Ponto de Entrada**:
   - O arquivo [index.html](file:///Users/lucasalsare/app-recorte-cartazes/index.html) DEVE ser mantido na raiz do projeto para servir diretamente em ambientes de produção estática (Vercel, GitHub Pages).

2. **Divisão de Módulos**:
   - Todo CSS DEVE ser mantido na pasta `css/` (`variables.css`, `layout.css`, `components.css`).
   - Todo JavaScript DEVE ser mantido na pasta `js/` (`config.js`, `canvas.js`, `shapes.js`, `pdf.js`, `export.js`, `ui.js`, `app.js`).

3. **Ordem Estrita de Carregamento de Scripts**:
   Ao adicionar novas funções ou utilitários JS em `index.html`, garanta a manutenção da ordem de dependências:
   ```html
   <script src="js/config.js"></script>
   <script src="js/canvas.js"></script>
   <script src="js/shapes.js"></script>
   <script src="js/pdf.js"></script>
   <script src="js/export.js"></script>
   <script src="js/ui.js"></script>
   <script src="js/app.js"></script>
   ```

---

## 🎨 Design System e Estilização

1. **Tokens CSS**:
   - Utilize sempre as variáveis declaradas em `:root` ([css/variables.css](file:///Users/lucasalsare/app-recorte-cartazes/css/variables.css)):
     - `--primary`: `#233476`
     - `--accent`: `#fdd200`
     - `--bg-dark`: `#121212`
     - `--surface`: `#ffffff`
     - `--handle`: `#e0e0e0`
     - `--danger`: `#d32f2f`

2. **Responsividade Mobile e Safe Area**:
   - Respeite as insets de tela do iOS: `env(safe-area-inset-top)` no topo e `calc(20px + env(safe-area-inset-bottom))` no rodapé.
   - Utilize `100dvh` para altura da página no mobile para evitar que a barra de endereços do navegador oculte elementos da UI.

---

## 🎨 Fabric.js e Estado do Canvas

1. **Retângulo de Fundo**:
   - O objeto de fundo do grid possui a flag `isBackground: true`. Ele nunca deve ser selecionável (`selectable: false`) ou interativo (`evented: false`).
2. **Histórico (Undo/Redo)**:
   - Ao modificar ou adicionar objetos, chame `saveHistory()` para persistir o estado no vetor de undo (limite mantido de 10 estados). Preserve as propriedades `['isBackground', 'gridConfig', 'id']` no método `canvas.toJSON()`.
