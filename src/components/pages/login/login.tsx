// src/components/pages/login/login.tsx

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, generateToken } from '../../../services/authService';
import { setAuth } from '../../../utils/auth';
import styles from './login.module.scss';

export const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authenticateUser(login, password);

      if (!user) {
        setError('Неверный логин или пароль');
        return;
      }

      setAuth(user, generateToken());
      navigate(user.role === 'student' ? '/student' : '/teacher');
    } catch {
      setError('Не удалось подключиться к серверу. Запустите npm run api');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.logo}></div>
          <h1 className={styles.title}>Контроль посещаемости</h1>
          <p className={styles.subtitle}>Войдите в систему для отметки или просмотра табелей</p>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="login">Логин</label>
            <input
              type="text"
              id="login"
              className={styles.inputField}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.errorWrapper}>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Войти'}
          </button>

          <div className={styles.testHint}>
            <p>Тестовые данные:</p>
            <p>Преподаватель: login: teacher, password: teacher123</p>
            <p>Студент: login: student1, password: student123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;