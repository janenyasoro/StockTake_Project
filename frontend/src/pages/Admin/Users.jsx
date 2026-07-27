import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Users() {
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState(null);

    // Fetch all users
    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await userAPI.getAll();
            return response.data;
        }
    });

    // Update user role mutation
    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }) => userAPI.setRole(userId, role),
        onSuccess: () => {
            toast.success('User role updated successfully');
            queryClient.invalidateQueries(['users']);
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
        return <div className="flex justify-center p-8">Loading users...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
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
                                                'bg-gray-100 text-gray-800'}`}>
                                        {user.profile?.role || 'staff'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.profile?.role || 'staff'}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="border rounded px-2 py-1 text-sm"
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
            </div>
        </div>
    );
}