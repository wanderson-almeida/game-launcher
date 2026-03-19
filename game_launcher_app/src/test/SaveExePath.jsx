export default function SaveExePath() {
  async function selecionarEInstalar() {
    const caminhoDoExe = await window.launcherAPI.openFileDialog();

    if (!caminhoDoExe) {
      alert("Nenhum arquivo selecionado.");
      return;
    }

    const resultado = await window.launcherAPI.installExe(caminhoDoExe);

    if (!resultado.success) {
      alert(resultado.error);
      return;
    }

    alert(`Executável salvo em: ${resultado.destino}`);
  }

  return (
    <div>
      <button style={{ marginTop:"1rem" }} onClick={selecionarEInstalar}>Instalar executável</button>
      <p style={{ fontSize: '0.8em', color: 'gray', marginTop: '0.5em' }}>(testa se a função de copiar um executavel pra outro diretorio funciona)</p>
    </div>
  );
}