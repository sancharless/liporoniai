import React, { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle2, XCircle, Clock, Link, ExternalLink, ShieldCheck } from 'lucide-react';
import { dbService } from '../services/db';
import { authService } from '../services/auth';

export default function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadProposals();
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const loadProposals = () => {
    setProposals(dbService.getProposals());
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Aceita': return 'badge-success';
      case 'Enviada': return 'badge-primary';
      case 'Visualizada': return 'badge-warning';
      case 'Recusada': return 'badge-danger';
      case 'Em ajuste': return 'badge-warning';
      case 'Rascunho': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  };

  const handleCopyLink = (prop) => {
    if (prop.status === 'Rascunho') {
      alert('Esta proposta está salva como Rascunho. Aprove-a antes de obter o link público.');
      return;
    }
    const publicUrl = `${window.location.origin}${window.location.pathname}#/proposta/${prop.id}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopiedId(prop.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleOpenLink = (prop) => {
    const publicUrl = `${window.location.origin}${window.location.pathname}#/proposta/${prop.id}`;
    window.open(publicUrl, '_blank');
  };

  const handleApproveDraft = (prop) => {
    const updated = {
      ...prop,
      status: 'Enviada',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    };
    dbService.saveProposal(updated);

    // Also update contact status
    const contacts = dbService.getContacts();
    const contact = contacts.find(c => c.id === prop.contactId);
    if (contact) {
      contact.status = 'Proposta enviada';
      contact.lastContact = new Date().toISOString();
      dbService.saveContact(contact);
    }

    // Add notification
    const db = dbService.getDB();
    db.notifications.push({
      id: 'not_' + Date.now(),
      type: 'scoring',
      title: 'Rascunho Aprovado',
      message: `A proposta nº ${prop.proposalNumber} para ${prop.clientCompany} foi aprovada pelo gestor e liberada para envio.`,
      timestamp: new Date().toISOString(),
      read: false
    });
    dbService.saveDB(db);

    alert(`Proposta nº ${prop.proposalNumber} aprovada com sucesso! O link público já está disponível.`);
    loadProposals();
  };

  const isManagerOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');

  return (
    <div className="table-card glass-panel">
      <div className="view-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Propostas Comerciais</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Propostas geradas automaticamente pelo robô ou revisadas por humanos.</p>
        </div>
      </div>

      <div className="contacts-table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Empresa Contratante</th>
              <th>Contato</th>
              <th>Valor Total</th>
              <th>Data de Emissão</th>
              <th>Validade</th>
              <th>Status</th>
              <th>Visualizações</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Nenhuma proposta gerada ainda.
                </td>
              </tr>
            ) : (
              proposals.map(prop => (
                <tr key={prop.id}>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <FileText size={16} className="glow-text-blue" />
                      <span style={{ fontWeight: 600 }}>{prop.proposalNumber}</span>
                    </div>
                  </td>
                  <td>{prop.clientCompany}</td>
                  <td>{prop.clientContactName}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {prop.valueTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    {prop.discount > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#f87171', marginLeft: '6px' }}>
                        (desc: R$ {prop.discount.toLocaleString('pt-BR')})
                      </span>
                    )}
                  </td>
                  <td>{new Date(prop.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>{new Date(prop.validUntil).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(prop.status)}`}>
                      {prop.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Eye size={14} className="icon-info" />
                      <span>{prop.viewCount || 0} visualizações</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                      {prop.status === 'Rascunho' ? (
                        isManagerOrAdmin ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}
                            onClick={() => handleApproveDraft(prop)}
                            title="Aprovar Rascunho"
                          >
                            <ShieldCheck size={14} />
                            <span>Aprovar</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aguardando Aprovação</span>
                        )
                      ) : (
                        <>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '6px', minWidth: '95px' }}
                            onClick={() => handleCopyLink(prop)}
                            title="Copiar link da proposta"
                          >
                            <Link size={14} />
                            <span>{copiedId === prop.id ? 'Copiado!' : 'Copiar Link'}</span>
                          </button>
                          
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                            onClick={() => handleOpenLink(prop)}
                            title="Visualizar proposta do cliente"
                          >
                            <ExternalLink size={14} />
                            <span>Visualizar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
