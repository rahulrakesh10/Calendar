import { useState, useMemo, useEffect, useRef } from "react";
import AssignmentChat from './AssignmentChat';

// --- Persistent Course Color Logic ---
// Moved outside the component to prevent being reset on re-renders.
const courseColors = {};
let lastColorIndex = -1;
const colorPaletteForCourses = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#8B5CF6', '#F97316', '#14B8A6', '#EC4899', '#84CC16', '#6366F1', '#F59E0B', '#06B6D4'];

const getCourseColor = (courseName) => {
    if (!courseName) return 'transparent';
    if (!courseColors[courseName]) {
        lastColorIndex = (lastColorIndex + 1) % colorPaletteForCourses.length;
        courseColors[courseName] = colorPaletteForCourses[lastColorIndex];
    }
    return courseColors[courseName];
};
// --- End of Color Logic ---

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
  courseName: "",
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
const [showSettings, setShowSettings] = useState(false);
const [settings, setSettings] = useState({
    theme: 'dark',
    sidebarColor: '#007bff'
});
const colorOptions = ['#007bff', '#6f42c1', '#d9534f', '#5cb85c', '#f0ad4e', '#5bc0de'];
const [sidebarOpen, setSidebarOpen] = useState(true);
const fabRef = useRef();

const today = new Date();
today.setHours(0, 0, 0, 0); // Set to start of today for consistent comparisons

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
    setSidebarOpen(true);
}

const showAllEvents = () => {
    setFilteredDate(null);
    setSelectedDate(null);
    setExpandedEventId(null);
    setSidebarOpen(true);
}

const openAddEventPopup = () => {
    const dateForEvent = selectedDate || new Date();
    // Safeguard to prevent adding events to past dates
    if (dateForEvent < today) {
        alert("Events cannot be added to past dates.");
        return;
    }

    // If no date is selected, default to today for the popup
    if (!selectedDate) {
        setSelectedDate(new Date());
    }
    setShowEventPopup(true);
    setEditMode(false);
    setEditingEventId(null);
    setFormData({ title: "", courseName: "", hours: "", minutes: "", ampm: "AM", text: "", desc: "" });
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
        courseName: formData.courseName.trim(),
        time: `${formData.hours.padStart(2, '0')}:${formData.minutes.padStart(2, '0')} ${formData.ampm}`,
        desc: formData.desc.trim()
    };
    setEvents(prev => [...prev, newEvent]);
    setShowEventPopup(false);
    setFormData({ title: "", courseName: "", hours: "", minutes: "", ampm: "AM", desc: "" });
}

const editEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
        const [time, ampm] = event.time.split(' ');
        const [hours, minutes] = time.split(':');
        setFormData({
            title: event.title || "",
            courseName: event.courseName || "",
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
                courseName: formData.courseName.trim(),
                time: `${formData.hours.padStart(2, '0')}:${formData.minutes.padStart(2, '0')} ${formData.ampm}`,
                desc: formData.desc.trim()
              }
            : event
    ));
    setShowEventPopup(false);
    setEditMode(false);
    setEditingEventId(null);
    setFormData({ title: "", courseName: "", hours: "", minutes: "", ampm: "AM", desc: "" });
}

const removeEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
    }
    setShowEventPopup(false);
    setEditMode(false);
    setEditingEventId(null);
    setFormData({ title: "", courseName: "", hours: "", minutes: "", ampm: "AM", text: "", desc: "" });
}

const closePopup = () => {
    setShowEventPopup(false);
    setEditMode(false);
    setEditingEventId(null);
    setFormData({ title: "", courseName: "", hours: "", minutes: "", ampm: "AM", text: "", desc: "" });
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

// Function to handle theme changes
const handleThemeChange = (newTheme) => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
};

// Function to handle sidebar color changes
const handleSidebarColorChange = (newColor) => {
    setSettings(prev => ({ ...prev, sidebarColor: newColor }));
};

  return (
    <>
      <div 
        className="calendar-container" 
        data-theme={settings.theme}
        style={{ '--primary-accent-color': settings.sidebarColor }}
      >
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
              const isPast = thisDate < today;

              // Get colors for events on this day
              const eventColorsOnDay = events
                .filter(e => new Date(e.date).toDateString() === thisDate.toDateString())
                .map(e => getCourseColor(e.courseName))
                .filter((value, index, self) => self.indexOf(value) === index); // Unique colors

              return (
                <div 
                  key={date} 
                  className={`day ${isToday ? 'today' : ''} ${isSelected ? 'selected-day' : ''} ${hasEvent ? 'has-event' : ''} ${isPast ? 'past-day' : ''}`} 
                  onClick={() => handleDayClick(date)}
                >
                  {date}
                  {hasEvent && (
                    <div className="event-dots">
                      {eventColorsOnDay.slice(0, 4).map(color => (
                        <div key={color} className="event-dot" style={{ backgroundColor: color }}></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div 
            className={`sidebar${sidebarOpen ? ' open' : ''}`}
            style={{ '--primary-accent-color': settings.sidebarColor, '--primary-accent-hover': settings.sidebarColor }}
        >
          <div className="sidebar-header">
            <h2>{filteredDate ? `Events for ${new Date(filteredDate).toLocaleDateString()}` : 'All Events'}</h2>
            <div className="sidebar-actions">
              {filteredDate && (
                <>
                  <button 
                    className="sidebar-btn" 
                    onClick={openAddEventPopup} 
                    disabled={new Date(filteredDate) < today}
                    title={new Date(filteredDate) < today ? "Cannot add events to past dates" : "Add a new event"}
                  >
                    Add Event
                  </button>
                  <button className="sidebar-btn" onClick={showAllEvents}>Show All</button>
                </>
              )}
            </div>
          </div>
          <div className="events-list">
            {displayedEvents.length > 0 ? (
              displayedEvents.map(event => (
                <div 
                  key={event.id} 
                  className="event-item" 
                  onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                  style={{ position: 'relative' }}
                >
                  <div className="event-color-bar" style={{ backgroundColor: getCourseColor(event.courseName) }}></div>
                  <div className="event-details">
                    <p className="event-title">
                      {event.courseName ? `${event.courseName}: ` : ''}{event.title}
                    </p>
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
              <input type="text" placeholder="Course Name (e.g., COMP 101)" value={formData.courseName} onChange={(e) => handleInputChange('courseName', e.target.value)} maxLength="30" />
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

        {/* AI Chat Modal */}
        {showChat && (
          <div className="chat-modal-backdrop" onClick={() => setShowChat(false)}>
            <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="chat-modal-close-btn" onClick={() => setShowChat(false)} title="Close">
                &times;
              </button>
              <AssignmentChat 
                closeChat={() => setShowChat(false)} 
                addEvents={events => setEvents(prev => [...prev, ...events])}
              />
            </div>
          </div>
        )}
      </div>
      {/* FAB is now outside the container to ensure correct positioning on all screen sizes */}
      <div className="fab-root" ref={fabRef}>
        {/* FAB main button, plus to X transition. Moved to be the first element for correct stacking. */}
        <button className={`fab-main${fabOpen ? ' open' : ''}`} onClick={() => setFabOpen(fab => !fab)} title="Menu">
          <span className="fab-icon">
          <svg width="32" height="32" viewBox="0 0 32 32">
            <g transform="translate(16, 16)">
              <rect
                className="fab-plus-vert"
                x="-0.75"
                y="-7"
                width="1.5"
                height="14"
                rx="0.75"
                fill="currentColor"
                style={{
                  transition: 'transform 0.3s cubic-bezier(.7,1.7,.7,1)',
                  transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                }}
              />
              <rect
                className="fab-plus-horiz"
                x="-7"
                y="-0.75"
                width="14"
                height="1.5"
                rx="0.75"
                fill="currentColor"
                style={{
                  transition: 'transform 0.3s cubic-bezier(.7,1.7,.7,1)',
                  transform: fabOpen ? 'rotate(45deg)' : 'rotate(-0deg)'
                }}
              />
            </g>
          </svg>
          </span>
        </button>
        {/* Vertical animated menu. Always rendered but visibility is controlled by CSS. */}
        <div className={`fab-vertical-menu ${fabOpen ? 'fab-menu-open' : ''}`}>
            <button className="fab-vertical-item user" title="User" onClick={() => { setFabOpen(false); alert('User profile coming soon!'); }}>
              <i className="bx bx-user"></i>
              <span className="fab-label">User</span>
            </button>
            <button className="fab-vertical-item ai" title="Calendarly" onClick={() => { setShowChat(true); setFabOpen(false); }}>
              <i className="bx bx-bot"></i>
              <span className="fab-label">Calendarly</span>
            </button>
            <button className="fab-vertical-item settings" title="Settings" onClick={() => { setShowSettings(true); setFabOpen(false); }}>
              <i className="bx bx-cog"></i>
              <span className="fab-label">Settings</span>
            </button>
        </div>
      </div>
      {/* Settings Modal */}
      {showSettings && (
          <div className="settings-modal-backdrop" onClick={() => setShowSettings(false)}>
              <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Settings</h3>
                  <div className="setting-item">
                      <label>Theme</label>
                      <div className="theme-toggle">
                          <button className={settings.theme === 'light' ? 'active' : ''} onClick={() => handleThemeChange('light')}>Light</button>
                          <button className={settings.theme === 'dark' ? 'active' : ''} onClick={() => handleThemeChange('dark')}>Dark</button>
                      </div>
                  </div>
                  <div className="setting-item">
                      <label>Sidebar Color</label>
                      <div className="color-palette">
                          {colorOptions.map(color => (
                              <button 
                                  key={color}
                                  className={`color-swatch ${settings.sidebarColor === color ? 'active' : ''}`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => handleSidebarColorChange(color)}
                                  title={color}
                              />
                          ))}
                      </div>
                  </div>
                  <button className="settings-close-btn" onClick={() => setShowSettings(false)}>Done</button>
              </div>
          </div>
      )}
    </>
  );
}

export default CalendarApp;