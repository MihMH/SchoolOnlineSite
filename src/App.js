import './App.css';
import {
  createBrowserRouter, createRoutesFromElements, NavLink, Route,
  RouterProvider, Routes
} from 'react-router-dom';
import { RegisterPage } from './Pages/Register/RegisterPage';
import { LoginPage } from './Pages/Login/LoginPage';
function App() {
  const router=createBrowserRouter(createRoutesFromElements(
    <Route path="/">
      <Route path="/register" element={<RegisterPage />}/>
      <Route path="/login" element={<LoginPage />}/>
    </Route>
  ))
  return (
    <div>
      
    </div>

  );
}

export default App;
