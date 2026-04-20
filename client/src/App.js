import './App.css';
import {
  createBrowserRouter, createRoutesFromElements, NavLink, Route,
  RouterProvider, Routes
} from 'react-router-dom';
import { RegisterPage } from './Pages/Register/RegisterPage';
import { LoginPage } from './Pages/Login/LoginPage';
import { CreateSchoolPage } from './Pages/CreateSchool/CreateSchoolPage';
function App() {
  return (
    <Routes>
      <Route path="/">
        <Route path="/register" element={<RegisterPage />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path='/createSchool' element={<CreateSchoolPage/>}/>
      </Route>
    </Routes>

  );
}

export default App;
