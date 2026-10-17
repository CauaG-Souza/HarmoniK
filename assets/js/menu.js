
const botao = document.querySelector("#menu-btn");
const menu = document.querySelector("#menu");

if (botao && menu) {
    botao.addEventListener("click", () => {
        const aberto = menu.classList.toggle("ativo");

        botao.setAttribute("aria-expanded", aberto);
        botao.setAttribute(
            "aria-label",
            aberto ? "Fechar menu" : "Abrir menu"
        );
    });
}
