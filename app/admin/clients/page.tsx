'use client';

import { Search, Filter, MoreVertical } from 'lucide-react';

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#334155] rounded-lg bg-white dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-[#334155] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1e293b] text-gray-800 dark:text-gray-100">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-[#0B1120] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-[#1f2937]">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#1e293b]">
            <tr>
              {['Client', 'Email', 'Phone', 'Status', 'Joined', 'Actions'].map((heading, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    heading === 'Actions' ? 'text-right' : ''
                  } text-gray-600 dark:text-gray-400`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#1f2937]">
            {[
              {
                name: 'Rahul Sharma',
                email: 'rahul@example.com',
                phone: '+91 98765 43210',
                status: 'Active',
                joined: 'Jan 15, 2024',
              },
              {
                name: 'Priya Patel',
                email: 'priya@example.com',
                phone: '+91 98765 43211',
                status: 'Active',
                joined: 'Jan 20, 2024',
              },
              {
                name: 'Amit Kumar',
                email: 'amit@example.com',
                phone: '+91 98765 43212',
                status: 'Inactive',
                joined: 'Feb 1, 2024',
              },
            ].map((client, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {client.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {client.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      client.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {client.joined}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
