import { useState, useEffect, useRef } from 'react';
import { startSession, getActiveSession, getSessionAttendance, approveAttendance, rejectAttendance, manualMark, submitAttendance } from '../services/api';

const user = JSON.parse(localStorage.getItem('user') || '{}');

export default function TeacherDashboard() {
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState({ verified: [], unverified: [], absent: [] });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  function startPolling(sessionId) {
    if (pollRef.current) clearInterval(pollRef.current);
    fetchAttendance(sessionId);
    pollRef.current = setInterval(() => fetchAttendance(sessionId), 5000);
  }

  async function fetchAttendance(sessionId) {
    try {
      const res = await getSessionAttendance(sessionId);
      setAttendance(res.data.data);
    } catch {}
  }

  useEffect(() => () => clearInterval(pollRef.current), []);

  async function handleStart(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await startSession(classId, subject);
      setSession(res.data.data.session);
      startPolling(res.data.data.session._id);
      setMsg('Session started.');
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Failed to start session');
    } finally { setLoading(false); }
  }

  async function handleApprove(id) {
    try { await approveAttendance(id); fetchAttendance(session._id); }
    catch (err) { setMsg(err.response?.data?.error?.message || 'Failed'); }
  }

  async function handleReject(id) {
    try { await rejectAttendance(id); fetchAttendance(session._id); }
    catch (err) { setMsg(err.response?.data?.error?.message || 'Failed'); }
  }

  async function handleManual(studentId, status) {
    try { await manualMark(studentId, session._id, status); fetchAttendance(session._id); }
    catch (err) { setMsg(err.response?.data?.error?.message || 'Failed'); }
  }

  async function handleSubmit() {
    if (!window.confirm('Finalize attendance? Remaining students will be marked absent.')) return;
    try {
      await submitAttendance(session._id);
      clearInterval(pollRef.current);
      setSession(null);
      setAttendance({ verified: [], unverified: [], absent: [] });
      setMsg('Attendance submitted and session closed.');
    } catch (err) { setMsg(err.response?.data?.error?.message || 'Failed'); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 text-white px-6 py-3 flex justify-between items-center">
        <span className="font-semibold">Teacher — {user.name}</span>
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="text-sm underline">Logout</button>
      </nav>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {msg && <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded text-sm">{msg}</div>}

        {!session && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Start Session</h2>
            <form onSubmit={handleStart} className="space-y-3">
              <input type="text" placeholder="Class ID" value={classId} onChange={(e) => setClassId(e.target.value)} required className="w-full border rounded px-3 py-2 text-sm" />
              <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full border rounded px-3 py-2 text-sm" />
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Starting...' : 'Start Session'}
              </button>
            </form>
          </div>
        )}

        {session && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-green-800">Session Active</p>
              <p className="text-sm text-green-700">Subject: {session.subject} | Started: {new Date(session.startTime).toLocaleTimeString()}</p>
            </div>
            <button onClick={handleSubmit} className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">Submit & Close</button>
          </div>
        )}

        {session && (
          <div className="space-y-4">
            <Section title="Verified" color="text-green-700" records={attendance.verified} renderActions={() => null} />
            <Section title="Unverified — Pending Review" color="text-yellow-700" records={attendance.unverified}
              renderActions={(r) => (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(r._id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Approve</button>
                  <button onClick={() => handleReject(r._id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                </div>
              )} />
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-gray-700 mb-3">Not Marked ({attendance.absent?.length || 0})</h3>
              {!attendance.absent?.length ? <p className="text-sm text-gray-400">All students marked.</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Mark</th></tr></thead>
                  <tbody>
                    {attendance.absent.map((s) => (
                      <tr key={s._id} className="border-b last:border-0">
                        <td className="py-2">{s.name}</td>
                        <td className="py-2 text-gray-500">{s.email}</td>
                        <td className="py-2">
                          <select defaultValue="" onChange={(e) => e.target.value && handleManual(s._id, e.target.value)} className="border rounded px-2 py-1 text-xs">
                            <option value="">Mark as...</option>
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, color, records, renderActions }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className={`font-medium mb-3 ${color}`}>{title} ({records.length})</h3>
      {!records.length ? <p className="text-sm text-gray-400">None.</p> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th className="pb-2">Status</th><th className="pb-2">Time</th><th className="pb-2">Actions</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-b last:border-0">
                <td className="py-2">{r.studentId?.name || '—'}</td>
                <td className="py-2 capitalize">{r.status}</td>
                <td className="py-2 text-gray-500">{new Date(r.time).toLocaleTimeString()}</td>
                <td className="py-2">{renderActions(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
