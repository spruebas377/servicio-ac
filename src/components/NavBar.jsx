// src/components/NavBar.jsx
import * as React from "react";
import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
  alpha,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import TaskIcon from "@mui/icons-material/Task";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import ServicesIcon from "@mui/icons-material/MiscellaneousServices";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { NavLink } from "react-router";
import { useColorMode } from "../context/ColorModeContext";
import { supabase } from "../supabase/client";
import { useAuth } from "../context/AuthContext";
import MessagesMenu from "./MessagesMenu";
import { GenderSubmenuDesktop, GenderSubmenuMobile } from "./GenderSubmenu";
import { nombrePagina, Logo } from "./datos/pagina";

/* ------------------------------------------------------------------ */
/*  Configuración                                                      */
/* ------------------------------------------------------------------ */

const pages = [
  {
    icon: <Diversity3OutlinedIcon fontSize="small" />,
    label: "Géneros",
    link: "/new-task",
    isGenderMenu: true,
  },
  {
    icon: <InfoOutlinedIcon fontSize="small" />,
    label: "Quiénes somos",
    link: "/about",
  },
  {
    icon: <ContactSupportOutlinedIcon fontSize="small" />,
    label: "Contacto",
    link: "/contact",
  },
];

const settings = [
  {
    icon: <AccountCircleIcon fontSize="small" />,
    label: "Perfil",
    link: "/profile",
  },
  {
    icon: <EditOutlinedIcon fontSize="small" />,
    label: "Actualizar perfil",
    link: "/profile-update",
  },
  {
    icon: <ServicesIcon fontSize="small" />,
    label: "Mis publicaciones",
    link: "/my-publications",
  },
  { divider: true },
  {
    icon: <LogoutIcon fontSize="small" />,
    label: "Cerrar sesión",
    link: "/logout",
    danger: true,
  },
];

const settingsNoLogged = [
  {
    icon: <AccountCircleIcon fontSize="small" />,
    label: "Iniciar sesión",
    link: "/login",
  },
  {
    icon: <AccountCircleIcon fontSize="small" />,
    label: "Registrarse",
    link: "/signup",
  },
];

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

const PremiumAppBar = styled(AppBar)(({ theme }) => ({
  background:
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.75)"
      : "rgba(22, 24, 29, 0.75)",
  backdropFilter: "saturate(180%) blur(20px)",
  WebkitBackdropFilter: "saturate(180%) blur(20px)",
  color: theme.palette.text.primary,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const NavItem = styled(NavLink)(({ theme }) => ({
  textDecoration: "none",
  color: "inherit",
  padding: theme.spacing(0.75, 1.5),
  borderRadius: 999,
  fontSize: "0.9rem",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  transition: "all 0.2s ease",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  "&:hover": {
    backgroundColor: alpha(theme.palette.text.primary, 0.06),
  },
  "&.active": {
    backgroundColor: alpha(theme.palette.text.primary, 0.08),
    fontWeight: 600,
  },
}));

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== "danger",
})(({ theme, danger }) => ({
  borderRadius: 12,
  margin: theme.spacing(0.25, 0.5),
  padding: theme.spacing(0.9, 1.2),
  gap: theme.spacing(1),
  "&:hover": {
    backgroundColor: alpha(
      danger ? "#d32f2f" : theme.palette.text.primary,
      0.05,
    ),
  },
  ...(danger && {
    color: "#c62828",
    "& .MuiListItemIcon-root": { color: "#c62828" },
  }),
}));

const menuPaperSx = (theme) => ({
  mt: 1.5,
  minWidth: 240,
  borderRadius: 3,
  padding: 0.5,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 20px 35px -8px rgba(0,0,0,0.08), 0 8px 18px -6px rgba(0,0,0,0.04)"
      : "0 20px 35px -8px rgba(0,0,0,0.6), 0 8px 18px -6px rgba(0,0,0,0.4)",
  backgroundImage: "none",
});

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export default function NavBar() {
  const { user } = useAuth();
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElGender, setAnchorElGender] = useState(null);
  const [avatar, setAvatar] = useState("");

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleOpenGenderMenu = (e) => setAnchorElGender(e.currentTarget);
  const handleCloseGenderMenu = () => setAnchorElGender(null);

  /* Cargar avatar del usuario */
  useEffect(() => {
    let isMounted = true;
    const assignAvatar = async () => {
      if (!user?.id) {
        if (isMounted) setAvatar("");
        return;
      }
      try {
        const { data: user_data, error } = await supabase
          .from("user_data")
          .select("avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("Error cargando avatar:", error);
          if (isMounted) setAvatar("");
          return;
        }

        if (isMounted) setAvatar(user_data?.avatar_url || "");
      } catch (err) {
        console.error("Error al obtener avatar:", err);
        if (isMounted) setAvatar("");
      }
    };
    assignAvatar();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <PremiumAppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 1 }}>
          <Logo />

          {/* ---------- Menú móvil ---------- */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              justifyContent: "flex-end",
            }}
          >
            <IconButton
              size="medium"
              onClick={handleOpenNavMenu}
              sx={{
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.text.primary, 0.06),
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              keepMounted
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
              slotProps={{ paper: { sx: menuPaperSx(theme) } }}
            >
              {pages.map((page) =>
                page.isGenderMenu ? (
                  <GenderSubmenuMobile
                    key={page.label}
                    onSelect={handleCloseNavMenu}
                  />
                ) : (
                  <StyledMenuItem
                    key={page.label}
                    component={NavLink}
                    to={page.link}
                    onClick={handleCloseNavMenu}
                  >
                    <ListItemIcon
                      sx={{ minWidth: 28, color: "text.secondary" }}
                    >
                      {page.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={page.label}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    />
                  </StyledMenuItem>
                ),
              )}
            </Menu>
          </Box>

          {/* ---------- Navegación desktop ---------- */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            {pages.map((page) =>
              page.isGenderMenu ? (
                <React.Fragment key={page.label}>
                  <NavItem
                    component="button"
                    type="button"
                    onClick={handleOpenGenderMenu}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorElGender)}
                  >
                    {page.icon}
                    {page.label}
                    <ExpandMoreIcon
                      fontSize="small"
                      sx={{
                        ml: 0.5,
                        transition: "transform 0.2s ease",
                        transform: anchorElGender
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </NavItem>

                  <GenderSubmenuDesktop
                    anchorEl={anchorElGender}
                    open={Boolean(anchorElGender)}
                    onClose={handleCloseGenderMenu}
                  />
                </React.Fragment>
              ) : (
                <NavItem key={page.label} to={page.link}>
                  {page.icon}
                  {page.label}
                </NavItem>
              ),
            )}
          </Box>

          {/* ---------- Toggle modo + Mensajes + Avatar ---------- */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {user && <MessagesMenu />}

            <Tooltip
              title={mode === "light" ? "Modo oscuro" : "Modo claro"}
              arrow
            >
              <IconButton
                onClick={toggleColorMode}
                sx={{
                  color: "text.primary",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.text.primary, 0.06),
                  },
                }}
              >
                {mode === "light" ? (
                  <DarkModeOutlinedIcon />
                ) : (
                  <LightModeOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Mi cuenta" arrow>
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{
                  p: 0,
                  ml: 0.5,
                  border: "2px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: alpha(theme.palette.text.primary, 0.1),
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Avatar
                  alt={user?.email || "Usuario"}
                  src={avatar || undefined}
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor:
                      theme.palette.mode === "light" ? "#eaeef2" : "#2a2d34",
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  {!avatar && (user?.email?.[0]?.toUpperCase() || "?")}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              keepMounted
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              slotProps={{ paper: { sx: menuPaperSx(theme) } }}
            >
              <Box sx={{ px: 1.5, py: 1.25 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {user ? user.email : "Invitado"}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.78rem", color: "text.secondary" }}
                >
                  {user ? "Gestiona tu cuenta" : "Inicia sesión para continuar"}
                </Typography>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              {(user ? settings : settingsNoLogged).map((setting, idx) =>
                setting.divider ? (
                  <Divider key={`div-${idx}`} sx={{ my: 0.5 }} />
                ) : (
                  <StyledMenuItem
                    key={setting.label}
                    component={NavLink}
                    to={setting.link}
                    onClick={handleCloseUserMenu}
                    danger={setting.danger}
                  >
                    <ListItemIcon
                      sx={{ minWidth: 28, color: "text.secondary" }}
                    >
                      {setting.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={setting.label}
                      primaryTypographyProps={{
                        fontSize: "0.88rem",
                        fontWeight: 500,
                      }}
                    />
                  </StyledMenuItem>
                ),
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </PremiumAppBar>
  );
}
