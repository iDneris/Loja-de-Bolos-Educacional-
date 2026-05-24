# Como Rodar o Frontend

## Requisitos

- Navegador moderno (Chrome/Firefox/Edge)
- Backend rodando (veja `docs/projeto/execucao.md`)
- Servidor HTTP local (recomendado - evita problema de CORS)

## Setup

### VS Code + Live Server
1. Instala a extensao "Live Server"
2. Click direito em `frontend/index.html` > "Open with Live Server"
3. Abre em http://localhost:5500

### npx serve
```bash
npx serve frontend
# http://localhost:3000 (ou a porta que aparecer)
```

### Python
```bash
cd frontend
python -m http.server 8080
```

## Configuracao da API

A URL base da API ta no `assets/js/controller.js`:

```javascript
const API_URL = 'http://localhost:3000';        // dev local
const API_URL = 'https://seu-projeto.vercel.app'; // producao
```

Altere conforme o ambiente.

## Dependencias

Tudo CDN, sem build step:

| Lib | Uso |
|-----|-----|
| jQuery 3.7.1 | DOM, AJAX, eventos |
| SweetAlert2 | Confirmacoes e alerts |
| Chart.js 4 | Graficos do dashboard |
| Font Awesome 6 | Icones |

## Fluxo de inicializacao

1. `$(document).ready()` dispara
2. `carregarHeader()` → fetch `components/header.html` → injeta no DOM
3. `atualizarUsuario()` → le localStorage → atualiza UI do header
4. Funcoes da pagina carregam dados da API conforme necessidade

## Troubleshooting

### CORS bloqueando
- Nao abra o HTML direto do filesystem (`file://`)
- Use um servidor HTTP (Live Server, serve, etc)
- Backend precisa ter `CORS_ORIGIN=*` no `.env`

### API offline
- Confirma que o backend ta rodando (`curl http://localhost:3000/bolos`)
- Verifica a `API_URL` no `controller.js`

### Imagens quebradas
- As imagens sao URLs externas salvas no banco
- Verifica se as URLs no Supabase ainda sao validas
