// Gerenciamento do Organograma
class OrganogramaManager {
    constructor() {
        this.modal = document.getElementById('modalCargo');
        this.form = document.getElementById('formCargo');
        this.container = document.querySelector('.organograma-container');
        this.btnFecharModal = document.getElementById('btnFecharModal');
        this.btnCancelar = document.getElementById('btnCancelar');
        this.currentCargoId = null;
        this.isEditMode = false;
        this.cargos = JSON.parse(localStorage.getItem('cargos')) || [];
        
        this.initializeEventListeners();
        this.renderCargos();
    }

    initializeEventListeners() {
        // Botões principais
        document.getElementById('btnAdicionarCargo').addEventListener('click', () => this.showModal());
        document.getElementById('btnEditarOrganograma').addEventListener('click', () => this.toggleEditMode());
        document.getElementById('btnAlternarLayout').addEventListener('click', () => this.toggleLayout());

        // Modal
        this.btnFecharModal.addEventListener('click', () => this.hideModal());
        this.btnCancelar.addEventListener('click', () => this.hideModal());
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    }

    showModal(cargoId = null) {
        this.currentCargoId = cargoId;
        if (cargoId) {
            const cargo = this.cargos.find(c => c.id === cargoId);
            if (cargo) {
                document.getElementById('nomePessoa').value = cargo.nome;
                document.getElementById('cargo').value = cargo.titulo;
                document.getElementById('email').value = cargo.email;
            }
        } else {
            this.form.reset();
        }
        this.modal.classList.add('active');
    }

    hideModal() {
        this.modal.classList.remove('active');
        this.form.reset();
        this.currentCargoId = null;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = {
            id: this.currentCargoId || Date.now(),
            titulo: document.getElementById('cargo').value,
            nome: document.getElementById('nomePessoa').value,
            email: document.getElementById('email').value
        };

        if (this.currentCargoId) {
            const index = this.cargos.findIndex(c => c.id === this.currentCargoId);
            if (index !== -1) {
                this.cargos[index] = formData;
                sistemaNotificacoes.adicionarNotificacao(
                    'Cargo Atualizado',
                    `${formData.titulo} foi atualizado com sucesso.`,
                    'success'
                );
            }
        } else {
            this.cargos.push(formData);
            sistemaNotificacoes.adicionarNotificacao(
                'Cargo Adicionado',
                `${formData.titulo} foi adicionado ao organograma.`,
                'success'
            );
        }

        this.saveCargos();
        this.renderCargos();
        this.hideModal();
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const btnEditar = document.getElementById('btnEditarOrganograma');
        btnEditar.innerHTML = this.isEditMode ? 
            '<i class="fas fa-check"></i> Salvar Organograma' : 
            '<i class="fas fa-edit"></i> Editar Organograma';
        
        this.renderCargos();
    }

    toggleLayout() {
        this.container.classList.toggle('horizontal');
        const btnLayout = document.getElementById('btnAlternarLayout');
        const isHorizontal = this.container.classList.contains('horizontal');
        btnLayout.innerHTML = isHorizontal ?
            '<i class="fas fa-arrows-alt-v"></i> Layout Vertical' :
            '<i class="fas fa-arrows-alt-h"></i> Layout Horizontal';
    }

    renderCargos() {
        this.container.innerHTML = '';
        
        if (this.cargos.length === 0) {
            this.container.innerHTML = `
                <div class="cargo-vazio">
                    <p>Nenhum cargo adicionado.</p>
                    <p>Clique em "Adicionar Cargo" para começar.</p>
                </div>
            `;
            return;
        }

        this.cargos.forEach(cargo => {
            const cargoElement = document.createElement('div');
            cargoElement.className = 'cargo';
            cargoElement.dataset.cargoId = cargo.id;
            cargoElement.innerHTML = `
                <div class="cargo-preview">
                    <h3>${cargo.titulo}</h3>
                    <p class="nome">${cargo.nome}</p>
                    <p class="email">${cargo.email}</p>
                    ${this.isEditMode ? `
                        <div class="cargo-acoes">
                            <button class="btn-editar" onclick="organogramaManager.editCargo(${cargo.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-excluir" onclick="organogramaManager.deleteCargo(${cargo.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
            this.container.appendChild(cargoElement);
        });
    }

    editCargo(id) {
        this.showModal(id);
    }

    deleteCargo(id) {
        if (confirm('Tem certeza que deseja excluir este cargo?')) {
            const cargo = this.cargos.find(c => c.id === id);
            this.cargos = this.cargos.filter(c => c.id !== id);
            this.saveCargos();
            this.renderCargos();
            
            sistemaNotificacoes.adicionarNotificacao(
                'Cargo Removido',
                `${cargo.titulo} foi removido do organograma.`,
                'info'
            );
        }
    }

    saveCargos() {
        localStorage.setItem('cargos', JSON.stringify(this.cargos));
    }
}

// Inicializa o gerenciador do organograma quando o DOM estiver carregado
let organogramaManager;
document.addEventListener('DOMContentLoaded', () => {
    organogramaManager = new OrganogramaManager();
}); 