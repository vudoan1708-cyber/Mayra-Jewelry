'use client'

import { useEffect, useState, type FormEvent } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, ShieldCheck, ShieldOff, X } from 'lucide-react';

import Button from '../../../components/Button';
import AdminShell from '../AdminShell';
import { useAdminAuth } from '../AdminAuthContext';
import {
  adminCardPadded,
  adminEyebrow,
  adminGhostButton,
  adminInput,
  adminLabel,
  adminLabelText,
  adminPageEyebrow,
  adminPageHeading,
  adminSectionTitle,
} from '../styles';
import {
  type AdminUserCreated,
  type AdminUserSummary,
  createAdminUser,
  listAdmins,
  setAdminDisabled,
} from '../api';

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

function NewAdminForm({ onCreated, onCancel }: { onCreated: (admin: AdminUserCreated) => void; onCancel: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await createAdminUser({ email: email.trim().toLowerCase(), password });
      if (!result) throw new Error('No response');
      onCreated(result);
      setEmail('');
      setPassword('');
      setConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create admin');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={onSubmit}
      className={`${adminCardPadded} overflow-hidden`}
    >
      <header className="flex items-center justify-between">
        <div>
          <p className={adminEyebrow}>New admin</p>
          <h2 className={adminSectionTitle}>Add a teammate</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="text-brand-500/70 hover:text-brand-700 transition-colors"
        >
          <X className="size-4" />
        </button>
      </header>

      <label className={adminLabel}>
        <span className={adminLabelText}>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={adminInput}
          placeholder="name@mayra.example"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className={adminLabel}>
          <span className={adminLabelText}>Password</span>
          <input
            type="password"
            required
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={adminInput}
          />
        </label>
        <label className={adminLabel}>
          <span className={adminLabelText}>Confirm password</span>
          <input
            type="password"
            required
            minLength={12}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={adminInput}
          />
        </label>
      </div>

      <p className="text-xs text-brand-500/70">
        Minimum 12 characters. After you click Create, a TOTP QR is shown once for the new admin to scan into their authenticator app.
      </p>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy} working={busy}>
          <Plus className="size-4" />
          {busy ? 'Creating…' : 'Create admin'}
        </Button>
      </div>
    </motion.form>
  );
}

function NewAdminQrModal({ admin, onClose }: { admin: AdminUserCreated; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-brand-700/60 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-accent-300/40 rounded-2xl shadow-2xl shadow-black/30 max-w-md w-full p-7 flex flex-col gap-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={adminEyebrow}>Two-factor enrolment</p>
              <h3 className={`${adminSectionTitle} mt-1`}>Admin created</h3>
              <p className="text-sm text-brand-500/80 mt-2">
                Have <b className="text-brand-700">{admin.email}</b> scan this QR with their authenticator before signing in.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-brand-500/70 hover:text-brand-700 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="self-center bg-white p-4 rounded-md border border-accent-300/40">
            <QRCodeSVG value={admin.otpauthURL} size={240} bgColor="#ffffff" fgColor="#000814" level="M" includeMargin={false} />
          </div>
          <details className="text-xs text-brand-500/70">
            <summary className="cursor-pointer text-brand-700 hover:text-brand-500">Can't scan? Show the URI</summary>
            <code className="block mt-2 bg-accent-100 border border-accent-300/40 rounded p-2 break-all text-[11px]">
              {admin.otpauthURL}
            </code>
          </details>
          <p className="text-xs text-brand-500/70">
            This QR can't be shown again. If lost, the admin must be recreated.
          </p>
          <Button type="button" variant="primary" onClick={onClose}>
            Done
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function UsersView() {
  const { email: currentEmail } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUserSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdAdmin, setCreatedAdmin] = useState<AdminUserCreated | null>(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => {
    listAdmins()
      .then((data) => setAdmins(data ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load admins'));
  };

  useEffect(() => {
    refresh();
  }, []);

  const onToggleDisabled = async (admin: AdminUserSummary) => {
    try {
      await setAdminDisabled(admin.id, !admin.disabled);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <AdminShell>
      <section className="flex flex-col gap-7">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className={adminPageEyebrow}>Team</p>
            <h1 className={adminPageHeading}>Admin users</h1>
            <p className="text-sm text-brand-500/80 mt-1">
              {admins === null ? 'Loading…' : `${admins.length} admin${admins.length === 1 ? '' : 's'}`}
            </p>
          </div>
          {!showForm && (
            <Button type="button" variant="primary" onClick={() => setShowForm(true)}>
              <Plus className="size-4" />
              New admin
            </Button>
          )}
        </header>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <AnimatePresence>
          {showForm && (
            <NewAdminForm
              onCancel={() => setShowForm(false)}
              onCreated={(a) => {
                setShowForm(false);
                setCreatedAdmin(a);
                refresh();
              }}
            />
          )}
        </AnimatePresence>

        {admins !== null && admins.length > 0 && (
          <div className="bg-white border border-accent-300/40 rounded-2xl overflow-hidden shadow-sm shadow-black/5">
            <table className="w-full text-sm">
              <thead className="bg-accent-100/60 text-brand-500/80 text-[10px] uppercase tracking-[0.22em]">
                <tr>
                  <th className="text-left px-5 py-4 font-normal">Email</th>
                  <th className="text-left px-5 py-4 font-normal">Status</th>
                  <th className="text-left px-5 py-4 font-normal">Last login</th>
                  <th className="text-left px-5 py-4 font-normal">Created</th>
                  <th className="text-right px-5 py-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => {
                  const isSelf = admin.email === currentEmail;
                  const locked = admin.lockedUntil && new Date(admin.lockedUntil) > new Date();
                  return (
                    <tr key={admin.id} className="border-t border-accent-300/30 hover:bg-accent-100/30 transition-colors">
                      <td className="px-5 py-4 text-brand-700">
                        <span className="block">{admin.email}</span>
                        {isSelf && <span className="text-[10px] uppercase tracking-[0.18em] text-brand-500/70">You</span>}
                      </td>
                      <td className="px-5 py-4">
                        {admin.disabled ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-red-700">
                            <ShieldOff className="size-3.5" /> Disabled
                          </span>
                        ) : locked ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
                            Locked until {formatDate(admin.lockedUntil)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                            <ShieldCheck className="size-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-brand-500/80">{formatDate(admin.lastLoginAt)}</td>
                      <td className="px-5 py-4 text-brand-500/80">{formatDate(admin.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onToggleDisabled(admin)}
                          disabled={isSelf}
                          className={adminGhostButton}
                        >
                          {admin.disabled ? 'Enable' : 'Disable'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {createdAdmin && (
        <NewAdminQrModal admin={createdAdmin} onClose={() => setCreatedAdmin(null)} />
      )}
    </AdminShell>
  );
}
