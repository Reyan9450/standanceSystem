import { useState, useEffect } from 'react';
import { markAttendance, getAttendanceHistory, getActiveSession } from '../services/api';

const user = JSON.parse(localStorage.getItem('user') || '{}');

export default function StudentDashboard() {
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [msg, setMsg] = useState('');
  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
    checkSession();
  }, []);

  async function fetchHistory() {
    try {
      const res = await getAttendanceHistory();
      setHistory(res.data.data);
    } catch {}
  }

  async function checkSession() {
    if (!user.classId) return;
    try {
      const res = await getActiveSession(user.classId);
      setActiveSession(res.data.data.session);
    } catch {}
  }

  async function handleMark() {
    if (!activeSession) return;
    setLoading(true);
    setMsg('');
    try {
      await markAttendance(activeSession._id);
      setMarked(true);
      setMsg('Attendance marked successfully.');
      fetchHistory();
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
  }

  const statusColors = {
    present: 'text-green-600 bg-green-50',
    late: 'text-yellow-600 bg-yellow-50',
    absent: 'text-red-600 bg-red-50',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-700 text-white px-6 py-3 flex justify-between items-center">
        <span className="font-semibold">Student Dashboard — {user.name}</span>
        <button onClick={handleLogout} className="text-sm underline">Logout</button>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {msg && (
          <div className={`px-4 py-2 rounded text-sm border ${msg.includes('success') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {msg}
          </div>
        )}

        {/* Mark Attendance Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Mark Attendance</h2>
          {!activeSession ? (
            <p className="text-sm text-gray-500">No active session found for your class.</p>
          ) : marked ? (
            <p className="text-sm text-green-600 font-medium">You have marked attendance for this session.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Active session: <span className="font-medium">{activeSession.subject}</span>
              </p>
              <button
                onClick={handleMark}
                disabled={loading}
                className="bg-indigo-600 text-white px-5 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Marking...' : 'Mark My Attendance'}
              </button>
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Attendance History</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">No attendance records yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Class</th>
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r._id} className="border-b last:border-0">
                    <td className="py-2">{new Date(r.sessionId?.startTime).toLocaleDateString()}</td>
                    <td className="py-2">{r.sessionId?.classId?.name || '—'}</td>
                    <td className="py-2">{r.sessionId?.subject || '—'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
