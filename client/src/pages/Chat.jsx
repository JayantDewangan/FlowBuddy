import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI, circleAPI, viewerAPI } from '../api';
import { toast } from 'react-hot-toast';
import * as Icons from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user.role === 'user') {
      fetchConversations();
    } else {
      // Viewer case: they only have one partner (the main user)
      // We need to get the main user's ID/name. 
      // We can get it from the viewer dashboard API or just use linkedUserId from user context if available
      fetchViewerPartner();
    }
  }, []);

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [selectedPartner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      // For main user, get list of people who messaged them or they messaged
      const res = await messageAPI.getConversations();
      setConversations(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Could not load conversations");
      setLoading(false);
    }
  };

  const fetchViewerPartner = async () => {
    try {
      const res = await viewerAPI.getDashboard();
      setSelectedPartner({
        id: user.linkedUserId,
        name: res.data.userName
      });
      setLoading(false);
    } catch (err) {
      toast.error("Could not load chat partner");
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedPartner) return;
    try {
      const res = await messageAPI.getHistory(selectedPartner.id);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedPartner) return;

    setSending(true);
    try {
      const res = await messageAPI.send({
        content: input,
        recipientId: selectedPartner.id
      });
      setMessages([...messages, res.data]);
      setInput('');
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header" style={{ paddingBottom: '1rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Icons.MessageCircleHeart size={32} color="var(--primary)" /> 
          {selectedPartner ? `Chat with ${selectedPartner.name}` : 'Messages'}
        </h1>
        {selectedPartner && user.role === 'user' && (
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPartner(null)} style={{ marginTop: '0.5rem' }}>
            <Icons.ChevronLeft size={16} /> Back to list
          </button>
        )}
      </div>

      <div className="page-content" style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        {!selectedPartner && user.role === 'user' ? (
          <div className="stack">
            {conversations.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Icons.Ghost size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No messages yet. Invite viewers to start chatting!</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.id} 
                  className="card fade-in-up" 
                  onClick={() => setSelectedPartner(conv)}
                  style={{ cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface-2)', transition: 'transform 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar" style={{ width: 48, height: 48 }}>{conv.name[0].toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <p style={{ fontWeight: 700, color: 'var(--text)' }}>{conv.name}</p>
                        {conv.relationship && conv.relationship !== 'me' && (
                          <span style={{ 
                            fontSize: '0.65rem', 
                            padding: '0.1rem 0.4rem', 
                            borderRadius: '10px', 
                            background: 'rgba(168, 85, 247, 0.2)', 
                            color: 'var(--primary)',
                            textTransform: 'uppercase',
                            fontWeight: 800
                          }}>
                            {conv.relationship}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        {conv.lastMessage}
                      </p>
                    </div>
                    <Icons.ChevronRight size={20} color="var(--text-muted)" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {/* Message List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem', fontSize: '0.9rem' }}>
                  Send a sweet message to start the conversation 🌸
                </p>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.senderId === user._id;
                return (
                  <div key={msg._id} style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: isMine ? '20px 20px 0 20px' : '20px 20px 20px 0',
                      background: isMine ? 'var(--primary)' : 'var(--surface-2)',
                      color: isMine ? 'white' : 'var(--text)',
                      fontSize: '0.95rem',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      border: isMine ? 'none' : '1px solid var(--border)',
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '1rem', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
              <input
                className="form-input"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={sending || !input.trim()}
                style={{ padding: '0.5rem 1rem' }}
              >
                {sending ? <Icons.Loader2 className="spinner" size={20} /> : <Icons.Send size={20} />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
