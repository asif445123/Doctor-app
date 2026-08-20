"use client";

import { FaPen, FaTrash } from "react-icons/fa";

export default function PatientTable({ patients, onRowClick, onEdit, onDelete, isDemo }) {
  if (!patients.length) {
    return (
      <div className="card text-center text-sm text-slate-500">No patients found.</div>
    );
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Sr.</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Patient Name</th>
            <th className="px-4 py-3">Age</th>
            <th className="px-4 py-3">Disease</th>
            <th className="px-4 py-3">Medicine</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">House Address</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map((p) => (
            <tr
              key={p._id}
              onClick={() => onRowClick(p)}
              className="cursor-pointer hover:bg-slate-50"
            >
              <td className="px-4 py-3">{p.srNo}</td>
              <td className="px-4 py-3">{p.date?.slice(0, 10)}</td>
              <td className="px-4 py-3 font-medium">{p.patientName}</td>
              <td className="px-4 py-3">{p.age}</td>
              
              <td className="px-4 py-3">{p.disease}</td>
              <td className="px-4 py-3">{p.medicine}</td>
              <td className="px-4 py-3">{p.amount}</td>
              <td className="px-4 py-3">{p.houseAddress}</td>
              <td className="px-4 py-3">
                
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(p);
                    }}
                    title="Edit"
                    className="text-brand-600 hover:text-brand-800"
                  >
                    <FaPen size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p);
                    }}
                    title="Remove"
                    disabled={isDemo}
                    className="text-red-500 hover:text-red-700 disabled:opacity-40"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
