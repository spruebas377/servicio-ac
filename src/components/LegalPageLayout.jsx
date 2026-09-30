// src/components/LegalPageLayout.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
  Button,
  alpha,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import { NavLink, useNavigate } from "react-router";
import { nombrePagina, email } from "./datos/pagina";

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

const PageRoot = styled(Box)(({ theme }) => ({
  minHeight: "calc(100vh - 72px)",
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(8),
  [theme.breakpoints.up("md")]: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(12),
  },
}));

const PremiumPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "2.5rem",
  padding: theme.spacing(5, 4),
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 20px 35px -8px rgba(0,0,0,0.04), 0 8px 18px -6px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.01)"
      : "0 20px 35px -8px rgba(0,0,0,0.5), 0 8px 18px -6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
  [theme.breakpoints.down("sm")]: {
    borderRadius: "2rem",
    padding: theme.spacing(3.5, 2.5),
  },
}));

const LogoBadge = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: "18px",
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)"
      : "linear-gradient(135deg, #f2f2f2 0%, #b8b8b8 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.mode === "light" ? "#fff" : "#1e1e1e",
  boxShadow: "0 10px 24px rgba(0,0,0,0.1)",
  marginBottom: theme.spacing(2.5),
  "& svg": { fontSize: 30 },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "text.disabled",
  marginBottom: theme.spacing(1),
}));

const Section = ({ id, number, title, children }) => (
  <Box component="section" id={id} sx={{ scrollMarginTop: 100 }}>
    <Stack direction="row" spacing={1.5} alignItems="baseline" sx={{ mb: 1.5 }}>
      <Typography
        sx={{
          fontSize: "0.85rem",
          fontWeight: 700,
          color: "text.disabled",
          fontVariantNumeric: "tabular-nums",
          minWidth: 24,
        }}
      >
        {number}.
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          letterSpacing: "-0.015em",
          fontSize: "1.1rem",
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>
    </Stack>
    <Box
      sx={{
        pl: { xs: 0, sm: 4.5 },
        "& p": {
          color: "text.secondary",
          lineHeight: 1.75,
          fontSize: "0.9rem",
          mb: 1.5,
        },
        "& p:last-child": { mb: 0 },
        "& ul": {
          color: "text.secondary",
          fontSize: "0.9rem",
          lineHeight: 1.75,
          pl: 2.5,
          mb: 1.5,
        },
        "& li": { mb: 0.5 },
        "& a": {
          color: "text.primary",
          textDecoration: "underline",
          textDecorationColor: alpha("#000", 0.2),
          "&:hover": { textDecorationColor: alpha("#000", 0.5) },
        },
      }}
    >
      {children}
    </Box>
  </Box>
);

const BackButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.85rem",
  color: theme.palette.text.secondary,
  borderRadius: 999,
  padding: theme.spacing(0.5, 1.5),
  marginBottom: theme.spacing(2),
  "&:hover": {
    color: theme.palette.text.primary,
    backgroundColor: alpha(theme.palette.text.primary, 0.04),
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.9rem",
  borderRadius: 999,
  padding: theme.spacing(1, 2.5),
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    borderColor: alpha(theme.palette.text.primary, 0.2),
    backgroundColor: alpha(theme.palette.text.primary, 0.03),
  },
}));

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export default function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  icon,
  summary,
  sections,
  relatedLinks = [],
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  /* Scroll al top al montar */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <PageRoot>
      <Container maxWidth="md">
        {/* Botón volver */}
        <BackButton
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon fontSize="small" />}
        >
          Volver
        </BackButton>

        <PremiumPaper elevation={0}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <LogoBadge>{icon || <GavelOutlinedIcon />}</LogoBadge>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
                mb: 1,
                fontSize: { xs: "1.65rem", md: "2rem" },
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.6,
                  mb: 1.5,
                  fontSize: "0.95rem",
                }}
              >
                {subtitle}
              </Typography>
            )}

            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                fontSize: "0.78rem",
                fontWeight: 500,
              }}
            >
              Última actualización: {lastUpdated}
            </Typography>
          </Box>

          {/* Resumen */}
          {summary && (
            <Box
              sx={{
                borderRadius: 3,
                padding: 2.5,
                mb: 4,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? alpha("#000", 0.015)
                    : alpha("#fff", 0.02),
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.7,
                  fontSize: "0.88rem",
                  fontStyle: "italic",
                }}
              >
                {summary}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 4 }} />

          {/* Secciones */}
          <Stack spacing={4}>
            {sections.map((section, idx) => (
              <Section
                key={section.id}
                id={section.id}
                number={idx + 1}
                title={section.title}
              >
                {section.content}
              </Section>
            ))}
          </Stack>

          <Divider sx={{ my: 4 }} />

          {/* Contacto / links relacionados */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 2, fontSize: "0.9rem" }}
            >
              ¿Dudas sobre este documento? Escribinos a{" "}
              <Box
                component="a"
                href={`mailto:${email}`}
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "&:hover": { borderBottomColor: theme.palette.text.primary },
                }}
              >
                {email}
              </Box>
            </Typography>

            {relatedLinks.length > 0 && (
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="center"
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 2 }}
              >
                {relatedLinks.map((link) => (
                  <SecondaryButton
                    key={link.to}
                    component={NavLink}
                    to={link.to}
                    size="small"
                  >
                    {link.label}
                  </SecondaryButton>
                ))}
              </Stack>
            )}
          </Box>
        </PremiumPaper>
      </Container>
    </PageRoot>
  );
}
