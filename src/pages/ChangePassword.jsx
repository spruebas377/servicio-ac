// src/pages/ChangePassword.jsx
import { useState } from "react";
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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
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

const ChangePassword = () => {
  const theme = useTheme();
  const { user, loading: authLoading, updatePassword } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword) {
      setError("Por favor ingresa una nueva contraseña.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(newPassword);
      setSuccess("¡Tu contraseña ha sido actualizada con éxito!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error al actualizar la contraseña:", err);
      setError(
        err?.message ||
          "No se pudo modificar la contraseña. Inténtalo nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordsMismatch = Boolean(
    confirmPassword && newPassword !== confirmPassword,
  );

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
            <LockResetOutlinedIcon sx={{ fontSize: 28 }} />
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
            Modificar contraseña
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Ingresa tu nueva contraseña para actualizar la seguridad de tu
            cuenta
          </Typography>
        </Box>

        {!authLoading && !user && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2.5,
              fontSize: "0.85rem",
            }}
          >
            Debes haber iniciado sesión o ingresar desde el enlace de
            recuperación para cambiar tu contraseña.
          </Alert>
        )}

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

        {success && (
          <Alert
            severity="success"
            icon={<CheckCircleOutlineOutlinedIcon fontSize="inherit" />}
            sx={{
              mb: 2.5,
              borderRadius: 2.5,
              fontSize: "0.85rem",
            }}
          >
            {success}
          </Alert>
        )}

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
            type={showNewPassword ? "text" : "password"}
            label="Nueva contraseña"
            placeholder="Mínimo 6 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            sx={fieldSx(theme)}
            slotProps={{
              input: {
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
                      onClick={() => setShowNewPassword((v) => !v)}
                      edge="end"
                      size="small"
                      aria-label={
                        showNewPassword
                          ? "Ocultar nueva contraseña"
                          : "Mostrar nueva contraseña"
                      }
                      sx={{
                        color: "text.disabled",
                        "&:hover": { color: "text.primary" },
                      }}
                    >
                      {showNewPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            type={showConfirmPassword ? "text" : "password"}
            label="Confirmar nueva contraseña"
            placeholder="Repite la nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            error={passwordsMismatch}
            helperText={passwordsMismatch ? "Las contraseñas no coinciden" : ""}
            sx={fieldSx(theme)}
            slotProps={{
              input: {
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
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      edge="end"
                      size="small"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar confirmación de contraseña"
                          : "Mostrar confirmación de contraseña"
                      }
                      sx={{
                        color: "text.disabled",
                        "&:hover": { color: "text.primary" },
                      }}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <PrimaryButton
            type="submit"
            fullWidth
            disabled={isSubmitting || authLoading || (!user && !location.hash)}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <LockResetOutlinedIcon fontSize="small" />
              )
            }
          >
            {isSubmitting ? "Actualizando…" : "Actualizar contraseña"}
          </PrimaryButton>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          {user ? (
            <Button
              component={NavLink}
              to="/profile"
              variant="text"
              size="small"
              startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontWeight: 500,
                borderRadius: 999,
                "&:hover": { color: "text.primary" },
              }}
            >
              Volver a mi perfil
            </Button>
          ) : (
            <Button
              component={NavLink}
              to="/login"
              variant="text"
              size="small"
              startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontWeight: 500,
                borderRadius: 999,
                "&:hover": { color: "text.primary" },
              }}
            >
              Ir a iniciar sesión
            </Button>
          )}
        </Stack>
      </PremiumPaper>
    </Box>
  );
};

export default ChangePassword;
