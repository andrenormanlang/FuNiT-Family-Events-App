import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { IconButton, Switch } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { UserInfo } from '../../types/User.types';
import { db } from '../../services/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

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

    const columns = [
        { field: 'displayName', headerName: 'Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 200 },
        { 
            field: 'isAdmin', 
            headerName: 'Admin', 
            renderCell: (params: GridRenderCellParams) => (
                <Switch
                    checked={params.value as boolean}
                    onChange={() => handleAdminToggle(params.id as string, params.value as boolean)}
                />
            ),
            width: 100 
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
        <div style={{ height: '100%', width: '100%' }}>
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
        </div>
    );
};

export default AdminUsersTable;
