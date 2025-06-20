import React, { useRef, useState } from 'react';

const AssignmentChat = ({ closeChat, addEvents }) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! Paste your assignment list, and I'll extract the due dates and titles for you." }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedEvents, setExtractedEvents] = useState(null);
  const fileInputRef = useRef();

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsProcessing(true);
    setExtractedEvents(null);

    try {
        const response = await fetch('http://localhost:5001/api/extract-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.events && data.events.length > 0) {
            setMessages(msgs => [...msgs, { sender: 'ai', text: 'Here are the assignments I found:', events: data.events }]);
            setExtractedEvents(data.events);
        } else {
            setMessages(msgs => [...msgs, { sender: 'ai', text: "I couldn't find any specific events or dates. Please try rephrasing or adding more details." }]);
        }
    } catch (error) {
        console.error("Failed to fetch from AI backend:", error);
        setMessages(msgs => [...msgs, { sender: 'ai', text: 'Sorry, I ran into an error. Please check the backend connection and try again.' }]);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // For now, let's just show a message that this feature is under development.
    // Full implementation would require backend support for file parsing.
    setMessages(msgs => [
        ...msgs, 
        { sender: 'user', text: `Uploaded file: ${file.name}`},
        { sender: 'ai', text: 'File upload processing is not yet implemented. Please paste the text directly.'}
    ]);
  };

  const handleConfirmEvents = () => {
    if (!extractedEvents) return;

    const eventsToAdd = extractedEvents.map(event => ({
        id: Date.now() + Math.random(), // Basic unique ID
        date: new Date(event.date), // Assumes YYYY-MM-DD from backend
        title: event.title,
        time: '12:00 AM', // Default time, can be improved
        desc: `Added via AI from text: "${event.title}"`
    }));

    addEvents(eventsToAdd);

    setMessages(msgs => [...msgs, { sender: 'ai', text: 'Events added to your calendar! 🎉' }]);
    setExtractedEvents(null);
    setTimeout(closeChat, 1500); // Close chat after a short delay
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 480,
      margin: '0 auto',
      background: 'rgba(30,34,44,0.95)',
      borderRadius: 18,
      boxShadow: '0 4px 32px #0004',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      height: 520,
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px 12px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            background: msg.sender === 'user' ? 'linear-gradient(90deg,#18aaff 60%,#6d28d9 100%)' : 'rgba(255,255,255,0.08)',
            color: msg.sender === 'user' ? '#fff' : '#fff',
            borderRadius: 14,
            padding: '12px 16px',
            maxWidth: '80%',
            fontSize: '1.08em',
            boxShadow: msg.sender === 'user' ? '0 2px 8px #18aaff33' : 'none',
            marginBottom: msg.events ? 0 : 4,
          }}>
            {msg.text}
            {msg.events && (
              <div style={{ marginTop: 10 }}>
                {msg.events.map((ev, i) => (
                  <div key={i} style={{ background: '#fff', color: '#232933', borderRadius: 8, padding: '8px 14px', margin: '8px 0', fontWeight: 600, fontSize: '1em', boxShadow: '0 2px 8px #18aaff11' }}>
                    <span style={{ color: '#18aaff', fontWeight: 700 }}>{ev.date}</span> — {ev.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div style={{ alignSelf: 'flex-start', color: '#18aaff', fontWeight: 600, fontSize: '1.1em', marginTop: 8 }}>Processing…</div>
        )}
        {extractedEvents && (
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <button onClick={handleConfirmEvents} style={{
              background: 'linear-gradient(90deg,#18aaff 60%,#6d28d9 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: '1.1em',
              fontWeight: 700,
              padding: '12px 32px',
              boxShadow: '0 2px 12px #18aaff33',
              cursor: 'pointer',
              marginTop: 8,
            }}>Confirm & Add to Calendar</button>
          </div>
        )}
      </div>
      <div style={{ borderTop: '1.5px solid #232933', padding: '14px 12px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(36,40,54,0.98)' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message or paste assignments…"
          style={{ flex: 1, borderRadius: 8, border: 'none', padding: '10px 14px', fontSize: '1.08em', background: '#232933', color: '#fff', outline: 'none' }}
          disabled={isProcessing}
        />
        <button onClick={() => fileInputRef.current.click()} style={{ background: 'none', border: 'none', color: '#18aaff', fontSize: '1.5em', cursor: 'pointer' }} title="Upload file">
          <i className="bx bx-paperclip"></i>
        </button>
        <input type="file" accept=".txt,.pdf,image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} disabled={isProcessing} />
        <button onClick={handleSend} style={{ background: 'none', border: 'none', color: '#18aaff', fontSize: '1.5em', cursor: 'pointer' }} title="Send" disabled={isProcessing}>
          <i className="bx bx-send"></i>
        </button>
      </div>
    </div>
  );
};

export default AssignmentChat; 