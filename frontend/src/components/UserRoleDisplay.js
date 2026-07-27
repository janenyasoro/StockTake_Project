import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const UserRoleDisplay = () => {
    const { user, userRole, isAdmin, isSalesAgent, isInventoryManager } = useAuth()

    if (!user) {
        return <div>Please login to see your role</div>
    }

    const getRoleColor = () => {
        if (isAdmin()) return '#1976d2'  // Blue
        if (isSalesAgent()) return '#2e7d32'  // Green
        if (isInventoryManager()) return '#e65100'  // Orange
        return '#9e9e9e'  // Grey
    }

    const getRoleBadge = () => {
        if (isAdmin()) return '🛡️ Admin'
        if (isSalesAgent()) return '💼 Sales Agent'
        if (isInventoryManager()) return '📦 Inventory Manager'
        return '👤 User'
    }

    return (
        <div style={{
            padding: '15px',
            background: '#f5f5f5',
            borderRadius: '8px',
            borderLeft: `4px solid ${getRoleColor()}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ margin: 0 }}>{user.displayName || user.email}</h4>
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>{user.email}</p>
                </div>
                <div style={{
                    padding: '5px 15px',
                    background: getRoleColor(),
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>
                    {getRoleBadge()}
                </div>
            </div>
            {userRole && (
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    <span>Role: <strong>{userRole.role}</strong></span>
                    {userRole.company && <span> | Company: <strong>{userRole.company}</strong></span>}
                </div>
            )}
        </div>
    )
}

export default UserRoleDisplay
