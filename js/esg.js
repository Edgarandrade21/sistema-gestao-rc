class ESGManager {
    constructor() {
        this.initializeData();
        this.setupEventListeners();
        this.updateIndicators();
        this.updateCharts();
        this.loadTreinamentos();
        this.loadCertificacoes();
        this.updateDateTime();
        
        // Atualizar data/hora a cada minuto
        setInterval(() => this.updateDateTime(), 60000);
    }

    initializeData() {
        // Dados simulados para demonstração
        this.data = {
            ambiental: {
                emissaoCO2: '150.5 ton',
                consumoCombustivel: '25.000 L',
                manutencoesPrev: 48
            },
            social: {
                treinamentos: 24,
                horasCapacitacao: 360,
                beneficios: 15
            },
            governanca: {
                conformidade: '95%',
                auditorias: 12,
                politicas: 8
            },
            seguranca: {
                taxaAcidentes: '0.5%',
                diasSemAcidentes: 180,
                inspecoes: 96
            },
            treinamentosSeguranca: [
                { nome: 'Direção Defensiva', data: '15/04/2024', status: 'Concluído' },
                { nome: 'Manuseio de Produtos Perigosos', data: '20/04/2024', status: 'Em Andamento' },
                { nome: 'Primeiros Socorros', data: '25/04/2024', status: 'Agendado' }
            ],
            certificacoes: [
                { nome: 'ISO 45001', validade: '31/12/2024', status: 'Ativo' },
                { nome: 'SASSMAQ', validade: '30/06/2024', status: 'Ativo' },
                { nome: 'Programa Olho Vivo', validade: '31/03/2025', status: 'Ativo' }
            ]
        };
    }

    setupEventListeners() {
        // Adicionar event listeners para os botões de relatório
        const buttons = ['Ambiental', 'Social', 'Governanca'].map(tipo => 
            document.querySelector(`button[onclick="abrirRelatorio${tipo}()"]`)
        );
        
        buttons.forEach((btn, index) => {
            if (btn) {
                btn.onclick = () => this.abrirRelatorio(['ambiental', 'social', 'governanca'][index]);
            }
        });
    }

    updateDateTime() {
        const dataHora = document.getElementById('dataHoraAtual');
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

    updateIndicators() {
        // Atualizar indicadores ambientais
        Object.entries(this.data.ambiental).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) element.textContent = value;
        });

        // Atualizar indicadores sociais
        Object.entries(this.data.social).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) element.textContent = value;
        });

        // Atualizar indicadores de governança
        Object.entries(this.data.governanca).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) element.textContent = value;
        });

        // Atualizar indicadores de segurança
        Object.entries(this.data.seguranca).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) element.textContent = value;
        });
    }

    loadTreinamentos() {
        const container = document.getElementById('treinamentosSeguranca');
        if (!container) return;

        container.innerHTML = this.data.treinamentosSeguranca.map(treinamento => `
            <div class="treinamento-item">
                <h5>${treinamento.nome}</h5>
                <p>Data: ${treinamento.data}</p>
                <span class="status-badge status-${treinamento.status.toLowerCase()}">${treinamento.status}</span>
            </div>
        `).join('');
    }

    loadCertificacoes() {
        const container = document.getElementById('certificacoes');
        if (!container) return;

        container.innerHTML = this.data.certificacoes.map(cert => `
            <div class="certificacao-item">
                <h5>${cert.nome}</h5>
                <p>Validade: ${cert.validade}</p>
                <span class="status-badge status-${cert.status.toLowerCase()}">${cert.status}</span>
            </div>
        `).join('');
    }

    updateCharts() {
        this.updateSegurancaChart();
        this.updateIncidentesChart();
    }

    updateSegurancaChart() {
        const ctx = document.getElementById('graficoSeguranca');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Taxa de Acidentes',
                    data: [0.8, 0.6, 0.7, 0.5, 0.4, 0.5],
                    borderColor: '#e74c3c',
                    tension: 0.4
                }, {
                    label: 'Inspeções Realizadas',
                    data: [85, 88, 92, 95, 94, 96],
                    borderColor: '#3498db',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateIncidentesChart() {
        const ctx = document.getElementById('graficoIncidentes');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Quase Acidentes', 'Incidentes Leves', 'Acidentes Graves', 'Outros'],
                datasets: [{
                    data: [65, 20, 5, 10],
                    backgroundColor: ['#f1c40f', '#e67e22', '#e74c3c', '#95a5a6']
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

    abrirRelatorio(tipo) {
        // Implementar lógica para abrir relatórios detalhados
        console.log(`Abrindo relatório de ${tipo}`);
        alert(`Relatório de ${tipo} será aberto em uma nova janela.`);
    }
}

// Inicializar o gerenciador ESG quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ESGManager();
}); 