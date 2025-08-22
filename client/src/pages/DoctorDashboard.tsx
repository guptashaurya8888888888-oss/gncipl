import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Calendar, Clock, Users, Settings, CheckCircle, XCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '../contexts/AuthContext';
import { subscribeToDoctorAppointments, updateAppointmentStatus } from '../lib/firestore';
import { Notification } from '../components/Notification';
import type { Appointment, NotificationData } from '../types';

export default function DoctorDashboard() {
  const { user, logout } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationData>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToDoctorAppointments(user.uid, (newAppointments) => {
      setAppointments(newAppointments);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const showNotification = (message: string, type: NotificationData['type']) => {
    setNotification({ show: true, message, type });
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    setUpdating(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, status);
      showNotification(`Appointment ${status} successfully`, 'success');
    } catch (error) {
      console.error('Error updating appointment:', error);
      showNotification('Failed to update appointment', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadgeClass = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const todaysAppointments = appointments.filter(
    apt => apt.date === new Date().toISOString().split('T')[0] && apt.status === 'confirmed'
  ).length;

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

  const thisWeekAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return appointmentDate >= today && appointmentDate <= weekFromNow && apt.status === 'confirmed';
  }).length;

  const totalPatients = new Set(appointments.map(apt => apt.patientId)).size;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-medical-blue">DocCare</div>
              <div className="hidden md:block text-sm text-gray-500">Doctor Dashboard</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <Button variant="ghost" onClick={logout} className="text-sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <Link href="/manage-availability">
            <Button className="bg-success hover:bg-green-700">
              <Settings className="w-4 h-4 mr-2" />
              Manage Availability
            </Button>
          </Link>
        </div>
        
        {/* Doctor Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{todaysAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-medical-blue" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-warning">{pendingAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{thisWeekAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Appointment Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Appointment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No appointments found</p>
                <Link href="/manage-availability">
                  <Button className="bg-success hover:bg-green-700">
                    Set Your Availability
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-600">
                          Age: {appointment.patientAge} | Gender: {appointment.patientGender}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-success hover:bg-green-700"
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                            disabled={updating === appointment.id}
                          >
                            {updating === appointment.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Confirm
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'declined')}
                            disabled={updating === appointment.id}
                          >
                            {updating === appointment.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Badge className={getStatusBadgeClass(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Notification
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
}
