// src/pages/AboutUs.jsx
import { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Avatar,
  Divider,
  Button,
  Chip,
  Grid,
  alpha,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { NavLink } from "react-router";
import { nombrePagina } from "../components/datos/pagina";

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

const PageRoot = styled(Box)(({ theme }) => ({
  minHeight: "calc(100vh - 72px)",
  paddingBottom: theme.spacing(8),
  [theme.breakpoints.up("md")]: {
    paddingBottom: theme.spacing(12),
  },
}));

const PremiumPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "2rem",
  padding: theme.spacing(4, 3.5),
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 20px 35px -8px rgba(0,0,0,0.04), 0 8px 18px -6px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.01)"
      : "0 20px 35px -8px rgba(0,0,0,0.5), 0 8px 18px -6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
  transition: "box-shadow 0.3s ease, transform 0.3s ease",
  "&:hover": {
    boxShadow:
      theme.palette.mode === "light"
        ? "0 30px 50px -12px rgba(0,0,0,0.08), 0 12px 24px -8px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)"
        : "0 30px 50px -12px rgba(0,0,0,0.65), 0 12px 24px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
  },
  [theme.breakpoints.down("sm")]: {
    borderRadius: "1.5rem",
    padding: theme.spacing(3, 2.2),
  },
}));

const HeroRoot = styled(Box)(({ theme }) => ({
  position: "relative",
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  textAlign: "center",
  overflow: "hidden",
  [theme.breakpoints.up("md")]: {
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(12),
  },
}));

const LogoBadge = styled(Box)(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: "20px",
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)"
      : "linear-gradient(135deg, #f2f2f2 0%, #b8b8b8 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.mode === "light" ? "#fff" : "#1e1e1e",
  boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
  margin: "0 auto",
  marginBottom: theme.spacing(3),
  "& svg": { fontSize: 36 },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "text.disabled",
  marginBottom: theme.spacing(1),
}));

const ValueCard = styled(Paper)(({ theme }) => ({
  height: "100%",
  borderRadius: "1.5rem",
  padding: theme.spacing(3, 2.5),
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 4px 20px -4px rgba(0,0,0,0.04)"
      : "0 4px 20px -4px rgba(0,0,0,0.3)",
  transition: "all 0.25s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    borderColor: alpha(theme.palette.text.primary, 0.15),
    boxShadow:
      theme.palette.mode === "light"
        ? "0 14px 30px -6px rgba(0,0,0,0.1)"
        : "0 14px 30px -6px rgba(0,0,0,0.5)",
  },
}));

const ValueIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor:
    theme.palette.mode === "light" ? alpha("#000", 0.04) : alpha("#fff", 0.06),
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  "& svg": { fontSize: 24 },
}));

const StatBlock = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2, 1),
}));

const StatNumber = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  lineHeight: 1,
  marginBottom: theme.spacing(0.75),
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(180deg, #1e1e1e 0%, #6b6b6b 100%)"
      : "linear-gradient(180deg, #f2f2f2 0%, #8b8b8b 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}));

const TeamAvatar = styled(Avatar)(({ theme }) => ({
  width: 88,
  height: 88,
  fontSize: "1.75rem",
  fontWeight: 600,
  backgroundColor: theme.palette.mode === "light" ? "#eaeef2" : "#2a2d34",
  color: theme.palette.text.primary,
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  marginBottom: theme.spacing(1.5),
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
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.95rem",
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
/*  Datos                                                              */
/* ------------------------------------------------------------------ */

const VALUES = [
  {
    icon: <FavoriteBorderOutlinedIcon />,
    title: "Cercanía",
    description:
      "Cada decisión la pensamos desde la persona que está del otro lado. La tecnología es el medio, no el fin.",
  },
  {
    icon: <VerifiedUserOutlinedIcon />,
    title: "Confianza",
    description:
      "Construimos un espacio seguro, con perfiles verificados y reglas claras para todas las partes.",
  },
  {
    icon: <BoltOutlinedIcon />,
    title: "Simplicidad",
    description:
      "Creemos que lo complejo se resuelve con menos, no con más. Interfaces limpias, flujos directos.",
  },
  {
    icon: <ShieldOutlinedIcon />,
    title: "Privacidad",
    description:
      "Tus datos son tuyos. Nunca los vendemos ni los compartimos con terceros sin tu consentimiento.",
  },
  {
    icon: <GroupsOutlinedIcon />,
    title: "Comunidad",
    description:
      "Escuchamos a nuestros usuarios. Cada mejora nace de sus necesidades reales, no de suposiciones.",
  },
  {
    icon: <AutoAwesomeOutlinedIcon />,
    title: "Detalle",
    description:
      "Nos obsesiona el cuidado visual y funcional. Lo premium no es lo caro, es lo bien hecho.",
  },
];

const TEAM = [
  {
    name: "Lara Montes",
    role: "Product Designer",
    initials: "LM",
  },
  {
    name: "Tomás Aguirre",
    role: "Full Stack Developer",
    initials: "TA",
  },
  {
    name: "Sofía Ramírez",
    role: "Community Manager",
    initials: "SR",
  },
  {
    name: "Martín Ferreyra",
    role: "Backend Engineer",
    initials: "MF",
  },
];

const STATS = [
  { value: "2025", label: "Año de fundación" },
  { value: "12K+", label: "Usuarios activos" },
  { value: "24", label: "Provincias cubiertas" },
  { value: "4.8★", label: "Valoración promedio" },
];

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export default function AboutUs() {
  const theme = useTheme();

  /* ---------- Scroll al top ---------- */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);

  return (
    <PageRoot>
      {/* ---------- HERO ---------- */}
      <HeroRoot>
        <Container maxWidth="md">
          <LogoBadge>
            <Diversity1Icon />
          </LogoBadge>

          <Chip
            icon={<FavoriteIcon sx={{ fontSize: "1rem !important" }} />}
            label="Hecho con cuidado en Madrid"
            size="small"
            sx={{
              mb: 2.5,
              fontWeight: 500,
              fontSize: "0.75rem",
              borderRadius: "100px",
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha("#000", 0.04)
                  : alpha("#fff", 0.06),
              color: "text.secondary",
              border: `1px solid ${theme.palette.divider}`,
              "& .MuiChip-icon": { color: "text.disabled" },
            }}
          />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              mb: 2,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Quiénes somos
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              maxWidth: 560,
              mx: "auto",
              lineHeight: 1.7,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
            }}
          >
            Somos un equipo pequeño con una idea grande: crear una plataforma
            donde las personas puedan conectar de forma simple, segura y sin
            distracciones. Nada más. Nada menos.
          </Typography>
        </Container>
      </HeroRoot>

      {/* ---------- STATS ---------- */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 8 } }}>
        <PremiumPaper elevation={0}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {STATS.map((stat, idx) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <StatBlock>
                  <StatNumber>{stat.value}</StatNumber>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {stat.label}
                  </Typography>
                </StatBlock>
                {idx < STATS.length - 1 && (
                  <Divider
                    orientation="vertical"
                    sx={{ display: { xs: "none", md: "block" } }}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </PremiumPaper>
      </Container>

      {/* ---------- HISTORIA ---------- */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <SectionTitle>Nuestra historia</SectionTitle>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                mb: 2.5,
                fontSize: { xs: "1.5rem", md: "1.85rem" },
              }}
            >
              Nacimos de una necesidad real
            </Typography>

            <Stack spacing={2}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.75,
                  fontSize: "0.95rem",
                }}
              >
                En 2025, cansados de las plataformas llenas de ruido, publicidad
                invasiva y flujos confusos, decidimos construir algo distinto:
                una herramienta que respete el tiempo del usuario y ponga el
                foco en lo importante.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.75,
                  fontSize: "0.95rem",
                }}
              >
                Empezamos como un proyecto interno entre cuatro personas. Hoy
                somos miles de usuarios en toda España y Latinoamérica. Lo
                mejor: seguimos tomando cada decisión con el mismo cuidado del
                primer día.
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <PremiumPaper
              elevation={0}
              sx={{
                backgroundColor:
                  theme.palette.mode === "light"
                    ? alpha("#000", 0.015)
                    : alpha("#fff", 0.02),
                borderStyle: "dashed",
                padding: { xs: 4, md: 5 },
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "3rem",
                  lineHeight: 1,
                  mb: 2,
                  opacity: 0.6,
                }}
              >
                "
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontStyle: "italic",
                  color: "text.primary",
                  lineHeight: 1.7,
                  mb: 2,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                }}
              >
                Lo simple no es lo que queda cuando quitás cosas, es lo que
                queda cuando cuidás cada detalle.
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.disabled",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                }}
              >
                Filosofía {nombrePagina}
              </Typography>
            </PremiumPaper>
          </Grid>
        </Grid>
      </Container>

      {/* ---------- VALORES ---------- */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
          <SectionTitle>Lo que nos mueve</SectionTitle>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              maxWidth: 520,
              mx: "auto",
              fontSize: { xs: "1.5rem", md: "1.85rem" },
            }}
          >
            Seis valores que guían cada línea de código
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {VALUES.map((value) => (
            <Grid item xs={12} sm={6} md={4} key={value.title}>
              <ValueCard elevation={0}>
                <ValueIcon>{value.icon}</ValueIcon>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                    mb: 1,
                    fontSize: "1.05rem",
                  }}
                >
                  {value.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.65,
                    fontSize: "0.85rem",
                  }}
                >
                  {value.description}
                </Typography>
              </ValueCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ---------- EQUIPO ---------- */}
      <Container maxWidth="lg" sx={{ mb: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
          <SectionTitle>El equipo</SectionTitle>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              maxWidth: 520,
              mx: "auto",
              fontSize: { xs: "1.5rem", md: "1.85rem" },
            }}
          >
            Personas reales detrás de la plataforma
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
          {TEAM.map((member) => (
            <Grid item xs={6} sm={4} md={3} key={member.name}>
              <Stack alignItems="center" textAlign="center">
                <TeamAvatar>{member.initials}</TeamAvatar>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    fontSize: "0.95rem",
                  }}
                >
                  {member.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.78rem",
                  }}
                >
                  {member.role}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ---------- CTA FINAL ---------- */}
      <Container maxWidth="md">
        <PremiumPaper
          elevation={0}
          sx={{
            textAlign: "center",
            padding: { xs: 4, md: 6 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              mb: 1.5,
              fontSize: { xs: "1.5rem", md: "1.85rem" },
            }}
          >
            ¿Querés sumarte?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              maxWidth: 460,
              mx: "auto",
              lineHeight: 1.7,
              mb: 3.5,
              fontSize: "0.95rem",
            }}
          >
            Creá tu cuenta gratis, explorá la plataforma y contanos qué te
            parece. Escuchamos todo.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
          >
            <SecondaryButton component={NavLink} to="/contact">
              Contactanos
            </SecondaryButton>
            <PrimaryButton
              component={NavLink}
              to="/register"
              endIcon={<ArrowForwardIcon fontSize="small" />}
            >
              Crear cuenta
            </PrimaryButton>
          </Stack>
        </PremiumPaper>
      </Container>
    </PageRoot>
  );
}
