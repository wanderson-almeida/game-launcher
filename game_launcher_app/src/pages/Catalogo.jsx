import { useEffect, useState } from "react";
import './styles/Catalogo.css';

function Catalogo() {
    const [todosJogos, setTodosJogos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [jogosPorPagina] = useState(20);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [paginaAPI, setPaginaAPI] = useState(1); // Controla qual página da API está carregando

    useEffect(() => {
        carregarJogos();
    }, []);

    const carregarJogos = async (pagina = 1) => {
        try {
            setLoading(true);
            // Buscar jogos da api com paginação
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

            {/* Grid de jogos */}
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
                                <button className="btn-comprar">Baixar</button>
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

            {/* botao pra carregar mais jogo */}
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