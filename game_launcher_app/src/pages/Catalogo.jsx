import { useEffect, useState } from "react";
import './styles/Catalogo.css';

function Catalogo() {
    const [todosJogos, setTodosJogos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [jogosPorPagina] = useState(20);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [paginaAPI, setPaginaAPI] = useState(1);
    const [downloadStatus, setDownloadStatus] = useState({});
    const [mostrarPromptMagnet, setMostrarPromptMagnet] = useState(null);

    useEffect(() => {
        carregarJogos();
        
        // Polling de status dos downloads a cada 2 segundos
        const interval = setInterval(() => {
            checkAllDownloadStatus();
        }, 2000);
        
        return () => clearInterval(interval);
    }, []);

    const carregarJogos = async (pagina = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`http://127.0.0.1:8000/games?page=${pagina}&page_size=20`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const jogosFormatados = data.map(game => ({
                    id: game.id,
                    nome: game.name,
                    imagem: game.background_image || null
                }));
                
                if (pagina === 1) {
                    setTodosJogos(jogosFormatados);
                } else {
                    setTodosJogos(prevJogos => [...prevJogos, ...jogosFormatados]);
                }
            } else {
                console.error("Dados recebidos não são um array:", data);
                setTodosJogos([]);
            }
        } catch (err) {
            console.error("Erro ao buscar jogos:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setCarregandoMais(false);
        }
    };

    const carregarMaisJogos = async () => {
        setCarregandoMais(true);
        const proximaPagina = paginaAPI + 1;
        setPaginaAPI(proximaPagina);
        await carregarJogos(proximaPagina);
    };

    const iniciarDownload = async (jogo, magnetLink) => {
        try {
            // Atualizar status localmente
            setDownloadStatus(prev => ({
                ...prev,
                [jogo.id]: {
                    status: "starting",
                    progress: 0,
                    message: "Iniciando download..."
                }
            }));
            
            const response = await fetch("http://127.0.0.1:8000/download/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    magnet_link: magnetLink,
                    game_name: jogo.nome,
                    game_id: jogo.id
                    
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Erro ao iniciar download");
            }
            
            const data = await response.json();
            console.log("Download iniciado:", data);
            
        } catch (err) {
            console.error("Erro ao iniciar download:", err);
            setDownloadStatus(prev => ({
                ...prev,
                [jogo.id]: {
                    status: "error",
                    progress: 0,
                    message: err.message || "Erro ao iniciar download"
                }
            }));
            
            // Remover mensagem de erro após 5 segundos
            setTimeout(() => {
                setDownloadStatus(prev => {
                    const newStatus = { ...prev };
                    if (newStatus[jogo.id]?.status === "error") {
                        delete newStatus[jogo.id];
                    }
                    return newStatus;
                });
            }, 5000);
        }
    };
    
    const checkAllDownloadStatus = async () => {
        // Pegar todos os downloads ativos
        const activeDownloads = Object.keys(downloadStatus).filter(
            id => downloadStatus[id]?.status === "downloading" || 
                  downloadStatus[id]?.status === "extracting" ||
                  downloadStatus[id]?.status === "starting"
        );
        
        for (const gameId of activeDownloads) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/download/status/${gameId}`);
                const data = await response.json();
                
                if (data.status !== "not_started") {
                    setDownloadStatus(prev => ({
                        ...prev,
                        [gameId]: {
                            status: data.status,
                            progress: data.progress,
                            message: data.message
                        }
                    }));
                    
                    // Remover do estado se estiver completo ou com erro
                    if (data.status === "completed" || data.status === "error" || data.status === "cancelled") {
                        setTimeout(() => {
                            setDownloadStatus(prev => {
                                const newStatus = { ...prev };
                                delete newStatus[gameId];
                                return newStatus;
                            });
                        }, 10000); // Remove após 10 segundos
                    }
                }
                
            } catch (err) {
                console.error("Erro ao verificar status:", err);
            }
        }
    };

    const cancelDownload = async (gameId) => {
        if (!window.confirm("Tem certeza que deseja cancelar o download?")) return;
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/download/cancel/${gameId}`, {
                method: "POST"
            });
            
            if (response.ok) {
                setDownloadStatus(prev => ({
                    ...prev,
                    [gameId]: {
                        ...prev[gameId],
                        status: "cancelled",
                        message: "Cancelando download..."
                    }
                }));
                
                setTimeout(() => {
                    setDownloadStatus(prev => {
                        const newStatus = { ...prev };
                        delete newStatus[gameId];
                        return newStatus;
                    });
                }, 3000);
            }
        } catch (err) {
            console.error("Erro ao cancelar download:", err);
        }
    };

    // Componente Modal para inserir magnet link
    const MagnetModal = ({ jogo, onClose, onSubmit }) => {
        const [magnetLink, setMagnetLink] = useState("");
        
        const handleSubmit = (e) => {
            e.preventDefault();
            if (magnetLink.trim()) {
                onSubmit(jogo, magnetLink.trim());
                onClose();
            }
        };
        
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Magnet Link para {jogo.nome}</h3>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            className="magnet-input"
                            value={magnetLink}
                            onChange={(e) => setMagnetLink(e.target.value)}
                            placeholder="Cole o link magnético aqui..."
                            rows={4}
                            autoFocus
                        />
                        <div className="modal-buttons">
                            <button type="submit" className="btn-confirmar">
                                Iniciar Download
                            </button>
                            <button type="button" className="btn-cancelar" onClick={onClose}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Componente para mostrar progresso do download
    const DownloadProgress = ({ gameId, onCancel }) => {
        const status = downloadStatus[gameId];
        
        if (!status) return null;
        
        const getStatusText = () => {
            switch(status.status) {
                case "starting":
                    return " Iniciando...";
                case "downloading":
                    return `${status.message}`;
                case "extracting":
                    return `${status.message}`;
                case "completed":
                    return "Download concluído!";
                case "error":
                    return ` Erro: ${status.message}`;
                case "cancelled":
                    return "Download cancelado";
                default:
                    return status.message;
            }
        };
        
        return (
            <div className="download-progress">
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar-fill" 
                        style={{ width: `${status.progress}%` }}
                    />
                </div>
                <div className="progress-info">
                    <span className="progress-text">{getStatusText()}</span>
                    {status.status === "downloading" && (
                        <span className="progress-percent">{status.progress.toFixed(1)}%</span>
                    )}
                </div>
                {(status.status === "downloading" || status.status === "extracting") && (
                    <button 
                        className="btn-cancelar-download"
                        onClick={() => onCancel(gameId)}
                    >
                        Cancelar
                    </button>
                )}
            </div>
        );
    };

    const indiceUltimoJogo = paginaAtual * jogosPorPagina;
    const indicePrimeiroJogo = indiceUltimoJogo - jogosPorPagina;
    const jogosAtuais = todosJogos.slice(indicePrimeiroJogo, indiceUltimoJogo);
    const totalPaginas = Math.ceil(todosJogos.length / jogosPorPagina);

    const proximaPagina = () => {
        if (paginaAtual < totalPaginas) {
            setPaginaAtual(paginaAtual + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const paginaAnterior = () => {
        if (paginaAtual > 1) {
            setPaginaAtual(paginaAtual - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading && todosJogos.length === 0) {
        return <div className="loading">Carregando jogos...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <p>Erro: {error}</p>
                <button onClick={() => carregarJogos(1)} className="btn-tentar-novamente">
                    Tentar Novamente
                </button>
            </div>
        );
    }

    const handleDownloadClick = async (jogo) => {
        try {
            const response = await fetch(
                 `http://127.0.0.1:8000/magnet-links/search?game_name=${encodeURIComponent(jogo.nome)}`
            );
            
            const data = await response.json();

            if (data.success && data.magnet) {
                iniciarDownload(jogo, data.magnet);
            } else {
                setMostrarPromptMagnet(jogo);
            }
        } catch (err) {
        console.error("Erro ao buscar magnet:", err);
        setMostrarPromptMagnet(jogo);
    }
    
    } 

    const getPaginasVisiveis = () => {
        const paginas = [];
        const maxPaginasVisiveis = 5;
        
        if (totalPaginas <= maxPaginasVisiveis) {
            for (let i = 1; i <= totalPaginas; i++) {
                paginas.push(i);
            }
        } else {
            let inicio = Math.max(1, paginaAtual - 2);
            let fim = Math.min(totalPaginas, inicio + 4);
            
            if (fim - inicio < 4) {
                inicio = Math.max(1, fim - 4);
            }
            
            for (let i = inicio; i <= fim; i++) {
                paginas.push(i);
            }
        }
        
        return paginas;
    };

    return (
        <div className="catalogo-container">
            <h1>Catálogo de Jogos</h1>
            
            {mostrarPromptMagnet && (
                <MagnetModal
                    jogo={mostrarPromptMagnet}
                    onClose={() => setMostrarPromptMagnet(null)}
                    onSubmit={iniciarDownload}
                />
            )}

            
    
            
            {todosJogos.length > 0 && (
                <div className="info-pagina">
                    <p>
                        Mostrando {indicePrimeiroJogo + 1} - {Math.min(indiceUltimoJogo, todosJogos.length)} de {todosJogos.length} jogos
                    </p>
                    <p className="info-total">
                        Página {paginaAtual} de {totalPaginas}
                    </p>
                </div>
            )}

            <div className="jogos-grid">
                {jogosAtuais.length === 0 ? (
                    <p>Nenhum jogo encontrado.</p>
                ) : (
                    jogosAtuais.map(jogo => (
                        <div key={jogo.id} className="jogo-card">
                            <div className="jogo-imagem">
                                {jogo.imagem ? (
                                    <img src={jogo.imagem} alt={jogo.nome} />
                                ) : (
                                    <div className="imagem-placeholder">
                                        <span>📦</span>
                                    </div>
                                )}
                            </div>
                            <div className="jogo-info">
                                <h3>{jogo.nome}</h3>
                                <DownloadProgress 
                                    gameId={jogo.id} 
                                    gameName={jogo.nome}
                                    onCancel={cancelDownload}
                                />
                                <button 
                                    className="btn-baixar"
                                    onClick={() => handleDownloadClick(jogo) }
                                    disabled={downloadStatus[jogo.id]?.status === "downloading" || 
                                             downloadStatus[jogo.id]?.status === "extracting" ||
                                             downloadStatus[jogo.id]?.status === "starting"}
                                >
                                    {downloadStatus[jogo.id]?.status === "downloading" ? "Baixando..." :
                                     downloadStatus[jogo.id]?.status === "extracting" ? "Extraindo..." : 
                                     downloadStatus[jogo.id]?.status === "starting" ? "Iniciando..." : "Baixar"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {todosJogos.length > jogosPorPagina && (
                <div className="paginacao">
                    <button 
                        onClick={paginaAnterior} 
                        disabled={paginaAtual === 1}
                        className="btn-pagina btn-nav"
                    >
                        &laquo; Anterior
                    </button>
                    
                    <div className="paginas-numeros">
                        {getPaginasVisiveis().map(pagina => (
                            <button
                                key={pagina}
                                onClick={() => {
                                    setPaginaAtual(pagina);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`btn-pagina ${paginaAtual === pagina ? 'active' : ''}`}
                            >
                                {pagina}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={proximaPagina} 
                        disabled={paginaAtual === totalPaginas}
                        className="btn-pagina btn-nav"
                    >
                        Próximo &raquo;
                    </button>
                </div>
            )}

            <div className="carregar-mais-container">
                <button 
                    onClick={carregarMaisJogos} 
                    disabled={carregandoMais}
                    className="btn-carregar-mais"
                >
                    {carregandoMais ? 'Carregando mais jogos...' : 'Carregar Mais Jogos da API'}
                </button>
                {carregandoMais && (
                    <div className="loading-spinner">🔄</div>
                )}
            </div>

        </div>
    );  

    
}

export default Catalogo;