import HomePage from './home';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={<HomePage/>} />
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;
