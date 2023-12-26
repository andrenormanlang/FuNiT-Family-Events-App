import { Routes, Route } from 'react-router-dom';
import Navbar from './pages/partials/Navigation';
import EventGrid from './pages/EventGrid/EventGrid';
import EventForm from './pages/FormPages/EventFormPage';
import './assets/scss/App.scss';
import EventPage from './pages/EventPage/EventPage';
import SignUp from './pages/UserPages/SignUp';
import LogInPage from './pages/UserPages/LogInPage';
import LogOutPage from './pages/UserPages/LogOutPage';
import AuthOnly from './components/Auth/AuthOnly';
import SavedEvents from './pages/SavedEvents/SavedEvents';
import SavedEventsProvider from './contexts/SavedEventsProvider';

function App() {
  return (

      <SavedEventsProvider>
        <div id='App'>
          <Navbar />
          <Routes>
            {/* Unprotected Routes */}
            <Route path="/:id" element={<EventPage />} />
            <Route path="/" element={<EventGrid />} />
            <Route path='/register' element={<SignUp />} />
            <Route path='/login' element={<LogInPage />} />

            {/* Protected Routes */}
            <Route path='/event-form' element={<AuthOnly><EventForm /></AuthOnly>} />
            
            <Route path='/saved-events' element={<AuthOnly><SavedEvents /></AuthOnly>} />
            <Route path='/logout' element={<AuthOnly><LogOutPage /></AuthOnly>} />
          </Routes>
        </div>
      </SavedEventsProvider>
  );
}

export default App;