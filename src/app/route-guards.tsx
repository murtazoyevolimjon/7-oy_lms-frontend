import { Navigate, useLocation } from 'react-router-dom';
import { authStore } from '@/features/auth/store/auth.store';
import type { ReactNode } from 'react';

const STUDENT_ROLE = 'STUDENT';
const TEACHER_ROLE = 'TEACHER';
const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'ADMINSTRATOR', 'MANAGEMENT'];

type Role = typeof STUDENT_ROLE | typeof TEACHER_ROLE | (typeof ADMIN_ROLES)[number] | string;

type ProtectedRouteProps = {
    allowedRoles: Role[];
    children: ReactNode;
};

const getDefaultRouteByRole = (role: string | null) => {
    if (!role) {
        return '/login';
    }

    if (role === STUDENT_ROLE) {
        return '/student/dashboard';
    }

    if (role === TEACHER_ROLE) {
        return '/teacher/dashboard';
    }

    return '/admin/dashboard';
};

export function RoleLandingRedirect() {
    const token = authStore.getToken();
    const role = authStore.getResolvedRole();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to={getDefaultRouteByRole(role)} replace />;
}

export function GuestOnlyRoute({ children }: { children: ReactNode }) {
    const token = authStore.getToken();
    const role = authStore.getResolvedRole();

    if (token) {
        return <Navigate to={getDefaultRouteByRole(role)} replace />;
    }

    return <>{children}</>;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const token = authStore.getToken();
    const role = authStore.getResolvedRole();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to={getDefaultRouteByRole(role)} replace />;
    }

    return <>{children}</>;
}

export const appRoles = {
    student: STUDENT_ROLE,
    teacher: TEACHER_ROLE,
    admin: ADMIN_ROLES,
};
