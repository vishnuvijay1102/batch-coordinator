import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Classroom {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  course: string;
  paymentStatus: 'Paid' | 'Not Paid' | 'Partially Paid';
  promiseDate?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface Batch {
  id: string;
  code: string;
  title: string;
  trainer: string;
  classroomId: string;
  startTime: string;
  endTime: string;
  day: string;
  startDate: string;
  type: 'Weekday' | 'Weekend';
  status: 'Active' | 'Demo' | 'Future' | 'Closed';
}

export interface Teacher {
  id: string;
  name: string;
  handling: string; // What they are handling
}

export interface MockDetail {
  id: string;
  classroomId: string;
  trainer: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'viewer';
}

interface AppContextType {
  classrooms: Classroom[];
  batches: Batch[];
  teachers: Teacher[];
  students: Student[];
  courses: Course[];
  users: UserAccount[];
  userRole: 'admin' | 'viewer' | null;
  currentUser: UserAccount | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<UserAccount, 'id'>) => void;
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: 'admin' | 'viewer') => void;
  addClassroom: (name: string) => void;
  deleteClassroom: (id: string) => void;
  updateBatch: (batchId: string, updates: Partial<Batch>) => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  closeBatch: (id: string) => void;
  deleteBatch: (id: string) => void;
  addTeacher: (name: string, handling: string) => void;
  deleteTeacher: (id: string) => void;
  updateTeacher: (id: string, name: string, handling: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  deleteStudent: (id: string) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  addCourse: (name: string, code: string) => void;
  deleteCourse: (id: string) => void;
  updateCourse: (id: string, name: string, code: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  editBatchId: string | null;
  setEditBatchId: (id: string | null) => void;
  mockDetails: MockDetail[];
  addMockDetail: (mock: Omit<MockDetail, 'id'>) => void;
  deleteMockDetail: (id: string) => void;
  updateMockDetail: (id: string, updates: Partial<MockDetail>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<'admin' | 'viewer' | null>(() => {
    return localStorage.getItem('userRole') as any;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mockDetails, setMockDetails] = useState<MockDetail[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, cl, b, t, s, co, m] = await Promise.all([
          fetch('/api/users').then(r => r.ok ? r.json() : []),
          fetch('/api/classrooms').then(r => r.ok ? r.json() : []),
          fetch('/api/batches').then(r => r.ok ? r.json() : []),
          fetch('/api/teachers').then(r => r.ok ? r.json() : []),
          fetch('/api/students').then(r => r.ok ? r.json() : []),
          fetch('/api/courses').then(r => r.ok ? r.json() : []),
          fetch('/api/mock-details').then(r => r.ok ? r.json() : [])
        ]);
        
        setUsers(Array.isArray(u) ? u : []);
        setClassrooms(Array.isArray(cl) ? cl : []);
        setBatches(Array.isArray(b) ? b : []);
        setTeachers(Array.isArray(t) ? t : []);
        setStudents(Array.isArray(s) ? s : []);
        setCourses(Array.isArray(co) ? co : []);
        setMockDetails(Array.isArray(m) ? m : []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const login = (username: string, password: string) => {
    if (!users || !Array.isArray(users)) {
      console.error('Login failed: users list is not available yet.');
      return false;
    }
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setUserRole(user.role);
      setCurrentUser(user);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserRole(null);
    setCurrentUser(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  };

  const addUser = async (userData: Omit<UserAccount, 'id'>) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const newUser = await res.json();
    setUsers([...users, newUser]);
  };

  const deleteUser = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.id !== id));
  };

  const updateUserRole = async (id: string, role: 'admin' | 'viewer') => {
    const res = await fetch(`/api/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const updatedUser = await res.json();
    setUsers(users.map(u => u.id === id ? updatedUser : u));
  };

  const addClassroom = async (name: string) => {
    const res = await fetch('/api/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const newRoom = await res.json();
    setClassrooms([...classrooms, newRoom]);
  };

  const deleteClassroom = async (id: string) => {
    await fetch(`/api/classrooms/${id}`, { method: 'DELETE' });
    setClassrooms(classrooms.filter(r => r.id !== id));
    setBatches(batches.filter(b => b.classroomId !== id));
  };

  const updateBatch = async (batchId: string, updates: Partial<Batch>) => {
    const res = await fetch(`/api/batches/${batchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updatedBatch = await res.json();
    setBatches(batches.map(b => b.id === batchId ? { ...b, ...updatedBatch } : b));
  };

  const addBatch = async (batch: Omit<Batch, 'id'>) => {
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch)
    });
    const newBatch = await res.json();
    setBatches([...batches, newBatch]);
  };

  const closeBatch = async (id: string) => {
    const res = await fetch(`/api/batches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Closed' })
    });
    const updatedBatch = await res.json();
    setBatches(batches.map(b => b.id === id ? updatedBatch : b));
  };

  const deleteBatch = async (id: string) => {
    await fetch(`/api/batches/${id}`, { method: 'DELETE' });
    setBatches(batches.filter(b => b.id !== id));
  };

  const addTeacher = async (name: string, handling: string) => {
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, handling })
    });
    const newTeacher = await res.json();
    setTeachers([...teachers, newTeacher]);
  };

  const deleteTeacher = async (id: string) => {
    await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const updateTeacher = async (id: string, name: string, handling: string) => {
    const res = await fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, handling })
    });
    const updatedTeacher = await res.json();
    setTeachers(teachers.map(t => t.id === id ? updatedTeacher : t));
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    const newStudent = await res.json();
    setStudents([...students, newStudent]);
  };

  const deleteStudent = async (id: string) => {
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    setStudents(students.filter(s => s.id !== id));
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updatedStudent = await res.json();
    setStudents(students.map(s => s.id === id ? { ...s, ...updatedStudent } : s));
  };

  const addCourse = async (name: string, code: string) => {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code })
    });
    const newCourse = await res.json();
    setCourses([...courses, newCourse]);
  };

  const deleteCourse = async (id: string) => {
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = async (id: string, name: string, code: string) => {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code })
    });
    const updatedCourse = await res.json();
    setCourses(courses.map(c => c.id === id ? updatedCourse : c));
  };

  const [activeTab, setActiveTab] = useState('Home');
  const [editBatchId, setEditBatchId] = useState<string | null>(null);

  const addMockDetail = async (mock: Omit<MockDetail, 'id'>) => {
    try {
      const res = await fetch('/api/mock-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mock)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.details || 'Failed to save mock detail');
      }
      
      const newMock = await res.json();
      setMockDetails([...mockDetails, newMock]);
    } catch (err) {
      console.error('Add Mock Detail failed:', err);
      // You could add a toast notification here
      alert(`Error: ${err instanceof Error ? err.message : 'Could not save to database'}`);
    }
  };

  const deleteMockDetail = async (id: string) => {
    await fetch(`/api/mock-details/${id}`, { method: 'DELETE' });
    setMockDetails(mockDetails.filter(m => m.id !== id));
  };

  const updateMockDetail = async (id: string, updates: Partial<MockDetail>) => {
    const res = await fetch(`/api/mock-details/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updatedMock = await res.json();
    setMockDetails(mockDetails.map(m => m.id === id ? { ...m, ...updatedMock } : m));
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AppContext.Provider value={{ 
      classrooms, 
      batches, 
      teachers,
      students,
      courses,
      users,
      userRole,
      currentUser,
      login,
      logout,
      addUser,
      deleteUser,
      updateUserRole,
      addClassroom, 
      deleteClassroom, 
      updateBatch, 
      addBatch, 
      closeBatch,
      deleteBatch,
      addTeacher,
      deleteTeacher,
      updateTeacher,
      addStudent,
      deleteStudent,
      updateStudent,
      addCourse,
      deleteCourse,
      updateCourse,
      activeTab,
      setActiveTab,
      editBatchId,
      setEditBatchId,
      mockDetails,
      addMockDetail,
      deleteMockDetail,
      updateMockDetail
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
