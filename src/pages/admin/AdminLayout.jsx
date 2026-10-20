// src/pages/admin/AdminLayout.jsx
import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  alpha,
  Tooltip,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import { NavLink, Outlet, useLocation, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { CircularProgress } from "@mui/material";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 72;

/* ------------------------------------------------------------------ */
/*  Nav items config                                                   */
/* ------------------------------------------------------------------ */
const navItems = [
  {
    label: "Dashboard",
    icon: <DashboardOutlinedIcon />,
    to: "/admin",
    end: true,
  },
  {
    label: "Usuarios",
    icon: <PeopleAltOutlinedIcon />,
    to: "/admin/users",
  },
  {
    label: "Comentarios",
    icon: <CommentOutlinedIcon />,
    to: "/admin/comments",
  },
  {
    label: "Destacados",
    icon: <WorkspacePremiumOutlinedIcon />,
    to: "/admin/featured",
  },
];

/* ------------------------------------------------------------------ */
/*  Styled nav item                                                    */
/* ------------------------------------------------------------------ */
const NavItemButton = styled(ListItemButton, {
  shouldForwardProp: (p) => p !== "active" && p !== "collapsed",
})(({ theme, active, collapsed }) => ({
  borderRadius: 12,
  margin: theme.spacing(0.3, 1),
  padding: collapsed
    ? theme.spacing(1.25, 1.5)
    : theme.spacing(1.1, 1.5),
  justifyContent: collapsed ? "center" : "flex-start",
  gap: theme.spacing(1.5),
  transition: "all 0.2s ease",
  position: "relative",
  overflow: "hidden",
  backgroundColor: active
    ? theme.palette.mode === "dark"
      ? alpha("#6366f1", 0.15)
      : alpha("#6366f1", 0.08)
    : "transparent",
  color: active ? "#6366f1" : theme.palette.text.secondary,

  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "20%",
    height: "60%",
    width: 3,
    borderRadius: "0 3px 3px 0",
    backgroundColor: active ? "#6366f1" : "transparent",
    transition: "all 0.2s ease",
  },

  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha("#6366f1", 0.1)
        : alpha("#6366f1", 0.06),
    color: "#6366f1",
  },

  "& .MuiListItemIcon-root": {
    minWidth: 0,
    color: "inherit",
  },
}));

/* ------------------------------------------------------------------ */
/*  Sidebar content                                                    */
/* ------------------------------------------------------------------ */
function SidebarContent({ collapsed, onToggle, userData }) {
  const theme = useTheme();
  const location = useLocation();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo / header */}
      <Box
        sx={{
          px: collapsed ? 1 : 2.5,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 1,
          minHeight: 72,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AdminPanelSettingsOutlinedIcon
                sx={{ color: "#fff", fontSize: 20 }}
              />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Admin Panel
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontSize: "0.68rem" }}
              >
                Panel de administración
              </Typography>
            </Box>
          </Box>
        )}

        <Tooltip title={collapsed ? "Expandir" : "Colapsar"} placement="right">
          <IconButton
            size="small"
            onClick={onToggle}
            sx={{
              borderRadius: 2,
              color: "text.secondary",
              "&:hover": {
                bgcolor: alpha(theme.palette.text.primary, 0.06),
              },
            }}
          >
            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mx: collapsed ? 1 : 2 }} />

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 1.5, px: 0 }}>
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <ListItem key={item.label} disablePadding>
              <Tooltip
                title={collapsed ? item.label : ""}
                placement="right"
                arrow
              >
                <NavItemButton
                  component={NavLink}
                  to={item.to}
                  active={isActive ? 1 : 0}
                  collapsed={collapsed ? 1 : 0}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          fontSize: "0.88rem",
                          fontWeight: isActive ? 700 : 500,
                        },
                      }}
                    />
                  )}
                </NavItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mx: collapsed ? 1 : 2, mb: 1 }} />

      {/* Back to site */}
      <List sx={{ pb: 2 }}>
        <ListItem disablePadding>
          <Tooltip title={collapsed ? "Volver al sitio" : ""} placement="right">
            <NavItemButton
              component={NavLink}
              to="/"
              collapsed={collapsed ? 1 : 0}
            >
              <ListItemIcon>
                <HomeOutlinedIcon />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary="Volver al sitio"
                  slotProps={{
                    primary: { fontSize: "0.88rem", fontWeight: 500 },
                  }}
                />
              )}
            </NavItemButton>
          </Tooltip>
        </ListItem>
      </List>

      {/* User info */}
      {!collapsed && (
        <Box
          sx={{
            mx: 2,
            mb: 2.5,
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? alpha("#ffffff", 0.05)
                : alpha("#000000", 0.03),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.82rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userData?.name || "Administrador"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {userData?.email}
          </Typography>
          <Chip
            label="Admin"
            size="small"
            sx={{
              mt: 0.75,
              height: 20,
              fontSize: "0.68rem",
              bgcolor: alpha("#6366f1", 0.12),
              color: "#6366f1",
              fontWeight: 700,
            }}
          />
        </Box>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main admin layout                                                  */
/* ------------------------------------------------------------------ */
export default function AdminLayout() {
  const { userData, loading } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Guard: solo admins
  if (!userData?.is_admin) {
    return <Navigate to="/" replace />;
  }

  const sidebarWidth = isMobile ? SIDEBAR_WIDTH : collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;
  const sidebarBg = isDark ? "#12141a" : "#ffffff";

  const drawerContent = (
    <SidebarContent
      collapsed={isMobile ? false : collapsed}
      onToggle={isMobile ? () => setMobileOpen(false) : () => setCollapsed((p) => !p)}
      userData={userData}
    />
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* ---- Sidebar ---- */}
      {isMobile ? (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              bgcolor: sidebarBg,
              border: "none",
              boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: "width 0.25s ease",
            "& .MuiDrawer-paper": {
              width: sidebarWidth,
              transition: "width 0.25s ease",
              bgcolor: sidebarBg,
              border: "none",
              borderRight: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* ---- Main content ---- */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Mobile topbar */}
        {isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: "background.paper",
            }}
          >
            <IconButton
              onClick={() => setMobileOpen(true)}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Admin Panel
            </Typography>
          </Box>
        )}

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2.5, md: 4 },
            maxWidth: 1400,
            width: "100%",
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
