
import React, { useState, useContext } from 'react';
import Modal from '../components/Modal';
import { AuthContext } from '../App';
import { Event, AudienceType } from '../types';

interface StudentDashboardProps {
    events: Event[];
}

const EventCard: React.FC<{ event: Event, onRegister: () => void, onFeedback: () => void, isRegistered: boolean, isPast: boolean }> = ({ event, onRegister, onFeedback, isRegistered, isPast }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
        <div>
            <h3 className="text-xl font-bold text-primary-800">{event.title}</h3>
            <p className="text-gray-500 text-sm">{event.date.toLocaleString()}</p>
            <p className="text-gray-600 mt-2 text-sm">Hosted by: {event.creatorName}</p>
            <p className="text-gray-700 mt-2">{event.description}</p>
        </div>
        <div className="mt-4">
            {isPast ? (
                <button onClick={onFeedback} className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Give Feedback</button>
            ) : isRegistered ? (
                <button disabled className="w-full bg-green-500 text-white px-4 py-2 rounded-md cursor-not-allowed">Registered</button>
            ) : (
                <button onClick={onRegister} className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Register</button>
            )}
        </div>
    </div>
);

const StudentDashboard: React.FC<StudentDashboardProps> = ({ events }) => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const handleRegister = (eventId: string) => {
        setRegisteredEvents(prev => new Set(prev).add(eventId));
    };
    
    const handleFeedback = (event: Event) => {
        setSelectedEvent(event);
        setFeedbackModalOpen(true);
    };

    const now = new Date();
    const upcomingEvents = events.filter(e => e.date > now);
    const pastEvents = events.filter(e => e.date <= now);
    
    // Filter events based on user's department and class
    const relevantEvents = upcomingEvents.filter(event => {
        const aud = event.targetAudience;
        if (aud.type === AudienceType.GENERAL) return true;
        if (aud.type === AudienceType.DEPARTMENT && aud.value === user?.department) return true;
        if (aud.type === AudienceType.CLASS && aud.value === user?.class) return true;
        return false;
    });

    const relevantPastEvents = pastEvents.filter(event => {
        const aud = event.targetAudience;
        if (aud.type === AudienceType.GENERAL) return true;
        if (aud.type === AudienceType.DEPARTMENT && aud.value === user?.department) return true;
        if (aud.type === AudienceType.CLASS && aud.value === user?.class) return true;
        return false;
    });

    return (
        <>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Events</h1>
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => setActiveTab('upcoming')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'upcoming' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Upcoming Events
                            </button>
                            <button onClick={() => setActiveTab('past')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'past' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Past Events
                            </button>
                        </nav>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'upcoming' && relevantEvents.map(event => (
                            <EventCard 
                                key={event.id} 
                                event={event}
                                onRegister={() => handleRegister(event.id)}
                                onFeedback={() => handleFeedback(event)}
                                isRegistered={registeredEvents.has(event.id)}
                                isPast={false}
                            />
                        ))}
                         {activeTab === 'past' && relevantPastEvents.map(event => (
                            <EventCard 
                                key={event.id} 
                                event={event}
                                onRegister={() => {}}
                                onFeedback={() => handleFeedback(event)}
                                isRegistered={false}
                                isPast={true}
                            />
                        ))}
                    </div>
                     {((activeTab === 'upcoming' && relevantEvents.length === 0) || (activeTab === 'past' && relevantPastEvents.length === 0)) && (
                         <div className="text-center py-12 bg-white rounded-lg shadow col-span-full">
                            <h3 className="text-lg font-medium text-gray-900">No events to show</h3>
                            <p className="mt-1 text-sm text-gray-500">There are no {activeTab} events available for you at this time.</p>
                        </div>
                    )}
                </div>
            </main>
            <Modal isOpen={isFeedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} title={`Feedback for ${selectedEvent?.title}`}>
                <FeedbackForm />
            </Modal>
        </>
    );
};

const FeedbackForm: React.FC = () => (
     <form className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
            <input type="number" min="1" max="5" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
        </div>
         <div>
            <label className="block text-sm font-medium text-gray-700">Comment</label>
            <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
        </div>
         <div className="flex justify-end">
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Submit Feedback</button>
        </div>
    </form>
);

export default StudentDashboard;
