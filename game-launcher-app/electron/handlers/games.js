const { ipcMain, dialog, app } = require("electron");
const path = require("path");
const fs = require("fs/promises");

function registerGameHandlers() {
  ipcMain.handle("open-file-dialog", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Executaveis", extensions: ["exe"] }]
    });
    // abre o explorador, restringe a ser selecionado somente arquivos, e filtra apenas os arquivos pro user

    if (result.canceled || !result.filePaths.length) return null;
    return result.filePaths[0];
    // retorna o caminho do arquivo caso haja um selecionado
  });

  ipcMain.handle("install-exe", async (_, caminhoDoExe) => {
    const destinoBase = path.join(app.getPath("userData"), "UnEpic Games", "Binaries");
    await fs.mkdir(destinoBase, { recursive: true });
    // cria os diretorio se não existir

    const executavel = path.basename(caminhoDoExe);
    const caminhoDestino = path.join(destinoBase, executavel);
    await fs.copyFile(caminhoDoExe, caminhoDestino);
    // copia de um pro outro, sem segredo

    return { success: true, exe: executavel, destino: caminhoDestino };
  });

// em teoria essa função de dar lauch no jogo ja esta funcionando, mas eu to com
// preguiça de fazer uma pagin a pra testar xd atumalaka   

//   ipcMain.handle("launch-game", async (_, caminhoDoExe) => {
//     const { spawn } = require("child_process");
//     const processo = spawn(caminhoDoExe, [], { detached: true, stdio: "ignore" });
//     processo.unref();
//     return { success: true };
//   });
}

module.exports = { registerGameHandlers };