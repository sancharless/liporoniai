import React, { useState, useEffect } from 'react';
import { Briefcase, AlertCircle, CheckCircle, Tag } from 'lucide-react';
import { dbService } from '../services/db';

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    setServices(dbService.getServices());
  }, []);

  return (
    <div className="table-card glass-panel">
      <div className="view-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Produtos & Serviços</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lista de produtos, faixas de preços e regras comerciais que orientam o robô.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {services.map(service => (
          <div key={service.id} className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <Briefcase size={20} className="glow-text-blue" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{service.name}</h3>
            </div>

            <span className="badge badge-info" style={{ alignSelf: 'flex-start', marginBottom: '14px' }}>
              {service.category}
            </span>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
              {service.description}
            </p>

            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <p><strong>Benefícios:</strong> {service.benefits}</p>
              <p><strong>Tecnologia:</strong> {service.technicalInfo}</p>
              <p><strong>Prazo de Implantação:</strong> {service.estimatedDeliveryDays} dias úteis</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preço Comercial</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                {service.priceType === 'fixed' 
                  ? service.priceFixed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : `${service.priceMonthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês`
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
