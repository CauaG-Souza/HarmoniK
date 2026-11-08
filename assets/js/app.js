const CHAVE_MUSICAS = "harmonik_musicas";
const CHAVE_AVALIACOES = "harmonik_avaliacoes";
const CHAVE_USUARIO = "harmonik_usuario";

const exemplos = [
    { id: "1", nome: "Blinding Lights", artista: "The Weeknd", album: "After Hours", genero: "pop", ano: 2020, capa: "", favorita: true },
    { id: "2", nome: "Bohemian Rhapsody", artista: "Queen", album: "A Night at the Opera", genero: "rock", ano: 1975, capa: "", favorita: false },
    { id: "3", nome: "Lose Yourself", artista: "Eminem", album: "8 Mile", genero: "rap", ano: 2002, capa: "", favorita: true }
];

function ler(chave, padrao) {
    try {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : padrao;
    } catch {
        return padrao;
    }
}

function salvar(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function obterMusicas() {
    const musicas = ler(CHAVE_MUSICAS, null);
    if (musicas) return musicas;
    salvar(CHAVE_MUSICAS, exemplos);
    return exemplos;
}

function obterAvaliacoes() {
    return ler(CHAVE_AVALIACOES, []);
}

function estrelas(nota) {
    const valor = Number(nota) || 0;
    return "★".repeat(valor) + "☆".repeat(5 - valor);
}

function mediaMusica(id) {
    const notas = obterAvaliacoes().filter(item => item.musicaId === id);
    if (!notas.length) return 0;
    return notas.reduce((total, item) => total + Number(item.nota), 0) / notas.length;
}

function criarCard(musica) {
    const card = document.createElement("article");
    card.className = "musica-card"; // Usa a classe do seu projeto original
    const media = mediaMusica(musica.id);
    
    card.innerHTML = `
        <h3>${musica.nome}</h3>
        <p><strong>Artista:</strong> ${musica.artista}</p>
        <p><strong>Álbum:</strong> ${musica.album || "N/A"}</p>
        <p><strong>Gênero:</strong> ${musica.genero.charAt(0).toUpperCase() + musica.genero.slice(1)}</p>
        <p><strong>Ano:</strong> ${musica.ano}</p>
        <p class="avaliacao">${media ? `${estrelas(Math.round(media))} (${media.toFixed(1)})` : "Ainda sem avaliações"}</p>
        <div class="card-acoes" style="margin-top: 15px; display:flex; gap: 10px; align-items:center;">
            <a href="musica.html?id=${musica.id}" style="color: var(--cor-destaque); text-decoration: none; font-weight: bold;">Ver detalhes</a>
            <button type="button" style="padding: 6px 12px; background: transparent; border: 1px solid var(--cor-destaque); color: var(--cor-texto); border-radius: 4px; cursor: pointer;" data-favorito="${musica.id}" aria-label="Alternar favorita">
                ${musica.favorita ? "Remover ♥" : "Favoritar ♡"}
            </button>
        </div>
    `;
    return card;
}

function renderizarLista(elemento, musicas) {
    if (!elemento) return;
    elemento.innerHTML = "";
    musicas.forEach(musica => elemento.appendChild(criarCard(musica)));
}

function alternarFavorito(id) {
    const musicas = obterMusicas();
    const musica = musicas.find(item => item.id === id);
    if (!musica) return;
    musica.favorita = !musica.favorita;
    salvar(CHAVE_MUSICAS, musicas);
    iniciarPagina();
}

function iniciarExplorar() {
    const lista = document.querySelector("#lista-musicas");
    if (!lista) return;
    const pesquisa = document.querySelector("#pesquisa");
    const genero = document.querySelector("#genero");
    const ordenacao = document.querySelector("#ordenacao");
    const contador = document.querySelector("#contador-musicas");
    
    function filtrar(evento) {
        if (evento) evento.preventDefault();
        let musicas = [...obterMusicas()];
        const termo = (pesquisa?.value || "").trim().toLowerCase();
        
        musicas = musicas.filter(item => 
            (item.nome.toLowerCase().includes(termo) || item.artista.toLowerCase().includes(termo))
        );
        
        if (genero && genero.value && genero.value !== "") {
            musicas = musicas.filter(item => item.genero.toLowerCase() === genero.value.toLowerCase());
        }
        
        if (ordenacao) {
            musicas.sort((a, b) => {
                if (ordenacao.value === "nota") return mediaMusica(b.id) - mediaMusica(a.id);
                if (ordenacao.value === "artista") return a.artista.localeCompare(b.artista);
                if (ordenacao.value === "ano") return Number(b.ano) - Number(a.ano);
                return a.nome.localeCompare(b.nome);
            });
        }
        
        renderizarLista(lista, musicas);
        if(contador) contador.textContent = `${musicas.length} resultado(s) encontrado(s)`;
    }

    const form = document.querySelector("#form-filtros");
    if(form) form.addEventListener("submit", filtrar);
    if(pesquisa) pesquisa.addEventListener("input", filtrar);
    if(genero) genero.addEventListener("change", filtrar);
    if(ordenacao) ordenacao.addEventListener("change", filtrar);
    
    filtrar();
}

function iniciarCadastroMusica() {
    const form = document.querySelector("#form-musica");
    if (!form) return;
    
    form.addEventListener("submit", evento => {
        evento.preventDefault();
        const idInput = document.querySelector("#musica-id");
        const id = idInput ? idInput.value : "";
        const musicas = obterMusicas();
        
        const registro = { 
            id: id || String(Date.now()), 
            nome: document.querySelector("#nome").value.trim(), 
            artista: document.querySelector("#artista").value.trim(), 
            album: document.querySelector("#album").value.trim(), 
            genero: document.querySelector("#genero").value, 
            ano: Number(document.querySelector("#ano").value), 
            favorita: false 
        };
        
        musicas.push(registro);
        salvar(CHAVE_MUSICAS, musicas);
        
        const feedback = document.querySelector("#feedback-musica");
        if(feedback) {
            feedback.innerHTML = '<p class="mensagem-sucesso">Música cadastrada com sucesso!</p>';
            form.reset();
        } else {
            alert("Música cadastrada com sucesso!");
        }
    });
}

function iniciarBuscaSpotify() {
    const btnBuscar = document.querySelector("#btn-buscar-spotify");
    const inputBusca = document.querySelector("#busca-spotify");
    const divResultados = document.querySelector("#resultados-spotify");

    if (!btnBuscar || !inputBusca || !divResultados) return;


    const CLIENT_ID = "b9cc2718328a4df7a9cf8e43d8bd4373";
    const CLIENT_SECRET = "0a7a5b2547c74f3197e1ea0bd74fee1a";

    btnBuscar.addEventListener("click", async () => {
        const termo = inputBusca.value.trim();
        if (!termo) return;

        divResultados.innerHTML = "<p class='muted'>Buscando no Spotify...</p>";

        try {
           
            const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET)
                },
                body: "grant_type=client_credentials"
            });
            
            const tokenData = await tokenResponse.json();
            const token = tokenData.access_token;

          
            const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(termo)}&type=track&limit=4`, {
                headers: { "Authorization": "Bearer " + token }
            });

            const searchData = await searchResponse.json();
            const musicas = searchData.tracks.items;

           
            divResultados.innerHTML = "";
            if (musicas.length === 0) {
                divResultados.innerHTML = "<p class='mensagem-erro'>Nenhuma música encontrada.</p>";
                return;
            }

            musicas.forEach(musica => {
                
                const capa = musica.album.images.length > 0 ? musica.album.images[0].url : "";
                const ano = musica.album.release_date.substring(0, 4);
                
                const card = document.createElement("div");
                card.style = "display: flex; align-items: center; gap: 15px; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--borda-card); border-radius: 8px; cursor: pointer; transition: 0.3s;";
                
                card.innerHTML = `
                    <img src="${capa}" alt="Capa" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover; background: #333;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0; font-size: 14px; color: var(--cor-texto);">${musica.name}</h4>
                        <p style="margin: 0; font-size: 12px; color: var(--cor-texto-secundario);">${musica.artists[0].name} • ${musica.album.name}</p>
                    </div>
                    <span style="font-size: 12px; color: var(--cor-destaque); font-weight: bold;">Selecionar</span>
                `;

                
                card.addEventListener("click", () => {
                    document.querySelector("#nome").value = musica.name;
                    document.querySelector("#artista").value = musica.artists[0].name;
                    document.querySelector("#album").value = musica.album.name;
                    document.querySelector("#ano").value = ano;
                    
                    
                    let inputCapa = document.querySelector("#capa-oculta");
                    if(!inputCapa) {
                        inputCapa = document.createElement("input");
                        inputCapa.type = "hidden";
                        inputCapa.id = "capa-oculta";
                        inputCapa.name = "capa";
                        document.querySelector("#form-musica").appendChild(inputCapa);
                    }
                    inputCapa.value = capa;

                    divResultados.innerHTML = `<p class="mensagem-sucesso">Música selecionada! Selecione o gênero abaixo e salve.</p>`;
                    inputBusca.value = "";
                });

                
                card.addEventListener("mouseenter", () => card.style.background = "rgba(255,255,255,0.1)");
                card.addEventListener("mouseleave", () => card.style.background = "rgba(255,255,255,0.05)");

                divResultados.appendChild(card);
            });

        } catch (error) {
            console.error("Erro na API do Spotify:", error);
            divResultados.innerHTML = "<p class='mensagem-erro'>Falha ao conectar com o Spotify.</p>";
        }
    });
}

function iniciarAvaliacao() {
    const form = document.querySelector("#form-avaliacao");
    if (!form) return;
    
    const seletor = document.querySelector("#musica-avaliar");
    if(seletor) {
        seletor.innerHTML = '<option value="">Selecione uma música</option>';
        obterMusicas().forEach(musica => {
            const opcao = document.createElement("option");
            opcao.value = musica.id;
            opcao.textContent = `${musica.nome} - ${musica.artista}`;
            seletor.appendChild(opcao);
        });
    }
    
    form.addEventListener("submit", evento => {
        evento.preventDefault();
        if(!seletor.value) return alert("Selecione uma música.");
        
        const avaliacoes = obterAvaliacoes();
        avaliacoes.push({ 
            id: String(Date.now()), 
            musicaId: seletor.value, 
            nota: Number(document.querySelector("#nota").value), 
            comentario: document.querySelector("#comentario").value.trim(), 
            data: new Date().toISOString() 
        });
        
        salvar(CHAVE_AVALIACOES, avaliacoes);
        
        const feedback = document.querySelector("#feedback-avaliacao");
        if(feedback) feedback.innerHTML = '<p class="mensagem-sucesso">Avaliação registrada com sucesso!</p>';
        form.reset();
        renderizarAvaliacoes();
    });
    renderizarAvaliacoes();
}

function renderizarAvaliacoes() {
    const lista = document.querySelector("#lista-avaliacoes");
    if (!lista) return;
    lista.innerHTML = "";
    const musicas = obterMusicas();
    
    const avaliacoes = obterAvaliacoes().slice().reverse();
    if(avaliacoes.length === 0) {
        lista.innerHTML = "<p class='empty-state'>Nenhuma avaliação encontrada.</p>";
        return;
    }
    
    avaliacoes.forEach(avaliacao => {
        const musica = musicas.find(item => item.id === avaliacao.musicaId);
        if (!musica) return;
        const artigo = document.createElement("article");
        artigo.className = "avaliacao-card"; // Usa estilo do original
        artigo.style = "flex-direction: column; align-items: flex-start; text-align: left;";
        artigo.innerHTML = `
            <div>
                <h3 style="margin-bottom: 5px;">${musica.nome} - ${musica.artista}</h3>
                <p style="color: var(--cor-destaque); font-size: 1.2rem; margin: 0 0 10px 0;">${estrelas(avaliacao.nota)}</p>
                <p style="color: var(--cor-texto-secundario);">"${avaliacao.comentario || "Sem comentário."}"</p>
            </div>
        `;
        lista.appendChild(artigo);
    });
}

function iniciarDetalhe() {
    const alvo = document.querySelector("#detalhe-musica");
    if (!alvo) return;
    const id = new URLSearchParams(location.search).get("id");
    const musica = obterMusicas().find(item => item.id === id);
    
    if (!musica) {
        alvo.innerHTML = "<h1>Música não encontrada. Escolha uma música na página de Explorar.</h1>";
        return;
    }
    
    const media = mediaMusica(musica.id);
    alvo.innerHTML = `
        <h1>${musica.nome}</h1>
        <div class="info-grupo">
            <p><strong>Artista:</strong> ${musica.artista}</p>
            <p><strong>Álbum:</strong> ${musica.album || "Não informado"}</p>
            <p><strong>Gênero:</strong> ${musica.genero.charAt(0).toUpperCase() + musica.genero.slice(1)}</p>
            <p><strong>Ano:</strong> ${musica.ano}</p>
            <p class="avaliacao"><strong>Avaliação média:</strong> ${media ? `${estrelas(Math.round(media))} (${media.toFixed(1)})` : "Sem avaliações"}</p>
        </div>
    `;
    
    const btnFavorito = document.querySelector("#favoritar-musica");
    if(btnFavorito) {
        btnFavorito.textContent = musica.favorita ? "Remover dos Favoritos" : "Adicionar aos Favoritos";
        btnFavorito.onclick = (e) => {
            e.preventDefault();
            alternarFavorito(musica.id);
            location.reload();
        };
    }
    
    const btnExcluir = document.querySelector("#excluir-musica");
    if(btnExcluir) {
        btnExcluir.onclick = (e) => {
            e.preventDefault();
            if(!confirm("Tem certeza que deseja excluir esta música?")) return;
            salvar(CHAVE_MUSICAS, obterMusicas().filter(m => m.id !== musica.id));
            location.href = "musicas.html";
        };
    }
}

function iniciarPerfil() {
    const perfilNome = document.querySelector("#perfil-nome");
    if (!perfilNome) return;
    
    const usuario = ler(CHAVE_USUARIO, { nome: "Usuário HarmoniK", email: "usuario@harmonik.com" });
    perfilNome.textContent = usuario.nome;
    
    const elEmail = document.querySelector("#perfil-email");
    if(elEmail) elEmail.textContent = usuario.email;
    
    const totalM = document.querySelector("#total-musicas");
    if(totalM) totalM.textContent = obterMusicas().length;
    
    const totalA = document.querySelector("#total-avaliacoes");
    if(totalA) totalA.textContent = obterAvaliacoes().length;
    
    const favoritas = obterMusicas().filter(m => m.favorita);
    const totalF = document.querySelector("#total-favoritas");
    if(totalF) totalF.textContent = favoritas.length;
}

function iniciarAutenticacao() {
    const cadastro = document.querySelector("#form-cadastro");
    if (cadastro) {
        cadastro.addEventListener("submit", evento => {
            evento.preventDefault();
            const usuario = { 
                nome: document.querySelector("#nome").value.trim(), 
                email: document.querySelector("#email").value.trim() 
            };
            salvar(CHAVE_USUARIO, usuario);
            const feedback = document.querySelector("#feedback-cadastro");
            if(feedback) feedback.innerHTML = '<p class="mensagem-sucesso">Cadastro realizado! Redirecionando...</p>';
            setTimeout(() => location.href = "inicio.html", 1000);
        });
    }

    const login = document.querySelector("#form-login");
    if (login) {
        login.addEventListener("submit", evento => {
            evento.preventDefault();
            const feedback = document.querySelector("#feedback-login");
            if(feedback) feedback.innerHTML = '<p class="mensagem-sucesso">Login realizado! Redirecionando...</p>';
            setTimeout(() => location.href = "inicio.html", 1000);
        });
    }
}

function iniciarPagina() {
    const musicas = obterMusicas();
    renderizarLista(document.querySelector("#destaques-lista"), musicas.slice(0, 3));
    
    const listaFavoritas = document.querySelector("#lista-favoritas");
    if(listaFavoritas) {
        const favoritas = musicas.filter(item => item.favorita);
        if(favoritas.length > 0) {
            renderizarLista(listaFavoritas, favoritas);
        } else {
            listaFavoritas.innerHTML = "<p class='empty-state'>Você ainda não possui músicas favoritas.</p>";
        }
    }

    iniciarExplorar();
    iniciarCadastroMusica();
    iniciarBuscaSpotify();
    iniciarAvaliacao();
    iniciarDetalhe();
    iniciarPerfil();
    iniciarAutenticacao();
}

document.addEventListener("click", evento => {
    const botao = evento.target.closest("[data-favorito]");
    if (botao) {
        evento.preventDefault();
        alternarFavorito(botao.dataset.favorito);
    }
});

document.addEventListener("DOMContentLoaded", iniciarPagina);
