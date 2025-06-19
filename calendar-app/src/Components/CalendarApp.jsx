import { useState } from "react";

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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    clickedDate.setHours(0, 0, 0, 0);
    
    if (clickedDate >= today) {
        setSelectedDate(clickedDate);
        setShowEventPopup(true);
        setEditMode(false);
        setEditingEventId(null);
        setFormData({ title: "", hours: "", minutes: "", ampm: "AM", text: "", desc: "" });
    }
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

  return(
    <>
      <style>{`
        .calendar-app {
          display: flex;
          align-items: flex-start;
        }
        .calendar {
          flex: 1;
        }
        .events-sidebar {
          width: 350px;
          margin-left: 32px;
          min-height: 500px;
          position: relative;
        }
        @media (max-width: 700px) {
          .calendar-app {
            flex-direction: column;
            align-items: stretch;
          }
          .calendar {
            width: 100%;
            min-width: 0;
          }
          .events-sidebar {
            width: 100%;
            margin-left: 0;
            margin-top: 24px;
            min-height: unset;
          }
        }
        @media (max-width: 500px) {
          .calendar-app {
            padding: 0 4px;
          }
          .calendar, .events-sidebar {
            padding: 0 2vw;
          }
          .event-popup, .event {
            font-size: 0.95em;
          }
          .event-popup-button, .event-popup-close {
            font-size: 1em;
          }
        }
      `}</style>
      <div className="calendar-app">
        <div className="calendar">
            <h1 className="heading">Calendar</h1>
            <div className="navigate-date">
                <h2 className="month">{months[currentMonth]},</h2>
                <h2 className="year">{currentYear}</h2>
                <div className="buttons">
                    <i className="bx bx-chevron-left" onClick={prevMonth}></i>
                    <i className="bx bx-chevron-right" onClick={nextMonth}></i>
                </div> 
            </div>
            <div className="weekdays">
                {daysOfWeek.map((day) => <span key={day} > {day}</span> )}
            </div>
            <div className="days">
                {[...Array(firstDayOfMonth).keys()].map((_, index) => <span key={`empty-${index}`} />)}
                {[...Array(daysInMonth).keys()].map((day) => (<span key={day + 1} 
                className={day +1 === currentDate.getDate() && currentMonth === currentDate.getMonth()  && currentYear === currentDate.getFullYear() ? "current-day" : ""}
                onClick={() => handleDayClick(day + 1)}
                 >{day+1}</span> ))}
            </div>
        </div>
        <div className="events-sidebar">
            {showEventPopup && (
            <div className="event-popup" style={{ position: 'relative', marginBottom: '24px', borderRadius: '16px' }}>
                <input
                    type="text"
                    className="event-title-input"
                    placeholder="Event Title (max 20 chars)"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    maxLength={20}
                    style={{
                        width: '100%',
                        fontSize: '1.3em',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        borderRadius: '4px',
                        border: 'none',
                        padding: '8px',
                        background: '#fff',
                        color: '#000',
                    }}
                    required
                />
                <div className="time-input">
                    <div className="event-popup-time">Time</div>
                    <input type="number" className="hours" min={1} max={12} value={formData.hours} onChange={(e) => handleInputChange('hours', e.target.value)} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '4px', padding: '10px 16px', width: '70px', fontSize: '1.2em', marginRight: '12px' }} />
                    <input type="number" className="minutes" min={0} max={59} value={formData.minutes} onChange={(e) => handleInputChange('minutes', e.target.value)} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '4px', padding: '10px 16px', width: '70px', fontSize: '1.2em', marginRight: '12px' }} />
                    <select value={formData.ampm} onChange={e => handleInputChange('ampm', e.target.value)} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '4px', padding: '10px 16px', fontSize: '1.2em' }}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>
                <textarea placeholder="Event Description (max 60 characters)" value={formData.desc} onChange={e => handleInputChange('desc', e.target.value)} maxLength={60} style={{ width: '100%', marginTop: '10px', marginBottom: '10px', borderRadius: '4px', border: 'none', padding: '8px', background: '#fff', color: '#000', fontSize: '1em' }} />
                <button className="event-popup-button" onClick={editMode ? updateEvent : addEvent}>{editMode ? 'Update Event' : 'Add Event'}</button>
                <button className="event-popup-close" onClick={closePopup}>
                <i className="bx bx-x"></i>
                </button>
            </div>
        )}    
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>All Events</h3>
            {events.length === 0 ? (
                <div style={{ color: '#aaa' }}>No events scheduled.</div>
            ) : (
                events.map((event) => (
                    <div
                        key={event.id}
                        className="event"
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            background: '#18aaff',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            padding: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            minHeight: '64px',
                        }}
                        onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                    >
                        {/* Time column */}
                        <div style={{
                            minWidth: '70px',
                            marginRight: '18px',
                            textAlign: 'left',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1.3em',
                            lineHeight: 1.1,
                        }}>
                            <div>{event.time}</div>
                        </div>
                        {/* Title and description column */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                className="event-title"
                                style={{
                                    fontSize: '1.25em',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    marginBottom: event.desc ? '2px' : 0,
                                    wordBreak: 'break-word',
                                }}
                            >
                                {event.title}
                            </div>
                            {expandedEventId === event.id && event.desc && (
                                <div
                                    className="event-desc"
                                    style={{
                                        color: '#f3f3f3',
                                        marginTop: '6px',
                                        fontSize: '1em',
                                        background: '#1a4a6a',
                                        borderRadius: '4px',
                                        padding: '6px',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {event.desc}
                                </div>
                            )}
                        </div>
                        {/* Action buttons */}
                        <div
                            className="event-button"
                            style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <i className="bx bxs-edit-alt" onClick={() => editEvent(event.id)} style={{ fontSize: '1.2em', color: '#fff', cursor: 'pointer' }}></i>
                            <i className="bx bxs-message-alt-x" onClick={() => removeEvent(event.id)} style={{ fontSize: '1.2em', color: '#fff', cursor: 'pointer' }}></i>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </>
  )
}

export default CalendarApp