import AdminEventsTable from './AdminEventsTable';
import useStreamEvents from '../../hooks/useStreamEvents';
import { CircularProgress, Container, Typography } from '@mui/material';

const AdminEventsListPage = () => {
  const { events, isLoading, error } = useStreamEvents();

  if (isLoading) return <CircularProgress />;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="lg"> {/* Set the maxWidth similar to Navbar */}
      <Typography variant="h4" component="h2" gutterBottom>
        Events Review List
      </Typography>
      <AdminEventsTable events={events} />
    </Container>
  );
};

export default AdminEventsListPage;