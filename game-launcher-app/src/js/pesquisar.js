document.getElementById("btnPesquisar")
    .addEventListener("click", pesquisar);

async function pesquisar() {

    const palavraChave = document.getElementById("pesquisa").value.trim();
    const resultado = document.getElementById("resultado");

    if (!palavraChave) {
        resultado.innerHTML = "Digite algo para pesquisar.";
        return;
    }

    try {

        const response = await fetch("https://hydralinks.pages.dev/sources/onlinefix.json");

        const data = await response.json();

        const regex = new RegExp(palavraChave, "i");

        let encontrados = data.downloads.filter(item => regex.test(item.title));

        if (encontrados.length === 0) {
            resultado.innerHTML = "Nenhum resultado encontrado.";
            return;
        }

        let html = "";

        encontrados.forEach(item => {

            html += `
                <p>
                    Nome: <b>${item.title}</b><br>
                    Tamanho: ${item.fileSize}<br>
                    Download: <a href="${item.uris[0]}">Clique aqui!</a>
                </p>
                <hr>
            `;

        });

        resultado.innerHTML = html;

    } catch (erro) {
        resultado.innerHTML = "Erro ao carregar.";
        console.error(erro);
    }
}