import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { ArrowLeft, User, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '../contexts/AuthContext';
import { 
  getAvailableTimeSlots, 
  getUserDocument, 
  createAppointment, 
  updateTimeSlotBookingStatus 
} from '../lib/firestore';
import { Notification } from '../components/Notification';
import type { TimeSlot, Doctor, NotificationData } from '../types';

interface DoctorWithSlots extends Doctor {
  availableSlots: TimeSlot[];
}

export default function BookAppointment() {
  const [, navigate] = useLocation();
  const { user } = useAuthContext();
  const [doctorsWithSlots, setDoctorsWithSlots] = useState<DoctorWithSlots[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithSlots | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [notification, setNotification] = useState<NotificationData>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  const loadAvailableSlots = async () => {
    try {
      const slotsWithDoctorInfo = await getAvailableTimeSlots();
      
      // Group slots by doctor
      const doctorMap = new Map<string, DoctorWithSlots>();
      
      for (const slot of slotsWithDoctorInfo) {
        if (!doctorMap.has(slot.doctorId)) {
          const doctor = await getUserDocument(slot.doctorId) as Doctor;
          if (doctor) {
            doctorMap.set(slot.doctorId, {
              ...doctor,
              availableSlots: []
            });
          }
        }
        
        const doctorData = doctorMap.get(slot.doctorId);
        if (doctorData) {
          doctorData.availableSlots.push(slot);
        }
      }
      
      setDoctorsWithSlots(Array.from(doctorMap.values()));
    } catch (error) {
      console.error('Error loading available slots:', error);
      showNotification('Failed to load available appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: NotificationData['type']) => {
    setNotification({ show: true, message, type });
  };

  const selectDoctor = (doctor: DoctorWithSlots) => {
    setSelectedDoctor(doctor);
    setSelectedTimeSlot(null);
  };

  const selectTimeSlot = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
  };

  const bookAppointment = async () => {
    if (!selectedDoctor || !selectedTimeSlot || !user) return;

    setBooking(true);
    
    try {
      // Create appointment
      await createAppointment({
        doctorId: selectedDoctor.uid,
        patientId: user.uid,
        doctorName: selectedDoctor.name,
        patientName: user.name,
        patientAge: user.role === 'patient' ? (user as any).age : undefined,
        patientGender: user.role === 'patient' ? (user as any).gender : undefined,
        specialty: selectedDoctor.specialty,
        date: selectedTimeSlot.date,
        time: selectedTimeSlot.time,
        status: 'pending',
      });

      // Mark time slot as booked
      await updateTimeSlotBookingStatus(selectedTimeSlot.id, true);

      showNotification('Appointment booked successfully!', 'success');
      navigate('/patient/dashboard');
    } catch (error) {
      console.error('Error booking appointment:', error);
      showNotification('Failed to book appointment. Please try again.', 'error');
    } finally {
      setBooking(false);
    }
  };

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
              <div className="hidden md:block text-sm text-gray-500">Book Appointment</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/patient/dashboard">
            <Button variant="ghost" className="text-medical-blue hover:text-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Book an Appointment</h1>
        </div>
        
        {/* Doctor Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Select a Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            {doctorsWithSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No doctors with available slots found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctorsWithSlots.map((doctor) => (
                  <div
                    key={doctor.uid}
                    className={`border border-gray-200 rounded-lg p-4 hover:border-medical-blue cursor-pointer transition-colors ${
                      selectedDoctor?.uid === doctor.uid ? 'border-medical-blue bg-blue-50' : ''
                    }`}
                    onClick={() => selectDoctor(doctor)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        <p className="text-xs text-success">
                          {doctor.availableSlots.length} slots available
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Time Slot Selection */}
        {selectedDoctor && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Available Time Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {selectedDoctor.availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                    className={`px-4 py-3 h-auto flex flex-col ${
                      selectedTimeSlot?.id === slot.id 
                        ? 'bg-medical-blue hover:bg-blue-700' 
                        : 'hover:border-medical-blue'
                    }`}
                    onClick={() => selectTimeSlot(slot)}
                  >
                    <div className="flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">{slot.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{slot.time}</span>
                    </div>
                  </Button>
                ))}
              </div>
              
              {selectedTimeSlot && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Appointment Summary</h3>
                      <p className="text-sm text-gray-600">
                        {selectedDoctor.name} - {selectedTimeSlot.date} at {selectedTimeSlot.time}
                      </p>
                      <Badge className="mt-2">{selectedDoctor.specialty}</Badge>
                    </div>
                    <Button
                      onClick={bookAppointment}
                      disabled={booking}
                      className="bg-medical-blue hover:bg-blue-700"
                    >
                      {booking ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Booking...
                        </>
                      ) : (
                        'Book Appointment'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Notification
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
}
