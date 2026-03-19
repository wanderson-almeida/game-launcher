const { ipcMain, dialog, app } = require("electron");
const { spawn } = require("child_process"); // Módulo para rodar o .exe
const path = require("path");
const fs = require('fs');

function registerGameHandlers() {
    // -=---- HANDLER PARA SELECIONAR ARQUIVOS ---=---
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


    // -=---- HANDLER PARA SELECIONAR PASTAS ---=---
    ipcMain.handle("select-directory-dialog", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"]
        });

        if (result.canceled) return null;
        return result.filePaths[0];
        // retorna o caminho da pasta caso haja uma selecionada
    });



    // -=---- HANDLER COPIAR E COLAR UM ARQUIVO ---=---
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



    // -=---- HANDLER PARA EXECUTAR O DONWLOADER ---=---
    ipcMain.handle("download-torrent", async (event, magnetLink, inputDirectory) => {
        console.log("inputDirectory recebido:", inputDirectory);

        const downloadPath = inputDirectory || path.join(app.getPath("userData"), "UnEpic Games", "Downloads");
        console.log("magnetLink recebido:", magnetLink);

        
        const csharpExe = path.join(__dirname, "../../src/backend/js/publish/torrent-downloader.exe");

        // log pra debug
        console.log("--- DEBUG DE CAMINHO ---");
        console.log("Procurando em:", csharpExe);
        console.log("Existe?", fs.existsSync(csharpExe));
        console.log("------------------------");

        if (!fs.existsSync(csharpExe)) {
            return { success: false, error: "O executável C# não foi encontrado no caminho especificado." };
        }

        return new Promise((resolve) => {
            try {
                const processo = spawn(csharpExe, [magnetLink, downloadPath]);

                processo.stdout.on("data", (data) => {
                    const output = data.toString();
                    console.log("Output do C#:", output);
                    if (output.includes("PROGRESSO:")) {
                        const progresso = output.split(":")[1].trim();
                        event.sender.send("download-progress", progresso);
                    }
                });

                processo.on("error", (err) => {
                    console.error("Erro ao disparar o processo:", err);
                    resolve({ success: false, error: err.message });
                });

                processo.on("close", (code) => {
                    if (code === 0) {
                        resolve({ success: true, path: downloadPath });
                    } else {
                        resolve({ success: false, error: `C# saiu com código ${code}` });
                    }
                });
            } catch (err) {
                resolve({ success: false, error: err.message });
            }
        });
    });
}

module.exports = { registerGameHandlers };