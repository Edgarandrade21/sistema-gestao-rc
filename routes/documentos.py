from flask import Blueprint, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from database import db
from models.documento import Documento
from models.categoria import Categoria

bp = Blueprint('documentos', __name__)

UPLOAD_FOLDER = 'uploads/documentos'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/api/documentos', methods=['GET'])
def listar_documentos():
    try:
        categoria_id = request.args.get('categoria_id')
        query = Documento.query
        
        if categoria_id:
            query = query.filter_by(categoria_id=categoria_id)
            
        documentos = query.order_by(Documento.data_upload.desc()).all()
        return jsonify([doc.to_dict() for doc in documentos])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/documentos', methods=['POST'])
def criar_documento():
    try:
        if 'arquivo' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        arquivo = request.files['arquivo']
        if arquivo.filename == '':
            return jsonify({'error': 'Nome do arquivo vazio'}), 400
        
        if not allowed_file(arquivo.filename):
            return jsonify({'error': 'Tipo de arquivo não permitido'}), 400

        filename = secure_filename(arquivo.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        novo_nome = f"{timestamp}_{filename}"
        
        # Criar diretório se não existir
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        
        caminho_arquivo = os.path.join(UPLOAD_FOLDER, novo_nome)
        arquivo.save(caminho_arquivo)
        
        novo_documento = Documento(
            titulo=request.form.get('titulo'),
            descricao=request.form.get('descricao'),
            categoria_id=request.form.get('categoria_id'),
            arquivo_nome=novo_nome,
            arquivo_path=caminho_arquivo,
            tipo_arquivo=arquivo.content_type,
            tamanho_arquivo=os.path.getsize(caminho_arquivo),
            usuario_upload=request.form.get('usuario_upload', 'sistema')
        )
        
        if request.form.get('data_vencimento'):
            novo_documento.data_vencimento = datetime.strptime(
                request.form.get('data_vencimento'),
                '%Y-%m-%d'
            ).date()
        
        db.session.add(novo_documento)
        db.session.commit()
        
        return jsonify(novo_documento.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/documentos/<int:id>', methods=['PUT'])
def atualizar_documento(id):
    try:
        documento = Documento.query.get_or_404(id)
        
        # Atualizar campos básicos
        documento.titulo = request.form.get('titulo', documento.titulo)
        documento.descricao = request.form.get('descricao', documento.descricao)
        documento.categoria_id = request.form.get('categoria_id', documento.categoria_id)
        
        if request.form.get('data_vencimento'):
            documento.data_vencimento = datetime.strptime(
                request.form.get('data_vencimento'),
                '%Y-%m-%d'
            ).date()
        
        # Atualizar arquivo se fornecido
        if 'arquivo' in request.files:
            arquivo = request.files['arquivo']
            if arquivo.filename != '' and allowed_file(arquivo.filename):
                # Excluir arquivo antigo
                if os.path.exists(documento.arquivo_path):
                    os.remove(documento.arquivo_path)
                
                # Salvar novo arquivo
                filename = secure_filename(arquivo.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                novo_nome = f"{timestamp}_{filename}"
                caminho_arquivo = os.path.join(UPLOAD_FOLDER, novo_nome)
                arquivo.save(caminho_arquivo)
                
                documento.arquivo_nome = novo_nome
                documento.arquivo_path = caminho_arquivo
                documento.tipo_arquivo = arquivo.content_type
                documento.tamanho_arquivo = os.path.getsize(caminho_arquivo)
        
        db.session.commit()
        return jsonify(documento.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/documentos/<int:id>', methods=['DELETE'])
def excluir_documento(id):
    try:
        documento = Documento.query.get_or_404(id)
        
        # Excluir arquivo físico
        if os.path.exists(documento.arquivo_path):
            os.remove(documento.arquivo_path)
        
        db.session.delete(documento)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/documentos/<int:id>/download')
def download_documento(id):
    try:
        documento = Documento.query.get_or_404(id)
        
        if not os.path.exists(documento.arquivo_path):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
            
        return send_file(
            documento.arquivo_path,
            as_attachment=True,
            download_name=documento.arquivo_nome.split('_', 1)[1]  # Remove o timestamp do nome
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/categorias', methods=['GET'])
def listar_categorias():
    try:
        categorias = Categoria.query.order_by(Categoria.nome).all()
        return jsonify([cat.to_dict() for cat in categorias])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/documentos/vencidos', methods=['GET'])
def listar_documentos_vencidos():
    try:
        hoje = datetime.now().date()
        documentos = Documento.query.filter(
            Documento.data_vencimento <= hoje,
            Documento.status == 'ativo'
        ).all()
        return jsonify([doc.to_dict() for doc in documentos])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/documentos/buscar', methods=['GET'])
def buscar_documentos():
    try:
        termo = request.args.get('termo', '')
        documentos = Documento.query.filter(
            db.or_(
                Documento.titulo.ilike(f'%{termo}%'),
                Documento.descricao.ilike(f'%{termo}%')
            )
        ).all()
        return jsonify([doc.to_dict() for doc in documentos])
    except Exception as e:
        return jsonify({'error': str(e)}), 500 