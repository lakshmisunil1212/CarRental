import React, { useEffect, useState } from 'react';
import { adminGetUsers, adminPromoteUser } from '../../services/api';

export default function UsersManage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminGetUsers().then(setUsers).catch(()=>{});
  }, []);

  async function promote(id) {
    try {
      await adminPromoteUser(id);
      setUsers(users.map(u => u._id === id ? { ...u, role: 'owner' } : u));
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="text-left text-slate-500"><tr><th className="p-3">Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t"><td className="p-3">{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.role !== 'owner' && <button onClick={() => promote(u._id)} className="px-3 py-1 bg-green-100 text-green-700 rounded">Promote to Owner</button>}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
