const slides = document.querySelector('.slides');
const totalSlides = document.querySelectorAll('.slide').length;
const btnAnterior = document.querySelector('.anterior');
const btnProximo = document.querySelector('.proximo');

let slideAtual = 0;

// Função para mudar o slide
function mostrarSlide(index) {
  // Garante que o slide vá de 0 até o último
  if (index >= totalSlides) {
    slideAtual = 0;
  } else if (index < 0) {
    slideAtual = totalSlides - 1;
  } else {
    slideAtual = index;
  }

  const deslocamento = -slideAtual * 100;
  slides.style.transform = `translateX(${deslocamento}%)`;
}

// Botões de navegação
btnAnterior.addEventListener('click', () => {
  mostrarSlide(slideAtual - 1);
});

btnProximo.addEventListener('click', () => {
  mostrarSlide(slideAtual + 1);
});

// (Opcional) Autoplay a cada 5 segundos
// setInterval(() => {
//   mostrarSlide(slideAtual + 1);
// }, 5000);
