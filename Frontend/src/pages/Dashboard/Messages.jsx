import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/api';
import './Dashboard.css';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchHistory = async () => {
            const history = await apiService.fetchChatHistory();
            setMessages(history);
            setLoading(false);
            scrollToBottom();
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMsgContent = inputValue;
        setInputValue('');

        // 1. Optimistic Update (Immediate display)
        const optimisticMsg = {
            tempId: Date.now(),
            role: 'user',
            content: userMsgContent,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setIsTyping(true);

        try {
            await apiService.getAIChatResponse(userMsgContent, messages);
            // After AI responds, fetch fresh history from DB which will contain both
            const history = await apiService.fetchChatHistory();
            setMessages(history);
        } catch (error) {
            console.error("Failed to send message:", error);
            // Optionally remove the optimistic message on failure
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="messages-page fade-in">
            <div className="section-header">
                <p className="section-subtitle">Chat with your AI advisor and support team.</p>
            </div>

            <div className="messages-container">
                <div className="messages-sidebar">
                    <div className="chat-search">
                        <iconify-icon icon="ri:search-line"></iconify-icon>
                        <input type="text" placeholder="Search conversations..." />
                    </div>
                    <div className="contacts-list">
                        <div className="contact-item active">
                            <img src="https://ui-avatars.com/api/?name=AI+Advisor&background=ff863c&color=fff" alt="AI" className="contact-avatar" />
                            <div className="contact-info">
                                <div className="contact-name">AI Advisor</div>
                                <div className="contact-preview">Always here to help...</div>
                            </div>
                            <div className="contact-meta">
                                <div className="unread-badge"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chat-window">
                    <div className="chat-header">
                        <div className="active-contact">
                            <img src="https://ui-avatars.com/api/?name=AI+Advisor&background=ff863c&color=fff" alt="AI" className="header-avatar" />
                            <div>
                                <h4 className="header-contact-name">AI Advisor</h4>
                                <div className="header-status">Online</div>
                            </div>
                        </div>
                        <div className="chat-actions">
                            <button title="More"><iconify-icon icon="ri:more-2-fill"></iconify-icon></button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {loading && messages.length === 0 ? (
                            <div className="chat-loading">Loading chat history...</div>
                        ) : messages.length > 0 || isTyping ? (
                            <>
                                {messages.map(msg => (
                                    <div key={msg.id || msg.tempId} className={`chat-bubble-container ${msg.role === 'user' ? 'user' : 'bot'}`}>
                                        <div className="chat-bubble">
                                            {msg.content}
                                            <span className="bubble-time">{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="chat-bubble-container bot">
                                        <div className="chat-bubble typing-indicator-dash">
                                            <span className="dot"></span>
                                            <span className="dot"></span>
                                            <span className="dot"></span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-messages">Start a conversation with your advisor!</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <button className="btn-attach" disabled={isTyping}><iconify-icon icon="ri:attachment-2"></iconify-icon></button>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => !isTyping && e.key === 'Enter' && handleSend()}
                            disabled={isTyping}
                        />
                        <button className="btn-chat-send" onClick={handleSend} disabled={isTyping} style={{ opacity: isTyping ? 0.5 : 1, cursor: isTyping ? 'not-allowed' : 'pointer' }}>
                            <iconify-icon icon="ri:send-plane-2-fill"></iconify-icon>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
