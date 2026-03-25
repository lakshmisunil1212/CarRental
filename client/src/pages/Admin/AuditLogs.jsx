import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => { getAuditLogs().then(setLogs).catch(()=>{}); }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-left">
          <thead className="text-slate-500"><tr><th className="p-3">Time</th><th>Action</th><th>User</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l._id} className="border-t"><td className="p-3">{new Date(l.createdAt).toLocaleString()}</td><td>{l.action}</td><td>{l.user ? `${l.user.name} (${l.user.email})` : 'System'}</td><td><pre className="text-xs">{JSON.stringify(l.details)}</pre></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
