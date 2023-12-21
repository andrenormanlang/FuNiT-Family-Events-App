import { Routes, Route } from 'react-router-dom';
import Navbar from './pages/partials/Navigation';
import EventGrid from './pages/EventGrid/EventGrid';
import EventForm from './pages/FormPages/EventFormPage';
import './assets/scss/App.scss';
import EventPage from './pages/EventPage/EventPage';
import SignUp from './pages/SignUpInOutPages/SignUp';
import LogInPage from './pages/SignUpInOutPages/LogInPage';
import LogOutPage from './pages/SignUpInOutPages/LogOutPage';
import AuthOnly from './components/Auth/AuthOnly';

function App() {
  return (
    <div id='App'>
      <Navbar />
      <Routes>
        {/* Unprotected Routes */}
        <Route path="/event-form" element={<EventForm />} />
        <Route path="/:id" element={<EventPage />} />
        <Route path="/" element={<EventGrid />} />
        <Route path='/register' element={<SignUp />} />
        <Route path='/login' element={<LogInPage />} />
        <Route path='/sign-out' element={<LogOutPage />} />

        <Route
						path='/event-form'
						element={
							<AuthOnly>
								<EventForm />
							</AuthOnly>
						}
					/>
      </Routes>
    </div>
  );
}

export default App;