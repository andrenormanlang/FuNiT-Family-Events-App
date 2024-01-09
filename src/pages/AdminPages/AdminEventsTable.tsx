import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
// import { Button } from '@mui/material';
import { formatDate } from '../../helpers/FormatDate';
import { simpleAddress } from '../../helpers/SimpleAddress';
import { AppEvent } from '../../types/Event.types';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { IconButton, Switch } from '@mui/material';
import { db } from '../../services/firebase';
import { Delete } from '@mui/icons-material';
import { highlightUtils } from '../../helpers/HighLightUtils';

const AdminEventsTable = ({ events, searchTerm }: { events: AppEvent[], searchTerm: string }) => {
    const handleApproval = async (eventId: string, isCurrentlyApproved: boolean) => {
        const eventDocRef = doc(db, 'events', eventId as string);
        await updateDoc(eventDocRef, {
            isApproved: !isCurrentlyApproved
        });
    };

    console.log('events', events);

    const handleDeleteEvent = async (eventId: string) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            await deleteDoc(doc(db, 'events', eventId));
            // Add logic to update the table or state
        }
    };
    const columns = [
        { 
            field: 'name', 
            headerName: 'Name', 
            width: 200,
            renderCell: (params: GridRenderCellParams) => highlightUtils(params.value as string, searchTerm),
        },
        {
            field: 'eventDateTime',
            headerName: 'Date',
            width: 200,
            renderCell: (params: GridRenderCellParams) => {
                const { date, time } = formatDate(params.value);
                return `${date} ${time}`; // Combine date and time or display them separately as needed.
            }
        },
        {
            field: 'address',
            headerName: 'Address',
            width: 300,
            renderCell: (params: GridRenderCellParams) => simpleAddress(params.value as string)
        },
        { field: 'category', headerName: 'Category', width: 200 },
        { field: 'ageGroup', headerName: 'Age Group', width: 100 },
        {
            field: 'createdAt',
            headerName: 'Created',
            width: 150,
            renderCell: (params: GridRenderCellParams) => {
                const { date, time } = formatDate(params.value);
                return `${date} ${time}`; // Combine date and time or display them separately as needed.
            }
        },
        {
            field: 'updatedAt',
            headerName: 'Updated',
            width: 150,
            renderCell: (params: GridRenderCellParams) => {
                const { date, time } = formatDate(params.value);
                return `${date} ${time}`; // Combine date and time or display them separately as needed.
            }
        },
        {
            field: 'isApproved',
            headerName: 'Approved?',
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <Switch
                    checked={params.value as boolean}
                    onChange={() => handleApproval(params.id as string, params.value as boolean)}
                    color="primary"
                />
            )
        },
        {
            field: 'delete',
            headerName: 'Delete',
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton onClick={() => handleDeleteEvent(params.id as string)}>
                    <Delete />
                </IconButton>
            ),
            sortable: false
        }
    ];

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <DataGrid
                rows={events}
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

export default AdminEventsTable;
