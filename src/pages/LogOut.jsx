import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";
import { Navigate } from "react-router";

const LogOut = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Navigate to="/login" />
      </Box>
    </>
  );
};

export default LogOut;
