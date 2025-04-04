class RequisitosLegais {
    constructor() {
        this.requisitos = [];
        this.filtros = {
            categoria: 'todos',
            status: 'todos',
            pesquisa: ''
        };
        this.inicializar();
    }

    inicializar() {
        this.carregarRequisitos();
        this.configurarEventos();
        this.carregarAtualizacoesLegislativas();
    }

    configurarEventos() {
        // Configurar filtros
        document.getElementById('filtroCategoria').addEventListener('change', (e) => {
            this.filtros.categoria = e.target.value;
            this.atualizarVisualizacao();
        });

        document.getElementById('filtroStatus').addEventListener('change', (e) => {
            this.filtros.status = e.target.value;
            this.atualizarVisualizacao();
        });

        document.getElementById('pesquisaRequisito').addEventListener('input', (e) => {
            this.filtros.pesquisa = e.target.value.toLowerCase();
            this.atualizarVisualizacao();
        });

        // Configurar modal
        const modal = document.getElementById('modalDetalhes');
        const span = document.getElementsByClassName('close')[0];

        span.onclick = () => modal.style.display = "none";
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };
    }

    carregarRequisitos() {
        // Simular dados de requisitos (em produção, isso viria de uma API)
        this.requisitos = [
            {
                id: 1,
                titulo: 'Resolução ANTT nº 5.947/2021',
                descricao: 'Atualiza o Regulamento para o Transporte Rodoviário de Produtos Perigosos.',
                categoria: 'transporte',
                status: 'vigente',
                dataPublicacao: '2021-06-01',
                prazoAdequacao: '2021-12-01',
                detalhes: {
                    orgaoEmissor: 'ANTT',
                    abrangencia: 'Nacional',
                    linkOficial: 'https://www.gov.br/antt/resolucao-5947-2021',
                    documentosRelacionados: ['Manual de Procedimentos', 'Checklist de Conformidade']
                }
            },
            {
                id: 2,
                titulo: 'Resolução CONTRAN nº 810/2020',
                descricao: 'Estabelece os requisitos para concessão do código de segurança do tacógrafo.',
                categoria: 'transporte',
                status: 'vigente',
                dataPublicacao: '2020-12-15',
                prazoAdequacao: '2021-06-15',
                detalhes: {
                    orgaoEmissor: 'CONTRAN',
                    abrangencia: 'Nacional',
                    linkOficial: 'https://www.gov.br/contran/resolucao-810-2020',
                    documentosRelacionados: ['Guia de Implementação', 'Formulários']
                }
            }
        ];

        this.atualizarVisualizacao();
    }

    carregarAtualizacoesLegislativas() {
        const atualizacoes = [
            {
                titulo: 'Nova Resolução ANTT',
                descricao: 'Atualização das normas de transporte de produtos perigosos',
                data: '2024-04-01',
                tipo: 'importante'
            },
            {
                titulo: 'Portaria CONTRAN',
                descricao: 'Novas regras para tacógrafos digitais',
                data: '2024-03-28',
                tipo: 'normal'
            }
        ];

        const container = document.getElementById('ultimasAtualizacoes');
        container.innerHTML = atualizacoes.map(atualizacao => `
            <div class="atualizacao-card ${atualizacao.tipo}">
                <h4>${atualizacao.titulo}</h4>
                <p>${atualizacao.descricao}</p>
                <span class="data">${new Date(atualizacao.data).toLocaleDateString('pt-BR')}</span>
            </div>
        `).join('');
    }

    atualizarVisualizacao() {
        const requisitosFiltrados = this.requisitos.filter(requisito => {
            const matchCategoria = this.filtros.categoria === 'todos' || requisito.categoria === this.filtros.categoria;
            const matchStatus = this.filtros.status === 'todos' || requisito.status === this.filtros.status;
            const matchPesquisa = requisito.titulo.toLowerCase().includes(this.filtros.pesquisa) ||
                                requisito.descricao.toLowerCase().includes(this.filtros.pesquisa);
            
            return matchCategoria && matchStatus && matchPesquisa;
        });

        const container = document.querySelector('.requisitos-grid');
        container.innerHTML = requisitosFiltrados.map(requisito => this.criarCardRequisito(requisito)).join('');

        // Adicionar eventos aos botões após renderizar
        this.configurarBotoesCard();
    }

    criarCardRequisito(requisito) {
        return `
            <div class="requisito-card" data-id="${requisito.id}">
                <div class="requisito-header">
                    <span class="categoria-tag">${this.formatarCategoria(requisito.categoria)}</span>
                    <span class="status-tag ${requisito.status}">${this.formatarStatus(requisito.status)}</span>
                </div>
                <h4>${requisito.titulo}</h4>
                <p class="descricao">${requisito.descricao}</p>
                <div class="requisito-info">
                    <span class="data-publicacao">Publicado em: ${new Date(requisito.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                    <span class="prazo">Prazo de adequação: ${new Date(requisito.prazoAdequacao).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="acoes">
                    <button class="btn-detalhe" data-id="${requisito.id}">Ver Detalhes</button>
                    <button class="btn-download" data-id="${requisito.id}">Download PDF</button>
                </div>
            </div>
        `;
    }

    configurarBotoesCard() {
        document.querySelectorAll('.btn-detalhe').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.mostrarDetalhes(id);
            });
        });

        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.downloadPDF(id);
            });
        });
    }

    mostrarDetalhes(id) {
        const requisito = this.requisitos.find(r => r.id === id);
        if (!requisito) return;

        const modal = document.getElementById('modalDetalhes');
        const modalBody = modal.querySelector('.modal-body');

        modalBody.innerHTML = `
            <div class="detalhe-item">
                <strong>Órgão Emissor:</strong> ${requisito.detalhes.orgaoEmissor}
            </div>
            <div class="detalhe-item">
                <strong>Abrangência:</strong> ${requisito.detalhes.abrangencia}
            </div>
            <div class="detalhe-item">
                <strong>Link Oficial:</strong> 
                <a href="${requisito.detalhes.linkOficial}" target="_blank">Acessar documento original</a>
                    </div>
            <div class="detalhe-item">
                <strong>Documentos Relacionados:</strong>
                <ul>
                    ${requisito.detalhes.documentosRelacionados.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
                    </div>
                `;

        modal.style.display = "block";
    }

    downloadPDF(id) {
        // Implementar lógica de download do PDF
        console.log(`Download do PDF do requisito ${id}`);
        // Em produção, isso faria uma requisição para baixar o arquivo
    }

    formatarCategoria(categoria) {
        const categorias = {
            'transporte': 'Transporte de Cargas',
            'trabalhista': 'Legislação Trabalhista',
            'ambiental': 'Legislação Ambiental',
            'seguranca': 'Segurança do Trabalho'
        };
        return categorias[categoria] || categoria;
    }

    formatarStatus(status) {
        const statusMap = {
            'vigente': 'Vigente',
            'revogado': 'Revogado',
            'emAnalise': 'Em Análise'
        };
        return statusMap[status] || status;
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.requisitosLegais = new RequisitosLegais();
}); 