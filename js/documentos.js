class DocumentosManager {
    constructor() {
        this.db = {
            documentos: {
                cnpj: {
                    tipo: 'CNPJ',
                    numero: '12.345.678/0001-90',
                    dataAtualizacao: '2024-04-01',
                    status: 'ativo',
                    arquivo: null
                },
                ie: {
                    tipo: 'Inscrição Estadual',
                    numero: '123.456.789',
                    validade: '2024-12-31',
                    status: 'ativo',
                    arquivo: null
                },
                lo: {
                    tipo: 'Licença Operacional',
                    numero: 'LO-2024/001',
                    validade: '2024-06-30',
                    status: 'ativo',
                    arquivo: null
                },
                ibama: {
                    tipo: 'IBAMA',
                    numero: 'IB-123456',
                    validade: '2024-09-30',
                    status: 'ativo',
                    arquivo: null
                },
                antt: {
                    tipo: 'ANTT',
                    numero: 'ANTT-789012',
                    validade: '2024-08-15',
                    status: 'ativo',
                    arquivo: null
                },
                cert_ibama: {
                    tipo: 'Certificado de Regularidade IBAMA',
                    numero: 'CERT-345678',
                    validade: '2024-05-31',
                    status: 'ativo',
                    arquivo: null
                },
                contrato: {
                    tipo: 'Alteração Contratual',
                    versao: '5.0',
                    data: '2024-03-15',
                    status: 'ativo',
                    arquivo: null
                }
            },
            socios: [
                {
                    nome: 'João Silva',
                    cpf: '123.456.789-00',
                    rg: '12.345.678-9',
                    documentos: {
                        cpf: null,
                        rg: null,
                        comprovante_residencia: null
                    }
                },
                {
                    nome: 'Maria Santos',
                    cpf: '987.654.321-00',
                    rg: '98.765.432-1',
                    documentos: {
                        cpf: null,
                        rg: null,
                        comprovante_residencia: null
                    }
                }
            ]
        };

        this.initializeEventListeners();
        this.updateDateTime();
        this.loadDocumentos();
        this.loadSocios();
        this.updateDashboard();
        
        // Atualizar data/hora a cada minuto
        setInterval(() => this.updateDateTime(), 60000);
    }

    initializeEventListeners() {
        // Event listener para o formulário de upload
        const form = document.getElementById('uploadForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleUpload(e));
        }
    }

    updateDateTime() {
        const dataHora = document.getElementById('dataHoraAtualDocs');
        if (dataHora) {
            const agora = new Date();
            dataHora.textContent = agora.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    loadDocumentos() {
        // Atualizar informações dos documentos
        Object.entries(this.db.documentos).forEach(([key, doc]) => {
            const numeroElement = document.getElementById(`numero${key.toUpperCase()}`);
            const statusElement = document.getElementById(`status${key.toUpperCase()}`);
            const validadeElement = document.getElementById(`validade${key.toUpperCase()}`);
            
            if (numeroElement) numeroElement.textContent = doc.numero;
            if (statusElement) {
                statusElement.textContent = this.formatarStatus(doc.status);
                statusElement.className = `status-badge ${doc.status}`;
            }
            if (validadeElement && doc.validade) {
                validadeElement.textContent = this.formatarData(doc.validade);
            }
        });
    }

    loadSocios() {
        const container = document.getElementById('listaSocios');
        if (!container) return;

        container.innerHTML = this.db.socios.map(socio => `
            <div class="socio-item">
                <h5>${socio.nome}</h5>
                <p>CPF: ${socio.cpf}</p>
                <p>RG: ${socio.rg}</p>
            </div>
        `).join('');
    }

    updateDashboard() {
        this.updateVencimentos();
        this.updateStatusChart();
        this.updateAlertas();
    }

    updateVencimentos() {
        const container = document.getElementById('proximosVencimentosDocs');
        if (!container) return;

        const vencimentos = this.getProximosVencimentos();
        container.innerHTML = vencimentos.map(doc => `
            <div class="vencimento-item ${this.getVencimentoClass(doc.diasRestantes)}">
                <h5>${doc.tipo}</h5>
                <p>Vence em: ${this.formatarData(doc.validade)}</p>
                <p>Dias restantes: ${doc.diasRestantes}</p>
            </div>
        `).join('');
    }

    updateStatusChart() {
        const ctx = document.getElementById('graficoStatusDocs');
        if (!ctx) return;

        const status = this.getStatusCount();

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ativos', 'Pendentes', 'Vencidos'],
                datasets: [{
                    data: [status.ativos, status.pendentes, status.vencidos],
                    backgroundColor: [
                        'var(--success-color)',
                        'var(--warning-color)',
                        'var(--danger-color)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateAlertas() {
        const container = document.getElementById('alertasDocumentos');
        if (!container) return;

        const alertas = this.getAlertas();
        container.innerHTML = alertas.map(alerta => `
            <div class="vencimento-item ${alerta.tipo}">
                <h5>${alerta.titulo}</h5>
                <p>${alerta.mensagem}</p>
            </div>
        `).join('');
    }

    getProximosVencimentos() {
        const hoje = new Date();
        const vencimentos = [];

        Object.entries(this.db.documentos).forEach(([key, doc]) => {
            if (doc.validade) {
                const dataVencimento = new Date(doc.validade);
                const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

                if (diasRestantes <= 30) {
                    vencimentos.push({
                        tipo: doc.tipo,
                        validade: doc.validade,
                        diasRestantes
                    });
                }
            }
        });

        return vencimentos.sort((a, b) => a.diasRestantes - b.diasRestantes);
    }

    getStatusCount() {
        const status = {
            ativos: 0,
            pendentes: 0,
            vencidos: 0
        };

        Object.values(this.db.documentos).forEach(doc => {
            if (doc.status === 'ativo') status.ativos++;
            else if (doc.status === 'pendente') status.pendentes++;
            else if (doc.status === 'vencido') status.vencidos++;
        });

        return status;
    }

    getAlertas() {
        const alertas = [];
        const hoje = new Date();

        Object.entries(this.db.documentos).forEach(([key, doc]) => {
            if (doc.validade) {
                const dataVencimento = new Date(doc.validade);
                const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

                if (diasRestantes <= 0) {
                    alertas.push({
                        tipo: 'urgente',
                        titulo: doc.tipo,
                        mensagem: 'Documento vencido!'
                    });
                } else if (diasRestantes <= 15) {
                    alertas.push({
                        tipo: 'proximo',
                        titulo: doc.tipo,
                        mensagem: `Vence em ${diasRestantes} dias`
                    });
                }
            }
        });

        return alertas;
    }

    getVencimentoClass(diasRestantes) {
        if (diasRestantes <= 0) return 'urgente';
        if (diasRestantes <= 15) return 'proximo';
        return '';
    }

    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    formatarStatus(status) {
        const statusMap = {
            'ativo': 'Ativo',
            'pendente': 'Pendente',
            'vencido': 'Vencido'
        };
        return statusMap[status] || status;
    }

    visualizarDocumento(tipo) {
        const doc = this.db.documentos[tipo];
        if (doc && doc.arquivo) {
            // Implementar visualização do documento
            console.log(`Visualizando documento: ${doc.tipo}`);
        } else {
            alert('Documento não disponível para visualização.');
        }
    }

    atualizarDocumento(tipo) {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.classList.add('active');
            // Armazenar o tipo do documento sendo atualizado
            modal.dataset.documentoTipo = tipo;
        }
    }

    handleUpload(e) {
        e.preventDefault();
        const modal = document.getElementById('uploadModal');
        const tipo = modal.dataset.documentoTipo;
        const arquivo = document.getElementById('documento').files[0];
        const dataValidade = document.getElementById('dataValidade').value;
        const observacoes = document.getElementById('observacoes').value;

        if (arquivo) {
            // Simular upload do arquivo
            this.db.documentos[tipo].arquivo = {
                nome: arquivo.name,
                data: new Date().toISOString(),
                observacoes
            };

            if (dataValidade) {
                this.db.documentos[tipo].validade = dataValidade;
            }

            this.loadDocumentos();
            this.updateDashboard();
            this.fecharModal();
        }
    }

    fecharModal() {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.classList.remove('active');
            document.getElementById('uploadForm').reset();
        }
    }

    visualizarDocumentosSocios() {
        // Implementar visualização dos documentos dos sócios
        console.log('Visualizando documentos dos sócios');
    }

    atualizarDocumentosSocios() {
        // Implementar atualização dos documentos dos sócios
        console.log('Atualizando documentos dos sócios');
    }
}

// Inicializar o gerenciador de documentos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new DocumentosManager();
}); 