// src/components/ProfileComments.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase/client";

const MAX_COMMENT_LENGTH = 500;

/* ---------- Estilos personalizados ---------- */
const CommentsContainer = styled(Paper)(({ theme }) => ({
  borderRadius: "1.5rem",
  padding: theme.spacing(3.5),
  border: `1px solid ${
    theme.palette.mode === "light" ? alpha("#000", 0.06) : alpha("#fff", 0.06)
  }`,
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 4px 20px -4px rgba(0,0,0,0.03)"
      : "0 4px 20px -4px rgba(0,0,0,0.25)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const CommentCard = styled(Card)(({ theme }) => ({
  borderRadius: "1.25rem",
  border: `1px solid ${
    theme.palette.mode === "light" ? alpha("#000", 0.05) : alpha("#fff", 0.06)
  }`,
  backgroundColor:
    theme.palette.mode === "light"
      ? alpha("#000", 0.015)
      : alpha("#fff", 0.02),
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    borderColor:
      theme.palette.mode === "light"
        ? alpha(theme.palette.primary.main, 0.25)
        : alpha(theme.palette.primary.main, 0.4),
    boxShadow:
      theme.palette.mode === "light"
        ? "0 6px 20px -4px rgba(0,0,0,0.05)"
        : "0 6px 20px -4px rgba(0,0,0,0.4)",
  },
}));

/* Helper para tiempo relativo amigable en español */
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Hace un momento";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`;
    }
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ProfileComments({ profileId, profileOwnerName = "este usuario" }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, userData: currentUserData } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  // Diálogo para confirmación de eliminación
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Alerta toast
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const isOwnProfile = user && user.id === profileId;

  /* ---------- Cargar comentarios y autores ---------- */
  const fetchComments = useCallback(async () => {
    if (!profileId) return;
    try {
      setLoading(true);
      const { data: commentsData, error: commentsError } = await supabase
        .from("profile_comments")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (commentsError) {
        console.warn("Error cargando comentarios:", commentsError);
        // Si la tabla no existe aún, evitamos romper la app
        setComments([]);
        return;
      }

      const rawComments = commentsData || [];
      const authorIds = [...new Set(rawComments.map((c) => c.author_id))];

      let authorMap = {};
      if (authorIds.length > 0) {
        const { data: authorsData } = await supabase
          .from("user_data")
          .select("id, name, avatar_url, verified")
          .in("id", authorIds);

        if (authorsData) {
          authorsData.forEach((author) => {
            authorMap[author.id] = author;
          });
        }
      }

      const enrichedComments = rawComments.map((c) => ({
        ...c,
        author: authorMap[c.author_id] || {
          name: "Usuario",
          avatar_url: null,
          verified: false,
        },
      }));

      setComments(enrichedComments);
    } catch (err) {
      console.error("Excepción al cargar comentarios:", err);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  /* Carga inicial y suscripción Realtime */
  useEffect(() => {
    fetchComments();

    const channelName = `profile-comments-${profileId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profile_comments",
          filter: `profile_id=eq.${profileId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchComments]);

  /* ---------- Enviar nuevo comentario ---------- */
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    if (!user) {
      setToast({
        open: true,
        message: "Debes iniciar sesión para publicar un comentario.",
        severity: "warning",
      });
      return;
    }

    if (isOwnProfile) {
      setToast({
        open: true,
        message: "No puedes comentar en tu propio perfil.",
        severity: "error",
      });
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("profile_comments")
        .insert({
          profile_id: profileId,
          author_id: user.id,
          content: trimmed,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCommentText("");
      setToast({
        open: true,
        message: "¡Comentario publicado exitosamente!",
        severity: "success",
      });

      // Añadir de inmediato optimísticamente con datos del usuario actual
      const newCommentWithAuthor = {
        ...data,
        author: {
          name: currentUserData?.name || user.email?.split("@")[0] || "Usuario",
          avatar_url: currentUserData?.avatar_url || null,
          verified: Boolean(currentUserData?.verified),
        },
      };

      setComments((prev) => [
        newCommentWithAuthor,
        ...prev.filter((c) => c.id !== data.id),
      ]);
    } catch (err) {
      console.error("Error al publicar comentario:", err);
      setToast({
        open: true,
        message:
          err.message ||
          "No se pudo publicar el comentario. Por favor, intenta de nuevo.",
        severity: "error",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  /* ---------- Eliminar comentario ---------- */
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("profile_comments")
        .delete()
        .eq("id", deleteTargetId);

      if (error) throw error;

      setComments((prev) => prev.filter((c) => c.id !== deleteTargetId));
      setToast({
        open: true,
        message: "Comentario eliminado correctamente.",
        severity: "success",
      });
    } catch (err) {
      console.error("Error eliminando comentario:", err);
      setToast({
        open: true,
        message:
          err.message ||
          "No se pudo eliminar el comentario. Revisa los permisos.",
        severity: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <Box sx={{ mt: 5, mb: 4 }}>
      <CommentsContainer elevation={0}>
        {/* Cabecera de la sección */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h5" fontWeight={700}>
                  Comentarios del perfil
                </Typography>
                <Chip
                  label={comments.length}
                  size="small"
                  color="primary"
                  variant={comments.length > 0 ? "filled" : "outlined"}
                  sx={{ fontWeight: 700, height: 22, fontSize: "0.75rem" }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Opiniones y comentarios públicos de otros usuarios
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* ============ Formulario de Nuevo Comentario ============ */}
        {!user ? (
          // Usuario no autenticado
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 4,
              borderRadius: "1rem",
              textAlign: "center",
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha(theme.palette.primary.main, 0.03)
                  : alpha(theme.palette.primary.main, 0.08),
              borderColor: alpha(theme.palette.primary.main, 0.15),
            }}
          >
            <PersonOutlineRoundedIcon
              sx={{
                fontSize: 36,
                color: theme.palette.primary.main,
                mb: 1,
              }}
            />
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              ¿Quieres dejar un comentario en este perfil?
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2.5, maxWidth: 450, mx: "auto" }}
            >
              Inicia sesión con tu cuenta para compartir tu opinión o
              experiencia de forma pública.
            </Typography>
            <Button
              variant="contained"
              startIcon={<LoginRoundedIcon />}
              onClick={() =>
                navigate("/login", {
                  state: { from: `/user/${profileId}` },
                })
              }
              sx={{
                borderRadius: "0.75rem",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Iniciar sesión para comentar
            </Button>
          </Paper>
        ) : isOwnProfile ? (
          // El usuario está viendo su propio perfil
          <Alert
            severity="info"
            variant="outlined"
            sx={{
              mb: 4,
              borderRadius: "1rem",
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha(theme.palette.info.main, 0.04)
                  : alpha(theme.palette.info.main, 0.1),
            }}
          >
            Este es tu perfil público. Aquí se mostrarán los comentarios y
            opiniones que otros usuarios registrados dejen sobre vos. No puedes
            dejar comentarios en tu propio perfil.
          </Alert>
        ) : (
          // Usuario autenticado en perfil ajeno: Formulario de comentario
          <Box
            component="form"
            onSubmit={handleSubmitComment}
            sx={{
              mb: 4,
              p: 2.5,
              borderRadius: "1.25rem",
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha("#000", 0.02)
                  : alpha("#fff", 0.03),
              border: `1px solid ${
                theme.palette.mode === "light"
                  ? alpha("#000", 0.06)
                  : alpha("#fff", 0.06)
              }`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar
                src={currentUserData?.avatar_url || undefined}
                alt={currentUserData?.name || "Tu avatar"}
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "primary.main",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {(currentUserData?.name || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  placeholder={`Escribe un comentario público para ${profileOwnerName}...`}
                  value={commentText}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                      setCommentText(e.target.value);
                    }
                  }}
                  disabled={submitting}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "0.75rem",
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 1.5 }}
                >
                  <Typography
                    variant="caption"
                    color={
                      commentText.length >= MAX_COMMENT_LENGTH
                        ? "error.main"
                        : "text.secondary"
                    }
                  >
                    {commentText.length} / {MAX_COMMENT_LENGTH} caracteres
                  </Typography>

                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={
                      submitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <SendRoundedIcon />
                      )
                    }
                    disabled={!commentText.trim() || submitting}
                    sx={{
                      borderRadius: "0.75rem",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                    }}
                  >
                    {submitting ? "Publicando..." : "Publicar comentario"}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}

        {/* ============ Lista de Comentarios ============ */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
            }}
          >
            <CircularProgress size={36} />
          </Box>
        ) : comments.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              py: 6,
              px: 3,
              textAlign: "center",
              borderRadius: "1.25rem",
              borderStyle: "dashed",
              backgroundColor: "transparent",
            }}
          >
            <ChatBubbleOutlineRoundedIcon
              sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aún no hay comentarios
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 400, mx: "auto" }}
            >
              {isOwnProfile
                ? "Aún no recibiste comentarios de otros usuarios. Aparecerán aquí cuando los recibas."
                : "Sé el primero en dejar un comentario o valoración pública en este perfil."}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {comments.map((comment) => {
              const isCommentAuthor = user && comment.author_id === user.id;
              const canDelete = isCommentAuthor || isOwnProfile;
              const authorName = comment.author?.name || "Usuario";
              const authorInitials = authorName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "U";

              return (
                <Fade in key={comment.id} timeout={250}>
                  <CommentCard elevation={0}>
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1.5}
                      >
                        {/* Autor y fecha */}
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            component={Link}
                            to={`/user/${comment.author_id}`}
                            src={comment.author?.avatar_url || undefined}
                            alt={authorName}
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: "primary.main",
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              textDecoration: "none",
                              cursor: "pointer",
                              transition: "transform 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            {authorInitials}
                          </Avatar>

                          <Box>
                            <Stack
                              direction="row"
                              spacing={0.8}
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              <Typography
                                component={Link}
                                to={`/user/${comment.author_id}`}
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{
                                  color: "text.primary",
                                  textDecoration: "none",
                                  "&:hover": {
                                    textDecoration: "underline",
                                    color: "primary.main",
                                  },
                                }}
                              >
                                {authorName}
                              </Typography>

                              {comment.author?.verified && (
                                <Tooltip title="Perfil verificado">
                                  <VerifiedIcon
                                    color="success"
                                    sx={{ fontSize: 16 }}
                                  />
                                </Tooltip>
                              )}

                              {isCommentAuthor && (
                                <Chip
                                  label="Tú"
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                  }}
                                />
                              )}
                            </Stack>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              {formatRelativeTime(comment.created_at)}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Botón para eliminar (si es autor o dueño del perfil) */}
                        {canDelete && (
                          <Tooltip
                            title={
                              isCommentAuthor
                                ? "Eliminar mi comentario"
                                : "Eliminar comentario de mi perfil"
                            }
                          >
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteTargetId(comment.id)}
                              sx={{
                                opacity: 0.7,
                                transition: "opacity 0.2s",
                                "&:hover": { opacity: 1 },
                              }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>

                      {/* Contenido del comentario */}
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1.5,
                          whiteSpace: "pre-line",
                          wordBreak: "break-word",
                          lineHeight: 1.6,
                        }}
                      >
                        {comment.content}
                      </Typography>
                    </CardContent>
                  </CommentCard>
                </Fade>
              );
            })}
          </Stack>
        )}
      </CommentsContainer>

      {/* Modal de confirmación para eliminar comentario */}
      <Dialog
        open={Boolean(deleteTargetId)}
        onClose={() => !deleting && setDeleteTargetId(null)}
        PaperProps={{
          sx: { borderRadius: "1rem", p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          ¿Eliminar comentario?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará el comentario de manera permanente y pública.
            ¿Estás seguro de que deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTargetId(null)}
            disabled={deleting}
            sx={{ textTransform: "none", borderRadius: "0.75rem" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteOutlineRoundedIcon />
              )
            }
            sx={{ textTransform: "none", borderRadius: "0.75rem" }}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
