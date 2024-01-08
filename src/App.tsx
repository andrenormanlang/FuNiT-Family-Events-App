import { Routes, Route } from 'react-router-dom';
import Navbar from './pages/partials/Navigation';
import EventGrid from './pages/EventGrid/EventGrid';
import EventForm from './pages/FormPages/EventFormPage';
import FourOFour from './pages/UserPages/404Page';
import './assets/scss/App.scss';
import EventPage from './pages/EventPage/EventPage';
import SignUp from './pages/UserPages/SignUp';
import LogInPage from './pages/UserPages/LogInPage';
import LogOutPage from './pages/UserPages/LogOutPage';
import AuthOnly from './components/Auth/AuthOnly';
import SavedEvents from './pages/SavedEvents/SavedEvents';
import SavedEventsProvider from './contexts/SavedEventsProvider';
import Profile from './pages/UserPages/Profile/ProfilePage';
import AuthContextProvider from './contexts/AuthContextProvider';
import AdminEventsListPage from './pages/AdminPages/AdminReviewList';
import AdminOnly from './components/Auth/AdminOnly';
import SendPassword from './pages/UserPages/SendPassword';
import EventEditPage from './pages/AdminPages/EventEditPage';
import AdminUsersListPage from './pages/AdminPages/AdminUsersList';
import Algolia from './components/Algolia/SyncToAlgolia';


function App() {
    return (
        <SavedEventsProvider>
            <AuthContextProvider>
                {' '}
                {/* Wrap your components with AuthContextProvider */}
                <div id="App">
                    <Navbar />
                    <Routes>
                        {/* Unprotected Routes */}
                        {/* <Route path='*' element={< FourOFour />} /> */}
                        <Route path="/:id" element={<EventPage />} />
                        <Route path="/" element={<EventGrid />} />
                        <Route path="/register" element={<SignUp />} />
                        <Route path="/login" element={<LogInPage />} />
                        <Route path="/forgot-password" element={<SendPassword />} />

                        {/* Protected Routes */}
                        <Route
                            path="/event-form"
                            element={
                                <AuthOnly>
                                    <EventForm />
                                </AuthOnly>
                            }
                        />
                        <Route
                            path="/events-list"
                            element={
                                <AdminOnly>
                                    <AdminEventsListPage />
                                </AdminOnly>
                            }
                        />
                        <Route
                            path="/users-list"
                            element={
                                <AdminOnly>
                                    <AdminUsersListPage />
                                </AdminOnly>
                            }
                        />
                        <Route
                            path="/algolia"
                            element={
                                <AdminOnly>
                                    <Algolia/>
                                </AdminOnly>
                            }
                        />
                        
                        <Route
                            path="/edit-event/:id"
                            element={
                                <AdminOnly>
                                    <EventEditPage />
                                </AdminOnly>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <AuthOnly>
                                    <Profile />
                                </AuthOnly>
                            }
                        />
                        <Route
                            path="/saved-events"
                            element={
                                <AuthOnly>
                                    <SavedEvents />
                                </AuthOnly>
                            }
                        />
                        <Route
                            path="/logout"
                            element={
                                <AuthOnly>
                                    <LogOutPage />
                                </AuthOnly>
                            }
                        />
                        <Route path="/404" element={<FourOFour />} />
                        <Route path="*" element={<FourOFour />} />
                    </Routes>
                </div>
            </AuthContextProvider>
        </SavedEventsProvider>
    );
}

export default App;
