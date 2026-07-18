import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export default function App() {
  const [matrix, setMatrix] = useState(null);
  const [testUser, setTestUser] = useState('bob');
  const [testAction, setTestAction] = useState('delete:docs');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/matrix')
      .then(res => res.json())
      .then(data => setMatrix(data))
      .catch(console.error);
  }, []);

  const handleTestAccess = async () => {
      // In a real app we'd hit the Node API, but here we hit the RBAC engine directly for the UI demo to avoid CORS issues on the backend proxying
      try {
          const res = await fetch('http://localhost:8000/api/v1/evaluate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user: testUser, action: testAction })
          });
          const data = await res.json();
          setTestResult(data);
      } catch (e) {
          console.error(e);
      }
  };

  if (!matrix) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading RBAC Rules...</div>;

  const allPermissions = ["read:docs", "write:docs", "delete:docs"];
  const allRoles = Object.keys(matrix.roles);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8">
      <h1 className="text-3xl font-bold flex items-center gap-3 text-white mb-8">
        <Shield className="text-purple-500 w-8 h-8"/>
        SaaS RBAC Control Center
      </h1>

      <div className="grid grid-cols-2 gap-8">
        
        {/* Permissions Matrix */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <h2 className="text-xl font-bold p-6 border-b border-slate-700 text-white bg-slate-900">Permissions Matrix</h2>
            <table className="w-full text-center">
                <thead className="bg-slate-800 border-b border-slate-700">
                    <tr>
                        <th className="p-4 text-left text-slate-400">Role</th>
                        {allPermissions.map(p => <th key={p} className="p-4 text-slate-400 font-mono text-sm">{p}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {allRoles.map(role => (
                        <tr key={role} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="p-4 text-left font-bold text-white capitalize">{role}</td>
                            {allPermissions.map(p => (
                                <td key={p} className="p-4">
                                    {matrix.roles[role].includes(p) ? 
                                        <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto"/> : 
                                        <XCircle className="w-6 h-6 text-slate-600 mx-auto"/>
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Access Simulator */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 flex flex-col">
             <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-700 pb-4">Test Middleware Authorization</h2>
             
             <div className="space-y-4 mb-6">
                 <div>
                     <label className="block text-slate-400 mb-2 font-bold text-sm">Select User (Mock Identity)</label>
                     <select 
                        value={testUser} onChange={e => setTestUser(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white"
                     >
                         <option value="alice">Alice (Admin)</option>
                         <option value="bob">Bob (Editor)</option>
                         <option value="charlie">Charlie (Viewer)</option>
                     </select>
                 </div>
                 
                 <div>
                     <label className="block text-slate-400 mb-2 font-bold text-sm">Attempt Action</label>
                     <select 
                        value={testAction} onChange={e => setTestAction(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white font-mono"
                     >
                         {allPermissions.map(p => <option key={p} value={p}>{p}</option>)}
                     </select>
                 </div>
             </div>

             <button 
                onClick={handleTestAccess}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded mb-6"
             >
                 Simulate API Request
             </button>

             {testResult && (
                 <div className={`p-4 rounded border font-mono text-sm ${testResult.allowed ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}>
                     {testResult.allowed ? 
                        <div className="flex items-center gap-2 font-bold mb-1"><CheckCircle className="w-5 h-5"/> HTTP 200 OK</div> : 
                        <div className="flex items-center gap-2 font-bold mb-1"><ShieldAlert className="w-5 h-5"/> HTTP 403 Forbidden</div>
                     }
                     <div>{testResult.reason}</div>
                 </div>
             )}
        </div>

      </div>
    </div>
  );
}
