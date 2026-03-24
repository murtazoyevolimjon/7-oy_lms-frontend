export type Option = { id: string; name: string };

export type Student = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  birthDate: string;
  createdAt: string;
  coin: number;
  groupName?: string | null;
  avatar?: string | null;
};

export type Teacher = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  birthDate: string;
  createdAt: string;
  coin: number;
  groupName?: string | null;
  avatar?: string | null;
};

export type Course = {
  id: string;
  name: string;
  description?: string;
  lessonDurationMinutes: number;
  courseDurationMonths: number;
  price: number;
  archived?: boolean;
};

export type Room = {
  id: string;
  name: string;
  capacity: number;
};

export type Employee = {
  id: string;
  fullName: string;
  role: string;
  phone: string;
  email: string;
  birthDate: string;
  createdAt: string;
  coin: number;
};

export type Group = {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  courseName: string;
  lessonDurationMinutes: number;
  lessonTime: string;
  roomName?: string | null;
  teacherName?: string | null;
  studentsCount: number;
};

export type GroupDetails = {
  id: string;
  name: string;
  courseName: string;
  price: number;
  lessonDays: string[];
  lessonTime: string;
  startDate: string;
  endDate: string;
  teachers: Teacher[];
  students: Student[];
};

export type AttendanceStatus = 'present' | 'absent' | 'unknown';

export type AttendanceItem = {
  studentId: string;
  date: string;
  status: AttendanceStatus;
};

export type Homework = {
  id: string;
  topic: string;
  lessonDate: string;
  assignedAt: string;
  deadline: string;
};

export type Video = {
  id: string;
  fileName: string;
  lessonName: string;
  lessonDate: string;
  size: number;
  status: 'processing' | 'ready';
  createdAt: string;
  url?: string;
};
