// src/pages/Register.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

const PremiumPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 440,
  borderRadius: "2.5rem",
  padding: theme.spacing(4.5, 3.5),
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  boxShadow:
    theme.palette.mode === "light"
      ? "0 20px 35px -8px rgba(0,0,0,0.04), 0 8px 18px -6px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.01)"
      : "0 20px 35px -8px rgba(0,0,0,0.5), 0 8px 18px -6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow:
      theme.palette.mode === "light"
        ? "0 30px 50px -12px rgba(0,0,0,0.08), 0 12px 24px -8px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)"
        : "0 30px 50px -12px rgba(0,0,0,0.65), 0 12px 24px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
  },
  [theme.breakpoints.down("sm")]: {
    borderRadius: "2rem",
    padding: theme.spacing(3.5, 2.5),
  },
}));

const LogoBadge = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: "16px",
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)"
      : "linear-gradient(135deg, #f2f2f2 0%, #b8b8b8 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.mode === "light" ? "#fff" : "#1e1e1e",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  marginBottom: theme.spacing(2),
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  borderRadius: 999,
  padding: theme.spacing(1.2, 3),
  backgroundColor: theme.palette.text.primary,
  color: theme.palette.background.paper,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.text.primary, 0.9),
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    transform: "translateY(-1px)",
  },
  "&.Mui-disabled": {
    backgroundColor: alpha(theme.palette.text.primary, 0.4),
    color: theme.palette.background.paper,
  },
}));

/* ---------- Estilo compartido para inputs ---------- */
const fieldSx = (theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha("#000", 0.015)
        : alpha("#fff", 0.03),
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: theme.palette.divider },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.text.primary, 0.2),
    },
    "&.Mui-focused fieldset": {
      borderColor: alpha(theme.palette.text.primary, 0.5),
      borderWidth: "1.5px",
    },
    "&.Mui-focused": {
      backgroundColor:
        theme.palette.mode === "light" ? "#fff" : alpha("#fff", 0.05),
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.9rem",
    "&.Mui-focused": { color: theme.palette.text.primary },
  },
});

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

const Register = () => {
  const theme = useTheme();
  const { user, signup, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(email, password);
      navigate("/");
    } catch (err) {
      console.log(err);
      setError(err?.message || "No se pudo crear la cuenta.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: { xs: 2, sm: 3 },
      }}
    >
      <PremiumPaper elevation={0}>
        {/* Logo + títulos */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            mb: 3,
          }}
        >
          <LogoBadge>
            <Diversity1Icon sx={{ fontSize: 26 }} />
          </LogoBadge>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            Crear cuenta
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Regístrate para comenzar a gestionar tus tareas
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              mb: 2.5,
              borderRadius: 2.5,
              fontSize: "0.85rem",
              border: `1px solid ${alpha("#d32f2f", 0.2)}`,
              backgroundColor: alpha("#d32f2f", 0.06),
              color: theme.palette.mode === "light" ? "#b30000" : "#ef9a9a",
              "& .MuiAlert-icon": { color: "inherit" },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Formulario */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <TextField
            fullWidth
            type="email"
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon
                    sx={{ color: "text.disabled", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon
                    sx={{ color: "text.disabled", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="small"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    sx={{
                      color: "text.disabled",
                      "&:hover": { color: "text.primary" },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <PrimaryButton
            type="submit"
            fullWidth
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PersonAddAltOutlinedIcon fontSize="small" />
              )
            }
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </PrimaryButton>
        </Box>

        {/* Divisor */}
        <Divider sx={{ my: 3 }} />

        {/* Link a login */}
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            ¿Ya tienes cuenta?
          </Typography>
          <Typography
            component={NavLink}
            to="/login"
            variant="body2"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              textDecoration: "none",
              transition: "color 0.2s ease, transform 0.2s ease",
              "&:hover": {
                color: alpha(theme.palette.text.primary, 0.75),
                transform: "translateX(2px)",
              },
            }}
          >
            Inicia sesión
          </Typography>
        </Stack>
      </PremiumPaper>
    </Box>
  );
};

export default Register;
