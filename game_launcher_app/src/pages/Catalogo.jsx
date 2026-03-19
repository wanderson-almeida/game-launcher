import { useEffect, useState } from "react";
import './styles/Catalogo.css';

function Catalogo() {

    const [jogos, setJogos] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/games") // aq é onde nossa api ta localizada
            .then(res => res.json())
            .then(data => {
                // tentando botar a api pro resultado dos card
                const jogosFormatados = data.map(game => ({
                    id: game.id,
                    nome: game.name,
                    imagem: game.background_image
                }));

                setJogos(jogosFormatados);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="catalogo-container">
            <h1>Catálogo de Jogos</h1>

            <div className="jogos-grid">

                {jogos.map(jogo => (

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
                ))}
            </div>
        </div>
    );
}

export default Catalogo;