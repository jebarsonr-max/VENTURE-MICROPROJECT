import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, GraduationCap, Store, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, switchDemoAccount } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'vendor') navigate('/vendor');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'student' | 'vendor' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoAccount(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'vendor') navigate('/vendor');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-campus-card border border-campus-border text-campus-accent shadow-glow-accent mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-campus-text">Sign in to CAMPUSNEX</h2>
          <p className="text-xs text-campus-muted mt-1">Autonomous campus mobility & logistics platform</p>
        </div>

        {/* Demo Fast Login Box */}
        <div className="p-4 rounded-2xl bg-campus-card border border-campus-border">
          <div className="flex items-center space-x-2 text-xs font-bold text-campus-accent mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>INSTANT DEMO LOGIN (1-CLICK)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="p-2.5 rounded-xl bg-campus-elevated hover:bg-campus-elevated/80 border border-campus-border hover:border-campus-accent text-center transition group"
            >
              <GraduationCap className="w-4 h-4 text-campus-accent mx-auto mb-1 group-hover:scale-110 transition" />
              <div className="text-[11px] font-bold text-campus-text">Student</div>
              <div className="text-[9px] text-campus-muted">Alex Chen</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('vendor')}
              className="p-2.5 rounded-xl bg-campus-elevated hover:bg-campus-elevated/80 border border-campus-border hover:border-campus-accent-subtle text-center transition group"
            >
              <Store className="w-4 h-4 text-campus-accent-subtle mx-auto mb-1 group-hover:scale-110 transition" />
              <div className="text-[11px] font-bold text-campus-text">Vendor</div>
              <div className="text-[9px] text-campus-muted">Cafeteria</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2.5 rounded-xl bg-campus-elevated hover:bg-campus-elevated/80 border border-campus-border hover:border-emerald-400 text-center transition group"
            >
              <Cpu className="w-4 h-4 text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition" />
              <div className="text-[11px] font-bold text-campus-text">Admin Ops</div>
              <div className="text-[9px] text-campus-muted">Fleet Ops</div>
            </button>
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <div className="p-6 rounded-2xl bg-campus-card border border-campus-border shadow-xl">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-campus-muted mb-1.5">Campus Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-campus-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campusnex.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text placeholder-campus-muted/50 focus:outline-none focus:border-campus-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-campus-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-campus-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text placeholder-campus-muted/50 focus:outline-none focus:border-campus-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle transition shadow-glow-accent disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-campus-border/60 text-center text-xs text-campus-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-campus-accent hover:underline">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

