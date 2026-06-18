import React, { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { dbService } from '../services/db';

export default function Proposals() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    setProposals(dbService.getProposals());
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Aceita': return 'badge-success';
      case 'Enviada': return 'badge-primary';
      case 'Visualizada': return 'badge-warning';
      case 'Recusada': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

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
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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
                        (desc: R$ {prop.discount})
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
                      <span>{prop.viewCount} visualizações</span>
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
