import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Switch, TextField } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { UserInfo } from '../../types/User.types';
import { db } from '../../services/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useState } from 'react';

const AdminUsersTable = ({ users }: { users: UserInfo[] }) => {
    const handleAdminToggle = async (userId: string, isAdmin: boolean) => {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            isAdmin: !isAdmin
        });
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await deleteDoc(doc(db, 'users', userId));
        }
    };

    const [editUser, setEditUser] = useState<UserInfo | null>(null);

    const handleEditOpen = (user: UserInfo) => {
        setEditUser(user);
    };

    const handleEditClose = () => {
        setEditUser(null);
    };

    const handleEditSave = async () => {
        // Update user data in the database
        handleEditClose();
    };

    const columns = [
        {
            field: 'photoURL',
            headerName: 'Avatar',
            renderCell: (params: GridRenderCellParams) => <Avatar src={params.value as string} />,
            width: 100
        },
        { field: 'displayName', headerName: 'Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 400 },
        {
            field: 'isAdmin',
            headerName: 'Admin',
            renderCell: (params: GridRenderCellParams) => (
                <Switch checked={params.value as boolean} onChange={() => handleAdminToggle(params.id as string, params.value as boolean)} />
            ),
            width: 100
        },
        {
            field: 'edit',
            headerName: 'Edit',
            renderCell: (params: GridRenderCellParams) => (
                <IconButton onClick={() => handleEditOpen(params.row as UserInfo)}>
                    <Edit />
                </IconButton>
            ),
            width: 100,
            sortable: false
        },
        {
            field: 'delete',
            headerName: 'Delete',
            renderCell: (params: GridRenderCellParams) => (
                <IconButton onClick={() => handleDeleteUser(params.id as string)}>
                    <Delete />
                </IconButton>
            ),
            width: 100,
            sortable: false
        }
    ];

    return (
        <div style={{ height: '70vh', width: '100%' }}>
            <DataGrid
                rows={users}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 25 }
                    }
                }}
                pageSizeOptions={[25, 50]}
            />
            <Dialog open={!!editUser} onClose={handleEditClose}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    {/* Form fields for editing user data, e.g., name, email, etc. */}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={editUser?.displayName || ''}
                        onChange={(e) => setEditUser({ ...editUser!, displayName: e.target.value })}
                    />
                    {/* Add more fields as needed */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button onClick={handleEditSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AdminUsersTable;
