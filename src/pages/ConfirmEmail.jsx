// src/pages/ConfirmEmail.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Container,
  alpha,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const PremiumPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 480,
  borderRadius: "2.5rem",
  padding: theme.spacing(4.5, 3.5),
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  textAlign: "center",
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
  margin: "0 auto",
  marginBottom: theme.spacing(3),
}));

const IconBubble = styled(Box)(({ theme, success }) => ({
  width: 88,
  height: 88,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  marginBottom: theme.spacing(3),
  backgroundColor: success
    ? theme.palette.mode === "light"
      ? alpha("#4caf50", 0.1)
      : alpha("#4caf50", 0.15)
    : theme.palette.mode === "light"
      ? alpha("#000", 0.04)
      : alpha("#fff", 0.06),
  color: success
    ? theme.palette.mode === "light"
      ? "#2e7d32"
      : "#81c784"
    : theme.palette.text.primary,
  "& svg": { fontSize: 42 },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.9rem",
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

const SecondaryButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.9rem",
  borderRadius: 999,
  padding: theme.spacing(1.2, 2.5),
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: alpha(theme.palette.text.primary, 0.2),
    backgroundColor: alpha(theme.palette.text.primary, 0.03),
  },
}));

export default function ConfirmEmail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, resendConfirmation } = useAuth();

  const email = useMemo(() => {
    const fromState = location.state?.email;
    const fromQuery = new URLSearchParams(location.search).get("email");
    return fromState || fromQuery || "";
  }, [location.state, location.search]);

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  /* Si ya hay sesión activa (usuario confirmado), redirigir */
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleResend = async () => {
    if (!email) {
      setError(
        "No pudimos detectar tu email. Volvé a registrarte o iniciá sesión.",
      );
      return;
    }

    setError("");
    setResending(true);
    setResent(false);

    try {
      await resendConfirmation(email);
      setResent(true);
    } catch (err) {
      console.error("Error reenviando confirmación:", err);
      setError(err?.message || "No pudimos reenviar el correo.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, md: 6 },
      }}
    >
      <PremiumPaper elevation={0}>
        <LogoBadge>
          <Diversity1Icon sx={{ fontSize: 26 }} />
        </LogoBadge>

        <IconBubble success={resent}>
          {resent ? <CheckCircleOutlinedIcon /> : <MarkEmailReadOutlinedIcon />}
        </IconBubble>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            mb: 1.5,
          }}
        >
          Confirmá tu casilla de correo
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            maxWidth: 360,
            mx: "auto",
            lineHeight: 1.6,
            mb: 3,
          }}
        >
          Te enviamos un correo con un enlace de confirmación. Hacé click en él
          para activar tu cuenta y comenzar a usar AC-S.
        </Typography>

        {email && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: "100px",
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha("#000", 0.04)
                  : alpha("#fff", 0.06),
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
              maxWidth: "100%",
            }}
          >
            <MarkEmailReadOutlinedIcon
              sx={{ fontSize: 16, color: "text.disabled" }}
            />
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email}
            </Typography>
          </Box>
        )}

        {resent && (
          <Alert
            severity="success"
            onClose={() => setResent(false)}
            sx={{
              mb: 3,
              borderRadius: 2.5,
              textAlign: "left",
              fontSize: "0.85rem",
            }}
          >
            ¡Listo! Te reenviamos el correo. Revisá tu bandeja (y la carpeta de
            spam).
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              mb: 3,
              borderRadius: 2.5,
              textAlign: "left",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack spacing={1.5}>
          <PrimaryButton
            fullWidth
            onClick={handleResend}
            disabled={resending}
            startIcon={
              resending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <ReplayOutlinedIcon fontSize="small" />
              )
            }
          >
            {resending ? "Reenviando…" : "Reenviar correo de confirmación"}
          </PrimaryButton>

          <SecondaryButton
            fullWidth
            component={NavLink}
            to="/login"
            startIcon={<ArrowBackIcon fontSize="small" />}
          >
            Volver al inicio de sesión
          </SecondaryButton>
        </Stack>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 3.5,
            color: "text.disabled",
            fontSize: "0.72rem",
            lineHeight: 1.6,
          }}
        >
          ¿No recibiste el correo? Revisá tu carpeta de spam o esperá unos
          minutos antes de reenviarlo.
        </Typography>
      </PremiumPaper>
    </Container>
  );
}
