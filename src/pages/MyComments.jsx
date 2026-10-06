// src/pages/MyComments.jsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
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
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CallReceivedRoundedIcon from "@mui/icons-material/CallReceivedRounded";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import VerifiedIcon from "@mui/icons-material/Verified";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase/client";

/* ---------- Estilos personalizados ---------- */
const HeaderPaper = styled(Paper)(({ theme }) => ({
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
}));

const CommentItemCard = styled(Card)(({ theme }) => ({
  borderRadius: "1.25rem",
  border: `1px solid ${
    theme.palette.mode === "light" ? alpha("#000", 0.06) : alpha("#fff", 0.06)
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

export default function MyComments() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState(0); // 0: Recibidos, 1: Realizados
  const [receivedComments, setReceivedComments] = useState([]);
  const [madeComments, setMadeComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal para confirmar eliminación
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notificaciones
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  /* Redirección si no está autenticado */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: "/my-comments" } });
    }
  }, [user, authLoading, navigate]);

  /* Scroll al top */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* Cargar comentarios recibidos y realizados */
  const fetchAllComments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // 1. Comentarios recibidos en mi perfil
      const { data: receivedData, error: receivedError } = await supabase
        .from("profile_comments")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (receivedError) console.warn("Error comentarios recibidos:", receivedError);

      // 2. Comentarios que yo he realizado en perfiles de otros
      const { data: madeData, error: madeError } = await supabase
        .from("profile_comments")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (madeError) console.warn("Error comentarios realizados:", madeError);

      const rawReceived = receivedData || [];
      const rawMade = madeData || [];

      // Recopilar IDs de usuarios para enriquecer autores y destinatarios
      const allUserIds = [
        ...new Set([
          ...rawReceived.map((c) => c.author_id),
          ...rawMade.map((c) => c.profile_id),
        ]),
      ];

      let userProfilesMap = {};
      if (allUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from("user_data")
          .select("id, name, avatar_url, verified")
          .in("id", allUserIds);

        if (usersData) {
          usersData.forEach((u) => {
            userProfilesMap[u.id] = u;
          });
        }
      }

      setReceivedComments(
        rawReceived.map((c) => ({
          ...c,
          author: userProfilesMap[c.author_id] || {
            name: "Usuario",
            avatar_url: null,
            verified: false,
          },
        }))
      );

      setMadeComments(
        rawMade.map((c) => ({
          ...c,
          targetUser: userProfilesMap[c.profile_id] || {
            name: "Usuario",
            avatar_url: null,
            verified: false,
          },
        }))
      );
    } catch (err) {
      console.error("Error al obtener comentarios:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchAllComments();

      // Suscripción Realtime para cambios
      const channel = supabase
        .channel(`user-comments-channel-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profile_comments",
          },
          () => {
            fetchAllComments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchAllComments]);

  /* Eliminar comentario */
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("profile_comments")
        .delete()
        .eq("id", deleteTargetId);

      if (error) throw error;

      setReceivedComments((prev) => prev.filter((c) => c.id !== deleteTargetId));
      setMadeComments((prev) => prev.filter((c) => c.id !== deleteTargetId));

      setToast({
        open: true,
        message: "Comentario eliminado correctamente.",
        severity: "success",
      });
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
      setToast({
        open: true,
        message: err.message || "No se pudo eliminar el comentario.",
        severity: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const currentCommentsList = activeTab === 0 ? receivedComments : madeComments;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Botón Volver */}
      <Button
        startIcon={<ArrowBackOutlinedIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, borderRadius: "0.75rem", textTransform: "none" }}
      >
        Volver
      </Button>

      {/* Cabecera Principal */}
      <HeaderPaper elevation={0} sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
                Mis comentarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona las opiniones recibidas en tu perfil y las que has
                publicado en perfiles de otros.
              </Typography>
            </Box>
          </Stack>

          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            size="small"
            onClick={fetchAllComments}
            disabled={loading}
            sx={{
              borderRadius: "0.75rem",
              textTransform: "none",
              alignSelf: { xs: "flex-start", sm: "center" },
            }}
          >
            Actualizar
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Pestañas: Recibidos / Realizados */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              minHeight: 48,
              borderRadius: "0.75rem",
              mr: 1,
            },
          }}
        >
          <Tab
            icon={<CallReceivedRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Recibidos en mi perfil</span>
                <Chip
                  label={receivedComments.length}
                  size="small"
                  color={activeTab === 0 ? "primary" : "default"}
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                />
              </Stack>
            }
          />
          <Tab
            icon={<CallMadeRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Realizados por mí</span>
                <Chip
                  label={madeComments.length}
                  size="small"
                  color={activeTab === 1 ? "primary" : "default"}
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                />
              </Stack>
            }
          />
        </Tabs>
      </HeaderPaper>

      {/* Contenido de la lista */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : currentCommentsList.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            py: 8,
            px: 3,
            textAlign: "center",
            borderRadius: "1.5rem",
            borderStyle: "dashed",
            backgroundColor: "transparent",
          }}
        >
          <ChatBubbleOutlineRoundedIcon
            sx={{ fontSize: 50, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {activeTab === 0
              ? "No tienes comentarios recibidos"
              : "No has publicado comentarios aún"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 450, mx: "auto", mb: 3 }}
          >
            {activeTab === 0
              ? "Cuando otros usuarios dejen comentarios u opiniones públicas en tu perfil, aparecerán en este lugar."
              : "Puedes explorar perfiles públicos de otros usuarios y dejarles un comentario o reseña sincera."}
          </Typography>
          {activeTab === 1 && (
            <Button
              variant="contained"
              onClick={() => navigate("/search")}
              sx={{ borderRadius: "0.75rem", textTransform: "none", px: 3 }}
            >
              Explorar perfiles
            </Button>
          )}
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          {currentCommentsList.map((item) => {
            const isReceived = activeTab === 0;
            const otherUser = isReceived ? item.author : item.targetUser;
            const otherUserId = isReceived ? item.author_id : item.profile_id;
            const userName = otherUser?.name || "Usuario";
            const initials = userName
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "U";

            return (
              <Fade in key={item.id} timeout={250}>
                <CommentItemCard elevation={0}>
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={2}
                      sx={{ mb: 1.5 }}
                    >
                      {/* Avatar y Datos del otro usuario */}
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          component={Link}
                          to={`/user/${otherUserId}`}
                          src={otherUser?.avatar_url || undefined}
                          alt={userName}
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "primary.main",
                            fontWeight: 700,
                            textDecoration: "none",
                            cursor: "pointer",
                            transition: "transform 0.2s ease",
                            "&:hover": { transform: "scale(1.05)" },
                          }}
                        >
                          {initials}
                        </Avatar>

                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <Typography
                              component={Link}
                              to={`/user/${otherUserId}`}
                              variant="subtitle1"
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
                              {userName}
                            </Typography>

                            {otherUser?.verified && (
                              <Tooltip title="Perfil verificado">
                                <VerifiedIcon
                                  color="success"
                                  sx={{ fontSize: 16 }}
                                />
                              </Tooltip>
                            )}

                            <Chip
                              label={
                                isReceived
                                  ? "Comentó en tu perfil"
                                  : "Perfil comentado"
                              }
                              size="small"
                              variant="outlined"
                              color={isReceived ? "secondary" : "default"}
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                fontWeight: 600,
                              }}
                            />
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {formatRelativeTime(item.created_at)}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Botones de acción */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          component={Link}
                          to={`/user/${otherUserId}`}
                          size="small"
                          variant="outlined"
                          endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                          sx={{
                            borderRadius: "0.75rem",
                            textTransform: "none",
                            fontSize: "0.8rem",
                          }}
                        >
                          Ver perfil
                        </Button>

                        <Tooltip
                          title={
                            isReceived
                              ? "Eliminar comentario de mi perfil"
                              : "Eliminar mi comentario"
                          }
                        >
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => setDeleteTargetId(item.id)}
                            sx={{
                              opacity: 0.8,
                              "&:hover": { opacity: 1 },
                            }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Contenido del comentario */}
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                        lineHeight: 1.6,
                        color: "text.primary",
                      }}
                    >
                      {item.content}
                    </Typography>
                  </CardContent>
                </CommentItemCard>
              </Fade>
            );
          })}
        </Stack>
      )}

      {/* Modal de confirmación para eliminar */}
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
            {activeTab === 0
              ? "¿Estás seguro de que deseas eliminar este comentario recibido en tu perfil? Se borrará permanentemente."
              : "¿Estás seguro de que deseas eliminar tu comentario publicado? Se borrará permanentemente."}
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

      {/* Notificaciones Snackbar */}
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
    </Container>
  );
}
