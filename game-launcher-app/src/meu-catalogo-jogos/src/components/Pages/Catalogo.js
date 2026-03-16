
import './Catalogo.css';

function Catalogo() {
   
    const jogos = [
        { id: 1, nome: "jogo 1", imagem: "/jogo1.jpg" },
        { id: 2, nome: "jogo 2", imagem: "/jogo2.jpg" },
        { id: 3, nome: "jogo 3", imagem: "/jogo3.jpg" },
        { id: 4, nome: "jogo 4", imagem: "/jogo4.jpg" },
        { id: 5, nome: "jogo 5", imagem: "/jogo5.jpg" },
        { id: 6, nome: "jogo 6", imagem: "/jogo6.jpg" },
        { id: 7, nome: "jogo 7", imagem: "/jogo7.jpg" },
        { id: 8, nome: "jogo 8", imagem: "/jogo8.jpg" },
        { id: 9, nome: "jogo 9", imagem: "/jogo9.jpg" },
        { id: 10, nome: "jogo 10", imagem: "/jogo10.jpg" },
        { id: 11, nome: "jogo 11", imagem: "/jogo11.jpg" },
        { id: 12, nome: "jogo 12", imagem: "/jogo12.jpg" },
    ];

    return (
        <div className="catalogo-container">
            <h1>Catálogo de Jogos</h1>

            <div className="jogos-grid">

                {jogos.map(jogo => (

                    <div key={jogo.id} className="jogo-card">

                        <div className="jogo-imagem">
                            
                            {/* Placeholder da imagem */}

                            <div className="imagem-placeholder">
                                <span>📦</span>
                            </div>

                        </div>

                        <div className="jogo-info">
                            <h3>{jogo.nome}</h3>
                        
                            <button className="btn-comprar">Baixar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Catalogo;