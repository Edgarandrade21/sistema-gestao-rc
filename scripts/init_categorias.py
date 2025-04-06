from database import db
from models.categoria import Categoria

def init_categorias():
    """Inicializa as categorias padrão no banco de dados."""
    categorias_padrao = [
        {
            'nome': 'Documentos Veiculares',
            'descricao': 'Documentos relacionados à frota de veículos'
        },
        {
            'nome': 'Documentos Funcionários',
            'descricao': 'Documentos relacionados aos funcionários'
        },
        {
            'nome': 'Contratos',
            'descricao': 'Contratos diversos da empresa'
        },
        {
            'nome': 'Certificações',
            'descricao': 'Certificados e licenças'
        },
        {
            'nome': 'Políticas e Procedimentos',
            'descricao': 'Documentos de políticas internas'
        },
        {
            'nome': 'Documentos Fiscais',
            'descricao': 'Documentos fiscais e contábeis'
        }
    ]
    
    for cat_data in categorias_padrao:
        # Verifica se a categoria já existe
        if not Categoria.query.filter_by(nome=cat_data['nome']).first():
            categoria = Categoria(**cat_data)
            db.session.add(categoria)
    
    try:
        db.session.commit()
        print("Categorias padrão inicializadas com sucesso!")
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao inicializar categorias: {str(e)}")

if __name__ == '__main__':
    init_categorias() 