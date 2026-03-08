// ProfilePage.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { User, Lock, Bell } from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName, lastName: user?.lastName, phone: user?.phone });
  const [saving, setSaving] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/users/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await API.put('/auth/change-password', pwdForm);
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSavingPwd(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

      {/* Profile info card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`badge mt-1 ${user?.kycStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              KYC: {user?.kycStatus}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfile} className="space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><User size={16} /> Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label><input className="input-field" value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label><input className="input-field" value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} /></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label><input className="input-field" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label><input className="input-field" value={user?.email} disabled className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" /></div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Password */}
      <div className="card">
        <form onSubmit={handlePassword} className="space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Lock size={16} /> Change Password</h3>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label><input type="password" required className="input-field" value={pwdForm.currentPassword} onChange={e => setPwdForm(f => ({...f, currentPassword: e.target.value}))} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label><input type="password" required minLength={8} className="input-field" value={pwdForm.newPassword} onChange={e => setPwdForm(f => ({...f, newPassword: e.target.value}))} /></div>
          <button type="submit" disabled={savingPwd} className="btn-primary">{savingPwd ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
