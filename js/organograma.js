// Gerenciamento do Organograma
class OrganogramaManager {
    constructor() {
        this.modal = document.getElementById('modalCargo');
        this.form = document.getElementById('formCargo');
        this.currentCargoId = null;
        this.container = document.querySelector('.organograma-container');
        this.isVertical = true;
        this.activeDetails = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Botões de ação
        document.getElementById('btnAdicionarCargo').addEventListener('click', () => this.showModal());
        document.getElementById('btnEditarOrganograma').addEventListener('click', () => this.toggleEditMode());
        document.getElementById('btnAlternarLayout').addEventListener('click', () => this.toggleLayout());

        // Botões de informação
        document.querySelectorAll('.btn-info').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cargo = e.target.closest('.cargo');
                this.toggleCargoDetails(cargo);
            });
        });

        // Botões de edição e exclusão
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cargoId = e.target.closest('.cargo').dataset.cargoId;
                this.showModal(cargoId);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cargoId = e.target.closest('.cargo').dataset.cargoId;
                this.deleteCargo(cargoId);
            });
        });

        // Botões de fechar detalhes
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cargo = e.target.closest('.cargo');
                this.hideCargoDetails(cargo);
            });
        });

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.hideModal());
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Fechar detalhes ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.activeDetails && !e.target.closest('.cargo-detalhes')) {
                this.hideCargoDetails(this.activeDetails.closest('.cargo'));
            }
        });
    }

    toggleCargoDetails(cargo) {
        const detalhes = cargo.querySelector('.cargo-detalhes');
        
        // Se já houver um detalhe ativo, esconde ele primeiro
        if (this.activeDetails && this.activeDetails !== detalhes) {
            this.hideCargoDetails(this.activeDetails.closest('.cargo'));
        }

        // Alterna a visibilidade dos detalhes
        if (detalhes.classList.contains('active')) {
            this.hideCargoDetails(cargo);
        } else {
            this.showCargoDetails(cargo);
        }
    }

    showCargoDetails(cargo) {
        const detalhes = cargo.querySelector('.cargo-detalhes');
        detalhes.classList.add('active');
        this.activeDetails = detalhes;

        // Ajusta a posição dos detalhes
        const rect = cargo.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        if (window.innerWidth <= 768) {
            // Em telas pequenas, mostra abaixo
            detalhes.style.top = '100%';
            detalhes.style.left = '0';
        } else {
            // Em telas grandes, verifica se há espaço à direita
            if (rect.right + 300 > containerRect.right) {
                // Se não houver espaço à direita, mostra à esquerda
                detalhes.style.left = 'auto';
                detalhes.style.right = '100%';
            } else {
                // Mostra à direita
                detalhes.style.left = '100%';
                detalhes.style.right = 'auto';
            }
        }
    }

    hideCargoDetails(cargo) {
        const detalhes = cargo.querySelector('.cargo-detalhes');
        detalhes.classList.remove('active');
        if (this.activeDetails === detalhes) {
            this.activeDetails = null;
        }
    }

    toggleLayout() {
        this.isVertical = !this.isVertical;
        this.container.classList.toggle('vertical', this.isVertical);
        this.container.classList.toggle('horizontal', !this.isVertical);
        
        // Atualiza o ícone do botão
        const icon = document.querySelector('#btnAlternarLayout i');
        icon.classList.toggle('fa-arrows-alt-h', this.isVertical);
        icon.classList.toggle('fa-arrows-alt-v', !this.isVertical);

        // Esconde detalhes ativos ao mudar o layout
        if (this.activeDetails) {
            this.hideCargoDetails(this.activeDetails.closest('.cargo'));
        }
    }

    showModal(cargoId = null) {
        this.currentCargoId = cargoId;
        if (cargoId) {
            const cargo = document.querySelector(`.cargo[data-cargo-id="${cargoId}"]`);
            this.populateForm(cargo);
        } else {
            this.form.reset();
        }
        this.modal.style.display = 'block';
    }

    hideModal() {
        this.modal.style.display = 'none';
        this.form.reset();
        this.currentCargoId = null;
    }

    populateForm(cargo) {
        document.getElementById('cargoTitulo').value = cargo.querySelector('h3').textContent;
        document.getElementById('cargoNome').value = cargo.querySelector('.nome').textContent;
        document.getElementById('cargoEmail').value = cargo.querySelector('.contato').textContent;
        document.getElementById('cargoTelefone').value = cargo.querySelector('.telefone').textContent;
        document.getElementById('cargoResponsabilidades').value = Array.from(cargo.querySelectorAll('.cargo-responsabilidades li'))
            .map(li => li.textContent)
            .join('\n');
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = {
            titulo: document.getElementById('cargoTitulo').value,
            nome: document.getElementById('cargoNome').value,
            email: document.getElementById('cargoEmail').value,
            telefone: document.getElementById('cargoTelefone').value,
            responsabilidades: document.getElementById('cargoResponsabilidades').value
                .split('\n')
                .filter(line => line.trim())
        };

        if (this.currentCargoId) {
            this.updateCargo(this.currentCargoId, formData);
        } else {
            this.addCargo(formData);
        }

        this.hideModal();
    }

    updateCargo(cargoId, data) {
        const cargo = document.querySelector(`.cargo[data-cargo-id="${cargoId}"]`);
        
        // Atualiza preview
        cargo.querySelector('.cargo-preview h3').textContent = data.titulo;
        cargo.querySelector('.cargo-preview .nome').textContent = data.nome;

        // Atualiza detalhes
        cargo.querySelector('.cargo-info .contato').textContent = data.email;
        cargo.querySelector('.cargo-info .telefone').textContent = data.telefone;
        
        const responsabilidadesList = cargo.querySelector('.cargo-responsabilidades ul');
        responsabilidadesList.innerHTML = data.responsabilidades
            .map(resp => `<li>${resp}</li>`)
            .join('');
    }

    addCargo(data) {
        const novoCargoId = Date.now();
        const cargoHtml = `
            <div class="cargo" data-cargo-id="${novoCargoId}">
                <div class="cargo-preview">
                    <h3>${data.titulo}</h3>
                    <p class="nome">${data.nome}</p>
                    <button class="btn-info">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
                <div class="cargo-detalhes">
                    <div class="cargo-header">
                        <div class="cargo-actions">
                            <button class="btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" title="Remover"><i class="fas fa-trash"></i></button>
                            <button class="btn-close" title="Fechar"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="cargo-info">
                        <p class="contato">${data.email}</p>
                        <p class="telefone">${data.telefone}</p>
                    </div>
                    <div class="cargo-responsabilidades">
                        <h4>Responsabilidades</h4>
                        <ul>
                            ${data.responsabilidades.map(resp => `<li>${resp}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Adiciona o novo cargo ao nível apropriado
        const nivel3 = document.querySelector('.nivel-3');
        nivel3.insertAdjacentHTML('beforeend', cargoHtml);

        // Adiciona os event listeners aos novos botões
        const novoCargo = document.querySelector(`.cargo[data-cargo-id="${novoCargoId}"]`);
        this.addCargoEventListeners(novoCargo);
    }

    addCargoEventListeners(cargo) {
        cargo.querySelector('.btn-info').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCargoDetails(cargo);
        });

        cargo.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showModal(cargo.dataset.cargoId);
        });

        cargo.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteCargo(cargo.dataset.cargoId);
        });

        cargo.querySelector('.btn-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideCargoDetails(cargo);
        });
    }

    deleteCargo(cargoId) {
        if (confirm('Tem certeza que deseja remover este cargo?')) {
            const cargo = document.querySelector(`.cargo[data-cargo-id="${cargoId}"]`);
            if (this.activeDetails === cargo.querySelector('.cargo-detalhes')) {
                this.activeDetails = null;
            }
            cargo.remove();
        }
    }

    toggleEditMode() {
        const cargos = document.querySelectorAll('.cargo');
        cargos.forEach(cargo => {
            const actions = cargo.querySelector('.cargo-actions');
            actions.style.display = actions.style.display === 'none' ? 'flex' : 'none';
        });
    }
}

// Inicializa o gerenciador do organograma quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const manager = new OrganogramaManager();
    // Define o layout inicial como vertical
    manager.container.classList.add('vertical');
}); 