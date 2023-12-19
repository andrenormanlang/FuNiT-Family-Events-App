import { Routes, Route } from 'react-router-dom';
import Navbar from './pages/partials/Navigation';
import EventGrid from './pages/EventGrid/EventGrid';
import EventForm from './pages/FormPages/EventFormPage';
import './assets/scss/App.scss';

function App() {
  return (
    <div id='App'>
      <Navbar />
      <Routes>
        <Route path="/event-form" element={<EventForm />} />
        <Route path="/" element={<EventGrid />} />
      </Routes>
    </div>
  );
}

export default App;