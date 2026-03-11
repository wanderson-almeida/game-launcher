let jogos = [];
let paginaAtual = 1;
const limite = 5;

document.getElementById("btnPesquisarGeral").addEventListener("click", pesquisarGeral);
document.getElementById("btnProximo").addEventListener("click", proximaPagina);
document.getElementById("btnAnterior").addEventListener("click", paginaAnterior);

async function pesquisarGeral() {

  const resultado = document.getElementById("resultadoGeral");

  try {
    const response = await fetch("https://hydralinks.pages.dev/sources/onlinefix.json");
    const data = await response.json();

    jogos = data.downloads;
    paginaAtual = 1;

    mostrarPagina();

    document.getElementById("btnAnterior").disabled = false;
    document.getElementById("btnProximo").disabled = false;
    document.getElementById("btnPesquisarGeral").style.display = "none";
  } 
  catch (erro) {
    resultado.innerHTML = "Erro ao carregar.";
    console.error(erro);
  }
}

function mostrarPagina() {

  const resultado = document.getElementById("resultadoGeral");
  const offset = (paginaAtual - 1) * limite;
  const pagina = jogos.slice(offset, offset + limite);
  let html = "";

  pagina.forEach(item => {
    html += `
      <p>
        Nome: <b>${item.title}</b><br>
        Tamanho: ${item.fileSize}<br>
        Download: <a href="${item.uris[0]}">Clique aqui</a>
      </p>
      <hr>
    `;
    });

    resultado.innerHTML = html;
    atualizarControles();
}

function proximaPagina() {

  const totalPaginas = Math.ceil(jogos.length / limite);

  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    mostrarPagina();
  }

}

function paginaAnterior() {

  if (paginaAtual > 1) {
    paginaAtual--;
    mostrarPagina();
  }

}

function atualizarControles() {

  const btnAnterior = document.getElementById("btnAnterior");
  const btnProximo = document.getElementById("btnProximo");
  
  const totalPaginas = Math.ceil(jogos.length / limite);

  btnAnterior.style.display = paginaAtual > 1 ? "inline-block" : "disabled";
  btnProximo.style.display = paginaAtual < totalPaginas ? "inline-block" : "none";

}