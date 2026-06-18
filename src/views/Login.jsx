import React, { useState } from 'react';
import { Crosshair, Mail, Lock, AlertCircle, Shield } from 'lucide-react';
import { authService } from '../services/auth';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Por favor, preencha todos os campos.'); return; }
    setLoading(true); setError('');
    try {
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { setForgotError('Por favor, informe seu e-mail.'); return; }
    setForgotError(''); setForgotSuccess('');
    try {
      const res = await authService.recoverPassword(forgotEmail);
      setForgotSuccess(res.message);
    } catch (err) {
      setForgotError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      {/* TACTICAL BACKGROUND LAYERS */}
      <div className="login-bg" />
      <div className="login-bg-overlay" />
      <div className="login-bg-grid" />

      {/* Corner tactical decorations */}
      <div className="login-corner tl" />
      <div className="login-corner tr" />
      <div className="login-corner bl" />
      <div className="login-corner br" />

      {/* Ambient glow orbs */}
      <div className="login-glow-1" />
      <div className="login-glow-2" />

      {/* Animated scan line on left side */}
      <div style={{
        position: 'fixed',
        left: '60px',
        top: 0,
        bottom: 0,
        width: '1px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(255,149,0,0.15) 50%, transparent 100%)',
        zIndex: 3,
        animation: 'scanLine 8s linear infinite',
      }} />

      {/* Tactical info panel — left side (only visible on wide screens) */}
      <div style={{
        position: 'fixed',
        left: '100px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        maxWidth: '320px',
        animation: 'fadeInUp 0.8s ease 0.3s both',
      }} className="login-side-info">
        <div>
          <div style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            color: 'rgba(255,149,0,0.5)',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            // SYS.STATUS — ONLINE
          </div>
          <h1 style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '2.4rem',
            fontWeight: '900',
            color: '#fff',
            lineHeight: 1.1,
            letterSpacing: '0.05em',
          }}>
            TACT<br />
            <span style={{ color: 'var(--primary)', textShadow: '0 0 20px rgba(255,149,0,0.5)' }}>IMPORT</span>
          </h1>
          <div style={{
            marginTop: '14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.7,
          }}>
            Plataforma de Gestão Comercial<br />
            Airsoft & Equipamentos Táticos
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'AmmoBox', desc: 'BBs Premium' },
            { label: 'BLS Perfect BB', desc: 'Alto Desempenho' },
            { label: 'FEDERATY', desc: 'Equipamentos Táticos' },
            { label: 'FEASSO', desc: 'Tecnologia' },
          ].map(brand => (
            <div key={brand.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              background: 'rgba(255,149,0,0.04)',
              border: '1px solid rgba(255,149,0,0.1)',
              borderRadius: '6px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>
                {brand.label}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{brand.desc}</span>
            </div>
          ))}
        </div>

        <div style={{
          fontSize: '0.68rem',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.08em',
          fontFamily: 'Orbitron, monospace',
        }}>
          TACT IMPORT © 2026 — TACTICAL GRADE
        </div>
      </div>

      {/* LOGIN CARD */}
      <div className="login-card glass-panel" style={{ marginLeft: 'auto', marginRight: '10%' }}>

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Crosshair className="glow-pulse" size={34} />
          </div>
          <h2>TACT</h2>
          <div className="login-divider" />
          <p className="login-tagline">Gestão Comercial — Airsoft & Táticos</p>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label htmlFor="email">Usuário / E-mail</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={17} />
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="operador@tactimport.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha de Acesso</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={17} />
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-actions">
            <span className="forgot-password" onClick={() => setShowForgotModal(true)}>
              Esqueci minha senha
            </span>
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ borderTopColor: '#080b10' }} />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <Shield size={17} />
                <span>Acessar Sistema</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer-text">
          Acesso restrito — <span>TACT Import</span> — Sistema interno
        </div>
      </div>

      {/* MODAL RECUPERAR SENHA */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <h3>Recuperar Acesso</h3>
            </div>
            <div className="modal-body">
              <p>Informe seu e-mail cadastrado para receber as instruções de redefinição de senha.</p>
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                <div className="form-group">
                  <label>E-mail</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={17} />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="operador@tactimport.com.br"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>
                {forgotError && (
                  <div className="error-message-box">
                    <AlertCircle size={15} />
                    <span>{forgotError}</span>
                  </div>
                )}
                {forgotSuccess && (
                  <div className="badge badge-success" style={{ display: 'flex', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>
                    {forgotSuccess}
                  </div>
                )}
                <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '4px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowForgotModal(false); setForgotEmail(''); setForgotSuccess(''); setForgotError(''); }}>
                    Fechar
                  </button>
                  <button type="submit" className="btn btn-primary">Enviar Link</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
