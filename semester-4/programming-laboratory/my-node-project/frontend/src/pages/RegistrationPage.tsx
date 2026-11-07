import React, { FormEvent, useState } from 'react';
import { api } from '../services/api';
import './RegistrationPage.css';

interface RegistrationForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialForm: RegistrationForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

/** Formulário de criação de conta; a confirmação da senha nunca é enviada. */
export const RegistrationPage: React.FC = () => {
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [validationError, setValidationError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setForm((current) => ({ ...current, [name]: value }));
    setValidationError('');
    setRequestError('');
    setIsSubmitted(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError('');
    setRequestError('');
    setIsSubmitted(false);

    if (!form.name.trim()) {
      setValidationError('Informe seu nome completo.');
      return;
    }

    if (form.password.length < 8) {
      setValidationError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setValidationError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.registerAccount({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setForm(initialForm);
      setIsSubmitted(true);
    } catch (error) {
      setRequestError(
        error instanceof TypeError
          ? 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'
          : error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="registration-page" aria-labelledby="registration-title">
      <div className="registration-card">
        <aside className="registration-intro">
          <div className="registration-mark" aria-hidden="true">
            R
          </div>
          <p className="registration-eyebrow">RESTÔSAAS</p>
          <h1>Seu restaurante, organizado em um só lugar.</h1>
          <p className="registration-intro-copy">
            Crie sua conta para começar a explorar as ferramentas de gestão do seu restaurante.
          </p>
          <ul className="registration-benefits">
            <li>Gestão simples e centralizada</li>
            <li>Cardápio e pedidos conectados</li>
            <li>Mais controle para sua equipe</li>
          </ul>
        </aside>

        <div className="registration-form-panel">
          <div className="registration-heading">
            <p className="registration-eyebrow">COMECE AGORA</p>
            <h2 id="registration-title">Criar sua conta</h2>
            <p>Preencha seus dados para fazer seu cadastro.</p>
          </div>

          {isSubmitted ? (
            <div className="registration-alert registration-alert--success" role="status">
              Cadastro enviado com sucesso.
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

          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="registration-field">
              <label htmlFor="registration-name">Nome completo</label>
              <input
                autoComplete="name"
                id="registration-name"
                name="name"
                onChange={updateField}
                placeholder="Como podemos chamar você?"
                required
                type="text"
                value={form.name}
              />
            </div>

            <div className="registration-field">
              <label htmlFor="registration-email">E-mail</label>
              <input
                autoComplete="email"
                id="registration-email"
                name="email"
                onChange={updateField}
                placeholder="voce@exemplo.com"
                required
                type="email"
                value={form.email}
              />
            </div>

            <div className="registration-field">
              <label htmlFor="registration-password">Senha</label>
              <input
                autoComplete="new-password"
                id="registration-password"
                minLength={8}
                name="password"
                onChange={updateField}
                placeholder="Pelo menos 8 caracteres"
                required
                type="password"
                value={form.password}
              />
              <span className="registration-hint">Use no mínimo 8 caracteres.</span>
            </div>

            <div className="registration-field">
              <label htmlFor="registration-confirm-password">Confirmar senha</label>
              <input
                autoComplete="new-password"
                id="registration-confirm-password"
                name="confirmPassword"
                onChange={updateField}
                placeholder="Digite a senha novamente"
                required
                type="password"
                value={form.confirmPassword}
              />
            </div>

            <button className="registration-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Enviando...' : 'Cadastrar'}
            </button>
            <p className="registration-privacy-note">
              A confirmação da senha é validada neste dispositivo e não é enviada à API.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
