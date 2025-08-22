import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { ArrowLeft, Plus, Trash2, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '../contexts/AuthContext';
import { 
  subscribeToDoctorTimeSlots, 
  createTimeSlot, 
  deleteTimeSlot 
} from '../lib/firestore';
import { Notification } from '../components/Notification';
import type { TimeSlot, NotificationData } from '../types';

export default function ManageAvailability() {
  const [, navigate] = useLocation();
  const { user } = useAuthContext();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationData>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToDoctorTimeSlots(user.uid, (slots) => {
      setTimeSlots(slots);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setNewSlot(prev => ({ ...prev, date: prev.date || today }));
  }, []);

  const showNotification = (message: string, type: NotificationData['type']) => {
    setNotification({ show: true, message, type });
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSlot.date || !newSlot.time || !user) return;

    setAdding(true);
    
    try {
      await createTimeSlot({
        date: newSlot.date,
        time: newSlot.time,
        doctorId: user.uid,
        isBooked: false,
      });

      setNewSlot({ date: '', time: '' });
      showNotification('Available slot added successfully', 'success');
    } catch (error) {
      console.error('Error adding slot:', error);
      showNotification('Failed to add slot', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    setDeleting(slotId);
    
    try {
      await deleteTimeSlot(slotId);
      showNotification('Slot removed successfully', 'success');
    } catch (error) {
      console.error('Error removing slot:', error);
      showNotification('Failed to remove slot', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
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
              <div className="hidden md:block text-sm text-gray-500">Manage Availability</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/doctor/dashboard">
            <Button variant="ghost" className="text-medical-blue hover:text-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Manage Availability</h1>
        </div>
        
        {/* Add New Slot */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add Available Slot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSlot.date}
                  min={getTodayDate()}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full bg-success hover:bg-green-700"
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slot
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Current Available Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Your Available Slots</CardTitle>
          </CardHeader>
          <CardContent>
            {timeSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No available slots set</p>
                <p className="text-sm text-gray-400">Add your first available slot to start receiving appointment requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{slot.date}</span>
                      </div>
                      {!slot.isBooked && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSlot(slot.id)}
                          disabled={deleting === slot.id}
                          className="text-danger hover:text-red-700 hover:bg-red-50 p-2 h-auto"
                        >
                          {deleting === slot.id ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{slot.time}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {slot.isBooked ? (
                        <>
                          <XCircle className="w-4 h-4 text-danger" />
                          <Badge variant="destructive" className="text-xs">Booked</Badge>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          <Badge className="text-xs bg-green-100 text-green-800">Available</Badge>
                        </>
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
