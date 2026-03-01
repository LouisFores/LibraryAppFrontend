import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AppBar, Toolbar, Button } from "@mui/material";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Borrowers from "./pages/Borrowers";
import Loans from "./pages/Loans";
import Login from "./pages/Login";

function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      {isLoggedIn && (
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/books">Books</Button>
            <Button color="inherit" component={Link} to="/borrowers">Borrowers</Button>
            <Button color="inherit" component={Link} to="/loans">Loans</Button>

            <Button
              color="inherit"
              onClick={() => localStorage.clear()}
              component={Link}
              to="/login"
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/books" element={
            <PrivateRoute>
              <Books />
            </PrivateRoute>
          } />

          <Route path="/borrowers" element={
            <PrivateRoute>
              <Borrowers />
            </PrivateRoute>
          } />

          <Route path="/loans" element={
            <PrivateRoute>
              <Loans />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}