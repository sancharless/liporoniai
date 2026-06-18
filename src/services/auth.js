// Serviço de Autenticação simulado para o Liporoni

import { dbService } from './db';

const SESSION_KEY = 'liporoni_session';

export const authService = {
  // Realizar login
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      // Simula tempo de resposta do servidor
      setTimeout(() => {
        const users = dbService.getUsers();
        const user = users.find(u => u.email === email.trim().toLowerCase());

        if (!user) {
          reject(new Error('E-mail não cadastrado. Contate o administrador.'));
          return;
        }

        // Validação de senhas simulada
        // admin@liporoni.com.br -> admin123
        // gestor@liporoni.com.br -> gestor123
        // vendedor@liporoni.com.br -> vendedor123
        const rolePrefix = email.split('@')[0];
        const expectedPassword = `${rolePrefix}123`;

        if (password !== expectedPassword) {
          reject(new Error('Senha incorreta. Verifique suas credenciais.'));
          return;
        }

        // Sucesso: salvar sessão
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        resolve(user);
      }, 800);
    });
  },

  // Realizar logout
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // Obter usuário logado atual
  getCurrentUser: () => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: () => {
    return localStorage.getItem(SESSION_KEY) !== null;
  },

  // Recuperação de senha simulada
  recoverPassword: (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = dbService.getUsers();
        const user = users.find(u => u.email === email.trim().toLowerCase());

        if (!user) {
          reject(new Error('E-mail não encontrado em nossa base de usuários.'));
        } else {
          resolve({
            message: `Um e-mail de redefinição de senha foi enviado para ${email}. Verifique sua caixa de entrada.`
          });
        }
      }, 1000);
    });
  }
};
