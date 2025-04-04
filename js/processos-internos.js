class ProcessosInternosManager {
    constructor() {
        this.processos = [];
        this.departamentos = {
            'Administrativo': { processos: [], eficiencia: 0 },
            'Operacional': { processos: [], eficiencia: 0 },
            'Financeiro': { processos: [], eficiencia: 0 },
            'RH': { processos: [], eficiencia: 0 },
            'SSMA': { processos: [], eficiencia: 0 }
        };
        
        // Inicializar banco de dados
        this.bancoDados = {
            processos: JSON.parse(localStorage.getItem('processos')) || [],
            ultimoId: JSON.parse(localStorage.getItem('ultimoId')) || 0
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
        // Carregar processos do banco de dados
        this.processos = this.bancoDados.processos;
        this.agruparPorDepartamento();
        this.atualizarTabela();
    }

    agruparPorDepartamento() {
        this.processos.forEach(processo => {
            if (this.departamentos[processo.departamento]) {
                this.departamentos[processo.departamento].processos.push(processo);
            }
        });

        this.calcularEficienciaDepartamentos();
        this.calcularEconomiaDepartamentos();
    }

    calcularEficienciaDepartamentos() {
        Object.keys(this.departamentos).forEach(depto => {
            const processos = this.departamentos[depto].processos;
            if (processos.length > 0) {
                // Cálculo de eficiência baseado em métricas específicas por departamento
                const eficiencia = processos.reduce((acc, proc) => {
                    let pontuacao = 0;
                    
                    // Métricas comuns a todos os departamentos
                    pontuacao += proc.tempoConclusao <= proc.tempoEstimado ? 20 : 10; // Tempo de conclusão
                    pontuacao += proc.qualidade ? 20 : 10; // Qualidade do resultado
                    pontuacao += proc.conformidade ? 20 : 10; // Conformidade com normas
                    
                    // Métricas específicas por departamento
                    switch(depto) {
                        case 'Administrativo':
                            pontuacao += proc.documentacaoCompleta ? 20 : 10;
                            pontuacao += proc.comunicacaoEfetiva ? 20 : 10;
                            break;
                        case 'Operacional':
                            pontuacao += proc.manutencaoPreventiva ? 20 : 10;
                            pontuacao += proc.otimizacaoRecursos ? 20 : 10;
                            break;
                        case 'Financeiro':
                            pontuacao += proc.controleOrcamentario ? 20 : 10;
                            pontuacao += proc.reducaoCustos ? 20 : 10;
                            break;
                        case 'RH':
                            pontuacao += proc.satisfacaoColaboradores ? 20 : 10;
                            pontuacao += proc.desenvolvimentoPessoal ? 20 : 10;
                            break;
                        case 'SSMA':
                            pontuacao += proc.acidentesZero ? 20 : 10;
                            pontuacao += proc.conformidadeAmbiental ? 20 : 10;
                            break;
                    }
                    
                    return acc + pontuacao;
                }, 0) / processos.length;
                
                this.departamentos[depto].eficiencia = eficiencia;
            }
        });
    }

    calcularEconomiaDepartamentos() {
        Object.keys(this.departamentos).forEach(depto => {
            const processos = this.departamentos[depto].processos;
            if (processos.length > 0) {
                // Cálculo de economia baseado em métricas específicas por departamento
                const economia = processos.reduce((acc, proc) => {
                    let valorEconomia = 0;
                    
                    // Métricas comuns a todos os departamentos
                    valorEconomia += proc.reducaoCustosOperacionais || 0;
                    valorEconomia += proc.otimizacaoRecursos || 0;
                    
                    // Métricas específicas por departamento
                    switch(depto) {
                        case 'Administrativo':
                            valorEconomia += proc.reducaoPapel || 0;
                            valorEconomia += proc.automacaoProcessos || 0;
                            break;
                        case 'Operacional':
                            valorEconomia += proc.reducaoCombustivel || 0;
                            valorEconomia += proc.manutencaoPreventiva || 0;
                            break;
                        case 'Financeiro':
                            valorEconomia += proc.reducaoJuros || 0;
                            valorEconomia += proc.otimizacaoTributos || 0;
                            break;
                        case 'RH':
                            valorEconomia += proc.reducaoTurnover || 0;
                            valorEconomia += proc.aumentoProdutividade || 0;
                            break;
                        case 'SSMA':
                            valorEconomia += proc.reducaoMultas || 0;
                            valorEconomia += proc.reducaoAcidentes || 0;
                            break;
                    }
                    
                    return acc + valorEconomia;
                }, 0);
                
                this.departamentos[depto].economia = economia;
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

    atualizarTabela() {
        const tbody = document.getElementById('processosTableBody');
        tbody.innerHTML = '';

        this.processos.forEach(processo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${processo.numeroDocumento}</td>
                <td>${new Date(processo.dataCriacao).toLocaleDateString('pt-BR')}</td>
                <td>${processo.responsavel}</td>
                <td>${processo.departamento}</td>
                <td><span class="status-badge status-${processo.status.toLowerCase()}">${processo.status}</span></td>
                <td>${processo.eficiencia}%</td>
                <td>R$ ${processo.economia.toLocaleString()}</td>
                <td class="acoes">
                    <button class="btn-acao btn-editar" onclick="processosManager.editarProcesso(${processo.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-acao btn-excluir" onclick="processosManager.excluirProcesso(${processo.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
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
        // Botão Novo Processo
        document.getElementById('btnNovoProcesso').addEventListener('click', () => {
            this.abrirModalNovoProcesso();
        });

        // Botão Relatório
        document.getElementById('btnRelatorio').addEventListener('click', () => {
            this.gerarRelatorio();
        });

        // Formulário de Novo Processo
        document.getElementById('formNovoProcesso').addEventListener('submit', (e) => {
            this.salvarProcesso(e);
        });

        // Botão Cancelar
        document.getElementById('btnCancelar').addEventListener('click', () => {
            this.fecharModalNovoProcesso();
        });

        // Botão Fechar Modal
        document.querySelector('.btn-close').addEventListener('click', () => {
            this.fecharModalNovoProcesso();
        });

        // Botão Adicionar Documento
        document.getElementById('btnAdicionarDocumento').addEventListener('click', () => {
            const processoId = this.bancoDados.ultimoId;
            this.adicionarDocumento(processoId);
        });
    }

    abrirModalNovoProcesso() {
        const modal = document.getElementById('modalNovoProcesso');
        modal.classList.add('active');
        
        // Preencher data atual
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('dataCriacao').value = hoje;
    }

    fecharModalNovoProcesso() {
        const modal = document.getElementById('modalNovoProcesso');
        modal.classList.remove('active');
        document.getElementById('formNovoProcesso').reset();
    }

    salvarProcesso(event) {
        event.preventDefault();
        
        // Gerar novo ID
        const novoId = ++this.bancoDados.ultimoId;
        
        // Criar novo processo com métricas iniciais
        const novoProcesso = {
            id: novoId,
            numeroDocumento: document.getElementById('numeroDocumento').value,
            dataCriacao: document.getElementById('dataCriacao').value,
            responsavel: document.getElementById('responsavel').value,
            departamento: document.getElementById('departamento').value,
            observacao: document.getElementById('observacao').value,
            status: 'Ativo',
            documentos: [], // Array para armazenar documentos
            
            // Métricas de eficiência
            tempoConclusao: 0,
            tempoEstimado: 30, // dias
            qualidade: false,
            conformidade: false,
            
            // Métricas específicas por departamento
            documentacaoCompleta: false,
            comunicacaoEfetiva: false,
            manutencaoPreventiva: false,
            otimizacaoRecursos: false,
            controleOrcamentario: false,
            reducaoCustos: false,
            satisfacaoColaboradores: false,
            desenvolvimentoPessoal: false,
            acidentesZero: false,
            conformidadeAmbiental: false,
            
            // Métricas de economia
            reducaoCustosOperacionais: 0,
            otimizacaoRecursos: 0,
            reducaoPapel: 0,
            automacaoProcessos: 0,
            reducaoCombustivel: 0,
            manutencaoPreventiva: 0,
            reducaoJuros: 0,
            otimizacaoTributos: 0,
            reducaoTurnover: 0,
            aumentoProdutividade: 0,
            reducaoMultas: 0,
            reducaoAcidentes: 0
        };
        
        // Adicionar ao banco de dados
        this.bancoDados.processos.push(novoProcesso);
        
        // Salvar no localStorage
        localStorage.setItem('processos', JSON.stringify(this.bancoDados.processos));
        localStorage.setItem('ultimoId', JSON.stringify(this.bancoDados.ultimoId));
        
        // Atualizar interface
        this.carregarProcessos();
        this.atualizarIndicadores();
        this.fecharModalNovoProcesso();
    }

    adicionarDocumento(processoId) {
        const nomeDocumento = document.getElementById('nomeDocumento').value;
        const arquivoDocumento = document.getElementById('arquivoDocumento').files[0];
        
        if (!nomeDocumento || !arquivoDocumento) {
            alert('Por favor, preencha o nome do documento e selecione um arquivo.');
            return;
        }
        
        const processo = this.bancoDados.processos.find(p => p.id === processoId);
        if (processo) {
            const novoDocumento = {
                id: Date.now(), // ID único baseado no timestamp
                nome: nomeDocumento,
                arquivo: arquivoDocumento.name,
                dataUpload: new Date().toISOString(),
                analise: {
                    qualidade: false,
                    conformidade: false,
                    observacoes: '',
                    dataAnalise: null
                }
            };
            
            processo.documentos.push(novoDocumento);
            
            // Salvar no localStorage
            localStorage.setItem('processos', JSON.stringify(this.bancoDados.processos));
            
            // Atualizar interface
            this.atualizarDocumentosGrid(processoId);
            
            // Limpar campos
            document.getElementById('nomeDocumento').value = '';
            document.getElementById('arquivoDocumento').value = '';
        }
    }

    atualizarDocumentosGrid(processoId) {
        const processo = this.bancoDados.processos.find(p => p.id === processoId);
        const grid = document.getElementById('documentosGrid');
        grid.innerHTML = '';
        
        if (processo && processo.documentos) {
            processo.documentos.forEach(doc => {
                const docElement = document.createElement('div');
                docElement.className = 'documento-card';
                docElement.innerHTML = `
                    <div class="documento-info">
                        <h5>${doc.nome}</h5>
                        <p>Arquivo: ${doc.arquivo}</p>
                        <p>Data: ${new Date(doc.dataUpload).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div class="documento-analise">
                        <div class="analise-status">
                            <span class="status-badge ${doc.analise.qualidade ? 'status-ativo' : 'status-pendente'}">
                                Qualidade: ${doc.analise.qualidade ? 'Aprovado' : 'Pendente'}
                            </span>
                            <span class="status-badge ${doc.analise.conformidade ? 'status-ativo' : 'status-pendente'}">
                                Conformidade: ${doc.analise.conformidade ? 'Conforme' : 'Pendente'}
                            </span>
                        </div>
                        <button class="btn-acao btn-analisar" onclick="processosManager.analisarDocumento(${processoId}, ${doc.id})">
                            <i class="fas fa-search"></i> Analisar
                        </button>
                    </div>
                `;
                grid.appendChild(docElement);
            });
        }
    }

    analisarDocumento(processoId, documentoId) {
        const processo = this.bancoDados.processos.find(p => p.id === processoId);
        const documento = processo.documentos.find(d => d.id === documentoId);
        
        if (documento) {
            // Abrir modal de análise
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Análise de Documento</h3>
                        <button class="btn-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formAnaliseDocumento">
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="qualidadeDocumento" ${documento.analise.qualidade ? 'checked' : ''}>
                                    Qualidade Aprovada
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="conformidadeDocumento" ${documento.analise.conformidade ? 'checked' : ''}>
                                    Conformidade Aprovada
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="observacoesAnalise">Observações</label>
                                <textarea id="observacoesAnalise" rows="4">${documento.analise.observacoes || ''}</textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                                <button type="submit" class="btn-primary">Salvar Análise</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Event listener para salvar análise
            modal.querySelector('form').addEventListener('submit', (e) => {
                e.preventDefault();
                
                documento.analise = {
                    qualidade: document.getElementById('qualidadeDocumento').checked,
                    conformidade: document.getElementById('conformidadeDocumento').checked,
                    observacoes: document.getElementById('observacoesAnalise').value,
                    dataAnalise: new Date().toISOString()
                };
                
                // Salvar no localStorage
                localStorage.setItem('processos', JSON.stringify(this.bancoDados.processos));
                
                // Atualizar interface
                this.atualizarDocumentosGrid(processoId);
                
                // Fechar modal
                modal.remove();
            });
            
            // Event listener para fechar modal
            modal.querySelector('.btn-close').addEventListener('click', () => {
                modal.remove();
            });
        }
    }

    gerarRelatorio() {
        // Implementar geração de relatório
        console.log('Gerar relatório');
    }

    editarProcesso(id) {
        // Implementar edição de processo
        console.log('Editar processo:', id);
    }

    excluirProcesso(id) {
        // Implementar exclusão de processo
        console.log('Excluir processo:', id);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.processosManager = new ProcessosInternosManager();
}); 