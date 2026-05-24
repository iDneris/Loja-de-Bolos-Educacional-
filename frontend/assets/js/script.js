/* =========================================================
   A&L Cakes - JavaScript principal
   Funcionalidades:
   - Menu hambúrguer responsivo
   - Marca link ativo na navbar
   - Animações de entrada (scroll reveal)
   - Validação dos formulários (login, cadastro, admin)
   - Pré-visualização do cadastro de produto
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  ativarMenuMobile();
  marcarLinkAtivo();
  animarAoRolar();
  configurarFormularios();
});

/* ---------------------------------------------------------
   MENU MOBILE - abre/fecha ao clicar no hambúrguer
   --------------------------------------------------------- */
function ativarMenuMobile() {
  const btn = document.querySelector(".hamburguer");
  const menu = document.querySelector(".nav-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    menu.classList.toggle("aberto");
  });

  // Fecha o menu ao clicar em um link (no mobile)
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => menu.classList.remove("aberto"));
  });
}

/* ---------------------------------------------------------
   LINK ATIVO - destaca o item da navbar da página atual
   --------------------------------------------------------- */
function marcarLinkAtivo() {
  // Pega só o nome do arquivo (ex: cardapio.html)
  const arquivo = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    const href = link.getAttribute("href").split("/").pop();
    if (href === arquivo) link.classList.add("ativo");
  });
}

/* ---------------------------------------------------------
   ANIMAÇÃO AO ROLAR - usa IntersectionObserver
   Elementos com [data-animar] aparecem ao entrar na viewport
   --------------------------------------------------------- */
function animarAoRolar() {
  const alvos = document.querySelectorAll("[data-animar]");
  if (!alvos.length) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.style.opacity = "1";
          entrada.target.style.transform = "translateY(0)";
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  alvos.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    observador.observe(el);
    // Fallback: garante visibilidade após 1.5s caso o observer não dispare
    setTimeout(() => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; }, 1500);
  });
}

/* ---------------------------------------------------------
   FORMULÁRIOS - validação básica e mensagens
   --------------------------------------------------------- */
function configurarFormularios() {

  configurarAdmin();
}

/* Mostra mensagem dentro de uma div com classe .mensagem */
function exibirMensagem(form, texto, tipo = "sucesso") {
  let msg = form.querySelector(".mensagem");
  if (!msg) {
    msg = document.createElement("div");
    msg.classList.add("mensagem");
    form.appendChild(msg);
  }
  msg.className = "mensagem " + tipo;
  msg.textContent = texto;
}





/* ---- ADMIN: cadastro de produto + preview ---- */
function configurarAdmin() {
  const form = document.querySelector("#form-admin");
  if (!form) return;

  const preview = document.querySelector("#preview-produto");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    const descricao = form.descricao.value.trim();
    const preco = parseFloat(form.preco.value);
    const imagem = form.imagem_url.value.trim();

    if (!nome || !descricao || isNaN(preco) || preco <= 0) {
      return exibirMensagem(form, "Preencha todos os campos corretamente.", "erro");
    }

    // Monta a pré-visualização (apenas visual - nada é salvo)
    if (preview) {
      preview.innerHTML = `
        <h3>Pré-visualização do produto</h3>
        ${imagem ? `<img src="${imagem}" alt="${nome}" onerror="this.style.display='none'" style="width:100%;max-height:240px;object-fit:cover;border-radius:10px;margin:1rem 0;">` : ""}
        <h4 style="font-family:var(--fonte-titulo);font-size:1.3rem;">${nome}</h4>
        <p style="color:var(--texto-claro);margin:0.4rem 0;">${descricao}</p>
        <span class="preco">R$ ${preco.toFixed(2).replace(".", ",")}</span>
      `;
      preview.classList.add("ativo");
    }

    exibirMensagem(form, "Produto cadastrado (simulação) com sucesso!", "sucesso");
  });
}

/* ---- Utilitário: valida formato de email ---- */
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}




/* =========================================================
   DROPDOWN USUÁRIO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const usuarioBtn = document.getElementById("usuario-btn");
  const dropdownUsuario = document.getElementById("dropdown-usuario");

  if (!usuarioBtn || !dropdownUsuario) return;

  usuarioBtn.addEventListener("click", () => {
    dropdownUsuario.classList.toggle("ativo");
  });

  document.addEventListener("click", (e) => {
    if (!usuarioBtn.contains(e.target) && !dropdownUsuario.contains(e.target)) {
      dropdownUsuario.classList.remove("ativo");
    }
  });
});

/* =========================================================
   CLIENTES CADASTRADOS - CRUD com localStorage
========================================================= */
const CLIENTES_KEY = "al_cakes_clientes";

// MOCK ATUALIZADO (sem telefone, com senha)
const clientesMock = [
  { id: 1, nome: "Maria Silva",    email: "maria@gmail.com",   senha: "123456", dataCadastro: "10/05/2026" },
  { id: 2, nome: "Joana Pereira",  email: "joana@gmail.com",   senha: "123456", dataCadastro: "12/05/2026" },
  { id: 3, nome: "Carla Mendonça", email: "carla@hotmail.com", senha: "123456", dataCadastro: "13/05/2026" }
];


function obterClientes() {
  const dados = localStorage.getItem(CLIENTES_KEY);
  if (!dados) {
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientesMock));
    return [...clientesMock];
  }
  return JSON.parse(dados);
}

function salvarClientes(lista) {
  localStorage.setItem(CLIENTES_KEY, JSON.stringify(lista));
}

function abrirModalClientes() {
  renderizarClientes();
  document.getElementById("overlay-clientes").classList.add("ativo");
}

function fecharModalClientes() {
  document.getElementById("overlay-clientes").classList.remove("ativo");
}

function renderizarClientes() {
  const lista = document.getElementById("clientes-lista");
  if (!lista) return;
  const clientes = obterClientes();

  if (!clientes.length) {
    lista.innerHTML = `<p style="text-align:center;color:var(--texto-claro);padding:2rem;">Nenhum cliente cadastrado.</p>`;
    return;
  }

  lista.innerHTML = clientes.map(c => `
    <div class="cliente-card">
      <div class="cliente-info">
        <h3>${c.nome}</h3>
        <p>📧 ${c.email}</p>
        <p>🔒 ${"•".repeat((c.senha || "").length)}</p>
        <span class="data-cadastro">Cadastrado em ${c.dataCadastro}</span>
      </div>
      <div class="cliente-acoes">
        <button class="btn-editar-cliente" data-id="${c.id}">Editar</button>
        <button class="btn-excluir-cliente" data-id="${c.id}">Excluir</button>
      </div>
    </div>
  `).join("");

  lista.querySelectorAll(".btn-editar-cliente").forEach(b =>
    b.addEventListener("click", () => abrirEditarCliente(Number(b.dataset.id)))
  );
  lista.querySelectorAll(".btn-excluir-cliente").forEach(b =>
    b.addEventListener("click", () => excluirCliente(Number(b.dataset.id)))
  );
}


function abrirEditarCliente(id) {
  const c = obterClientes().find(x => x.id === id);
  if (!c) return;
  document.getElementById("edit-cliente-id").value    = c.id;
  document.getElementById("edit-cliente-nome").value  = c.nome;
  document.getElementById("edit-cliente-email").value = c.email;
  document.getElementById("edit-cliente-senha").value = c.senha;
  document.getElementById("overlay-editar-cliente").classList.add("ativo");
}


function fecharEditarCliente() {
  document.getElementById("overlay-editar-cliente").classList.remove("ativo");
}

function salvarEdicaoCliente(e) {
  e.preventDefault();
  const id = Number(document.getElementById("edit-cliente-id").value);
  const lista = obterClientes().map(c =>
    c.id === id ? {
      ...c,
      nome:  document.getElementById("edit-cliente-nome").value.trim(),
      email: document.getElementById("edit-cliente-email").value.trim(),
      senha: document.getElementById("edit-cliente-senha").value
    } : c
  );
  salvarClientes(lista);
  fecharEditarCliente();
  renderizarClientes();
}


function excluirCliente(id) {
  if (!confirm("Deseja realmente excluir este cliente?")) return;
  salvarClientes(obterClientes().filter(c => c.id !== id));
  renderizarClientes();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("abrir-clientes")?.addEventListener("click", abrirModalClientes);
  document.getElementById("fechar-clientes")?.addEventListener("click", fecharModalClientes);
  document.getElementById("overlay-clientes")?.addEventListener("click", e => {
    if (e.target.id === "overlay-clientes") fecharModalClientes();
  });

  document.getElementById("fechar-editar-cliente")?.addEventListener("click", fecharEditarCliente);
  document.getElementById("overlay-editar-cliente")?.addEventListener("click", e => {
    if (e.target.id === "overlay-editar-cliente") fecharEditarCliente();
  });
  document.getElementById("form-editar-cliente")?.addEventListener("submit", salvarEdicaoCliente);
});
