function formatarPreco(valor) {
  if (valor == null) return '';
  const num = typeof valor === 'number' ? valor : Number(String(valor).replace(/[^0-9,\.]/g, '').replace(',', '.'));
  if (Number.isNaN(num)) return String(valor);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function carregarFavoritos() {
  const container = document.querySelector('.produtos-favoritos');
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

  if (!container) return;
  container.innerHTML = ''; // limpa o container

  if (favoritos.length === 0) {
    container.innerHTML = '<p class="sem-favoritos">Nenhum produto favoritado ainda 😢</p>';
    return;
  }

  favoritos.forEach(produto => {
    const item = document.createElement('div');
    item.className = 'produto-card';
    item.setAttribute('data-id', produto.id);

    item.innerHTML = `
      <img src="${produto.imagem || '../img/sem-imagem.png'}" alt="${produto.titulo || produto.nome}" />

      <div class="produto-info">
        <div class="linha-superior">
          <h3 class="produto-titulo">${produto.titulo || produto.nome || 'Produto'}</h3>
          <div class="icones-superiores">
            <button class="btn-favorito favorito-ativo" title="Remover dos favoritos">
              <i class="bi bi-heart-fill"></i>
            </button>
            <button class="btn-adicionar-carrinho" title="Adicionar ao carrinho">
            </button>
          </div>
        </div>
        <p class="preco">${formatarPreco(produto.preco)}</p>
      </div>
    `;

    const btnRemover = item.querySelector('.btn-favorito');
    btnRemover.addEventListener('click', () => removerFavorito(produto.id));

    const btnCarrinho = item.querySelector('.btn-adicionar-carrinho');
    btnCarrinho.addEventListener('click', () => {
      if (typeof window.abrirCarrinho === 'function') {
        window.abrirCarrinho();
      } else if (typeof abrirCarrinho === 'function') {
        abrirCarrinho();
      } else {
        console.warn('Função abrirCarrinho() não encontrada.');
      }
    });

    container.appendChild(item);
  });
}

function removerFavorito(id) {
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const novosFavoritos = favoritos.filter(prod => String(prod.id) !== String(id));
  localStorage.setItem('favoritos', JSON.stringify(novosFavoritos));

  const card = document.querySelector(`.produto-card[data-id="${id}"]`);
  if (card) card.remove();

  if (novosFavoritos.length === 0) {
    document.querySelector('.produtos-favoritos').innerHTML = '<p class="sem-favoritos">Nenhum produto favoritado ainda 😢</p>';
  }
}

document.addEventListener('DOMContentLoaded', carregarFavoritos);
