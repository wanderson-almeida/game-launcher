## O que acontece a qui

O Main.js é onde a gente inicializa o electron. 
Ele é bem menos restrito que um navegador comum, onde você não tem acesso ao sistema diretamente, por essa razão é preciso registrar função mais "invasivas"
dentro do electron, se não, simplesmente não funciona #sentaEchora

### #Como?

> O preload.js roda antes do react carregar para expor as funções de forma
controlada pro react, caso o contrario ele teria acesso irrestrito ao node
e uma gigaenorme catastrofe poderia acontecer

## Tutorial da IA abaixo

1. React chama `window.launcherAPI.openFileDialog()`
2. Preload disponibiliza: `ipcRenderer.invoke("open-file-dialog")`
3. Main abre o explorador de arquivos nativo do Windows e devolve o caminho do .exe selecionado
4. React recebe o caminho e chama `window.launcherAPI.installExe(caminho)`
5. Preload disponibliza: `ipcRenderer.invoke("install-exe", caminho)`
6. Main copia o .exe para `AppData/Roaming/UnEpic Games/Binaries/`
7. Main devolve `{ success: true, destino: "..." }` pro React mostrar pro usuário