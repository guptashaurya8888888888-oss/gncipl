export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
}

export interface Patient extends User {
  role: 'patient';
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  doctorId: string;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  specialty: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationData {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}
