class ProcessosManager {
    constructor() {
        this.modal = document.getElementById('modalNovoProcesso');
        this.form = document.getElementById('formNovoProcesso');
        this.btnNovoProcesso = document.getElementById('btnNovoProcesso');
        this.btnCancelar = document.querySelector('#btnCancelar');
        this.btnFechar = document.querySelector('.btn-close');
        this.processos = JSON.parse(localStorage.getItem('processos')) || [];
        this.documentos = [];

        this.initializeEventListeners();
        this.renderProcessos();
        this.updateIndicadores();
    }

    initializeEventListeners() {
        // Botão Novo Processo
        this.btnNovoProcesso.addEventListener('click', () => this.showModal());

        // Fechar Modal
        this.btnFechar.addEventListener('click', () => this.hideModal());
        this.btnCancelar.addEventListener('click', () => this.hideModal());

        // Submit do formulário
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Adicionar Documento
        document.getElementById('btnAdicionarDocumento').addEventListener('click', () => this.adicionarDocumento());

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    }

    showModal() {
        this.modal.style.display = 'block';
        this.form.reset();
        this.documentos = [];
        document.getElementById('documentosGrid').innerHTML = '';
        document.getElementById('dataCriacao').valueAsDate = new Date();
    }

    hideModal() {
        this.modal.style.display = 'none';
        this.form.reset();
        this.documentos = [];
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const novoProcesso = {
            id: Date.now(),
            numero: document.getElementById('numeroDocumento').value,
            dataCriacao: document.getElementById('dataCriacao').value,
            responsavel: document.getElementById('responsavel').value,
            departamento: document.getElementById('departamento').value,
            observacao: document.getElementById('observacao').value,
            documentos: this.documentos,
            status: 'Ativo',
            eficiencia: Math.floor(Math.random() * 100), // Simulação
            economia: Math.floor(Math.random() * 10000) // Simulação
        };

        this.processos.push(novoProcesso);
        this.saveProcessos();
        this.renderProcessos();
        this.updateIndicadores();
        this.hideModal();

        sistemaNotificacoes.adicionarNotificacao(
            'Processo Criado',
            `O processo ${novoProcesso.numero} foi criado com sucesso.`,
            'success'
        );
    }

    adicionarDocumento() {
        const nome = document.getElementById('nomeDocumento').value;
        const arquivo = document.getElementById('arquivoDocumento').files[0];

        if (!nome || !arquivo) {
            sistemaNotificacoes.adicionarNotificacao(
                'Erro',
                'Por favor, preencha o nome e selecione um arquivo.',
                'error'
            );
            return;
        }

        const documento = {
            id: Date.now(),
            nome: nome,
            arquivo: arquivo.name,
            data: new Date().toISOString()
        };

        this.documentos.push(documento);
        this.renderDocumentos();

        // Limpar campos
        document.getElementById('nomeDocumento').value = '';
        document.getElementById('arquivoDocumento').value = '';
    }

    renderDocumentos() {
        const grid = document.getElementById('documentosGrid');
        grid.innerHTML = this.documentos.map(doc => `
            <div class="documento-card">
                <div class="documento-info">
                    <h5>${doc.nome}</h5>
                    <p>${doc.arquivo}</p>
                    <p>Adicionado em: ${new Date(doc.data).toLocaleDateString()}</p>
                </div>
                <button class="btn-danger" onclick="processosManager.removerDocumento(${doc.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    removerDocumento(id) {
        this.documentos = this.documentos.filter(doc => doc.id !== id);
        this.renderDocumentos();
    }

    renderProcessos() {
        const tbody = document.getElementById('processosTableBody');
        tbody.innerHTML = this.processos.map(processo => `
            <tr>
                <td>${processo.numero}</td>
                <td>${new Date(processo.dataCriacao).toLocaleDateString()}</td>
                <td>${processo.responsavel}</td>
                <td>${processo.departamento}</td>
                <td><span class="status-badge status-${processo.status.toLowerCase()}">${processo.status}</span></td>
                <td>${processo.eficiencia}%</td>
                <td>R$ ${processo.economia.toLocaleString()}</td>
                <td class="acoes">
                    <button class="btn-acao btn-editar" onclick="processosManager.editarProcesso(${processo.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-acao btn-excluir" onclick="processosManager.excluirProcesso(${processo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateIndicadores() {
        // Total de Processos
        document.getElementById('totalProcessos').textContent = this.processos.length;

        // Eficiência Média
        const eficienciaMedia = this.processos.reduce((acc, p) => acc + p.eficiencia, 0) / this.processos.length || 0;
        document.getElementById('eficiencia').textContent = `${Math.round(eficienciaMedia)}%`;

        // Economia Total
        const economiaTotal = this.processos.reduce((acc, p) => acc + p.economia, 0);
        document.getElementById('economia').textContent = `R$ ${economiaTotal.toLocaleString()}`;

        // Produtividade (simulação)
        document.getElementById('produtividade').textContent = `${Math.round(eficienciaMedia * 0.8)}%`;

        // Atualizar indicadores por departamento
        const departamentos = ['admin', 'oper', 'fin', 'rh', 'ssma'];
        departamentos.forEach(dep => {
            const processosDep = this.processos.filter(p => 
                p.departamento.toLowerCase().startsWith(dep));
            document.getElementById(`${dep}Processos`).textContent = processosDep.length;
            const eficienciaDep = processosDep.reduce((acc, p) => acc + p.eficiencia, 0) / processosDep.length || 0;
            document.getElementById(`${dep}Eficiencia`).textContent = `${Math.round(eficienciaDep)}%`;
        });

        this.updateGraficos();
    }

    updateGraficos() {
        // Gráfico de Desempenho
        const ctxDesempenho = document.getElementById('desempenhoChart').getContext('2d');
        new Chart(ctxDesempenho, {
            type: 'line',
            data: {
                labels: this.processos.map(p => p.numero),
                datasets: [{
                    label: 'Eficiência',
                    data: this.processos.map(p => p.eficiencia),
                    borderColor: '#4dabf7',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });

        // Gráfico de Economia por Departamento
        const ctxEconomia = document.getElementById('economiaChart').getContext('2d');
        const economiaPorDep = {
            'Administrativo': 0,
            'Operacional': 0,
            'Financeiro': 0,
            'RH': 0,
            'SSMA': 0
        };

        this.processos.forEach(p => {
            economiaPorDep[p.departamento] += p.economia;
        });

        new Chart(ctxEconomia, {
            type: 'bar',
            data: {
                labels: Object.keys(economiaPorDep),
                datasets: [{
                    label: 'Economia (R$)',
                    data: Object.values(economiaPorDep),
                    backgroundColor: '#4dabf7'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    editarProcesso(id) {
        const processo = this.processos.find(p => p.id === id);
        if (!processo) return;

        // Implementar edição
        console.log('Editar processo:', processo);
    }

    excluirProcesso(id) {
        if (!confirm('Tem certeza que deseja excluir este processo?')) return;

        const processo = this.processos.find(p => p.id === id);
        this.processos = this.processos.filter(p => p.id !== id);
        this.saveProcessos();
        this.renderProcessos();
        this.updateIndicadores();

        sistemaNotificacoes.adicionarNotificacao(
            'Processo Excluído',
            `O processo ${processo.numero} foi excluído com sucesso.`,
            'info'
        );
    }

    saveProcessos() {
        localStorage.setItem('processos', JSON.stringify(this.processos));
    }
}

// Inicializa o gerenciador de processos quando o DOM estiver carregado
let processosManager;
document.addEventListener('DOMContentLoaded', () => {
    processosManager = new ProcessosManager();
}); 