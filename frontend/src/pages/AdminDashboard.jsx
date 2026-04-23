import { useState, useEffect } from 'react';
import { createUser, listUsers, createClass, assignStudent, getReports } from '../services/api';

const user = JSON.parse(localStorage.getItem('user') || '{}');

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('users');

  // Create user form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student', classId: '' });
  // Create class form
  const [newClass, setNewClass] = useState({ name: '', teacherId: '' });
  // Assign student form
  const [assign, setAssign] = useState({ classId: '', studentId: '' });

  useEffect(() => {
    fetchUsers();
    fetchReports();
  }, []);

  async function fetchUsers() {
    try {
      const res = await listUsers();
      setUsers(res.data.data);
    } catch {}
  }

  async function fetchReports() {
    try {
      const res = await getReports();
      setReports(res.data.data);
    } catch {}
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setMsg('');
    try {
      await createUser(newUser);
      setMsg('User created successfully.');
      setNewUser({ name: '', email: '', password: '', role: 'student', classId: '' });
      fetchUsers();
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Failed to create user');
    }
  }

  async function handleCreateClass(e) {
    e.preventDefault();
    setMsg('');
    try {
      await createClass(newClass.name, newClass.teacherId);
      setMsg('Class created successfully.');
      setNewClass({ name: '', teacherId: '' });
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Failed to create class');
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    setMsg('');
    try {
      await assignStudent(assign.classId, assign.studentId);
      setMsg('Student assigned successfully.');
      setAssign({ classId: '', studentId: '' });
      fetchUsers();
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Failed to assign student');
    }
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
  }

  const tabs = ['users', 'classes', 'reports'];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
        <span className="font-semibold">Admin Dashboard — {user.name}</span>
        <button onClick={handleLogout} className="text-sm underline">Logout</button>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {msg && (
          <div className={`px-4 py-2 rounded text-sm border ${msg.includes('success') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-6">
            {/* Create User */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Create User</h2>
              <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-3">
                <input placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required className="border rounded px-3 py-2 text-sm" />
                <input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required className="border rounded px-3 py-2 text-sm" />
                <input placeholder="Password (min 6 chars)" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required className="border rounded px-3 py-2 text-sm" />
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="border rounded px-3 py-2 text-sm">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                <input placeholder="Class ID (optional, for students)" value={newUser.classId} onChange={(e) => setNewUser({ ...newUser, classId: e.target.value })} className="border rounded px-3 py-2 text-sm col-span-2" />
                <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">Create User</button>
              </form>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">All Users ({users.length})</h2>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Role</th><th className="pb-2">ID</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b last:border-0">
                      <td className="py-2">{u.name}</td>
                      <td className="py-2 text-gray-500">{u.email}</td>
                      <td className="py-2 capitalize">{u.role}</td>
                      <td className="py-2 text-xs text-gray-400 font-mono">{u._id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {tab === 'classes' && (
          <div className="space-y-6">
            {/* Create Class */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Create Class</h2>
              <form onSubmit={handleCreateClass} className="space-y-3">
                <input placeholder="Class Name" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} required className="w-full border rounded px-3 py-2 text-sm" />
                <input placeholder="Teacher ID" value={newClass.teacherId} onChange={(e) => setNewClass({ ...newClass, teacherId: e.target.value })} required className="w-full border rounded px-3 py-2 text-sm" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Create Class</button>
              </form>
            </div>

            {/* Assign Student */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Assign Student to Class</h2>
              <form onSubmit={handleAssign} className="space-y-3">
                <input placeholder="Class ID" value={assign.classId} onChange={(e) => setAssign({ ...assign, classId: e.target.value })} required className="w-full border rounded px-3 py-2 text-sm" />
                <input placeholder="Student ID" value={assign.studentId} onChange={(e) => setAssign({ ...assign, studentId: e.target.value })} required className="w-full border rounded px-3 py-2 text-sm" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Assign Student</button>
              </form>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {tab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Attendance Reports</h2>
            {reports.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Student</th>
                    <th className="pb-2">Class</th>
                    <th className="pb-2">Present</th>
                    <th className="pb-2">Late</th>
                    <th className="pb-2">Absent</th>
                    <th className="pb-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{r.studentName}</td>
                      <td className="py-2">{r.className || '—'}</td>
                      <td className="py-2 text-green-600">{r.present}</td>
                      <td className="py-2 text-yellow-600">{r.late}</td>
                      <td className="py-2 text-red-600">{r.absent}</td>
                      <td className="py-2 font-medium">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
