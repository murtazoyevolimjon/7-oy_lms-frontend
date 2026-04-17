import { Navigate, createBrowserRouter } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/login-page';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StudentLayout } from '@/components/layout/student-layout';
import { TeacherLayout } from '../components/layout/teacher-layout';
import DashboardPage from '@/features/dashboard/pages/dashboard-page';
import TeacherDashboardPage from '../features/teachers/pages/teacher-dashboard-page';
import TeacherProfilePage from '../features/teachers/pages/teacher-profile-page';
import TeacherGroupsPage from '@/features/teachers/pages/teacher-groups-page';
import StudentDashboardPage from '../features/student/pages/student-dashboard-page';
import StudentProfilePage from '@/features/student/pages/student-profile-page';
import StudentGroupsPage from '@/features/student/pages/student-groups-page';
import StudentGroupDetailsPage from '@/features/student/pages/student-group-details-page';
import TeacherGroupDetailsPage from '@/features/teachers/pages/teacher-group-details-page';
import StudentsPage from '@/features/students/pages/students-page';
import TeachersPage from '@/features/teachers/pages/teachers-page';
import GroupsPage from '@/features/groups/pages/groups-page';
import GroupDetailsPage from '@/features/groups/pages/group-details-page';
import CoursesPage from '@/features/management/pages/courses-page';
import RoomsPage from '@/features/management/pages/rooms-page';
import EmployeesPage from '@/features/management/pages/employees-page';
import HomeworkPage from '../features/homework/HomeworkPage';
import {
  GuestOnlyRoute,
  ProtectedRoute,
  RoleLandingRedirect,
  appRoles,
} from './route-guards';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RoleLandingRedirect />,
    },
    {
      path: '/login',
      element: (
        <GuestOnlyRoute>
          <LoginPage />
        </GuestOnlyRoute>
      ),
    },
    {
      path: '/admin',
      element: (
        <ProtectedRoute allowedRoles={appRoles.admin}>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'teachers', element: <TeachersPage /> },
        { path: 'students', element: <StudentsPage /> },
        { path: 'groups', element: <GroupsPage /> },
        { path: 'groups/:id', element: <GroupDetailsPage /> },
        { path: 'management/courses', element: <CoursesPage /> },
        { path: 'management/rooms', element: <RoomsPage /> },
        { path: 'management/employees', element: <EmployeesPage /> },
        { path: 'homework', element: <HomeworkPage /> },
      ],
    },
    {
      path: '/student',
      element: (
        <ProtectedRoute allowedRoles={[appRoles.student]}>
          <StudentLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <StudentDashboardPage /> },
        { path: 'groups', element: <StudentGroupsPage /> },
        { path: 'groups/:id', element: <StudentGroupDetailsPage /> },
        { path: 'profile', element: <StudentProfilePage /> },
        { path: 'settings', element: <Navigate to="/student/profile" replace /> },
        { path: 'homework', element: <HomeworkPage /> },
      ],
    },
    {
      path: '/teacher',
      element: (
        <ProtectedRoute allowedRoles={[appRoles.teacher]}>
          <TeacherLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'home', element: <TeacherDashboardPage /> },
        { path: 'profile', element: <TeacherProfilePage /> },
        { path: 'dashboard', element: <TeacherDashboardPage /> },
        { path: 'groups', element: <TeacherGroupsPage /> },
        { path: 'groups/:id', element: <TeacherGroupDetailsPage /> },
        { path: 'homework', element: <HomeworkPage /> },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);