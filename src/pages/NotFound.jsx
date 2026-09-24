// src/pages/NotFound.jsx
import { Box, Paper, Typography, Button, Stack, Divider } from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { NavLink, useNavigate } from "react-router";
import { nombrePagina } from "../components/datos/pagina";

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

const PremiumPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 520,
  borderRadius: "2.5rem",
  padding: theme.spacing(5, 4),
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
    padding: theme.spacing(4, 2.5),
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

/* Número 404 con degradado sutil */
const ErrorNumber = styled(Typography)(({ theme }) => ({
  fontSize: "clamp(4.5rem, 14vw, 7rem)",
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: "-0.06em",
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(180deg, #1e1e1e 0%, #8b8b8b 100%)"
      : "linear-gradient(180deg, #f2f2f2 0%, #6b6b70 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  marginBottom: theme.spacing(2),
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

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export default function NotFound() {
  const theme = useTheme();
  const navigate = useNavigate();

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
        {/* Logo */}
        {/*         <LogoBadge>
          <Diversity1Icon sx={{ fontSize: 26 }} />
        </LogoBadge> */}

        {/* Icono decorativo */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor:
              theme.palette.mode === "light"
                ? alpha("#000", 0.03)
                : alpha("#fff", 0.05),
            color: "text.disabled",
            mb: 2.5,
          }}
        >
          <SearchOffOutlinedIcon sx={{ fontSize: 30 }} />
        </Box>

        {/* Número 404 */}
        <ErrorNumber>404</ErrorNumber>

        {/* Título */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            mb: 1.5,
          }}
        >
          Página no encontrada
        </Typography>

        {/* Descripción */}
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            maxWidth: 360,
            mx: "auto",
            lineHeight: 1.6,
            mb: 3.5,
          }}
        >
          Lo sentimos, la página que buscás no existe o fue movida. Verificá la
          URL o volvé al inicio.
        </Typography>

        <Divider sx={{ mb: 3.5 }} />

        {/* Acciones */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
        >
          <SecondaryButton
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon fontSize="small" />}
          >
            Volver atrás
          </SecondaryButton>

          <PrimaryButton
            component={NavLink}
            to="/"
            startIcon={<HomeOutlinedIcon fontSize="small" />}
          >
            Ir al inicio
          </PrimaryButton>
        </Stack>

        {/* Pie sutil */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 3.5,
            color: "text.disabled",
            fontSize: "0.72rem",
            letterSpacing: "0.02em",
          }}
        >
          {nombrePagina}
        </Typography>
      </PremiumPaper>
    </Box>
  );
}
