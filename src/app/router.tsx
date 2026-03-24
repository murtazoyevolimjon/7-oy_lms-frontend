import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/login-page';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import DashboardPage from '@/features/dashboard/pages/dashboard-page';
import StudentsPage from '@/features/students/pages/students-page';
import TeachersPage from '@/features/teachers/pages/teachers-page';
import GroupsPage from '@/features/groups/pages/groups-page';
import GroupDetailsPage from '@/features/groups/pages/group-details-page';
import CoursesPage from '@/features/management/pages/courses-page';
import RoomsPage from '@/features/management/pages/rooms-page';
import EmployeesPage from '@/features/management/pages/employees-page';

export const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'teachers', element: <TeachersPage /> },
        { path: 'students', element: <StudentsPage /> },
        { path: 'groups', element: <GroupsPage /> },
        { path: 'groups/:id', element: <GroupDetailsPage /> },
        { path: 'management/courses', element: <CoursesPage /> },
        { path: 'management/rooms', element: <RoomsPage /> },
        { path: 'management/employees', element: <EmployeesPage /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);