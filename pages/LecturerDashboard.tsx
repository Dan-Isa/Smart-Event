
import React, { useState, useContext } from 'react';
import Modal from '../components/Modal';
import { AuthContext } from '../App';
import { Event, AudienceType, Registration } from '../types';
import EventForm from '../components/EventForm';

interface LecturerDashboardProps {
    events: Event[];
    addEvent: (event: Omit<Event, 'id' | 'registrations' | 'feedback'>) => void;
    deleteEvent: (eventId: string) => void;
}

const EventCard: React.FC<{ event: Event, onManage: () => void, onViewRegistrations: () => void, onDelete: () => void }> = ({ event, onManage, onViewRegistrations, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-primary-800">{event.title}</h3>
            <p className="text-gray-500 text-sm">{event.date.toLocaleString()}</p>
            <p className="text-gray-700 mt-2">{event.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">{event.registrations.length} Registered</span>
            <div className="space-x-3">
                <button onClick={onViewRegistrations} className="text-sm text-primary-600 hover:underline">View Registrations</button>
                <button onClick={onManage} className="text-sm text-gray-600 hover:underline">Edit</button>
                 <button onClick={onDelete} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
        </div>
    </div>
);

const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ events, addEvent, deleteEvent }) => {
    const { user } = useContext(AuthContext);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isRegistrationsModalOpen, setRegistrationsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const handleViewRegistrations = (event: Event) => {
        setSelectedEvent(event);
        setRegistrationsModalOpen(true);
    };

    const handleCreateEvent = (eventData: Omit<Event, 'id' | 'registrations' | 'feedback'>) => {
        addEvent(eventData);
        setCreateModalOpen(false);
    };

    const myEvents = events.filter(event => event.creatorId === user?.uid);
    
    return (
        <>
             <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
                        <button onClick={() => setCreateModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 shadow-sm">
                            Create New Event
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myEvents.map(event => (
                            <EventCard 
                                key={event.id} 
                                event={event} 
                                onManage={() => { /* Open edit modal */ }}
                                onViewRegistrations={() => handleViewRegistrations(event)}
                                onDelete={() => deleteEvent(event.id)}
                            />
                        ))}
                    </div>
                    {myEvents.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                            <p className="mt-1 text-sm text-gray-500">Click "Create New Event" to get started.</p>
                        </div>
                    )}
                </div>
            </main>
            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Event">
                <EventForm onSubmit={handleCreateEvent} onClose={() => setCreateModalOpen(false)} />
            </Modal>
            <Modal isOpen={isRegistrationsModalOpen} onClose={() => setRegistrationsModalOpen(false)} title={`Registrations for ${selectedEvent?.title}`}>
                <RegisteredStudentsList registrations={selectedEvent?.registrations || []} />
            </Modal>
        </>
    );
};


const RegisteredStudentsList: React.FC<{ registrations: Registration[] }> = ({ registrations }) => (
    <div className="max-h-96 overflow-y-auto">
        {registrations.length === 0 ? <p>No students have registered yet.</p> : (
            <ul className="divide-y divide-gray-200">
                {registrations.map(reg => (
                    <li key={reg.studentId} className="py-3">
                        <p className="font-semibold text-gray-800">{reg.studentName}</p>
                        <p className="text-sm text-gray-500">{reg.studentEmail}</p>
                    </li>
                ))}
            </ul>
        )}
    </div>
);


export default LecturerDashboard;
