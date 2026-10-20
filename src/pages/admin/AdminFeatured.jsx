// src/pages/admin/AdminFeatured.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  IconButton,
  Grid,
  alpha,
  Skeleton,
  Chip,
  Tooltip,
  Switch,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import VerifiedIcon from "@mui/icons-material/Verified";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import { supabase } from "../../supabase/client";
import { NavLink } from "react-router";

/* ------------------------------------------------------------------ */
/*  User featured card                                                 */
/* ------------------------------------------------------------------ */
function FeaturedCard({ user, onToggle }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${
          user.featured
            ? alpha("#f59e0b", 0.4)
            : theme.palette.divider
        }`,
        borderRadius: 3,
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: isDark
            ? user.featured
              ? "0 12px 30px -8px rgba(245,158,11,0.25)"
              : "0 12px 30px -8px rgba(0,0,0,0.4)"
            : user.featured
            ? "0 12px 30px -8px rgba(245,158,11,0.12)"
            : "0 8px 20px -8px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Star badge */}
      {user.featured && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: alpha("#f59e0b", 0.15),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StarIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
        </Box>
      )}

      {/* Avatar + name */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
      >
        <Avatar
          src={user.avatar_url}
          sx={{
            width: 48,
            height: 48,
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          {(user.name || user.email || "?")[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name || "Sin nombre"}
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
            {user.email}
          </Typography>
        </Box>
      </Box>

      {/* Chips */}
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
        {user.verified && (
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: "14px !important" }} />}
            label="Verificado"
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              bgcolor: alpha("#22c55e", 0.1),
              color: "#16a34a",
            }}
          />
        )}
        {user.is_public && (
          <Chip
            label="Público"
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              bgcolor: alpha("#3b82f6", 0.1),
              color: "#2563eb",
            }}
          />
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Controls */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {[
          {
            field: "featured",
            label: "Destacado",
            activeColor: "#f59e0b",
            icon: user.featured ? StarIcon : StarBorderIcon,
          },
          {
            field: "verified",
            label: "Verificado",
            activeColor: "#22c55e",
            icon: user.verified ? VerifiedIcon : VerifiedOutlinedIcon,
          },
        ].map(({ field, label, activeColor }) => (
          <Box
            key={field}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
              {label}
            </Typography>
            <Switch
              checked={user[field] ?? false}
              onChange={() => onToggle(user, field)}
              size="small"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: activeColor,
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  bgcolor: activeColor,
                },
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Link to profile */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <Tooltip title="Ver perfil público">
          <IconButton
            size="small"
            component={NavLink}
            to={`/user/${user.id}`}
            target="_blank"
            sx={{
              color: "#6366f1",
              "&:hover": { bgcolor: alpha("#6366f1", 0.1) },
            }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function AdminFeatured() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_data")
        .select(
          "id, name, email, avatar_url, verified, featured, is_public, created_at"
        )
        .or("featured.eq.true,verified.eq.true")
        .order("featured", { ascending: false })
        .order("verified", { ascending: false })
        .order("name", { ascending: true });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error cargando usuarios destacados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggle = async (user, field) => {
    const newVal = !user[field];
    try {
      const { error } = await supabase
        .from("user_data")
        .update({ [field]: newVal })
        .eq("id", user.id);
      if (error) throw error;

      setUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === user.id ? { ...u, [field]: newVal } : u
        );
        // If we un-featured AND un-verified someone, remove from list
        return updated.filter((u) => u.featured || u.verified);
      });
    } catch (err) {
      console.error("Error actualizando:", err);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <WorkspacePremiumOutlinedIcon sx={{ color: "#f59e0b", fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Perfiles destacados y verificados
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {users.length} perfil{users.length !== 1 ? "es" : ""} con estado
          especial. Para agregar nuevos, usa la sección{" "}
          <strong>Gestión de usuarios</strong>.
        </Typography>
      </Box>

      {/* Grid */}
      <Grid container spacing={2.5}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          : users.length === 0 ? (
            <Grid size={12}>
              <Box
                sx={{ textAlign: "center", py: 8, color: "text.secondary" }}
              >
                <StarBorderIcon
                  sx={{ fontSize: 52, mb: 1.5, opacity: 0.3 }}
                />
                <Typography>
                  No hay usuarios destacados ni verificados aún.
                </Typography>
              </Box>
            </Grid>
          ) : (
            users.map((user) => (
              <Grid key={user.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <FeaturedCard user={user} onToggle={handleToggle} />
              </Grid>
            ))
          )}
      </Grid>
    </Box>
  );
}
