// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  alpha,
  Skeleton,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import { supabase } from "../../supabase/client";

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, icon: Icon, color, sublabel, loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        background: isDark
          ? alpha(color, 0.08)
          : alpha(color, 0.04),
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: isDark
            ? `0 12px 30px -8px ${alpha(color, 0.3)}`
            : `0 12px 30px -8px ${alpha(color, 0.15)}`,
        },
      }}
    >
      {/* Decorative circle */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: alpha(color, isDark ? 0.15 : 0.08),
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: alpha(color, 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                fontSize: "0.8rem",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                mb: 0.5,
              }}
            >
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={60} height={40} />
            ) : (
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color, lineHeight: 1 }}
              >
                {value ?? "—"}
              </Typography>
            )}
            {sublabel && (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
              >
                {sublabel}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Recent users mini list                                             */
/* ------------------------------------------------------------------ */
function RecentUserRow({ user }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.25,
        px: 2,
        borderRadius: 2,
        transition: "background 0.15s",
        "&:hover": {
          background: alpha(theme.palette.text.primary, 0.04),
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: `linear-gradient(135deg, #6366f1 0%, #a855f7 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "0.85rem",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {(user.name || user.email || "?")[0].toUpperCase()}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.88rem",
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
      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
        {user.verified && (
          <Chip
            label="Verificado"
            size="small"
            icon={<VerifiedOutlinedIcon sx={{ fontSize: "14px !important" }} />}
            sx={{
              height: 22,
              fontSize: "0.7rem",
              bgcolor: alpha("#22c55e", 0.1),
              color: "#16a34a",
              border: "none",
            }}
          />
        )}
        {user.is_public === false && (
          <Chip
            label="Privado"
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              bgcolor: alpha("#f59e0b", 0.1),
              color: "#b45309",
            }}
          />
        )}
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, verifiedRes, publicRes, commentsRes, featuredRes] =
          await Promise.all([
            supabase.from("user_data").select("id", { count: "exact", head: true }),
            supabase
              .from("user_data")
              .select("id", { count: "exact", head: true })
              .eq("verified", true),
            supabase
              .from("user_data")
              .select("id", { count: "exact", head: true })
              .eq("is_public", true),
            supabase
              .from("profile_comments")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("user_data")
              .select("id", { count: "exact", head: true })
              .eq("featured", true),
          ]);

        setStats({
          total: usersRes.count ?? 0,
          verified: verifiedRes.count ?? 0,
          public: publicRes.count ?? 0,
          comments: commentsRes.count ?? 0,
          featured: featuredRes.count ?? 0,
        });

        // Recent users
        const { data: recent } = await supabase
          .from("user_data")
          .select("id, name, email, verified, is_public, created_at")
          .order("created_at", { ascending: false })
          .limit(8);

        setRecentUsers(recent || []);
      } catch (err) {
        console.error("Error cargando estadísticas admin:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Usuarios totales",
      value: stats?.total,
      icon: PeopleAltOutlinedIcon,
      color: "#6366f1",
      sublabel: "registrados en la plataforma",
    },
    {
      label: "Verificados",
      value: stats?.verified,
      icon: VerifiedOutlinedIcon,
      color: "#22c55e",
      sublabel: `${stats?.total ? Math.round((stats.verified / stats.total) * 100) : 0}% del total`,
    },
    {
      label: "Perfiles públicos",
      value: stats?.public,
      icon: PublicOutlinedIcon,
      color: "#3b82f6",
      sublabel: "visibles en búsquedas",
    },
    {
      label: "Comentarios",
      value: stats?.comments,
      icon: CommentOutlinedIcon,
      color: "#f59e0b",
      sublabel: "en toda la plataforma",
    },
    {
      label: "Destacados",
      value: stats?.featured,
      icon: StarOutlinedIcon,
      color: "#ec4899",
      sublabel: "con badge especial",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <TrendingUpIcon sx={{ color: "#6366f1", fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Resumen general
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Vista rápida del estado actual de la plataforma
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Progress bar: public vs private */}
      {!loading && stats && (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            mb: 3,
            p: 3,
          }}
        >
          <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: "0.95rem" }}>
            Visibilidad de perfiles
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {stats.public} públicos · {stats.total - stats.public} privados
          </Typography>
          <LinearProgress
            variant="determinate"
            value={stats.total ? (stats.public / stats.total) * 100 : 0}
            sx={{
              mt: 1.5,
              height: 8,
              borderRadius: 4,
              bgcolor: alpha("#3b82f6", 0.12),
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
              },
            }}
          />
        </Card>
      )}

      {/* Recent users */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
            Últimos usuarios registrados
          </Typography>
          <Chip
            label={`${recentUsers.length} recientes`}
            size="small"
            sx={{
              bgcolor: alpha("#6366f1", 0.1),
              color: "#6366f1",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </Box>
        <Box sx={{ py: 1 }}>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{ px: 2, py: 1.25 }}>
                  <Skeleton height={36} sx={{ borderRadius: 2 }} />
                </Box>
              ))
            : recentUsers.map((u) => <RecentUserRow key={u.id} user={u} />)}
        </Box>
      </Card>
    </Box>
  );
}
