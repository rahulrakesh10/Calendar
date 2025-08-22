import React, { useRef, useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;

const AssignmentChat = ({ closeChat, addEvents }) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! I'm Calendarly. Paste your assignment list or upload a PDF, and I'll extract the due dates and titles for you." }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedEvents, setExtractedEvents] = useState(null);
  const [usage, setUsage] = useState(null);
  const fileInputRef = useRef();

  // Fetch usage on component mount
  React.useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/usage`);
      if (response.ok) {
        const usageData = await response.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const processTextOrFile = async (dataPayload, isFile = false) => {
    setIsProcessing(true);
    setExtractedEvents(null);

    // Add a user message to the chat
    const userMessage = isFile 
        ? `Uploaded file: ${dataPayload.get('file').name}`
        : dataPayload.get('text');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    if (!isFile) setInput('');

    try {
        const response = await fetch(`${apiUrl}/api/extract-events`, {
            method: 'POST',
            body: dataPayload 
            // Note: No 'Content-Type' header. The browser sets it for FormData.
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // Handle daily limit error
            if (response.status === 429 && errorData.error && errorData.error.includes('Daily limit exceeded')) {
                setMessages(msgs => [...msgs, { 
                    sender: 'ai', 
                    text: `Daily limit reached! You've used ${errorData.used}/${errorData.limit} requests today. The limit resets at midnight.` 
                }]);
                await fetchUsage(); // Refresh usage data
                return;
            }
            
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.events && data.events.length > 0) {
            setMessages(msgs => [...msgs, { sender: 'ai', text: 'Here are the events I found:', events: data.events }]);
            setExtractedEvents(data.events);
        } else {
            setMessages(msgs => [...msgs, { sender: 'ai', text: "I couldn't find any specific events or dates in the document." }]);
        }
        
        // Refresh usage data after successful request
        await fetchUsage();
    } catch (error) {
        console.error("Failed to fetch from AI backend:", error);
        setMessages(msgs => [...msgs, { sender: 'ai', text: `Sorry, an error occurred: ${error.message}` }]);
    } finally {
        setIsProcessing(false);
        // Reset file input to allow uploading the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const formData = new FormData();
    formData.append('text', input);
    processTextOrFile(formData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || isProcessing) return;
    
    const formData = new FormData();
    formData.append('file', file);
    processTextOrFile(formData, true);
  };

  const handleConfirmEvents = () => {
    if (!extractedEvents) return;

    const eventsToAdd = extractedEvents.map(event => ({
        id: Date.now() + Math.random(), // Basic unique ID
        date: new Date(event.date), // Assumes YYYY-MM-DD from backend
        title: event.title,
        category: event.category || event.courseName || '', // Map courseName to category
        time: event.time || '12:00 AM', // Use extracted time or default
        desc: event.desc || `Added via AI from text: "${event.title}"` // Use extracted desc or default
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
      {/* Usage indicator */}
      {usage && (
        <div style={{
          background: 'rgba(24,170,255,0.1)',
          borderBottom: '1px solid rgba(24,170,255,0.3)',
          padding: '8px 16px',
          fontSize: '0.85em',
          color: '#18aaff',
          textAlign: 'center',
          fontWeight: 600
        }}>
          {usage.remaining > 0 ? 
            `${usage.remaining} of ${usage.limit} requests remaining today` :
            'Daily limit reached - resets at midnight'
          }
        </div>
      )}
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
                  <div key={i} style={{ background: 'rgba(255,255,255,0.95)', color: '#232933', borderRadius: 10, padding: '12px 16px', margin: '8px 0', fontSize: '0.95em', boxShadow: '0 2px 8px #18aaff11' }}>
                    {ev.category && <div style={{ fontSize: '0.85em', fontWeight: 700, color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>{ev.category}</div>}
                    <div style={{ fontWeight: 700, fontSize: '1.05em', color: '#111' }}>{ev.title}</div>
                    <div style={{ margin: '4px 0', color: '#007bff', fontWeight: 600 }}>
                      🗓️ {new Date(ev.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      {ev.time && ` at ${ev.time}`}
                    </div>
                    {ev.desc && <p style={{ margin: '6px 0 0 0', fontStyle: 'italic', color: '#555' }}>"{ev.desc}"</p>}
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
        <input type="file" accept=".txt,.pdf" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} disabled={isProcessing} />
        <button onClick={handleSend} style={{ background: 'none', border: 'none', color: '#18aaff', fontSize: '1.5em', cursor: 'pointer' }} title="Send" disabled={isProcessing}>
          <i className="bx bx-send"></i>
        </button>
      </div>
    </div>
  );
};

export default AssignmentChat; 