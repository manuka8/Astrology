import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, UserCheck, Trash2, LayoutDashboard } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { getUsersApi, updateUserRoleApi } from '../../services/api';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await getUsersApi();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleUpdate = async (id, newRole) => {
        try {
            await updateUserRoleApi(id, newRole);
            fetchUsers();
            alert('Role updated successfully!');
        } catch (error) {
            alert('Failed to update role');
        }
    };

    return (
        <DashboardLayout>
            <div className="pt-32 pb-24 px-6 md:px-12 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-gold/20 rounded-2xl text-gold">
                            <LayoutDashboard size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-outfit gold-text-gradient">Admin Dashboard</h1>
                            <p className="text-white/50">Manage seekers and destiny controllers.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                        <Card className="p-6 border-gold/10">
                            <div className="flex items-center gap-4 mb-4">
                                <Users className="text-gold" size={24} />
                                <h3 className="font-bold">Total Seekers</h3>
                            </div>
                            <p className="text-3xl font-bold">{users.length}</p>
                        </Card>
                        <Card className="p-6 border-gold/10">
                            <div className="flex items-center gap-4 mb-4">
                                <Shield className="text-gold" size={24} />
                                <h3 className="font-bold">Admins</h3>
                            </div>
                            <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                        </Card>
                    </div>

                    <Card className="overflow-hidden border-gold/10">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                User Management
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-white/60 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center py-10">Fetching celestial data...</td></tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium">{user.name}</td>
                                                <td className="px-6 py-4 text-white/60">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-gold/20 text-gold' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="p-2 h-auto"
                                                        onClick={() => handleRoleUpdate(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                                    >
                                                        <UserCheck size={16} />
                                                    </Button>
                                                    <Button variant="outline" className="p-2 h-auto text-red-400 border-red-400/20 hover:bg-red-400/10">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
