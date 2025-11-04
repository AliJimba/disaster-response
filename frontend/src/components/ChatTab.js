import React, { useState, useRef, useEffect } from 'react';

export default function ChatTab({ prediction, location }) {
  const [messages, setMessages] = useState([
    { id: 1, text: `Chat about ${location} flood risk. Powered by Ollama!`, sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestedQuestions = [
    'What precautions?',
    'When expected?',
    'Should evacuate?',
    'Rainfall data?'
  ];

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { id: prev.length + 1, text, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      // DIRECT OLLAMA CALL
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `You are a flood expert. Location: ${location}. Risk: ${prediction.risk_level}. Question: ${text}. Answer in 1-2 sentences.`,
          stream: false
        })
      });

      const data = await response.json();
      const ollamaResponse = data.response || 'No response from Ollama';

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: ollamaResponse,
        sender: 'bot'
      }]);

      setLoading(false);
    } catch (error) {
      console.error('Ollama error:', error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: `❌ Ollama not responding: ${error.message}`,
        sender: 'bot'
      }]);
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Ollama Chat</h2>
        <p>Direct AI Response | 📍 {location}</p>
      </div>

      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="message-content"><span className="typing">●●●</span></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="suggested-questions">
        <p>Questions:</p>
        <div className="suggestions">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="suggestion-btn"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
          placeholder="Ask about flood risk..."
          disabled={loading}
          className="chat-input"
        />
        <button
          onClick={() => handleSendMessage(input)}
          disabled={loading || !input.trim()}
          className="send-btn"
        >
          {loading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
}
