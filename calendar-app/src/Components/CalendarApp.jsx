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
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #232933 0%, #2b3a4a 100%);
        }
        .calendar-app {
          display: flex;
          align-items: flex-start;
          min-height: 760px;
          padding: 48px 48px 48px 48px;
          border-radius: 32px;
          background: rgba(30, 34, 44, 0.98);
          box-shadow: 0 8px 48px 0 rgba(0,0,0,0.25);
          max-width: 1200px;
          margin: 48px auto;
          gap: 48px;
        }
        .calendar {
          flex: 1;
          min-width: 420px;
          max-width: 700px;
          margin-right: 0;
          padding: 32px 32px 32px 32px;
          background: rgba(36, 40, 54, 0.98);
          border-radius: 24px;
          box-shadow: 0 2px 16px 0 rgba(0,0,0,0.10);
        }
        .calendar .heading {
          font-family: 'Montserrat', 'Inter', Arial, sans-serif;
          font-size: 2.8em;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 18px;
          color: #fff;
        }
        .calendar .navigate-date {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .calendar .month, .calendar .year {
          font-size: 1.5em;
          font-weight: 700;
          color: #fff;
        }
        .calendar .buttons i {
          font-size: 2em;
          color: #18aaff;
          background: #232933;
          border-radius: 50%;
          padding: 6px 10px;
          margin: 0 2px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(24,170,255,0.08);
        }
        .calendar .buttons i:hover {
          background: #18aaff;
          color: #fff;
        }
        .calendar .weekdays {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-weight: 700;
          color: #8fa1b3;
          letter-spacing: 1px;
        }
        .calendar .days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .calendar .days span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          font-size: 1.1em;
          color: #dbeafe;
          background: transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
          font-weight: 500;
        }
        .calendar .days span.current-day {
          background: linear-gradient(135deg, #6d28d9 60%, #18aaff 100%);
          color: #fff;
          font-weight: 700;
          box-shadow: 0 0 24px 0 #6d28d9aa;
          border-radius: 50%;
          font-size: 1.2em;
        }
        .calendar .days span:hover:not(.current-day) {
          background: #18aaff33;
          color: #18aaff;
          box-shadow: 0 2px 8px #18aaff22;
        }
        .events-sidebar {
          width: 400px;
          min-width: 320px;
          min-height: 600px;
          background: linear-gradient(135deg, #18aaff 60%, #6d28d9 100%);
          border-radius: 24px;
          padding: 36px 28px 28px 28px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-shadow: 0 4px 32px 0 rgba(24,170,255,0.10);
        }
        .events-sidebar h3 {
          color: #fff;
          font-size: 1.3em;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 18px;
        }
        .event-strip {
          background: #fff;
          color: #232933;
          border-radius: 16px;
          padding: 22px 28px;
          margin-bottom: 18px;
          font-size: 1.15em;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 16px rgba(24,170,255,0.10);
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .event-strip:hover {
          transform: translateY(-2px) scale(1.025);
          box-shadow: 0 8px 32px rgba(24,170,255,0.18);
        }
        .event-strip .event-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .event-strip .event-title {
          font-size: 1.18em;
          font-weight: bold;
          color: #232933;
          margin-bottom: 2px;
        }
        .event-strip .event-time {
          color: #18aaff;
          font-size: 1.08em;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .event-strip .event-time:before {
          content: '\u{1F552}';
          font-size: 1em;
          margin-right: 4px;
          opacity: 0.7;
        }
        .event-strip .event-actions {
          display: flex;
          gap: 18px;
          align-items: center;
        }
        .event-strip .event-actions i {
          font-size: 1.35em;
          color: #18aaff;
          cursor: pointer;
          transition: color 0.18s;
        }
        .event-strip .event-actions i:last-child {
          color: #ff5c5c;
        }
        .event-strip .event-actions i:hover {
          color: #6d28d9;
        }
        @media (max-width: 1100px) {
          .calendar-app {
            flex-direction: column;
            gap: 32px;
            padding: 24px;
          }
          .calendar {
            margin-right: 0;
            margin-bottom: 32px;
          }
          .events-sidebar {
            width: 100%;
            min-width: 0;
            min-height: 300px;
          }
        }
        @media (max-width: 700px) {
          .calendar-app {
            padding: 0 2vw;
          }
          .calendar, .events-sidebar {
            padding: 12px 2vw;
          }
        }
        .event-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(30, 34, 44, 0.45);
          backdrop-filter: blur(6px);
          z-index: 1000;
          transition: background 0.2s;
        }
        .event-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 420px;
          max-width: 95vw;
          background: rgba(36, 40, 54, 0.85);
          color: #fff;
          box-shadow: 0 8px 48px 0 rgba(24,170,255,0.18);
          border-radius: 32px;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          padding: 48px 40px 36px 40px;
          animation: fadeInModal 0.25s cubic-bezier(.4,1.4,.6,1);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255,255,255,0.08);
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: translate(-50%, -60%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        .event-modal-title {
          font-size: 2em;
          font-weight: 900;
          margin-bottom: 32px;
          letter-spacing: 1px;
          text-align: left;
          color: #fff;
        }
        .event-modal-close {
          position: absolute;
          top: 24px;
          right: 32px;
          background: none;
          border: none;
          color: #18aaff;
          font-size: 2.2em;
          cursor: pointer;
          z-index: 10;
          transition: color 0.18s;
          font-weight: 900;
        }
        .event-modal-close:hover {
          color: #ff5c5c;
        }
        .event-modal input, .event-modal textarea, .event-modal select {
          width: 100%;
          margin-bottom: 22px;
          border-radius: 10px;
          border: none;
          padding: 16px 14px;
          font-size: 1.15em;
          background: rgba(255,255,255,0.10);
          color: #fff;
          box-shadow: 0 2px 8px #0002;
          outline: none;
          transition: box-shadow 0.18s, background 0.18s;
          font-family: inherit;
        }
        .event-modal input:focus, .event-modal textarea:focus, .event-modal select:focus {
          box-shadow: 0 0 0 2px #18aaff;
          background: rgba(24,170,255,0.10);
        }
        .event-modal .event-modal-actions {
          display: flex;
          gap: 18px;
          margin-top: 18px;
        }
        .event-modal .event-popup-button {
          background: linear-gradient(90deg, #18aaff 60%, #6d28d9 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 1.25em;
          font-weight: 800;
          padding: 18px 0;
          box-shadow: 0 2px 12px #18aaff33;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s;
          letter-spacing: 1px;
          display: block;
          margin: 0 auto;
          width: 80%;
        }
        .event-modal .event-popup-button:hover {
          background: linear-gradient(90deg, #6d28d9 60%, #18aaff 100%);
          box-shadow: 0 4px 24px #18aaff33;
        }
        @media (max-width: 600px) {
          .event-modal {
            width: 98vw !important;
            min-width: 0;
            padding: 18px 6px 12px 6px;
            border-radius: 18px;
          }
          .event-modal .event-modal-close {
            top: 8px;
            right: 10px;
            font-size: 2em;
          }
          .event-modal-title {
            font-size: 1.3em;
            margin-bottom: 18px;
          }
          .event-modal input, .event-modal textarea, .event-modal select {
            font-size: 1em;
            padding: 12px 8px;
          }
          .event-modal .event-popup-button {
            font-size: 1.1em;
            padding: 14px 0;
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
            <>
              <div className="event-modal-backdrop" onClick={closePopup}></div>
              <div className="event-modal">
                <button className="event-modal-close" onClick={closePopup} aria-label="Close event modal">
                  <i className="bx bx-x"></i>
                </button>
                <div className="event-modal-title">{editMode ? 'Edit Event' : 'Add Event'}</div>
                <input
                  type="text"
                  className="event-title-input"
                  placeholder="Event Title (max 20 chars)"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  maxLength={20}
                  required
                />
                <div style={{ display: 'flex', gap: '12px', marginBottom: '22px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Time</div>
                    <input type="number" className="hours" min={1} max={12} value={formData.hours} onChange={(e) => handleInputChange('hours', e.target.value)} placeholder="hh" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: 'transparent' }}>:</div>
                    <input type="number" className="minutes" min={0} max={59} value={formData.minutes} onChange={(e) => handleInputChange('minutes', e.target.value)} placeholder="mm" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: 'transparent' }}>AM/PM</div>
                    <select value={formData.ampm} onChange={e => handleInputChange('ampm', e.target.value)}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <textarea placeholder="Event Description (max 60 characters)" value={formData.desc} onChange={e => handleInputChange('desc', e.target.value)} maxLength={60} />
                <div className="event-modal-actions">
                  <button className="event-popup-button" onClick={editMode ? updateEvent : addEvent}>{editMode ? 'Update Event' : 'Add Event'}</button>
                </div>
              </div>
            </>
        )}    
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>All Events</h3>
            {events.length === 0 ? (
                <div style={{ color: '#fff' }}>No events scheduled.</div>
            ) : (
                events.map((event) => (
                    <div
                        key={event.id}
                        className="event-strip"
                        onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                    >
                        <div className="event-info">
                            <div className="event-title">{event.title}</div>
                            <div className="event-time">{event.time}</div>
                            {expandedEventId === event.id && event.desc && (
                                <div style={{ color: '#232933', marginTop: '8px', fontSize: '0.98em', background: '#eaf6fd', borderRadius: '8px', padding: '10px', wordBreak: 'break-word' }}>{event.desc}</div>
                            )}
                        </div>
                        <div className="event-actions" onClick={e => e.stopPropagation()}>
                            <i className="bx bxs-edit-alt" onClick={() => editEvent(event.id)}></i>
                            <i className="bx bxs-message-alt-x" onClick={() => removeEvent(event.id)}></i>
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