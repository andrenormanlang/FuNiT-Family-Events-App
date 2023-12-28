import { DataGrid, GridRenderCellParams, GridRowId } from '@mui/x-data-grid';
// import { Button } from '@mui/material';
import { formatDate } from '../../helpers/FormatDate';
import { simpleAddress } from '../../helpers/SimpleAddress';
import { AppEvent } from '../../types/Event.types';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@mui/material';
import { db } from '../../services/firebase';

const AdminEventsTable = ({ events }: { events: AppEvent[] }) => {
    const handleApprove = async (eventId: GridRowId) => {
        // Type GridRowId for eventId
        const eventDocRef = doc(db, 'events', eventId as string); // Casting eventId to string
        await updateDoc(eventDocRef, {
            isApproved: true
        });
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        {
            field: 'eventDateTime',
            headerName: 'Date',
            width: 100,
            renderCell: (params: GridRenderCellParams) => formatDate(params.value)
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
            field: 'isApproved',
            headerName: 'Rendered?',
            renderCell: (params: GridRenderCellParams) => (
              <Button onClick={() => handleApprove(params.id)} variant="contained" color="primary">
                  Approve
              </Button>
          ),
            width: 100
        }

        // {
        //   field: 'edit',
        //   headerName: 'Edit',
        //   renderCell: () => (
        //     <Button variant="contained" color="primary">Edit</Button>
        //   ),
        //   width: 100
        // }
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
                checkboxSelection
            />
        </div>
    );
};

export default AdminEventsTable;
