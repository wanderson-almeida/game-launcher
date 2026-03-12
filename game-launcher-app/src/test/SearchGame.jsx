import { useState, useEffect } from 'react';

const SearchGames = () => {
    const [palavraChave, setPalavraChave] = useState('');
    const [jogos, setJogos] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Estado do Download
    const [downloading, setDownloading] = useState({ active: false, progress: 0, gameTitle: '' });
    
    // Estado do Diretório (Caminho padrão inicial)
    const [diretorioInstalacao, setDiretorioInstalacao] = useState('C:\\Games\\Download');

    // Listener para o progresso vindo do C#
    useEffect(() => {
        if (window.launcherAPI?.onDownloadProgress) {
            const removeListener = window.launcherAPI.onDownloadProgress((progress) => {
                // Convertemos para número caso venha como string
                const numProgress = parseFloat(progress);
                setDownloading(prev => ({ 
                    ...prev, 
                    progress: isNaN(numProgress) ? prev.progress : numProgress 
                }));
            });

            return () => removeListener(); 
        }
    }, []);

    // Função para selecionar a pasta via Electron Dialog
    const selecionarPasta = async () => {
        const pastaSelecionada = await window.launcherAPI.selectDirectoryDialog();
        if (pastaSelecionada) {
            setDiretorioInstalacao(pastaSelecionada);
        }
    };

    const pesquisarJogos = async () => {
        if (!palavraChave.trim()) return;
        setLoading(true);

        try {
            const response = await fetch("https://hydralinks.pages.dev/sources/onlinefix.json");
            const data = await response.json();
            const regex = new RegExp(palavraChave, "i");
            const encontrados = data.downloads.filter(item => regex.test(item.title));
            setJogos(encontrados);
        } catch (error) {
            console.error("Erro ao buscar jogos:", error);
            alert("Erro ao carregar a lista de jogos.");
        } finally {
            setLoading(false);
        }
    };

    const iniciarInstalacao = async (game) => {
        const magnet = game.uris[0];
        setDownloading({ active: true, progress: 0, gameTitle: game.title });

        try {
            // Passamos o magnet E o diretório escolhido para o C#
            const result = await window.launcherAPI.downloadTorrent(magnet, diretorioInstalacao);
            
            if (result.success) {
                alert(`${game.title} instalado com sucesso em: ${diretorioInstalacao}`);
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error("Falha no download:", error);
            alert("Erro ao iniciar o motor de download.");
        } finally {
            setDownloading({ active: false, progress: 0, gameTitle: '' });
        }
    };

    return (
        <div style={styles.container}>
            <h2>UnEpic Games - Search</h2>

            {/* Seletor de Pasta */}
            <div style={styles.folderSection}>
                <p style={styles.label}>Local de Instalação:</p>
                <div style={styles.pathRow}>
                    <code style={styles.pathDisplay}>{diretorioInstalacao}</code>
                    <button onClick={selecionarPasta} style={styles.secondaryBtn}>Alterar</button>
                </div>
            </div>

            <div style={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Nome do jogo..."
                    value={palavraChave}
                    onChange={(e) => setPalavraChave(e.target.value)}
                    style={styles.input}
                    onKeyDown={(e) => e.key === 'Enter' && pesquisarJogos()}
                />
                <button onClick={pesquisarJogos} style={styles.button}>
                    {loading ? '...' : 'Buscar'}
                </button>
            </div>

            {/* Barra de Progresso Ativa */}
            {downloading.active && (
                <div style={styles.progressContainer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Baixando: <strong>{downloading.gameTitle}</strong></span>
                        <span>{downloading.progress}%</span>
                    </div>
                    <div style={styles.progressBarBg}>
                        <div style={{ 
                            ...styles.progressBarFill, 
                            width: `${Math.min(downloading.progress, 100)}%` 
                        }} />
                    </div>
                </div>
            )}

            <div style={styles.resultsList}>
                {jogos.length > 0 ? (
                    jogos.map((jogo, index) => (
                        <div key={index} style={styles.gameCard}>
                            <div style={{ flex: 1 }}>
                                <strong>{jogo.title}</strong>
                                <p style={styles.infoText}>Tamanho: {jogo.fileSize}</p>
                            </div>
                            <button
                                onClick={() => iniciarInstalacao(jogo)}
                                style={styles.downloadBtn}
                                disabled={downloading.active}
                            >
                                {downloading.active ? 'Aguarde...' : 'Instalar'}
                            </button>
                        </div>
                    ))
                ) : (
                    !loading && <p style={{ opacity: 0.5 }}>Digite o nome de um jogo para começar.</p>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '25px', color: '#fff', backgroundColor: '#121212', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' },
    label: { fontSize: '12px', color: '#aaa', marginBottom: '5px' },
    folderSection: { marginBottom: '20px', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '8px' },
    pathRow: { display: 'flex', gap: '10px', alignItems: 'center' },
    pathDisplay: { flex: 1, fontSize: '13px', backgroundColor: '#000', padding: '8px', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis' },
    searchBox: { display: 'flex', gap: '10px', marginBottom: '25px' },
    input: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#222', color: '#fff' },
    button: { padding: '0 25px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    secondaryBtn: { padding: '8px 15px', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    progressContainer: { backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #007bff44' },
    progressBarBg: { width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' },
    progressBarFill: { height: '100%', backgroundColor: '#007bff', transition: 'width 0.4s cubic-bezier(0.1, 0.7, 1.0, 0.1)', boxShadow: '0 0 10px #007bff' },
    resultsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    gameCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #222' },
    infoText: { fontSize: '13px', color: '#888', margin: '4px 0 0 0' },
    downloadBtn: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
};

export default SearchGames;