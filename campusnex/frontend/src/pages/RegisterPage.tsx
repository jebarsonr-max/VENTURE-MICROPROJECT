import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Lock, Mail, User, Phone, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    campus_id: '',
    hostel_block: 'Hostel Alpha (North Wing)',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await register(formData);
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'vendor') navigate('/vendor');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-campus-card border border-campus-border text-campus-accent shadow-glow-accent mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-campus-text">Create Account</h2>
          <p className="text-xs text-campus-muted mt-1">Register for autonomous campus delivery services</p>
        </div>

        <div className="p-6 rounded-2xl bg-campus-card border border-campus-border shadow-xl">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-campus-muted mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alex Chen"
                className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text focus:outline-none focus:border-campus-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-campus-muted mb-1">Campus Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex.chen@campusnex.edu"
                className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text focus:outline-none focus:border-campus-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-campus-muted mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text focus:outline-none focus:border-campus-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-campus-muted mb-1">Account Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text focus:outline-none focus:border-campus-accent"
                >
                  <option value="student">Student</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-campus-muted mb-1">Student / Staff ID</label>
                <input
                  type="text"
                  value={formData.campus_id}
                  onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                  placeholder="STU-2026-99"
                  className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text focus:outline-none focus:border-campus-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-campus-muted mb-1">Hostel / Campus Residence</label>
              <select
                value={formData.hostel_block}
                onChange={(e) => setFormData({ ...formData, hostel_block: e.target.value })}
                className="w-full px-3 py-2.5 bg-campus-bg border border-campus-border rounded-xl text-xs text-campus-text focus:outline-none focus:border-campus-accent"
              >
                <option value="Hostel Alpha (North Wing)">Hostel Alpha (North Wing)</option>
                <option value="Hostel Beta (West Wing)">Hostel Beta (West Wing)</option>
                <option value="Hostel Gamma (East Wing)">Hostel Gamma (East Wing)</option>
                <option value="Dr. Kalam Central Library">Dr. Kalam Central Library</option>
                <option value="Turing Engineering Quad">Turing Engineering Quad</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-campus-accent text-campus-bg font-extrabold text-xs hover:bg-campus-accent-subtle transition shadow-glow-accent disabled:opacity-50 mt-2"
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-campus-border/60 text-center text-xs text-campus-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-campus-accent hover:underline">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

