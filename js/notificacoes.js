// Sistema de Notificações
class Notificacoes {
    constructor() {
        this.notificacoes = [];
        this.container = null;
        this.inicializar();
    }

    inicializar() {
        // Criar container de notificações
        this.container = document.createElement('div');
        this.container.className = 'notificacoes-container';
        document.body.appendChild(this.container);

        // Carregar notificações do localStorage
        this.carregarNotificacoes();
    }

    adicionarNotificacao(titulo, mensagem, tipo = 'info') {
        const notificacao = {
            id: Date.now(),
            titulo,
            mensagem,
            tipo,
            data: new Date(),
            lida: false
        };

        this.notificacoes.unshift(notificacao);
        this.salvarNotificacoes();
        this.atualizarInterface();
    }

    marcarComoLida(id) {
        const notificacao = this.notificacoes.find(n => n.id === id);
        if (notificacao) {
            notificacao.lida = true;
            this.salvarNotificacoes();
            this.atualizarInterface();
        }
    }

    carregarNotificacoes() {
        const notificacoesSalvas = localStorage.getItem('notificacoes');
        if (notificacoesSalvas) {
            this.notificacoes = JSON.parse(notificacoesSalvas);
        }
        this.atualizarInterface();
    }

    salvarNotificacoes() {
        localStorage.setItem('notificacoes', JSON.stringify(this.notificacoes));
    }

    atualizarInterface() {
        this.container.innerHTML = '';
        
        this.notificacoes.forEach(notificacao => {
            const elemento = document.createElement('div');
            elemento.className = `notificacao ${notificacao.tipo} ${notificacao.lida ? 'lida' : 'nao-lida'}`;
            elemento.innerHTML = `
                <div class="notificacao-cabecalho">
                    <h3>${notificacao.titulo}</h3>
                    <span class="notificacao-data">${this.formatarData(notificacao.data)}</span>
                </div>
                <p>${notificacao.mensagem}</p>
                ${!notificacao.lida ? `<button onclick="sistemaNotificacoes.marcarComoLida(${notificacao.id})">Marcar como lida</button>` : ''}
            `;
            this.container.appendChild(elemento);
        });
    }

    formatarData(data) {
        return new Date(data).toLocaleString('pt-BR');
    }
}

// Inicializar sistema de notificações
const sistemaNotificacoes = new Notificacoes(); 