import React, { useState, useEffect } from 'react';
import { Database, Plus, Search, Trash2, CheckCircle2, FileText, HelpCircle, X, Save } from 'lucide-react';
import { dbService } from '../services/db';

export default function Knowledge() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Geral');
  const [content, setContent] = useState('');
  const [type, setType] = useState('text'); // text or faq

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    setArticles(dbService.getKnowledgeBase());
  };

  const handleAddArticle = (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Título e Conteúdo são obrigatórios.');
      return;
    }

    const newArticle = {
      title,
      category,
      content,
      type,
      status: 'Treinado'
    };

    dbService.saveKnowledgeArticle(newArticle);
    loadArticles();
    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Geral');
    setContent('');
    setType('text');
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta informação da Base de Conhecimento?')) {
      dbService.deleteKnowledgeArticle(id);
      loadArticles();
    }
  };

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(search.toLowerCase()) ||
    art.content.toLowerCase().includes(search.toLowerCase()) ||
    art.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="table-card glass-panel">
      <div className="view-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Base de Conhecimento da Empresa</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adicione dados institucionais, regras de cancelamento e FAQs para treinar as respostas do Liporoni.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Adicionar Informação</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="table-filters" style={{ marginBottom: '24px' }}>
        <div className="search-bar" style={{ width: '300px' }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Pesquisar FAQs, manuais, regras..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* ARTICLES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredArticles.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Nenhuma informação encontrada na base de conhecimento.
          </div>
        ) : (
          filteredArticles.map(art => (
            <div key={art.id} className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', height: '220px' }}>
              <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'flex-start', marginBottom: '12px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {art.type === 'faq' ? (
                    <HelpCircle size={18} style={{ color: 'var(--primary)' }} />
                  ) : (
                    <FileText size={18} style={{ color: 'var(--info)' }} />
                  )}
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={art.title}>
                    {art.title}
                  </h3>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{art.category}</span>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, overflowY: 'auto', flex: 1, paddingRight: '4px', marginBottom: '14px' }}>
                {art.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--success)' }}>
                  <CheckCircle2 size={12} />
                  <span>Treinado (Ativo)</span>
                </div>
                <button 
                  onClick={() => handleDelete(art.id)}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                  title="Excluir informação"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD ARTICLE MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '500px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Adicionar Informação de Treinamento</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddArticle}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Título / Pergunta Comercial *</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Ex: Qual o prazo de reembolso?" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Categoria</label>
                    <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Financeiro, Implantação, etc." value={category} onChange={e => setCategory(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Documento</label>
                    <select className="filter-select" style={{ width: '100%' }} value={type} onChange={e => setType(e.target.value)}>
                      <option value="text">Artigo / Manual Comercial</option>
                      <option value="faq">FAQ / Relação Dúvida-Resposta</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Conteúdo / Resposta da IA *</label>
                  <textarea 
                    className="form-control" 
                    style={{ paddingLeft: '14px', height: '120px', resize: 'vertical', fontSize: '0.8rem', lineHeight: '1.4' }}
                    placeholder="Escreva a resposta que o Liporoni deve dar ao cliente baseado nesta regra..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={14} /> Salvar & Treinar IA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
