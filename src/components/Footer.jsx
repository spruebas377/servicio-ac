// src/components/Footer.jsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Divider,
  Tooltip,
  Link,
  alpha,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { NavLink } from "react-router";
import { nombrePagina, Logo } from "./datos/pagina";
import { Link as RouterLink } from "react-router";

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

const FooterRoot = styled(Box)(({ theme }) => ({
  marginTop: "auto",
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor:
    theme.palette.mode === "light"
      ? alpha("#ffffff", 0.6)
      : alpha("#16181d", 0.6),
  backdropFilter: "saturate(180%) blur(20px)",
  WebkitBackdropFilter: "saturate(180%) blur(20px)",
}));

const FooterLink = styled(NavLink)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.text.secondary,
  fontSize: "0.85rem",
  fontWeight: 500,
  letterSpacing: "-0.005em",
  padding: theme.spacing(0.5, 0),
  transition: "color 0.2s ease, transform 0.2s ease",
  display: "inline-block",
  "&:hover": {
    color: theme.palette.text.primary,
    transform: "translateX(2px)",
  },
  "&.active": {
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: "10px",
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: "transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    color: theme.palette.text.primary,
    borderColor: alpha(theme.palette.text.primary, 0.2),
    backgroundColor: alpha(theme.palette.text.primary, 0.04),
    transform: "translateY(-2px)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: theme.palette.text.disabled,
  marginBottom: theme.spacing(1.5),
}));

/* ------------------------------------------------------------------ */
/*  Configuración                                                      */
/* ------------------------------------------------------------------ */

const productLinks = [
  { label: "Géneros", link: "/search" },
  { label: "Quiénes somos", link: "/about" },
  { label: "Contacto", link: "/contact" },
];

const accountLinks = [
  { label: "Mi perfil", link: "/profile" },
  { label: "Actualizar perfil", link: "/profile-update" },
  { label: "Cerrar sesión", link: "/logout" },
];

const legalLinks = [
  { label: "Términos", link: "/terms" },
  { label: "Privacidad", link: "/privacy" },
  { label: "Cookies", link: "/cookies" },
];

const socials = [
  {
    icon: <GitHubIcon fontSize="small" />,
    label: "GitHub",
    href: "https://github.com",
  },
  {
    icon: <LinkedInIcon fontSize="small" />,
    label: "LinkedIn",
    href: "https://linkedin.com",
  },
  {
    icon: <TwitterIcon fontSize="small" />,
    label: "Twitter",
    href: "https://twitter.com",
  },
  {
    icon: <EmailOutlinedIcon fontSize="small" />,
    label: "Email",
    href: "mailto:hola@ac-s.com",
  },
];

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <FooterRoot>
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 6 } }}>
        {/* Grid principal */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "2fr 1fr 1fr 1fr",
            },
            gap: { xs: 4, md: 5 },
            mb: { xs: 4, md: 5 },
          }}
        >
          {/* Columna: marca + descripción + socials */}
          <Box>
            <Logo />
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                maxWidth: 280,
                lineHeight: 1.6,
                my: 2,
                fontSize: "0.85rem",
              }}
            >
              Encuentra y ofrece servicios de forma segura y discreta.
            </Typography>

            <Stack direction="row" spacing={1}>
              {socials.map((s) => (
                <Tooltip key={s.label} title={s.label} arrow>
                  <SocialButton
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    size="small"
                  >
                    {s.icon}
                  </SocialButton>
                </Tooltip>
              ))}
            </Stack>
          </Box>

          {/* Columna: Producto */}
          <Box>
            <SectionTitle>Página</SectionTitle>
            <Stack spacing={0.75}>
              {productLinks.map((l) => (
                <FooterLink key={l.label} to={l.link}>
                  {l.label}
                </FooterLink>
              ))}
            </Stack>
          </Box>

          {/* Columna: Cuenta */}
          <Box>
            <SectionTitle>Cuenta</SectionTitle>
            <Stack spacing={0.75}>
              {accountLinks.map((l) => (
                <FooterLink key={l.label} to={l.link}>
                  {l.label}
                </FooterLink>
              ))}
            </Stack>
          </Box>

          {/* Columna: Legal */}
          <Box>
            <SectionTitle>Legal</SectionTitle>
            <Stack spacing={0.75}>
              {legalLinks.map((l) => (
                <FooterLink key={l.label} to={l.link}>
                  {l.label}
                </FooterLink>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Divisor */}
        <Divider sx={{ mb: 3 }} />

        {/* Barra inferior */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignitems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.disabled",
              fontSize: "0.75rem",
              letterSpacing: "-0.005em",
            }}
          >
            © {year} {nombrePagina}. Todos los derechos reservados.
          </Typography>

          <Stack direction="row" spacing={2} alignitems="center">
            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                fontSize: "0.75rem",
                letterSpacing: "-0.005em",
              }}
            >
              Hecho con cuidado en Argentina
            </Typography>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "text.disabled",
                opacity: 0.5,
              }}
            />
            <Link
              href="#top"
              underline="none"
              sx={{
                color: "text.disabled",
                fontSize: "0.75rem",
                fontWeight: 500,
                transition: "color 0.2s ease",
                "&:hover": { color: "text.primary" },
              }}
            >
              Volver arriba ↑
            </Link>
          </Stack>
        </Box>
      </Container>
    </FooterRoot>
  );
}
