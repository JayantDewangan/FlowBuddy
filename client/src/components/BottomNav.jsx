import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, PenTool, Lightbulb, Heart, MessageCircleHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserNav = () => (
  <nav className="bottom-nav">
    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon"><Home size={20} /></span>
      <span>Home</span>
    </NavLink>
    <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon"><CalendarDays size={20} /></span>
      <span>Calendar</span>
    </NavLink>
    <NavLink to="/log" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon"><PenTool size={20} /></span>
      <span>Log</span>
    </NavLink>
    <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon"><MessageCircleHeart size={20} /></span>
      <span>Chat</span>
    </NavLink>
    <NavLink to="/insights" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon"><Lightbulb size={20} /></span>
      <span>Insights</span>
    </NavLink>
    <NavLink to="/circle" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon"><Heart size={20} /></span>
      <span>Circle</span>
    </NavLink>
  </nav>
);

const ViewerNav = () => (
  <nav className="bottom-nav" style={{ justifyContent: 'center', gap: '2rem' }}>
    <NavLink to="/viewer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon"><Heart size={20} fill="currentColor" fillOpacity={0.2} /></span>
      <span>Dashboard</span>
    </NavLink>
    <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon"><MessageCircleHeart size={20} /></span>
      <span>Chat</span>
    </NavLink>
  </nav>
);

export default function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'viewer' ? <ViewerNav /> : <UserNav />;
}
