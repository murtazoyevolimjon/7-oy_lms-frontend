import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uz: {
    translation: {
      search: "Qidirish...",
      hello: "Salom!",
      welcome: "EduCoin platformasiga xush kelibsiz.",
      activeStudents: "Faol talabalar",
      groups: "Guruhlar",
      frozen: "Muzlatilganlar",
      archived: "Arxivdagilar",
      teachers: "O'qituvchilar",
      students: "Talabalar",
      dashboard: "Asosiy",
      managementCourses: "Boshqarish / Kurslar",
      managementRooms: "Boshqarish / Xonalar",
      managementEmployees: "Boshqarish / Xodimlar",
      dashboardHint: "Dashboard chart, payments va qo'shimcha statistikalarni shu yerga ulaysiz.",
    }
  },
  en: {
    translation: {
      search: "Search...",
      hello: "Hello!",
      welcome: "Welcome to EduCoin platform.",
      activeStudents: "Active students",
      groups: "Groups",
      frozen: "Frozen",
      archived: "Archived",
      teachers: "Teachers",
      students: "Students",
      dashboard: "Dashboard",
      managementCourses: "Management / Courses",
      managementRooms: "Management / Rooms",
      managementEmployees: "Management / Employees",
      dashboardHint: "You can connect dashboard charts, payments and more statistics here.",
    }
  },
  ru: {
    translation: {
      search: "Поиск...",
      hello: "Привет!",
      welcome: "Добро пожаловать на платформу EduCoin.",
      activeStudents: "Активные студенты",
      groups: "Группы",
      frozen: "Замороженные",
      archived: "В архиве",
      teachers: "Учителя",
      students: "Студенты",
      dashboard: "Главная",
      managementCourses: "Управление / Курсы",
      managementRooms: "Управление / Комнаты",
      managementEmployees: "Управление / Сотрудники",
      dashboardHint: "Здесь можно подключить графики, платежи и дополнительную статистику.",
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'uz',
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
});

export default i18n;