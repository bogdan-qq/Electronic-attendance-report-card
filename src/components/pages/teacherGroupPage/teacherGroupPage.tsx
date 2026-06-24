// src/components/pages/teacherGroupPage/teacherGroupPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../../utils/auth';
import styles from './teacherGroupPage.module.scss';

interface Teacher {
  id: string;
  login: string;
  fullName: string;
  role: string;
}

interface Student {
  id: string;
  fullName: string;
  groupId: number;
}

interface Discipline {
  id: string;
  name: string;
  teacherId: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  disciplineId: string;
  date: string;
  grade: string;
  status: 'П' | 'Н';
}

interface StudentWithAttendance {
  student: Student;
  records: AttendanceRecord[];
}

const TeacherGroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<Teacher | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // ===== Календарь =====
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser(userData as Teacher);
    }

    // Загружаем данные группы
    const fetchGroupData = async () => {
      // Группы (заглушка)
      const groups = [
        { id: '1', name: 'ИС11' },
        { id: '2', name: 'ИС12' },
        { id: '3', name: 'ИС21' },
        { id: '4', name: 'ИС22' },
        { id: '5', name: 'ИС31' },
        { id: '6', name: 'ИС32' },
      ];
      const group = groups.find((g) => g.id === groupId);
      setGroupName(group?.name || 'Группа');

      // Студенты группы (заглушка)
      const allStudents: Student[] = [
        { id: '1', fullName: 'Иванов Иван Иванович', groupId: 3 },
        { id: '2', fullName: 'Петров Пётр Петрович', groupId: 3 },
        { id: '3', fullName: 'Сидоров Сидор Сидорович', groupId: 3 },
        { id: '4', fullName: 'Козлов Андрей Игоревич', groupId: 3 },
        { id: '5', fullName: 'Смирнов Алексей Владимирович', groupId: 3 },
        { id: '6', fullName: 'Иванова Елена Петровна', groupId: 3 },
        { id: '7', fullName: 'Петров Дмитрий Сергеевич', groupId: 3 },
        { id: '8', fullName: 'Сидорова Ольга Николаевна', groupId: 3 },
        { id: '9', fullName: 'Михайлова Мария Сергеевна', groupId: 3 },
        { id: '10', fullName: 'Николаев Павел Викторович', groupId: 3 },
      ];

      const groupStudents = allStudents.filter((s) => s.groupId === Number(groupId));

      // Дисциплины
      const allDisciplines: Discipline[] = [
        { id: '1', name: 'Математика', teacherId: '1' },
        { id: '2', name: 'Русский язык', teacherId: '2' },
        { id: '3', name: 'Информатика', teacherId: '3' },
        { id: '4', name: 'Физика', teacherId: '4' },
        { id: '5', name: 'Химия', teacherId: '5' },
        { id: '6', name: 'Биология', teacherId: '6' },
        { id: '7', name: 'История', teacherId: '7' },
        { id: '8', name: 'Английский язык', teacherId: '8' },
      ];
      setDisciplines(allDisciplines);
      setSelectedDiscipline(allDisciplines[0]?.id || '');

      // Посещаемость (заглушка)
      const allAttendance: AttendanceRecord[] = [
        { id: '1', studentId: '1', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
        { id: '2', studentId: '2', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
        { id: '3', studentId: '3', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
        { id: '4', studentId: '4', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
        { id: '5', studentId: '5', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
        { id: '6', studentId: '6', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
        { id: '7', studentId: '7', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
        { id: '8', studentId: '8', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
        { id: '9', studentId: '9', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
        { id: '10', studentId: '10', disciplineId: '1', date: '12.12.26', grade: '-', status: 'Н' },
      ];

      const grouped = groupStudents.map((student) => ({
        student,
        records: allAttendance.filter((r) => r.studentId === student.id),
      }));

      setStudents(grouped);
    };

    fetchGroupData();
  }, [groupId]);

  // ===== Календарь =====
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      let day: number | null = null;
      let isCurrentMonth = true;

      if (i < firstDay) {
        day = daysInPrevMonth - firstDay + i + 1;
        isCurrentMonth = false;
      } else if (i >= firstDay + daysInMonth) {
        day = i - (firstDay + daysInMonth) + 1;
        isCurrentMonth = false;
      } else {
        day = i - firstDay + 1;
        isCurrentMonth = true;
      }

      days.push({ day, isCurrentMonth });
    }

    return days;
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    if (day === null) return;
    setSelectedDay(day);
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formatted = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getFullYear()).slice(2)}`;
    setSelectedDate(formatted);
    setShowCalendar(false);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDay(today.getDate());
    const formatted = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getFullYear()).slice(2)}`;
    setSelectedDate(formatted);
    setShowCalendar(false);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/teacher');
  };

  const handleDisciplineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDiscipline(e.target.value);
  };

  const handleStatusChange = (studentId: string, newStatus: 'П' | 'Н') => {
    setStudents((prev) =>
      prev.map((item) => {
        if (item.student.id === studentId) {
          return {
            ...item,
            records: item.records.map((record) => ({
              ...record,
              status: newStatus,
            })),
          };
        }
        return item;
      })
    );
  };

  const handleStartPoll = () => {
    console.log('Начать опрос');
  };

  const handleDownloadReport = () => {
    console.log('Скачать отчет');
  };

  // Форматирование даты для отображения
  const today = new Date();
  const defaultDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getFullYear()).slice(2)}`;

  return (
    <div className={styles.groupPageContainer}>
      {/* Шапка */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Назад
          </button>
          <div className={styles.headerTitles}>
            <h1 className={styles.pageTitle}>Группа {groupName}</h1>
            <span className={styles.pageSubtitle}>Табель посещаемости</span>
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
        <div className={styles.contentWrapper}>
          {/* Фильтры */}
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <div className={styles.viewButtons}>
                <button
                  className={`${styles.viewButton} ${viewMode === 'daily' ? styles.active : ''}`}
                  onClick={() => setViewMode('daily')}
                >
                  Ежедневный
                </button>
                <button
                  className={`${styles.viewButton} ${viewMode === 'weekly' ? styles.active : ''}`}
                  onClick={() => setViewMode('weekly')}
                >
                  Еженедельный
                </button>
                <button
                  className={`${styles.viewButton} ${viewMode === 'monthly' ? styles.active : ''}`}
                  onClick={() => setViewMode('monthly')}
                >
                  Ежемесячный
                </button>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.datePickerWrapper}>
                <button
                  className={styles.dateButton}
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <span>{selectedDate || defaultDate}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {showCalendar && (
                  <div className={styles.calendarDropdown}>
                    <div className={styles.calendarHeader}>
                      <button onClick={prevMonth} className={styles.calendarNav}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <span className={styles.calendarMonth}>
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </span>
                      <button onClick={nextMonth} className={styles.calendarNav}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18L15 12L9 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>

                    <div className={styles.calendarGrid}>
                      {dayNames.map((day) => (
                        <div key={day} className={styles.calendarDayName}>{day}</div>
                      ))}
                      {getDaysInMonth(currentMonth).map((item, index) => (
                        <div
                          key={index}
                          className={`${styles.calendarDay} ${
                            !item.isCurrentMonth ? styles.calendarDayOther : ''
                          } ${
                            selectedDay === item.day && item.isCurrentMonth
                              ? styles.calendarDaySelected
                              : ''
                          }`}
                          onClick={() => item.isCurrentMonth && item.day && selectDate(item.day)}
                        >
                          {item.day}
                        </div>
                      ))}
                    </div>

                    <div className={styles.calendarActions}>
                      <button className={styles.calendarActionBack} onClick={prevMonth}>
                        Назад
                      </button>
                      <button className={styles.calendarActionSelect} onClick={goToToday}>
                        Выбрать
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <select
                className={styles.disciplineSelect}
                value={selectedDiscipline}
                onChange={handleDisciplineChange}
              >
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <button className={styles.startPollButton} onClick={handleStartPoll}>
                Начать опрос
              </button>
              <button className={styles.downloadReportButton} onClick={handleDownloadReport}>
                Скачать отчет Word
              </button>
            </div>
          </div>

          {/* Таблица */}
          <div className={styles.tableWrapper}>
            <table className={styles.attendanceTable}>
              <thead>
                <tr>
                  <th>№</th>
                  <th>ФИО</th>
                  <th>Оценка</th>
                  <th>Статус присутствия</th>
                </tr>
              </thead>
              <tbody>
                {students.map((item, index) => {
                  const record = item.records[0];
                  return (
                    <tr key={item.student.id}>
                      <td>{index + 1}</td>
                      <td>{item.student.fullName}</td>
                      <td>{record?.grade || '-'}</td>
                      <td>
                        <select
                          className={styles.statusSelect}
                          value={record?.status || 'Н'}
                          onChange={(e) =>
                            handleStatusChange(item.student.id, e.target.value as 'П' | 'Н')
                          }
                        >
                          <option value="П">П</option>
                          <option value="Н">Н</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherGroupPage;