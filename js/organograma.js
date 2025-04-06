// Gerenciamento do Organograma
class OrganogramaManager {
    constructor() {
        this.cargos = JSON.parse(localStorage.getItem('cargos')) || [];
        this.modal = document.getElementById('cargoModal');
        this.form = document.getElementById('cargoForm');
        this.container = document.querySelector('.organograma-container');
        this.cargoSuperiorSelect = document.getElementById('cargoSuperior');
        this.nivelSelect = document.getElementById('nivel');
        this.posicaoRadios = document.querySelectorAll('input[name="posicao"]');
        
        this.initializeEventListeners();
        this.renderCargos();
    }

    initializeEventListeners() {
        // Botões de ação
        document.getElementById('btnAdicionarCargo').addEventListener('click', () => this.showModal());
        document.getElementById('btnEditarOrganograma').addEventListener('click', () => this.toggleEditMode());
        
        // Modal
        this.modal.querySelector('.btn-close').addEventListener('click', () => this.hideModal());
        this.modal.querySelector('.btn-cancelar').addEventListener('click', () => this.hideModal());
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Eventos de seleção
        this.nivelSelect.addEventListener('change', () => this.updateCargoSuperiorOptions());
        this.cargoSuperiorSelect.addEventListener('change', () => this.validatePosicaoOptions());
    }

    showModal(cargoId = null) {
        this.modal.classList.add('active');
        this.form.reset();
        
        if (cargoId) {
            const cargo = this.cargos.find(c => c.id === cargoId);
            if (cargo) {
                this.form.querySelector('#titulo').value = cargo.titulo;
                this.form.querySelector('#nome').value = cargo.nome;
                this.form.querySelector('#email').value = cargo.email;
                this.form.querySelector('#nivel').value = cargo.nivel;
                this.form.querySelector('#descricao').value = cargo.descricao || '';
                
                if (cargo.cargoSuperior) {
                    this.updateCargoSuperiorOptions();
                    this.form.querySelector('#cargoSuperior').value = cargo.cargoSuperior;
                }
                
                this.form.dataset.cargoId = cargoId;
            }
        } else {
            this.updateCargoSuperiorOptions();
        }
    }

    hideModal() {
        this.modal.classList.remove('active');
        this.form.reset();
        delete this.form.dataset.cargoId;
    }

    updateCargoSuperiorOptions() {
        const nivel = parseInt(this.nivelSelect.value);
        const cargosSuperiores = this.cargos.filter(c => c.nivel < nivel);
        
        this.cargoSuperiorSelect.innerHTML = '<option value="">Selecione um cargo superior</option>';
        cargosSuperiores.forEach(cargo => {
            const option = document.createElement('option');
            option.value = cargo.id;
            option.textContent = cargo.titulo;
            this.cargoSuperiorSelect.appendChild(option);
        });
        
        this.validatePosicaoOptions();
    }

    validatePosicaoOptions() {
        const cargoSuperior = this.cargoSuperiorSelect.value;
        this.posicaoRadios.forEach(radio => {
            radio.disabled = !cargoSuperior;
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            titulo: this.form.querySelector('#titulo').value,
            nome: this.form.querySelector('#nome').value,
            email: this.form.querySelector('#email').value,
            nivel: parseInt(this.form.querySelector('#nivel').value),
            cargoSuperior: this.form.querySelector('#cargoSuperior').value || null,
            posicao: this.form.querySelector('input[name="posicao"]:checked').value,
            descricao: this.form.querySelector('#descricao').value
        };

        if (this.form.dataset.cargoId) {
            // Atualizar cargo existente
            const index = this.cargos.findIndex(c => c.id === this.form.dataset.cargoId);
            if (index !== -1) {
                this.cargos[index] = { ...this.cargos[index], ...formData };
            }
        } else {
            // Adicionar novo cargo
            formData.id = Date.now().toString();
            this.cargos.push(formData);
        }

        this.saveCargos();
        this.renderCargos();
        this.hideModal();
    }

    saveCargos() {
        localStorage.setItem('cargos', JSON.stringify(this.cargos));
    }

    buildHierarchy() {
        const hierarchy = {
            nivel1: [],
            nivel2: [],
            nivel3: [],
            nivel4: []
        };

        this.cargos.forEach(cargo => {
            switch (cargo.nivel) {
                case 1:
                    hierarchy.nivel1.push(cargo);
                    break;
                case 2:
                    hierarchy.nivel2.push(cargo);
                    break;
                case 3:
                    hierarchy.nivel3.push(cargo);
                    break;
                case 4:
                    hierarchy.nivel4.push(cargo);
                    break;
            }
        });

        return hierarchy;
    }

    createCargoElement(cargo) {
        const div = document.createElement('div');
        div.className = 'cargo';
        div.dataset.cargoId = cargo.id;
        div.dataset.nivel = cargo.nivel;
        div.dataset.descricao = cargo.descricao || 'Sem descrição';

        div.innerHTML = `
            <h3>${cargo.titulo}</h3>
            <p class="nome">${cargo.nome}</p>
            <p class="email">${cargo.email}</p>
            <div class="cargo-acoes">
                <button class="btn-editar" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-excluir" title="Excluir"><i class="fas fa-trash"></i></button>
            </div>
        `;

        div.querySelector('.btn-editar').addEventListener('click', () => this.showModal(cargo.id));
        div.querySelector('.btn-excluir').addEventListener('click', () => this.deleteCargo(cargo.id));

        return div;
    }

    renderCargos() {
        this.container.innerHTML = '';
        
        if (this.cargos.length === 0) {
            this.container.innerHTML = '<p class="cargo-vazio">Nenhum cargo cadastrado. Clique em "Adicionar Cargo" para começar.</p>';
            return;
        }

        const hierarchy = this.buildHierarchy();
        
        // Nível 1 (Diretoria)
        const nivel1 = document.createElement('div');
        nivel1.className = 'nivel-1';
        hierarchy.nivel1.forEach(cargo => {
            nivel1.appendChild(this.createCargoElement(cargo));
        });
        this.container.appendChild(nivel1);

        // Nível 2 (Gerência)
        const nivel2 = document.createElement('div');
        nivel2.className = 'nivel-2';
        hierarchy.nivel2.forEach(cargo => {
            nivel2.appendChild(this.createCargoElement(cargo));
        });
        this.container.appendChild(nivel2);

        // Nível 3 (Coordenação)
        const nivel3 = document.createElement('div');
        nivel3.className = 'nivel-3';
        hierarchy.nivel3.forEach(cargo => {
            nivel3.appendChild(this.createCargoElement(cargo));
        });
        this.container.appendChild(nivel3);

        // Nível 4 (Operacional)
        const nivel4 = document.createElement('div');
        nivel4.className = 'nivel-4';
        hierarchy.nivel4.forEach(cargo => {
            nivel4.appendChild(this.createCargoElement(cargo));
        });
        this.container.appendChild(nivel4);
    }

    deleteCargo(cargoId) {
        if (confirm('Tem certeza que deseja excluir este cargo?')) {
            this.cargos = this.cargos.filter(c => c.id !== cargoId);
            this.saveCargos();
            this.renderCargos();
        }
    }

    toggleEditMode() {
        this.container.classList.toggle('edit-mode');
        const btnEditar = document.getElementById('btnEditarOrganograma');
        btnEditar.classList.toggle('active');
    }
}

// Inicializar o gerenciador do organograma quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new OrganogramaManager();
}); 