
import React, { useState, useContext } from 'react';
import { Event, AudienceType, UserRole } from '../types';
import { AuthContext } from '../App';

interface EventFormProps {
    event?: Event | null;
    onSubmit: (event: Omit<Event, 'id' | 'registrations' | 'feedback'>) => void;
    onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onClose }) => {
    const { user } = useContext(AuthContext);
    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [date, setDate] = useState(event?.date ? event.date.toISOString().split('T')[0] : '');
    const [time, setTime] = useState(event?.date ? event.date.toTimeString().substring(0, 5) : '');
    const [location, setLocation] = useState(event?.location || '');
    const [audienceType, setAudienceType] = useState<AudienceType>(event?.targetAudience.type || AudienceType.GENERAL);
    const [audienceValue, setAudienceValue] = useState(event?.targetAudience.value || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        const combinedDate = new Date(`${date}T${time}`);

        onSubmit({
            title,
            description,
            date: combinedDate,
            location,
            creatorId: user.uid,
            creatorName: user.username || user.email,
            institution: user.institution,
            targetAudience: {
                type: audienceType,
                value: audienceType === AudienceType.GENERAL ? undefined : audienceValue,
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
                <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                    <input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>
             <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                 <select value={audienceType} onChange={e => setAudienceType(e.target.value as AudienceType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                    <option value={AudienceType.GENERAL}>General (Everyone)</option>
                    <option value={AudienceType.DEPARTMENT}>Department</option>
                    <option value={AudienceType.CLASS}>Class</option>
                </select>
            </div>
            {audienceType !== AudienceType.GENERAL && (
                 <div>
                    <label htmlFor="audienceValue" className="block text-sm font-medium text-gray-700">{audienceType === AudienceType.DEPARTMENT ? 'Department Name' : 'Class Name'}</label>
                    <input id="audienceValue" type="text" value={audienceValue} onChange={e => setAudienceValue(e.target.value)} required placeholder={audienceType === AudienceType.DEPARTMENT ? 'e.g., Computer Science' : 'e.g., CS101'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Save Event</button>
            </div>
        </form>
    );
};

export default EventForm;
