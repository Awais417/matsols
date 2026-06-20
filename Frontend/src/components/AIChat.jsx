import { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import './AIChat.css';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your AI Concierge. How can I help you find your dream university today?' }
  ]);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // If we are within 100px of the bottom, enable auto-scroll
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(atBottom);
  };

  const scrollToBottom = (force = false) => {
    if (shouldAutoScroll || force) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isUserMessage = lastMessage?.role === 'user';
    scrollToBottom(isUserMessage);
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Real API Call
    const fetchBotResponse = async () => {
      try {
        const response = await fetch(`${apiService.getBaseUrl()}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            content: inputValue,
            history: messages.slice(-5) // Send last 5 messages for context
          })
        });
        const data = await response.json();

        if (data.content) {
          setMessages(prev => [...prev, { role: 'bot', content: data.content }]);
        } else {
          throw new Error(data.error || 'Failed to get response');
        }
      } catch (error) {
        console.error('Chat Error:', error);
        setMessages(prev => [...prev, {
          role: 'bot',
          content: "I'm having trouble connecting to my brain right now. Please try again or check your internet connection."
        }]);
      }
    };

    fetchBotResponse();
  };

  return (
    <div className="ai-agent-wrapper">
      <div
        className={`ai-chat-window ${isOpen ? 'open' : ''}`}
      >
        <div className="ai-chat-header">
          <div className="ai-avatar">
            <iconify-icon icon="ri:robot-3-fill"></iconify-icon>
          </div>
          <div className="ai-status-info">
            <h4>MATSOLS Concierge</h4>
            <div className="ai-status">
              <span className="status-dot"></span>
              Online & Ready
            </div>
          </div>
          <button
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
            onClick={() => setIsOpen(false)}
          >
            <iconify-icon icon="ri:close-line" width="24"></iconify-icon>
          </button>
        </div>

        <div 
          className="ai-messages" 
          ref={containerRef}
          onScroll={handleScroll}
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-input-wrapper">
          <input
            type="text"
            className="ai-input"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="ai-send-btn" onClick={handleSend}>
            <iconify-icon icon="ri:send-plane-2-fill"></iconify-icon>
          </button>
        </div>
      </div>

      <button className="ai-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {!isOpen && <div className="pulse"></div>}
        <iconify-icon
          icon={isOpen ? "ri:close-fill" : "ri:robot-3-line"}
          width="30"
        ></iconify-icon>
      </button>
    </div>
  );
};

export default AIChat;
