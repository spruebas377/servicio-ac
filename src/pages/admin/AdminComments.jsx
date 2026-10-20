// src/pages/admin/AdminComments.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  alpha,
  Skeleton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { supabase } from "../../supabase/client";
import { NavLink } from "react-router";

/* ------------------------------------------------------------------ */
/*  Confirm delete dialog                                              */
/* ------------------------------------------------------------------ */
function ConfirmDeleteDialog({ open, comment, onClose, onConfirm }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        ¿Eliminar comentario?
      </DialogTitle>
      <DialogContent>
        {comment && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.text.primary, 0.04),
              border: `1px solid ${theme.palette.divider}`,
              mb: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: "text.secondary" }}
            >
              "{comment.content}"
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5, display: "block" }}>
              — {comment.author?.name || comment.author?.email || "Autor desconocido"}
            </Typography>
          </Box>
        )}
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={loading}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          {loading ? "Eliminando…" : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Comment card                                                       */
/* ------------------------------------------------------------------ */
function CommentCard({ comment, onDelete }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2.5,
        p: 2.5,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: isDark
            ? "0 8px 24px -8px rgba(0,0,0,0.5)"
            : "0 8px 24px -8px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Author */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1 }}>
          <Avatar
            src={comment.author?.avatar_url}
            sx={{
              width: 38,
              height: 38,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              fontWeight: 700,
              fontSize: "0.9rem",
              flexShrink: 0,
            }}
          >
            {(
              comment.author?.name ||
              comment.author?.email ||
              "?"
            )[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.25,
                flexWrap: "wrap",
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
                {comment.author?.name || "Sin nombre"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                →
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#6366f1" }}>
                {comment.profile?.name || "Perfil"}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.disabled", mb: 1, display: "block" }}>
              {new Date(comment.created_at).toLocaleString("es-AR")}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.9rem",
                lineHeight: 1.6,
                color: "text.primary",
              }}
            >
              {comment.content}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="Ver perfil">
            <IconButton
              size="small"
              component={NavLink}
              to={`/user/${comment.profile_id}`}
              target="_blank"
              sx={{
                color: "#6366f1",
                "&:hover": { bgcolor: alpha("#6366f1", 0.1) },
              }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar comentario">
            <IconButton
              size="small"
              onClick={() => onDelete(comment)}
              sx={{
                color: "#ef4444",
                "&:hover": { bgcolor: alpha("#ef4444", 0.1) },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function AdminComments() {
  const theme = useTheme();

  const [comments, setComments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);


  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch all comments
      const { data: rawComments, error } = await supabase
        .from("profile_comments")
        .select("id, content, created_at, profile_id, author_id")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!rawComments || rawComments.length === 0) {
        setComments([]);
        setFiltered([]);
        return;
      }

      // 2. Collect unique user IDs (authors + profiles)
      const userIds = [
        ...new Set([
          ...rawComments.map((c) => c.author_id),
          ...rawComments.map((c) => c.profile_id),
        ]),
      ].filter(Boolean);

      // 3. Fetch user_data for those IDs
      const { data: usersData } = await supabase
        .from("user_data")
        .select("id, name, email, avatar_url")
        .in("id", userIds);

      const usersMap = {};
      (usersData || []).forEach((u) => {
        usersMap[u.id] = u;
      });

      // 4. Enrich comments
      const enriched = rawComments.map((c) => ({
        ...c,
        author: usersMap[c.author_id] || null,
        profile: usersMap[c.profile_id] || null,
      }));

      setComments(enriched);
      setFiltered(enriched);
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? comments.filter(
            (c) =>
              c.content?.toLowerCase().includes(q) ||
              c.author?.name?.toLowerCase().includes(q) ||
              c.author?.email?.toLowerCase().includes(q) ||
              c.profile?.name?.toLowerCase().includes(q)
          )
        : comments
    );
  }, [search, comments]);

  const handleDeleteClick = (comment) => {
    setToDelete(comment);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      const { error } = await supabase
        .from("profile_comments")
        .delete()
        .eq("id", toDelete.id);
      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== toDelete.id));
      setDialogOpen(false);
      setToDelete(null);
    } catch (err) {
      console.error("Error eliminando comentario:", err);
    }
  };

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
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}
          >
            <CommentOutlinedIcon sx={{ color: "#f59e0b", fontSize: 26 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Moderación de comentarios
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {filtered.length} comentario
            {filtered.length !== 1 ? "s" : ""} encontrado
            {filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <TextField
          placeholder="Buscar en comentarios…"
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
            width: { xs: "100%", sm: 300 },
            "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
          }}
        />
      </Box>

      {/* Comment list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2.5,
                  p: 2.5,
                }}
              >
                <Skeleton height={80} />
              </Paper>
            ))
          : filtered.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "text.secondary",
              }}
            >
              <CommentOutlinedIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.3 }} />
              <Typography>
                {search ? "No se encontraron comentarios" : "No hay comentarios aún"}
              </Typography>
            </Box>
          ) : (
            filtered.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteClick}
              />
            ))
          )}
      </Box>

      <ConfirmDeleteDialog
        open={dialogOpen}
        comment={toDelete}
        onClose={() => {
          setDialogOpen(false);
          setToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
