import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uz: {
    translation: {
      search: "Qidirish...",
      hello: "Salom!",
      helloUser: "Salom, {{name}}!",
      welcome: "EduCoin platformasiga xush kelibsiz.",
      najotTitle: "Najot Talim",
      dashboardSubTitle: "Kunlik holat va muhim ko'rsatkichlar",
      activeStudents: "Faol talabalar",
      groups: "Guruhlar",
      frozen: "Muzlatilganlar",
      archived: "Arxivdagilar",
      monthlyPayments: "Joriy oy uchun to'lovlar",
      paymentsPaid: "To'langan",
      paymentsPending: "Kutilmoqda",
      paymentsDebt: "Qoldiq",
      lessonSchedule: "Dars jadvali",
      noLessonToday: "Bugun dars yo'q",
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
      helloUser: "Hello, {{name}}!",
      welcome: "Welcome to EduCoin platform.",
      najotTitle: "Najot Talim",
      dashboardSubTitle: "Daily status and key indicators",
      activeStudents: "Active students",
      groups: "Groups",
      frozen: "Frozen",
      archived: "Archived",
      monthlyPayments: "Payments for this month",
      paymentsPaid: "Paid",
      paymentsPending: "Pending",
      paymentsDebt: "Debt",
      lessonSchedule: "Lesson schedule",
      noLessonToday: "No lessons today",
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
      helloUser: "Привет, {{name}}!",
      welcome: "Добро пожаловать на платформу EduCoin.",
      najotTitle: "Najot Talim",
      dashboardSubTitle: "Ежедневный статус и ключевые показатели",
      activeStudents: "Активные студенты",
      groups: "Группы",
      frozen: "Замороженные",
      archived: "В архиве",
      monthlyPayments: "Платежи за текущий месяц",
      paymentsPaid: "Оплачено",
      paymentsPending: "Ожидается",
      paymentsDebt: "Остаток",
      lessonSchedule: "Расписание занятий",
      noLessonToday: "Сегодня занятий нет",
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