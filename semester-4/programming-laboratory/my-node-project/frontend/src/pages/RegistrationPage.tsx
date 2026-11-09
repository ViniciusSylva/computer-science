import React, { FormEvent, useState } from 'react';
import { api } from '../services/api';
import { authStorage } from '../services/authStorage';
import type { AuthSession } from '../types';
import './RegistrationPage.css';
import './AdminClientsPage.css';

interface RegistrationForm {
  name: string;
  restaurantName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface LoginForm {
  email: string;
  password: string;
}

const initialRegistrationForm: RegistrationForm = {
  name: '',
  restaurantName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const initialLoginForm: LoginForm = {
  email: '',
  password: '',
};

interface RegistrationPageProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onLoginSuccess }) => {
  // Modo atual: 'register' (criar conta) ou 'login' (já tenho conta)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');

  const [registerForm, setRegisterForm] = useState<RegistrationForm>(initialRegistrationForm);
  const [loginForm, setLoginForm] = useState<LoginForm>(initialLoginForm);

  const [validationError, setValidationError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setRegisterForm((current) => ({ ...current, [name]: value }));
    setValidationError('');
    setRequestError('');
    setIsSubmitted(false);
  };

  const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setLoginForm((current) => ({ ...current, [name]: value }));
    setValidationError('');
    setRequestError('');
  };

  // Submit do Cadastro
  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError('');
    setRequestError('');
    setIsSubmitted(false);

    if (!registerForm.name.trim()) {
      setValidationError('Informe seu nome completo.');
      return;
    }

    if (!registerForm.restaurantName.trim()) {
      setValidationError('Informe o nome do seu restaurante.');
      return;
    }

    if (!registerForm.phone.trim()) {
      setValidationError('Informe o telefone ou WhatsApp do restaurante.');
      return;
    }

    if (registerForm.password.length < 8) {
      setValidationError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setValidationError('As senhas não coincidem.');
      return;
    }

    if (
      authStorage
        .getClients()
        .some((client) => client.email.toLowerCase() === registerForm.email.trim().toLowerCase())
    ) {
      setValidationError('Já existe uma conta cadastrada com este e-mail.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Tenta API backend se disponível
      try {
        await api.registerAccount({
          name: registerForm.name.trim(),
          restaurantName: registerForm.restaurantName.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
        });
      } catch {
        // Se a rota do backend não estiver ativa, salva localmente no LocalStorage
      }

      await authStorage.setPassword(registerForm.email, registerForm.password);

      // O período de teste começa quando a administração aprovar o cadastro.
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 30);

      authStorage.addClient({
        name: registerForm.name.trim(),
        restaurantName: registerForm.restaurantName.trim(),
        email: registerForm.email.trim(),
        phone: registerForm.phone.trim(),
        status: 'PENDING',
        expirationDate: expiration.toISOString().split('T')[0],
        plan: 'TRIAL',
      });

      setIsSubmitted(true);
      setRegisterForm(initialRegistrationForm);
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit do Login
  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError('');
    setRequestError('');

    const email = loginForm.email.trim().toLowerCase();
    const password = loginForm.password;

    if (email === 'admin@restosaas.com') {
      if (password === 'admin123') {
        const session: AuthSession = {
          role: 'MASTER_ADMIN',
          user: {
            id: 'master-admin',
            name: 'Administrador',
            email: email,
          },
        };
        authStorage.setSession(session);
        onLoginSuccess(session);
        return;
      } else {
        setValidationError('E-mail ou senha do administrador inválidos.');
        return;
      }
    }

    // Login Dono de Restaurante (Cliente)
    const clients = authStorage.getClients();
    const found = clients.find((c) => c.email.toLowerCase() === email);

    if (!found) {
      setValidationError('Restaurante não encontrado. Verifique o e-mail ou cadastre-se na aba ao lado.');
      return;
    }

    if (found.status === 'PENDING') {
      setRequestError('Seu cadastro está aguardando aprovação do administrador.');
      return;
    }

    if (found.status === 'BLOCKED') {
      setRequestError('Sua conta está bloqueada. Entre em contato com o administrador.');
      return;
    }

    try {
      if (!authStorage.hasPassword(email)) {
        setRequestError('A senha desta conta ainda não foi configurada. Peça ao administrador para defini-la.');
        return;
      }
      if (!(await authStorage.verifyPassword(email, password))) {
        setValidationError('Senha incorreta.');
        return;
      }
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : 'Não foi possível validar a senha desta conta.'
      );
      return;
    }

    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 10);
    if (found.status !== 'ACTIVE' || found.expirationDate < today) {
      setRequestError(
        `Seu prazo de assinatura expirou em ${found.expirationDate}. Entre em contato com o administrador para estender seu acesso.`
      );
      return;
    }

    const session: AuthSession = {
      role: 'RESTAURANT_OWNER',
      user: {
        id: found.id,
        name: found.name,
        restaurantName: found.restaurantName,
        email: found.email,
        status: found.status,
        expirationDate: found.expirationDate,
      },
    };
    authStorage.setSession(session);
    onLoginSuccess(session);
  };

  return (
    <section className="registration-page" aria-labelledby="auth-title">
      <div className="registration-card">
        {/* Lado Esquerdo Institucional */}
        <aside className="registration-intro">
          <div className="registration-mark" aria-hidden="true">
            🍔
          </div>
          <p className="registration-eyebrow">GESTÃO DO RESTAURANTE</p>
          <h1>Seu restaurante, organizado em um só lugar</h1>
          <p className="registration-intro-copy">
            Acompanhe os pedidos, organize o salão e mantenha a cozinha em sintonia com o atendimento.
          </p>
          <ul className="registration-feature-list">
            <li>
              <span aria-hidden="true">🍽️</span>
              <span><strong>Cardápio digital</strong><small>Receba pedidos diretamente das mesas.</small></span>
            </li>
            <li>
              <span aria-hidden="true">🍳</span>
              <span><strong>Painel da cozinha</strong><small>Acompanhe cada pedido enquanto é preparado.</small></span>
            </li>
            <li>
              <span aria-hidden="true">🪑</span>
              <span><strong>Gestão de mesas</strong><small>Controle lugares e disponibilidade do salão.</small></span>
            </li>
          </ul>
          <div className="registration-intro-note">
            Entre na sua conta para continuar ou cadastre seu restaurante para começar.
          </div>
        </aside>

        {/* Lado Direito - Painel de Formulário */}
        <div className="registration-form-panel">
          {/* Seletor entre Cadastrar e Já Tenho Conta */}
          <div className="auth-mode-switch">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setValidationError('');
                setRequestError('');
              }}
              className={`auth-mode-btn ${authMode === 'login' ? 'auth-mode-btn--active' : ''}`}
            >
              Já tenho conta (Entrar)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setValidationError('');
                setRequestError('');
              }}
              className={`auth-mode-btn ${authMode === 'register' ? 'auth-mode-btn--active' : ''}`}
            >
              Cadastrar restaurante
            </button>
          </div>

          <div className="registration-heading">
            <h2 id="auth-title">
              {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
            </h2>
          </div>

          {/* Feedback Alerts */}
          {isSubmitted ? (
            <div className="registration-alert registration-alert--success" role="status">
              Cadastro enviado. Aguarde a aprovação do administrador para acessar sua conta.
            </div>
          ) : null}

          {validationError ? (
            <div className="registration-alert registration-alert--error" role="alert">
              {validationError}
            </div>
          ) : null}

          {requestError ? (
            <div className="registration-alert registration-alert--error" role="alert">
              {requestError}
            </div>
          ) : null}

          {/* FORMULÁRIO DE LOGIN */}
          {authMode === 'login' && (
            <div>
              <form
                className="registration-form"
                onSubmit={(event) => {
                  void handleLoginSubmit(event);
                }}
              >
                <div className="registration-field">
                  <label htmlFor="login-email">E-mail</label>
                  <input
                    autoComplete="email"
                    id="login-email"
                    name="email"
                    onChange={handleLoginChange}
                    placeholder="dono@restaurante.com"
                    required
                    type="email"
                    value={loginForm.email}
                  />
                </div>

                <div className="registration-field">
                  <label htmlFor="login-password">Senha</label>
                  <input
                    autoComplete="current-password"
                    id="login-password"
                    name="password"
                    onChange={handleLoginChange}
                    placeholder="Sua senha de acesso"
                    required
                    type="password"
                    value={loginForm.password}
                  />
                </div>

                <button className="registration-submit" type="submit">
                  Entrar
                </button>
              </form>
            </div>
          )}

          {/* FORMULÁRIO DE CADASTRO */}
          {authMode === 'register' && (
            <form className="registration-form" onSubmit={handleRegisterSubmit}>
              <div className="registration-field">
                <label htmlFor="registration-rest-name">Nome do Restaurante</label>
                <input
                  id="registration-rest-name"
                  name="restaurantName"
                  onChange={handleRegisterChange}
                  placeholder="Ex: Cantina do Lago"
                  required
                  type="text"
                  value={registerForm.restaurantName}
                />
              </div>

              <div className="registration-field">
                <label htmlFor="registration-name">Seu Nome Completo</label>
                <input
                  autoComplete="name"
                  id="registration-name"
                  name="name"
                  onChange={handleRegisterChange}
                  placeholder="Como podemos chamar você?"
                  required
                  type="text"
                  value={registerForm.name}
                />
              </div>

              <div className="registration-field">
                <label htmlFor="registration-email">E-mail Comercial</label>
                <input
                  autoComplete="email"
                  id="registration-email"
                  name="email"
                  onChange={handleRegisterChange}
                  placeholder="voce@seurestaurante.com"
                  required
                  type="email"
                  value={registerForm.email}
                />
              </div>

              <div className="registration-field">
                <label htmlFor="registration-phone">Telefone / WhatsApp</label>
                <input
                  autoComplete="tel"
                  id="registration-phone"
                  name="phone"
                  onChange={handleRegisterChange}
                  placeholder="(00) 00000-0000"
                  required
                  type="tel"
                  value={registerForm.phone}
                />
              </div>

              <div className="registration-field">
                <label htmlFor="registration-password">Senha</label>
                <input
                  autoComplete="new-password"
                  id="registration-password"
                  minLength={8}
                  name="password"
                  onChange={handleRegisterChange}
                  placeholder="Pelo menos 8 caracteres"
                  required
                  type="password"
                  value={registerForm.password}
                />
              </div>

              <div className="registration-field">
                <label htmlFor="registration-confirm-password">Confirmar Senha</label>
                <input
                  autoComplete="new-password"
                  id="registration-confirm-password"
                  name="confirmPassword"
                  onChange={handleRegisterChange}
                  placeholder="Digite a senha novamente"
                  required
                  type="password"
                  value={registerForm.confirmPassword}
                />
              </div>

              <button className="registration-submit" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Cadastrando...' : 'Criar Conta Grátis'}
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
};
