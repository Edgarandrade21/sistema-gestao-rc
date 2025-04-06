from datetime import datetime
from database import db

class Categoria(db.Model):
    __tablename__ = 'categorias_documentos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    def __repr__(self):
        return f'<Categoria {self.nome}>'
    
    def to_dict(self):
        """Converte a categoria em um dicionário para API"""
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 