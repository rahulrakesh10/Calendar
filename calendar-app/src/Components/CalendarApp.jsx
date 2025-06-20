import { useState, useMemo, useEffect, useRef } from "react";
import AssignmentChat from './AssignmentChat';

const CalendarApp = () => {
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const currentDate = new Date();
const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
const [currentYear, SetCurrentYear] = useState(currentDate.getFullYear());
const [selectedDate, setSelectedDate] = useState(currentDate);
const [showEventPopup, setShowEventPopup] = useState(false);
const [events, setEvents] = useState([]);
const [formData, setFormData] = useState({
  title: "",
  hours: "",
  minutes: "",
  ampm: "AM",
  text: "",
  desc: ""
});
const [editMode, setEditMode] = useState(false);
const [editingEventId, setEditingEventId] = useState(null);
const [expandedEventId, setExpandedEventId] = useState(null);
const [showChat, setShowChat] = useState(false);
const [filteredDate, setFilteredDate] = useState(null);
const [fabOpen, setFabOpen] = useState(false);
const fabRef = useRef();

const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
}, [events]);

const displayedEvents = useMemo(() => {
    if (!filteredDate) return sortedEvents;
    return sortedEvents.filter(event => new Date(event.date).toDateString() === new Date(filteredDate).toDateString());
}, [sortedEvents, filteredDate]);

const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

const prevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    SetCurrentYear((prevYear) => (currentMonth === 0 ? prevYear - 1 : prevYear));
}
const nextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    SetCurrentYear((prevYear) => (currentMonth === 11 ? prevYear + 1 : prevYear));
    
}

const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(clickedDate);
    setFilteredDate(clickedDate);
}

const showAllEvents = () => {
    setFilteredDate(null);
    setSelectedDate(null);
    setExpandedEventId(null);
}

const openAddEventPopup = () => {
    // If no date is selected, default to today for the popup
    if (!selectedDate) {
        setSelectedDate(new Date());
    }
    setShowEventPopup(true);
    setEditMode(false);
    setEditingEventId(null);
    setFormData({ title: "", hours: "", minutes: "", ampm: "AM", text: "", desc: "" });
}

const handleInputChange = (field, value) => {
    if (field === 'title' && value.length > 20) return;
    if (field === 'desc' && value.length > 60) return;
    setFormData(prev => ({
        ...prev,
        [field]: value
    }));
}

const addEvent = () => {
    if (!formData.title.trim() || !formData.hours || !formData.minutes) {
        alert("Please fill in all required fields");
        return;
    }
    const newEvent = {
        id: Date.now(),
        date: selectedDate,
        title: formData.title.trim(),
        time: `${formData.hours.padStart(2, '0')}:${formData.minutes.padStart(2, '0')} ${formData.ampm}`,
        desc: formData.desc.trim()
    };
    setEvents(prev => [...prev, newEvent]);
    setShowEventPopup(false);
    setFormData({ title: "", hours: "", minutes: "", ampm: "AM", desc: "" });
}

const editEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
        const [time, ampm] = event.time.split(' ');
        const [hours, minutes] = time.split(':');
        setFormData({
            title: event.title || "",
            hours: hours,
            minutes: minutes,
            ampm: ampm || "AM",
            text: event.text,
            desc: event.desc || ""
        });
        setSelectedDate(event.date);
        setEditMode(true);
        setEditingEventId(eventId);
        setShowEventPopup(true);
    }
}

const updateEvent = () => {
    if (!formData.title.trim() || !formData.hours || !formData.minutes) {
        alert("Please fill in all required fields");
        return;
    }
    setEvents(prev => prev.map(event => 
        event.id === editingEventId 
            ? {
                ...event,
                date: selectedDate,
                title: formData.title.trim(),
                time: `${formData.hours.padStart(2, '0')}:${formData.minutes.padStart(2, '0')} ${formData.ampm}`,
                desc: formData.desc.trim()
              }
            : event
    ));
    setShowEventPopup(false);
    setEditMode(false);
    setEditingEventId(null);
    setFormData({ title: "", hours: "", minutes: "", ampm: "AM", desc: "" });
}

const removeEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
    }
}

const closePopup = () => {
    setShowEventPopup(false);
    setEditMode(false);
    setEditingEventId(null);
    setFormData({ title: "", hours: "", minutes: "", ampm: "AM", text: "", desc: "" });
}

// Close FAB menu when clicking outside
useEffect(() => {
  if (!fabOpen) return;
  function handleClick(e) {
    if (fabRef.current && !fabRef.current.contains(e.target)) {
      setFabOpen(false);
    }
  }
  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown', handleClick);
}, [fabOpen]);

  return (
    <>
      <div className="calendar-container">
        <div className="calendar">
          <div className="calendar-header">
            <button onClick={prevMonth} className="nav-btn">‹</button>
            <div className="month-year">
              <span className="month">{months[currentMonth]}</span>
              <span className="year">{currentYear}</span>
            </div>
            <button onClick={nextMonth} className="nav-btn">›</button>
          </div>
          <div className="calendar-grid">
            {daysOfWeek.map(day => <div key={day} className="day-name">{day}</div>)}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="empty-day"></div>)}
            {Array.from({ length: daysInMonth }).map((_, day) => {
              const date = day + 1;
              const thisDate = new Date(currentYear, currentMonth, date);
              const isToday = thisDate.toDateString() === new Date().toDateString();
              const isSelected = (filteredDate && thisDate.toDateString() === new Date(filteredDate).toDateString()) || (selectedDate && thisDate.toDateString() === new Date(selectedDate).toDateString());
              const hasEvent = events.some(e => 
                new Date(e.date).toDateString() === thisDate.toDateString()
              );
              return (
                <div 
                  key={date} 
                  className={`day ${isToday ? 'today' : ''} ${isSelected ? 'selected-day' : ''} ${hasEvent ? 'has-event' : ''}`} 
                  onClick={() => handleDayClick(date)}
                >
                  {date}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-header">
            <h2>{filteredDate ? `Events for ${new Date(filteredDate).toLocaleDateString()}` : 'All Events'}</h2>
            <div className="sidebar-actions">
              {filteredDate && (
                <>
                  <button className="sidebar-btn" onClick={openAddEventPopup}>Add Event</button>
                  <button className="sidebar-btn" onClick={showAllEvents}>Show All</button>
                </>
              )}
            </div>
          </div>
          <div className="events-list">
            {displayedEvents.length > 0 ? (
              displayedEvents.map(event => (
                <div key={event.id} className="event-item" onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}>
                  <div className="event-details">
                    <p className="event-title">{event.title}</p>
                    <p className="event-time">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                  </div>
                  {expandedEventId === event.id && (
                    <div className="event-expanded">
                      <p className="event-desc">{event.desc}</p>
                      <div className="event-actions">
                        <button onClick={(e) => {e.stopPropagation(); editEvent(event.id);}}>Edit</button>
                        <button onClick={(e) => {e.stopPropagation(); removeEvent(event.id);}}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-events">{filteredDate ? 'No events for this day.' : 'No upcoming events.'}</p>
            )}
          </div>
        </div>

        {showEventPopup && (
          <div className="event-popup-backdrop" onClick={closePopup}>
            <div className="event-popup" onClick={(e) => e.stopPropagation()}>
              <h3>{editMode ? 'Edit Event' : 'Add Event'}</h3>
              <input type="text" placeholder="Event Title (max 20 chars)" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} maxLength="20" />
              <textarea placeholder="Event Description (max 60 chars)" value={formData.desc} onChange={(e) => handleInputChange('desc', e.target.value)} maxLength="60"></textarea>
              <div className="time-picker">
                <input type="number" placeholder="HH" min="1" max="12" value={formData.hours} onChange={(e) => handleInputChange('hours', e.target.value)} />
                <span>:</span>
                <input type="number" placeholder="MM" min="0" max="59" value={formData.minutes} onChange={(e) => handleInputChange('minutes', e.target.value)} />
                <select value={formData.ampm} onChange={(e) => handleInputChange('ampm', e.target.value)}>
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
              <div className="popup-actions">
                <button onClick={editMode ? updateEvent : addEvent}>{editMode ? 'Update' : 'Add'}</button>
                <button onClick={closePopup}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showChat && <AssignmentChat closeChat={() => setShowChat(false)} addEvents={events => setEvents(prev => [...prev, ...events])}/>}
      </div>
      {/* FAB is now outside the container */}
      <div className="fab-root" ref={fabRef}>
        <button className="fab-main" onClick={() => setFabOpen(fab => !fab)} title="Menu">
          <span style={{fontSize: '2em', fontWeight: 700, lineHeight: 1}}>?</span>
        </button>
        {fabOpen && (
          <div className="fab-popup">
            <button className="fab-option" title="User" onClick={() => { setFabOpen(false); alert('User profile coming soon!'); }}>
              <i className="bx bx-user"></i>
            </button>
            <button className="fab-option" title="AI Assistant" onClick={() => { setShowChat(true); setFabOpen(false); }}>
              <i className="bx bx-bot"></i>
            </button>
            <button className="fab-option" title="Settings" onClick={() => { setFabOpen(false); alert('Settings coming soon!'); }}>
              <i className="bx bx-cog"></i>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CalendarApp;