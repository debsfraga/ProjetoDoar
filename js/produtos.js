let produtos = []; // preenchido pelo JSON

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function parsePrecoBRL(str) {
  if (!str) return 0;
  return Number(String(str).replace(/[^0-9,.-]/g, "").replace(",", ".")) || 0;
}

// MODAIS 
function mostrarModalProduto(prod) {
  // Fecha o modal de orçamento se estiver aberto (evita sobreposição)
  fecharModalOrcamento();

  if (!prod) return;
  const modal = $("#modal");
  if (!modal) return;
  $("#modal-img").src = prod.imagem || "";
  $("#modal-titulo").innerText = prod.titulo || "";
  $("#modal-descricao").innerText = prod.descricao || "";
  $("#modal-preco").innerText = prod.preco || "";
  modal.style.display = "flex";
  window.produtoAtualModal = prod;
}

function fecharModal() {
  const modal = $("#modal");
  if (!modal) return;
  modal.style.display = "none";
  window.produtoAtualModal = null;
}



// FAVORITOS (localStorage)
// Guarda/recupera uma lista de objetos de produto em localStorage
function getFavoritos() {
  return JSON.parse(localStorage.getItem("favoritos")) || [];
}
function salvarFavoritos(favoritos) {
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

// Retorna true se o id já está nos favoritos
function isFavorito(id) {
  if (id === null || id === undefined) return false;
  return getFavoritos().some(f => String(f.id) === String(id));
}

// Adiciona produto (obj) aos favoritos, evitando duplicatas
function adicionarAosFavoritos(produto) {
  if (!produto || produto.id === undefined) return false;
  const favoritos = getFavoritos();
  if (!favoritos.some(f => String(f.id) === String(produto.id))) {
    favoritos.push(produto);
    salvarFavoritos(favoritos);
    atualizarContadorFavoritos();
    return true;
  }
  return false;
}

// Remove favorito por id
function removerFavoritoPorId(id) {
  let favoritos = getFavoritos();
  const novo = favoritos.filter(f => String(f.id) !== String(id));
  salvarFavoritos(novo);
  atualizarContadorFavoritos();
  return novo;
}

// Alterna estado de favorito: se já existir remove; caso contrário adiciona (usa produto do JSON quando possível)
function toggleFavorito(id, produtoFallback) {
  const exists = isFavorito(id);
  if (exists) {
    removerFavoritoPorId(id);
    return false;
  } else {
    // tenta encontrar objeto completo nos produtos carregados
    let prodObj = produtos.find(p => String(p.id) === String(id));
    if (!prodObj && produtoFallback) prodObj = produtoFallback;
    // se ainda não tiver, cria um objeto mínimo a partir do fallback
    if (!prodObj && produtoFallback == null) {
      prodObj = { id };
    }
    if (prodObj) {
      adicionarAosFavoritos(prodObj);
      return true;
    }
    return false;
  }
}

// Atualiza contador visível (se existir elemento com id contador-favoritos)
function atualizarContadorFavoritos() {
  const el = document.getElementById("contador-favoritos");
  if (el) el.innerText = getFavoritos().length;
}

// RENDER / INICIALIZAÇÃO DE EVENTOS 
function inicializarEventosNosCards(root = document) {
  // - imagens abrem modal
  $all(".card", root).forEach(card => {
    const dataId = card.getAttribute("data-id");
    const id = dataId ? Number(dataId) : null;

    // --- sincroniza estado do coração ao renderizar ---
    const heartEl = card.querySelector(".heart");
    if (heartEl && id !== null) {
      const icHeart = heartEl.querySelector("i");
      const fav = isFavorito(id);
      heartEl.classList.toggle("favoritado", fav);
      if (icHeart) {
        icHeart.classList.toggle("bi-heart-fill", fav);
        icHeart.classList.toggle("bi-heart", !fav);
      }
    }

    // imagem -> modal
    const img = card.querySelector("img");
    if (img) {
      img.style.cursor = "pointer";
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        // tenta obter produto do JSON; se não existir, usa os atributos do card
        const p = id !== null ? (produtos.find(x => x.id === id) || null) : null;
        const titleFromCard = card.getAttribute('data-name') || card.getAttribute('data-title') || card.querySelector("h2, h3")?.innerText || "";
        const isOrc = (p && p.titulo && /orcamento|orçamento/i.test(p.titulo)) || /orcamento|orçamento/i.test(titleFromCard);
        if (isOrc) {
          // passa p quando disponível, caso contrário um objeto fallback com título/imagem
          mostrarModalOrcamento(p || { titulo: titleFromCard, imagem: card.querySelector('img')?.src });
        } else {
          mostrarModalProduto(p || { titulo: titleFromCard, imagem: card.querySelector('img')?.src });
        }
      });
    }

    // botão favorito
    if (heartEl) {
      heartEl.style.cursor = "pointer";
      heartEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (id === null) return;
        const agoraFavorito = toggleFavorito(id);
        heartEl.classList.toggle("favoritado", agoraFavorito);
        const ic = heartEl.querySelector("i");
        if (ic) {
          ic.classList.toggle("bi-heart-fill", agoraFavorito);
          ic.classList.toggle("bi-heart", !agoraFavorito);
        }
      });
    }

    // botão mais detalhes -> modal
    const btnDetalhes = card.querySelector(".btn-mais-detalhes");
    if (btnDetalhes) {
      btnDetalhes.addEventListener("click", (e) => {
        e.stopPropagation();
        const p = id !== null ? (produtos.find(x => x.id === id) || null) : null;
        const titleFromCard = card.getAttribute('data-name') || card.getAttribute('data-title') || card.querySelector("h2, h3")?.innerText || "";
        const isOrc = (p && p.titulo && /orcamento|orçamento/i.test(p.titulo)) || /orcamento|orçamento/i.test(titleFromCard);
        if (isOrc) {
          mostrarModalOrcamento(p || { titulo: titleFromCard, imagem: card.querySelector('img')?.src });
        } else {
          mostrarModalProduto(p || { titulo: titleFromCard, imagem: card.querySelector('img')?.src });
        }
      });
    }
  });
}

// RENDER DINÂMICO 
function criarCardDOM(produto) {
  const div = document.createElement("div");
  div.className = "card";
  div.setAttribute("data-id", produto.id);
  // inclui data-name para permitir detecção de "orçamento" em cards dinâmicos
  if (produto.titulo) div.setAttribute("data-name", produto.titulo);
  div.innerHTML = `
    <div class="heart"><i class="bi bi-heart"></i></div>
    <img src="${produto.imagem}" alt="${produto.titulo}">
    <h2>${produto.titulo}</h2>
    <span class="preco">${produto.preco}</span>
    <button class="btn-mais-detalhes">Mais Detalhes</button>
  `;
  return div;
}

// CARREGAR PRODUTOS
function carregarProdutos() {
  fetch("../json/produtolista.json")
    .then(r => {
      if (!r.ok) throw new Error("Erro no fetch: " + r.status);
      return r.json();
    })
    .then(data => {
      produtos = data.lista || [];

      
      const containerStatic = document.querySelector(".container") || document.querySelector(".produtos-container");
      const cardsStatic = containerStatic ? containerStatic.querySelectorAll(".card") : null;

      if (containerStatic && cardsStatic && cardsStatic.length > 0) {
        // garante que data-id dos cards correspondem aos IDs do JSON (opcional)
        // inicializa listeners nos cards existentes
        inicializarEventosNosCards(containerStatic);
      } else {
        // cria um container novo se não existir
        const container = containerStatic || document.createElement("div");
        if (!containerStatic) {
          container.className = "container";
          document.querySelector("main")?.appendChild(container);
        }
        container.innerHTML = "";
        produtos.forEach(p => container.appendChild(criarCardDOM(p)));
        inicializarEventosNosCards(container);
      }

      // ligar botões de fechar modais globais
      $all(".fechar").forEach(btn => btn.addEventListener("click", () => {
        fecharModal();
        fecharModalOrcamento();
      }));

      // funções globais para modais (nomes que não sobrescrevem funções locais)
      window.mostrarModal = (id) => {
        const p = produtos.find(x => x.id === id);
        mostrarModalProduto(p);
      };
      // expõe um helper que mostra o modal de orçamento a partir de um id sem sobrescrever
      window.mostrarModalOrcamentoById = (id) => {
        const p = produtos.find(x => x.id === id);
        mostrarModalOrcamento(p);
      };
    })
    .catch(err => {
      console.error("Erro ao carregar produtos:", err);
      // mesmo se falhar no fetch, tenta inicializar listeners se houver cards estáticos
      const container = document.querySelector(".container") || document.querySelector(".produtos-container");
      if (container) inicializarEventosNosCards(container);
    });
}

// atualiza contador de favoritos ao carregar a página
window.addEventListener("load", atualizarContadorFavoritos);

/* ================ UTILIDADES MODAL ORÇAMENTO ================ */
function mostrarModalOrcamento(prod) {
  // Fecha o modal padrão se estiver aberto (evita sobreposição)
  fecharModal();

  console.log("Abrindo modal de orçamento para produto:", prod);  // Log temporário
  if (!prod) return;

  const modal = document.querySelector("#modal-orcamento");
  console.log("Modal encontrado:", modal);  // Confirma se o elemento existe

  document.querySelector("#modal-orcamento-img").src = prod.imagem || "";
  document.querySelector("#modal-orcamento-titulo").innerText = prod.titulo || "Solicitar orçamento";
  document.querySelector("#modal-orcamento-descricao").innerText =
    prod.descricao || "Aqui você pode solicitar um orçamento personalizado para sua festa!";
  document.querySelector("#modal-orcamento-preco").innerText = prod.preco || "";

  modal.style.display = "flex";
  console.log("Modal exibido com display: flex");  // Confirma exibição
}

function fecharModalOrcamento() {
  const modal = document.querySelector("#modal-orcamento");
  modal.style.display = "none";
}

// Redirecionamentos a partir do modal de orçamento
function irParaOrcamento() {
  // mantém compatibilidade com o botão existente: encaminha ao formulário
  window.location.href = 'formulario.html';
}

function irParaFormulario() {
  window.location.href = 'formulario.html';
}

// expõe as funções no escopo global (permite uso via onclick no HTML)
window.irParaOrcamento = irParaOrcamento;
window.irParaFormulario = irParaFormulario;


window.addEventListener("load", carregarProdutos);
