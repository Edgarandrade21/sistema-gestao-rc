class ProcessosManager {
    constructor() {
        this.processos = [];
        this.departamentos = {
            'Administrativo': { processos: [], eficiencia: 0 },
            'Operacional': { processos: [], eficiencia: 0 },
            'Financeiro': { processos: [], eficiencia: 0 },
            'RH': { processos: [], eficiencia: 0 }
        };
        
        this.init();
    }

    init() {
        this.carregarProcessos();
        this.atualizarIndicadores();
        this.inicializarGraficos();
        this.setupEventListeners();
    }

    carregarProcessos() {
        // Simulação de dados - substituir por dados reais
        this.processos = [
            {
                id: 1,
                nome: 'Processo de Contratação',
                departamento: 'RH',
                status: 'Ativo',
                eficiencia: 85,
                economia: 15000,
                produtividade: 90
            },
            // Adicionar mais processos aqui
        ];

        this.agruparPorDepartamento();
    }

    agruparPorDepartamento() {
        this.processos.forEach(processo => {
            if (this.departamentos[processo.departamento]) {
                this.departamentos[processo.departamento].processos.push(processo);
            }
        });

        this.calcularEficienciaDepartamentos();
    }

    calcularEficienciaDepartamentos() {
        Object.keys(this.departamentos).forEach(depto => {
            const processos = this.departamentos[depto].processos;
            if (processos.length > 0) {
                const totalEficiencia = processos.reduce((acc, proc) => acc + proc.eficiencia, 0);
                this.departamentos[depto].eficiencia = totalEficiencia / processos.length;
            }
        });
    }

    atualizarIndicadores() {
        // Total de Processos
        document.getElementById('totalProcessos').textContent = this.processos.length;

        // Eficiência Média
        const eficienciaMedia = this.processos.reduce((acc, proc) => acc + proc.eficiencia, 0) / this.processos.length;
        document.getElementById('eficiencia').textContent = `${eficienciaMedia.toFixed(1)}%`;

        // Economia Total
        const economiaTotal = this.processos.reduce((acc, proc) => acc + proc.economia, 0);
        document.getElementById('economia').textContent = `R$ ${economiaTotal.toLocaleString()}`;

        // Produtividade Média
        const produtividadeMedia = this.processos.reduce((acc, proc) => acc + proc.produtividade, 0) / this.processos.length;
        document.getElementById('produtividade').textContent = `${produtividadeMedia.toFixed(1)}%`;

        // Atualizar departamentos
        Object.keys(this.departamentos).forEach(depto => {
            document.getElementById(`${depto.toLowerCase()}Processos`).textContent = 
                this.departamentos[depto].processos.length;
            document.getElementById(`${depto.toLowerCase()}Eficiencia`).textContent = 
                `${this.departamentos[depto].eficiencia.toFixed(1)}%`;
        });
    }

    inicializarGraficos() {
        // Gráfico de Desempenho
        const ctxDesempenho = document.getElementById('desempenhoChart').getContext('2d');
        new Chart(ctxDesempenho, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Eficiência',
                    data: [75, 80, 85, 82, 88, 90],
                    borderColor: '#3498db',
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

        // Gráfico de Economia
        const ctxEconomia = document.getElementById('economiaChart').getContext('2d');
        new Chart(ctxEconomia, {
            type: 'bar',
            data: {
                labels: Object.keys(this.departamentos),
                datasets: [{
                    label: 'Economia (R$)',
                    data: Object.values(this.departamentos).map(d => 
                        d.processos.reduce((acc, p) => acc + p.economia, 0)
                    ),
                    backgroundColor: '#2ecc71'
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

    setupEventListeners() {
        document.getElementById('btnNovoProcesso').addEventListener('click', () => {
            // Implementar lógica para novo processo
        });

        document.getElementById('btnRelatorio').addEventListener('click', () => {
            // Implementar geração de relatório
        });
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new ProcessosManager();
}); 