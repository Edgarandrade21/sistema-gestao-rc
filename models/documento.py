from datetime import datetime
from database import db

class Documento(db.Model):
    __tablename__ = 'documentos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias_documentos.id'))
    titulo = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    arquivo_nome = db.Column(db.String(255), nullable=False)
    arquivo_path = db.Column(db.String(255), nullable=False)
    tipo_arquivo = db.Column(db.String(100))
    tamanho_arquivo = db.Column(db.BigInteger)
    data_upload = db.Column(db.DateTime, default=datetime.now)
    data_vencimento = db.Column(db.Date)
    status = db.Column(db.Enum('ativo', 'vencido', 'arquivado'), default='ativo')
    usuario_upload = db.Column(db.String(100))
    
    # Relacionamentos
    categoria = db.relationship('Categoria', backref=db.backref('documentos', lazy=True))
    
    def __repr__(self):
        return f'<Documento {self.titulo}>'
    
    def to_dict(self):
        """Converte o documento em um dicionário para API"""
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'categoria_id': self.categoria_id,
            'arquivo_nome': self.arquivo_nome,
            'tipo_arquivo': self.tipo_arquivo,
            'tamanho_arquivo': self.tamanho_arquivo,
            'data_upload': self.data_upload.isoformat() if self.data_upload else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'status': self.status,
            'usuario_upload': self.usuario_upload
        } 