// src/components/GenderSubmenu.jsx
import * as React from "react";
import { useState } from "react";
import {
  Box,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Collapse,
  List,
  ListItemButton,
  Chip,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";

import FemaleOutlinedIcon from "@mui/icons-material/FemaleOutlined";
import MaleOutlinedIcon from "@mui/icons-material/MaleOutlined";
import TransgenderOutlinedIcon from "@mui/icons-material/TransgenderOutlined";
import QuestionMarkOutlinedIcon from "@mui/icons-material/QuestionMarkOutlined";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";

import { NavLink } from "react-router";
import { useGenders } from "../context/GendersContext";

/* ---------- Mapeo nombre → icono ---------- */
const ICON_MAP = {
  FemaleOutlinedIcon,
  MaleOutlinedIcon,
  TransgenderOutlinedIcon,
  QuestionMarkOutlinedIcon,
  NotInterestedIcon,
  Diversity3OutlinedIcon,
  FavoriteBorderOutlinedIcon,
  StarBorderOutlinedIcon,
};

const GenderIcon = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || QuestionMarkOutlinedIcon;
  return <IconComponent {...props} />;
};

/* ---------- Estilos ---------- */
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: 12,
  margin: theme.spacing(0.25, 0.5),
  padding: theme.spacing(0.9, 1.2),
  gap: theme.spacing(1),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.text.primary, 0.05),
  },
}));

const menuPaperSx = (theme) => ({
  mt: 1.5,
  minWidth: 280,
  maxHeight: 440,
  borderRadius: 3,
  padding: 0.5,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 20px 35px -8px rgba(0,0,0,0.08), 0 8px 18px -6px rgba(0,0,0,0.04)"
      : "0 20px 35px -8px rgba(0,0,0,0.6), 0 8px 18px -6px rgba(0,0,0,0.4)",
  backgroundImage: "none",
});

const CountChip = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: "0.68rem",
  fontWeight: 600,
  borderRadius: "100px",
  marginLeft: theme.spacing(1),
  backgroundColor:
    theme.palette.mode === "light" ? alpha("#000", 0.05) : alpha("#fff", 0.08),
  color: theme.palette.text.secondary,
  border: "none",
  "& .MuiChip-label": { px: 1, py: 0 },
}));

const RefreshButton = styled(IconButton)(({ theme, spinning }) => ({
  width: 26,
  height: 26,
  color: theme.palette.text.disabled,
  transition: "color 0.2s ease, transform 0.2s ease",
  "& svg": {
    fontSize: 15,
    animation: spinning ? "spin 0.8s linear infinite" : "none",
  },
  "&:hover": {
    color: theme.palette.text.primary,
    backgroundColor: alpha(theme.palette.text.primary, 0.06),
  },
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
}));

/* ---------- Lista de items ---------- */
const GenderList = ({ genders, loading, onSelect, dense = false }) => {
  if (loading) {
    return (
      <Box sx={{ p: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1 }}
          >
            <Skeleton variant="circular" width={22} height={22} />
            <Skeleton variant="text" width="50%" height={20} />
            <Box sx={{ flex: 1 }} />
            <Skeleton variant="rounded" width={32} height={20} />
          </Box>
        ))}
      </Box>
    );
  }

  if (!genders.length) {
    return (
      <Typography
        sx={{
          px: 2,
          py: 1.5,
          fontSize: "0.85rem",
          color: "text.disabled",
          fontStyle: "italic",
        }}
      >
        Sin géneros disponibles
      </Typography>
    );
  }

  return genders.map((g) => (
    <StyledMenuItem
      key={g.id}
      component={NavLink}
      to={`/search?gender=${g.id}`}
      onClick={onSelect}
      dense={dense}
    >
      <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
        <GenderIcon name={g.icon} fontSize="small" />
      </ListItemIcon>

      <ListItemText
        primary={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {g.name}
            </Box>
            <CountChip
              label={g.count}
              size="small"
              aria-label={`${g.count} usuarios`}
            />
          </Box>
        }
        secondary={!dense ? g.description : undefined}
        primaryTypographyProps={{
          component: "div",
          sx: { width: "100%" },
        }}
        secondaryTypographyProps={{
          fontSize: "0.72rem",
          color: "text.disabled",
          noWrap: true,
        }}
      />
    </StyledMenuItem>
  ));
};

/* ---------- Submenú Desktop ---------- */
export function GenderSubmenuDesktop({ anchorEl, open, onClose }) {
  const theme = useTheme();
  const { genders, loading, refreshing, fromCache, refresh, total } =
    useGenders();

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{ paper: { sx: menuPaperSx(theme) } }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.disabled",
            }}
          >
            Filtrar por género
          </Typography>
          {fromCache && (
            <Tooltip title="Datos en caché · pulsa refrescar" arrow>
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "text.disabled",
                  opacity: 0.6,
                }}
              />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {!loading && genders.length > 0 && (
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 500,
                color: "text.disabled",
              }}
            >
              {total} usuarios
            </Typography>
          )}
          <Tooltip title="Refrescar" arrow>
            <RefreshButton
              size="small"
              spinning={refreshing ? 1 : 0}
              onClick={(e) => {
                e.stopPropagation();
                refresh();
              }}
              aria-label="Refrescar géneros"
            >
              <RefreshIcon />
            </RefreshButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ my: 0.5 }} />

      <GenderList genders={genders} loading={loading} onSelect={onClose} />
    </Menu>
  );
}

/* ---------- Submenú Móvil ---------- */
export function GenderSubmenuMobile({ onSelect }) {
  const theme = useTheme();
  const { genders, loading, refreshing, fromCache, refresh, total } =
    useGenders();
  const [open, setOpen] = useState(false);

  return (
    <>
      <ListItemButton
        onClick={() => setOpen((v) => !v)}
        sx={{
          borderRadius: 2,
          mx: 0.5,
          my: 0.25,
          padding: theme.spacing(0.9, 1.2),
          "&:hover": {
            backgroundColor: alpha(theme.palette.text.primary, 0.05),
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
          <Diversity3OutlinedIcon fontSize="small" />
        </ListItemIcon>

        <ListItemText
          primary="Géneros"
          primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 500 }}
        />

        {!loading && total > 0 && (
          <CountChip label={total} size="small" sx={{ mr: 0.5 }} />
        )}

        {open ? (
          <ExpandLessIcon fontSize="small" sx={{ color: "text.disabled" }} />
        ) : (
          <ExpandMoreIcon fontSize="small" sx={{ color: "text.disabled" }} />
        )}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.5,
              py: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "text.disabled",
                fontStyle: fromCache ? "italic" : "normal",
              }}
            >
              {fromCache ? "Datos en caché" : "Datos actualizados"}
            </Typography>

            <Tooltip title="Refrescar" arrow>
              <RefreshButton
                size="small"
                spinning={refreshing ? 1 : 0}
                onClick={(e) => {
                  e.stopPropagation();
                  refresh();
                }}
                aria-label="Refrescar géneros"
              >
                <RefreshIcon />
              </RefreshButton>
            </Tooltip>
          </Box>

          <GenderList
            genders={genders}
            loading={loading}
            onSelect={onSelect}
            dense
          />
        </List>
      </Collapse>
    </>
  );
}
