'use client';

import { useEffect, useMemo, useState } from 'react'
import { Search, Filter, MoreVertical, Phone, Mail, Calendar } from 'lucide-react';

type ClientUser = {
  id: number
  name: string
  email: string
  joined: string
}

export default function ClientsPage() {
  const [query, setQuery] = useState<string>('')
  const [users, setUsers] = useState<ClientUser[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    params.set('page', '1')
    params.set('pageSize', '20')
    return `/api/user?${params.toString()}`
  }, [query])

  useEffect(() => {
    let isCancelled = false
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(apiUrl, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to load users')
        const data: { users: ClientUser[] } = await res.json()
        if (!isCancelled) setUsers(data.users)
      } catch (e) {
        if (!isCancelled && !(e instanceof DOMException && e.name === 'AbortError')) {
          setError('Could not fetch users')
        }
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }
    load()
    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [apiUrl])

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Clients</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Search clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2 text-sm md:text-base border border-gray-300 dark:border-[#334155] rounded-lg bg-white dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 border border-gray-300 dark:border-[#334155] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1e293b] text-gray-800 dark:text-gray-100 text-sm md:text-base whitespace-nowrap">
          <Filter className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      {/* Clients Table - Desktop */}
      <div className="hidden lg:block bg-white dark:bg-[#0B1120] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-[#1f2937]">
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
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-500 dark:text-gray-400" colSpan={6}>Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-500 dark:text-gray-400" colSpan={6}>No clients found</td>
              </tr>
            ) : (
              users.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">-</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`}>
                      -
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(client.joined).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Clients Cards - Mobile and Tablet */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No clients found</div>
        ) : (
          users.map((client) => (
            <div key={client.id} className="bg-white dark:bg-[#0B1120] rounded-lg shadow-sm border border-gray-200 dark:border-[#1f2937] p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`}>
                      -
                    </span>
                  </div>
                </div>
                <button className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>-</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Joined {new Date(client.joined).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
