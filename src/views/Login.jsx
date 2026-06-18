import React, { useState } from 'react';
import { MessageCircle, Mail, Lock, AlertCircle } from 'lucide-react';
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
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

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
    if (!forgotEmail) {
      setForgotError('Por favor, informe seu e-mail.');
      return;
    }

    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await authService.recoverPassword(forgotEmail);
      setForgotSuccess(res.message);
    } catch (err) {
      setForgotError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glow-1"></div>
      <div className="login-glow-2"></div>

      <div className="login-card glass-panel">
        <div className="login-logo">
          <div className="login-logo-icon">
            <MessageCircle className="glow-pulse" size={36} />
          </div>
          <h2>Liporoni</h2>
          <p className="login-tagline">Agente Comercial Inteligente WhatsApp</p>
        </div>

        {error && (
          <div className="error-message-box">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail Comercial</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                id="email" 
                className="form-control"
                placeholder="exemplo@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha de Acesso</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
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
                <span className="spinner"></span>
                <span>Entrando...</span>
              </>
            ) : (
              'Entrar no Painel'
            )}
          </button>
        </form>
      </div>

      {/* MODAL ESQUECI MINHA SENHA */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <h3>Recuperar Acesso</h3>
            </div>
            <div className="modal-body">
              <p>Insira seu e-mail de acesso cadastrado para receber instruções de redefinição de senha.</p>
              
              <form onSubmit={handleForgotSubmit} style={{ marginTop: '15px' }}>
                <div className="form-group">
                  <label>E-mail</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input 
                      type="email" 
                      className="form-control"
                      placeholder="seu-email@empresa.com.br"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>

                {forgotError && (
                  <div className="error-message-box" style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <AlertCircle size={16} />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="badge badge-success" style={{ display: 'flex', width: '100%', padding: '10px', marginTop: '10px', marginBottom: '10px', borderRadius: '8px' }}>
                    {forgotSuccess}
                  </div>
                )}

                <div className="modal-footer" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail('');
                    setForgotSuccess('');
                    setForgotError('');
                  }}>
                    Fechar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Enviar Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
