// src/components/AgeVerificationModal.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Fade,
  Stack,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

const ConfirmButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.95rem",
  borderRadius: 999,
  padding: theme.spacing(1.3, 4),
  backgroundColor: theme.palette.text.primary,
  color: theme.palette.background.paper,
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  transition: "all 0.25s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.text.primary, 0.88),
    boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
    transform: "translateY(-2px)",
  },
  "&:active": {
    transform: "translateY(0px)",
  },
}));

const DenyButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.9rem",
  borderRadius: 999,
  padding: theme.spacing(1.1, 3),
  color: theme.palette.text.secondary,
  border: `1px solid ${alpha(theme.palette.text.primary, 0.15)}`,
  transition: "all 0.25s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.error.main, 0.06),
    borderColor: alpha(theme.palette.error.main, 0.4),
    color: theme.palette.error.main,
  },
}));

const AgeIconBadge = styled(Box)(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: "20px",
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      : "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.mode === "light" ? "#fff" : "#1a1a2e",
  boxShadow:
    theme.palette.mode === "light"
      ? "0 12px 30px rgba(15,52,96,0.35)"
      : "0 12px 30px rgba(0,0,0,0.2)",
  marginBottom: theme.spacing(2.5),
  position: "relative",
  "&::after": {
    content: '"18+"',
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor:
      theme.palette.mode === "light" ? "#e53e3e" : "#fc8181",
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: 800,
    borderRadius: "8px",
    padding: "2px 5px",
    lineHeight: 1.4,
    letterSpacing: "0.02em",
    boxShadow: "0 2px 8px rgba(229,62,62,0.4)",
  },
}));

/* ------------------------------------------------------------------ */
/*  Pantalla de bloqueo (acceso denegado)                              */
/* ------------------------------------------------------------------ */

const BlockedScreen = ({ onRetry }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor:
          theme.palette.mode === "light" ? "#0a0a0a" : "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        textAlign: "center",
        gap: 2,
      }}
    >
      <BlockOutlinedIcon
        sx={{
          fontSize: 64,
          color: alpha("#fff", 0.15),
          mb: 1,
        }}
      />
      <Typography
        variant="h5"
        sx={{
          color: alpha("#fff", 0.9),
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Acceso restringido
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: alpha("#fff", 0.45),
          maxWidth: 320,
          lineHeight: 1.7,
        }}
      >
        Este sitio es exclusivo para personas mayores de 18 años. Si cometiste
        un error, podés intentarlo nuevamente.
      </Typography>
      <Button
        variant="outlined"
        onClick={onRetry}
        sx={{
          mt: 2,
          textTransform: "none",
          borderRadius: 999,
          color: alpha("#fff", 0.6),
          borderColor: alpha("#fff", 0.15),
          "&:hover": {
            borderColor: alpha("#fff", 0.35),
            backgroundColor: alpha("#fff", 0.05),
            color: alpha("#fff", 0.85),
          },
        }}
      >
        Volver a intentar
      </Button>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

const AGE_KEY = "age_verified_18plus";

const AgeVerificationModal = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem(AGE_KEY);
    if (!verified) {
      // Pequeño delay para que el modal aparezca con la app ya cargada
      const timer = setTimeout(() => setOpen(true), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConfirm = () => {
    sessionStorage.setItem(AGE_KEY, "true");
    setOpen(false);
  };

  const handleDeny = () => {
    setOpen(false);
    setBlocked(true);
  };

  const handleRetry = () => {
    setBlocked(false);
    setTimeout(() => setOpen(true), 200);
  };

  if (blocked) {
    return <BlockedScreen onRetry={handleRetry} />;
  }

  return (
    <Dialog
      open={open}
      slots={{ transition: Fade }}
      transitionDuration={400}
      disableEscapeKeyDown
      // Impedir cierre al hacer click fuera
      onClose={() => {}}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            borderRadius: "2.5rem",
            maxWidth: 420,
            width: "calc(100% - 32px)",
            margin: "16px",
            backgroundColor: theme.palette.background.paper,
            backgroundImage: "none",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 32px 64px -16px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)"
                : "0 32px 64px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
            overflow: "visible",
          },
        },
        backdrop: {
          sx: {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(0,0,0,0.65)"
                : "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
          },
        },
      }}
    >
      <DialogContent
        sx={{
          padding: { xs: "2.5rem 1.75rem", sm: "3rem 2.5rem" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 0,
        }}
      >
        {/* Ícono */}
        <AgeIconBadge>
          <CakeOutlinedIcon sx={{ fontSize: 32 }} />
        </AgeIconBadge>

        {/* Título */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.2,
            mb: 1,
            color: "text.primary",
          }}
        >
          Verificación de edad
        </Typography>

        {/* Subtítulo */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.7,
            mb: 3.5,
            maxWidth: 320,
          }}
        >
          Este sitio está destinado exclusivamente a personas mayores de{" "}
          <Box
            component="span"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            18 años
          </Box>
          . Al continuar, confirmás que cumplís con este requisito.
        </Typography>

        {/* Separador decorativo */}
        <Box
          sx={{
            width: 40,
            height: 3,
            borderRadius: 99,
            backgroundColor: alpha(theme.palette.text.primary, 0.08),
            mb: 3.5,
          }}
        />

        {/* Botones */}
        <Stack spacing={1.5} width="100%">
          <ConfirmButton
            fullWidth
            onClick={handleConfirm}
            startIcon={<CheckCircleOutlinedIcon fontSize="small" />}
          >
            Sí, soy mayor de 18 años
          </ConfirmButton>

          <DenyButton fullWidth variant="outlined" onClick={handleDeny}>
            No, soy menor de edad
          </DenyButton>
        </Stack>

        {/* Nota legal */}
        <Typography
          variant="caption"
          sx={{
            mt: 2.5,
            color: alpha(theme.palette.text.primary, 0.3),
            lineHeight: 1.6,
            maxWidth: 280,
          }}
        >
          Al acceder, aceptás que sos mayor de 18 años y que cumplís con los
          requisitos legales de tu jurisdicción.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default AgeVerificationModal;
