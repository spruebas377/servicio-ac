// src/pages/admin/AdminUsers.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Paper,
  alpha,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedIcon from "@mui/icons-material/Verified";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { supabase } from "../../supabase/client";

/* ------------------------------------------------------------------ */
/*  User detail dialog                                                 */
/* ------------------------------------------------------------------ */
function UserDetailDialog({ open, user, onClose, onUpdated }) {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    verified: false,
    featured: false,
    is_public: true,
    is_admin: false,
  });

  useEffect(() => {
    if (user) {
      setForm({
        verified: user.verified ?? false,
        featured: user.featured ?? false,
        is_public: user.is_public ?? true,
        is_admin: user.is_admin ?? false,
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_data")
        .update(form)
        .eq("id", user.id);
      if (error) throw error;
      onUpdated({ ...user, ...form });
      onClose();
    } catch (err) {
      console.error("Error actualizando usuario:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundImage: "none",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={user.avatar_url}
            sx={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              fontWeight: 700,
            }}
          >
            {(user.name || user.email || "?")[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
              {user.name || "Sin nombre"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 1,
            }}
          >
            {[
              { label: "Ciudad", value: user.city || "—" },
              { label: "Provincia", value: user.province || "—" },
              { label: "Teléfono", value: user.phone || "—" },
              { label: "Género", value: user.gender || "—" },
              {
                label: "Registrado",
                value: user.created_at
                  ? new Date(user.created_at).toLocaleDateString("es-AR")
                  : "—",
              },
            ].map((row) => (
              <Box key={row.label}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    fontSize: "0.7rem",
                  }}
                >
                  {row.label}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: "0.88rem" }}>
                  {row.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider />

          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            CONTROLES DE ADMINISTRADOR
          </Typography>

          {[
            {
              key: "verified",
              label: "Perfil verificado",
              desc: "Muestra el badge de verificación",
              color: "#22c55e",
            },
            {
              key: "featured",
              label: "Perfil destacado",
              desc: "Aparece primero en los listados",
              color: "#f59e0b",
            },
            {
              key: "is_public",
              label: "Perfil público",
              desc: "Visible en búsquedas",
              color: "#3b82f6",
            },
            {
              key: "is_admin",
              label: "Administrador",
              desc: "Acceso al panel de admin",
              color: "#ec4899",
            },
          ].map(({ key, label, desc, color }) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: form[key] ? alpha(color, 0.06) : "transparent",
                transition: "all 0.2s",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  {label}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {desc}
                </Typography>
              </Box>
              <Switch
                checked={form[key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.checked }))
                }
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    bgcolor: color,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            borderRadius: 2,
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick action: toggle verified                                      */
/* ------------------------------------------------------------------ */
async function toggleField(userId, field, currentValue) {
  const { error } = await supabase
    .from("user_data")
    .update({ [field]: !currentValue })
    .eq("id", userId);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function AdminUsers() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_data")
        .select(
          "id, name, email, avatar_url, verified, featured, is_public, is_admin, created_at, city, province, phone, gender"
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? users.filter(
            (u) =>
              u.name?.toLowerCase().includes(q) ||
              u.email?.toLowerCase().includes(q)
          )
        : users
    );
  }, [search, users]);

  const handleToggleField = async (user, field) => {
    try {
      await toggleField(user.id, field, user[field]);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, [field]: !u[field] } : u
        )
      );
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  const handleDetailOpen = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleUserUpdated = (updated) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u))
    );
  };

  const columns = [
    { id: "user", label: "Usuario", minWidth: 220 },
    { id: "status", label: "Estado", minWidth: 140 },
    { id: "registered", label: "Registrado", minWidth: 110 },
    { id: "actions", label: "Acciones", minWidth: 140, align: "center" },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <PeopleAltOutlinedIcon sx={{ color: "#6366f1", fontSize: 26 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Gestión de usuarios
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {filtered.length} usuario{filtered.length !== 1 ? "s" : ""} encontrado
            {filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <TextField
          placeholder="Buscar por nombre o email…"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", sm: 280 },
            "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
          }}
        />
      </Box>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ maxHeight: "65vh" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || "left"}
                    sx={{
                      minWidth: col.minWidth,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "text.secondary",
                      bgcolor: isDark
                        ? alpha("#ffffff", 0.04)
                        : alpha("#000000", 0.02),
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.75,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton height={52} sx={{ borderRadius: 1 }} />
                      </TableCell>
                    </TableRow>
                  ))
                : filtered.map((user) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:last-child td": { borderBottom: 0 },
                        transition: "background 0.15s",
                      }}
                    >
                      {/* User col */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                        >
                          <Avatar
                            src={user.avatar_url}
                            sx={{
                              width: 34,
                              height: 34,
                              background:
                                "linear-gradient(135deg, #6366f1, #a855f7)",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                            }}
                          >
                            {(user.name || user.email || "?")[0].toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{ fontWeight: 600, fontSize: "0.88rem", lineHeight: 1.2 }}
                            >
                              {user.name || "—"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Status col */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {user.verified && (
                            <Chip
                              label="Verificado"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                bgcolor: alpha("#22c55e", 0.1),
                                color: "#16a34a",
                              }}
                            />
                          )}
                          {user.featured && (
                            <Chip
                              label="Destacado"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                bgcolor: alpha("#f59e0b", 0.1),
                                color: "#b45309",
                              }}
                            />
                          )}
                          {user.is_admin && (
                            <Chip
                              label="Admin"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                bgcolor: alpha("#ec4899", 0.1),
                                color: "#be185d",
                              }}
                            />
                          )}
                          {!user.is_public && (
                            <Chip
                              label="Privado"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                bgcolor: alpha("#64748b", 0.1),
                                color: "#64748b",
                              }}
                            />
                          )}
                          {!user.verified && !user.featured && !user.is_admin && user.is_public && (
                            <Typography variant="caption" sx={{ color: "text.disabled" }}>
                              Normal
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Registered col */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString("es-AR")
                            : "—"}
                        </Typography>
                      </TableCell>

                      {/* Actions col */}
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Box
                          sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
                        >
                          <Tooltip
                            title={user.verified ? "Quitar verificación" : "Verificar"}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleField(user, "verified")}
                              sx={{
                                color: user.verified ? "#22c55e" : "text.disabled",
                                "&:hover": { bgcolor: alpha("#22c55e", 0.1) },
                              }}
                            >
                              {user.verified ? (
                                <VerifiedIcon fontSize="small" />
                              ) : (
                                <VerifiedOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            title={user.featured ? "Quitar destacado" : "Destacar"}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleField(user, "featured")}
                              sx={{
                                color: user.featured ? "#f59e0b" : "text.disabled",
                                "&:hover": { bgcolor: alpha("#f59e0b", 0.1) },
                              }}
                            >
                              {user.featured ? (
                                <StarIcon fontSize="small" />
                              ) : (
                                <StarBorderIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            title={user.is_public ? "Hacer privado" : "Hacer público"}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleField(user, "is_public")}
                              sx={{
                                color: user.is_public ? "#3b82f6" : "text.disabled",
                                "&:hover": { bgcolor: alpha("#3b82f6", 0.1) },
                              }}
                            >
                              {user.is_public ? (
                                <CheckCircleOutlineIcon fontSize="small" />
                              ) : (
                                <BlockOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => handleDetailOpen(user)}
                              sx={{
                                color: "#6366f1",
                                "&:hover": { bgcolor: alpha("#6366f1", 0.1) },
                              }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <UserDetailDialog
        open={dialogOpen}
        user={selectedUser}
        onClose={() => setDialogOpen(false)}
        onUpdated={handleUserUpdated}
      />
    </Box>
  );
}
