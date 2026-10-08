import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Users() {
    const queryClient = useQueryClient();
    // Fetch all users
    const { data: users = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await userAPI.getAll();
            return Array.isArray(response.data) ? response.data : response.data.results || [];
        }
    });

    // Update user role mutation
    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }) => userAPI.setRole(userId, role),
        onSuccess: () => {
            toast.success('User role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            toast.error('Failed to update user role');
            console.error(error);
        }
    });

    const handleRoleChange = (userId, role) => {
        if (window.confirm(`Are you sure you want to change this user's role?`)) {
            updateRoleMutation.mutate({ userId, role });
        }
    };

    if (isLoading) {
        return <div className="flex h-48 items-center justify-center text-sm text-slate-500">Loading team…</div>;
    }

    return (
        <div className="space-y-6">
            <header>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Step 5 · Administration</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Manage team access</h1>
                <p className="mt-1 text-sm text-slate-500">Assign the right workspace access to each teammate.</p>
            </header>

            {isError && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>Team members could not be loaded.</span><button onClick={() => refetch()} className="font-bold text-rose-800">Try again</button></div>}
            {!isError && users.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No team members were found.</div>}
            {users.length > 0 && <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users?.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">
                                        {user.first_name} {user.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">@{user.username}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${user.profile?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.profile?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                'bg-slate-100 text-slate-700'}`}>
                                        {user.profile?.role || 'staff'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.profile?.role || 'staff'}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={updateRoleMutation.isPending}
                                        aria-label={`Role for ${user.username}`}
                                        className="rounded-lg border-slate-300 px-2.5 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-blue-100 disabled:opacity-60"
                                    >
                                        <option value="staff">Sales Staff</option>
                                        <option value="manager">Inventory Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>}
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
        </div>
    );
}
