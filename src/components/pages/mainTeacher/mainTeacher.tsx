// src/components/pages/mainTeacher/mainTeacher.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../../utils/auth';
import styles from './mainTeacher.module.scss';

interface Teacher {
  id: string;
  login: string;
  fullName: string;
  role: string;
}

interface Group {
  id: string;
  name: string;
  studentCount: number;
}

const MainTeacher: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Teacher | null>(null);
  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'ИС11', studentCount: 25 },
    { id: '2', name: 'ИС12', studentCount: 25 },
    { id: '3', name: 'ИС21', studentCount: 25 },
    { id: '4', name: 'ИС22', studentCount: 25 },
    { id: '5', name: 'ИС31', studentCount: 25 },
    { id: '6', name: 'ИС32', studentCount: 25 },
  ]);

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser(userData as Teacher);
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleOpenGroup = (groupId: string) => {
    navigate(`/teacher/group/${groupId}`);
  };

  return (
    <div className={styles.teacherContainer}>
      {/* Шапка */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}></div>
          <div className={styles.headerTitles}>
            <h1 className={styles.pageTitle}>Посещаемость</h1>
            <span className={styles.pageSubtitle}>Мои группы</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.fullName || 'Преподаватель'}</span>
            <span className={styles.userRole}>Преподаватель</span>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Выход
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>Группы</h2>
          <span className={styles.contentSubtitle}>
            Выберите группу для просмотра и редактирования табелей посещаемости
          </span>
        </div>

        <div className={styles.groupsGrid}>
          {groups.map((group) => (
            <div key={group.id} className={styles.groupCard}>
              <div className={styles.groupNameWrapper}>
                <span className={styles.groupName}>{group.name}</span>
              </div>
              <span className={styles.studentCount}>Студентов: {group.studentCount}</span>
              <button
                className={styles.openButton}
                onClick={() => handleOpenGroup(group.id)}
              >
                Открыть табель
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MainTeacher;