import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { TextField, Button, Divider, CircularProgress } from "@mui/material";

const Login = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /*   useEffect(() => {
    if (user) navigate("/");
  }, [user]); */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      alert("Datos incorrectos. Si no tienes cuenta, regístrate");
      console.log(error);
    }
  };

  return (
    <>
      <h1>Login</h1>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          "& > :not(style)": {
            m: 1,
            width: 300,
            height: 300,
          },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            width: "100%",
            height: "100%",
          }}
        >
          <form onSubmit={handleSubmit}>
            <TextField
              id="standard-basic"
              label="Email"
              variant="standard"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
            <TextField
              id="standard-basic"
              label="Password"
              type="password"
              variant="standard"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
            <Button
              variant="outlined"
              type="submit"
              disabled={loading}
              sx={{
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
                alignItems: "center",
                marginTop: "20px",
                marginBottom: "20px",
                width: "100%",
              }}
            >
              Login
            </Button>
          </form>
          <Divider orientation="horizontal" flexItem />
          {loading && <CircularProgress />}
          <p>
            ¿No tienes cuenta? <br />
            <Link to="/register">Regístrate</Link>
          </p>
        </Paper>
      </Box>
    </>
  );
};

export default Login;
