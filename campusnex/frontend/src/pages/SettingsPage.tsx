import React from 'react';
import { User, Shield, GraduationCap, Store, Cpu, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, logout, switchDemoAccount } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-campus-text">Account & System Configuration</h1>
        <p className="text-xs text-campus-muted mt-1">Manage profile, active permissions, and evaluation settings.</p>
      </div>

      {/* User Card */}
      <div className="p-6 rounded-3xl bg-campus-card border border-campus-border shadow-xl space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-campus-elevated border border-campus-accent/50 text-campus-accent flex items-center justify-center font-extrabold text-xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-campus-text">{user?.name}</h2>
            <p className="text-xs text-campus-muted">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-campus-elevated text-campus-accent border border-campus-border">
                {user?.role} Mode
              </span>
              <span className="text-xs text-campus-muted">ID: {user?.campus_id || 'STU-2026-8812'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-campus-border/60 text-xs">
          <div className="p-3 rounded-xl bg-campus-bg">
            <span className="text-campus-muted block text-[10px] uppercase font-mono">Assigned Residence</span>
            <span className="text-campus-text font-bold">{user?.hostel_block || 'Hostel Alpha (North Wing)'}</span>
          </div>
          <div className="p-3 rounded-xl bg-campus-bg">
            <span className="text-campus-muted block text-[10px] uppercase font-mono">Contact Phone</span>
            <span className="text-campus-text font-bold">{user?.phone || '+91 98765 43210'}</span>
          </div>
        </div>
      </div>

      {/* Quick Demo Switcher Section */}
      <div className="p-6 rounded-3xl bg-campus-card border border-campus-border space-y-4">
        <h3 className="font-extrabold text-sm text-campus-text flex items-center space-x-2">
          <Shield className="w-4 h-4 text-campus-accent" />
          <span>Switch Evaluator Persona (Instant Session Change)</span>
        </h3>
        <p className="text-xs text-campus-muted">
          Click to seamlessly switch between the three primary stakeholders in the CAMPUSNEX ecosystem.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => switchDemoAccount('student')}
            className={`p-4 rounded-2xl border text-left transition ${
              user?.role === 'student'
                ? 'border-campus-accent bg-campus-elevated'
                : 'border-campus-border bg-campus-bg hover:border-campus-accent/50'
            }`}
          >
            <GraduationCap className="w-5 h-5 text-campus-accent mb-2" />
            <div className="font-bold text-xs text-campus-text">Student Persona</div>
            <div className="text-[10px] text-campus-muted mt-1">Place orders & track live deliveries</div>
          </button>

          <button
            onClick={() => switchDemoAccount('vendor')}
            className={`p-4 rounded-2xl border text-left transition ${
              user?.role === 'vendor'
                ? 'border-campus-accent bg-campus-elevated'
                : 'border-campus-border bg-campus-bg hover:border-campus-accent/50'
            }`}
          >
            <Store className="w-5 h-5 text-campus-accent-subtle mb-2" />
            <div className="font-bold text-xs text-campus-text">Vendor Persona</div>
            <div className="text-[10px] text-campus-muted mt-1">Accept orders & manage stock</div>
          </button>

          <button
            onClick={() => switchDemoAccount('admin')}
            className={`p-4 rounded-2xl border text-left transition ${
              user?.role === 'admin'
                ? 'border-campus-accent bg-campus-elevated'
                : 'border-campus-border bg-campus-bg hover:border-campus-accent/50'
            }`}
          >
            <Cpu className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="font-bold text-xs text-campus-text">Admin Dispatch Ops</div>
            <div className="text-[10px] text-campus-muted mt-1">Fleet control & IoT telemetry</div>
          </button>
        </div>
      </div>

    </div>
  );
};

