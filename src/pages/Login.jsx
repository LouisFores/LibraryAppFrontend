import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import AppSnackbar from "../components/AppSnackbar";
import { getErrorMessage } from "../api/handleError";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("123456");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  // ✅ Nếu đã login thì tự động về dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);

  const login = async () => {
    // ✅ Validate rỗng
    if (!username.trim() || !password.trim()) {
      setSnack({
        open: true,
        message: "Vui lòng nhập username và password",
        severity: "warning",
      });
      return;
    }

    try {
      const res = await axiosClient.post("/auth/login", {
        username,
        password,
      });

      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", username);

      setSnack({
        open: true,
        message: "Đăng nhập thành công ✅",
        severity: "success",
      });

      navigate("/");
    } catch (err) {
      setSnack({
        open: true,
        message: getErrorMessage(err),
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Admin Login
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
            />

            <Button variant="contained" onClick={login}>
              Login
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack({ ...snack, open: false })}
      />
    </Box>
  );
}