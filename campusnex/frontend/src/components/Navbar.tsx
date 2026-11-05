import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bot,
  Plane,
  ShoppingBag,
  Bell,
  User as UserIcon,
  LogOut,
  Cpu,
  MapPin,
  Leaf,
  Layers,
  Activity,
  Menu,
  X,
  ShieldCheck,
  Store,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Notification } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoAccount } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(setNotifications)
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { name: 'Live Tracking', path: '/tracking', icon: MapPin },
    { name: 'IoT Telemetry', path: '/iot', icon: Activity },
    { name: 'Logistics Engine', path: '/logistics', icon: Layers },
    { name: 'Fleet', path: '/fleet', icon: Bot },
    { name: 'Sustainability', path: '/sustainability', icon: Leaf },
  ];

  return (
    <header className="sticky top-0 z-50 bg-campus-bg/90 backdrop-blur-md border-b border-campus-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-campus-card border border-campus-border flex items-center justify-center text-campus-accent group-hover:border-campus-accent transition shadow-glow-accent">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-campus-text">CAMPUS<span className="text-campus-accent">NEX</span></span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-campus-elevated text-campus-accent border border-campus-border">v1.0</span>
              </div>
              <p className="text-[10px] text-campus-muted tracking-wider uppercase font-medium">Autonomous Smart Mobility</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
                    active
                      ? 'bg-campus-elevated text-campus-accent border border-campus-border'
                      : 'text-campus-muted hover:text-campus-text hover:bg-campus-card/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            
            {/* Demo Account Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-campus-card border border-campus-border hover:border-campus-accent-subtle text-campus-text transition"
                title="Switch Demo Role"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-campus-accent" />
                <span className="hidden sm:inline">Demo Roles</span>
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-campus-card border border-campus-border shadow-2xl p-2 z-50">
                  <div className="text-[11px] font-bold text-campus-muted uppercase px-2 py-1 tracking-wider">
                    Instant Demo Login
                  </div>
                  <button
                    onClick={() => { switchDemoAccount('student'); setDemoMenuOpen(false); navigate('/student'); }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 text-xs rounded-lg text-campus-text hover:bg-campus-elevated text-left transition"
                  >
                    <GraduationCap className="w-4 h-4 text-campus-accent" />
                    <div>
                      <div className="font-semibold">Student Account</div>
                      <div className="text-[10px] text-campus-muted">Order food, books & lab items</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { switchDemoAccount('vendor'); setDemoMenuOpen(false); navigate('/vendor'); }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 text-xs rounded-lg text-campus-text hover:bg-campus-elevated text-left transition"
                  >
                    <Store className="w-4 h-4 text-campus-accent-subtle" />
                    <div>
                      <div className="font-semibold">Vendor Account</div>
                      <div className="text-[10px] text-campus-muted">Accept orders & manage stock</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { switchDemoAccount('admin'); setDemoMenuOpen(false); navigate('/admin'); }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 text-xs rounded-lg text-campus-text hover:bg-campus-elevated text-left transition"
                  >
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold">Admin / Dispatch Ops</div>
                      <div className="text-[10px] text-campus-muted">Fleet telemetry & system KPIs</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              to="/checkout"
              className="relative p-2 rounded-lg bg-campus-card border border-campus-border text-campus-text hover:text-campus-accent hover:border-campus-accent transition"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-campus-accent text-campus-bg font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-glow-accent">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg bg-campus-card border border-campus-border text-campus-text hover:text-campus-accent transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-campus-accent animate-ping" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-campus-card border border-campus-border shadow-2xl p-3 z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-campus-border">
                      <div className="font-bold text-xs text-campus-text">Campus Notifications</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-campus-accent hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-xs text-campus-muted">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2 rounded-lg text-xs border ${
                              n.is_read
                                ? 'bg-campus-bg/40 border-transparent text-campus-muted'
                                : 'bg-campus-elevated border-campus-border text-campus-text'
                            }`}
                          >
                            <div className="font-semibold text-campus-accent">{n.title}</div>
                            <div className="text-[11px] mt-0.5">{n.message}</div>
                            <div className="text-[9px] text-campus-muted mt-1">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={user.role === 'admin' ? '/admin' : (user.role === 'vendor' ? '/vendor' : '/student')}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-campus-elevated border border-campus-border hover:border-campus-accent text-xs font-semibold text-campus-text transition"
                >
                  <span className="w-2 h-2 rounded-full bg-campus-accent" />
                  <span className="hidden sm:inline capitalize">{user.role}</span>
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  title="Sign Out"
                  className="p-2 rounded-lg bg-campus-card border border-campus-border text-campus-muted hover:text-red-400 hover:border-red-400/40 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-campus-accent text-campus-bg font-bold text-xs hover:bg-campus-accent-subtle shadow-glow-accent transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-campus-card border border-campus-border text-campus-muted"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-campus-border space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-campus-muted hover:text-campus-accent hover:bg-campus-card"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

