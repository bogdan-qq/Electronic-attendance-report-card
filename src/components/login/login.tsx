import React from "react";
import "./Login.css";

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <form className="login-form">
          {/* Логотип */}
          <div className="logo"></div>

          {/* Заголовок */}
          <h1 className="title">Контроль посещаемости</h1>

          {/* Подзаголовок */}
          <p className="subtitle">Войдите в систему для отметки или просмотра табелей</p>

          {/* Поле Логин */}
          <div className="input-group">
            <label className="input-label">Логин</label>
            <input type="text" className="input-field" />
          </div>

          {/* Поле Пароль */}
          <div className="input-group">
            <label className="input-label">Пароль</label>
            <input type="password" className="input-field" />
          </div>

          {/* Кнопка */}
          <button type="submit" className="login-button">
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;