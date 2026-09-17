// src/pages/MyPublications.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Stack,
  Divider,
  Fade,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { supabase } from "../supabase/client";
import ImageUploader from "../components/ImageUploader";

const BUCKET_NAME = "imagenes";

const GalleryCard = styled(Card)(({ theme }) => ({
  borderRadius: "1.25rem",
  overflow: "hidden",
  border: `1px solid ${
    theme.palette.mode === "light" ? alpha("#000", 0.08) : alpha("#fff", 0.08)
  }`,
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 4px 20px -4px rgba(0,0,0,0.05)"
      : "0 4px 20px -4px rgba(0,0,0,0.3)",
  transition: "all 0.25s ease",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      theme.palette.mode === "light"
        ? "0 12px 28px -6px rgba(0,0,0,0.12)"
        : "0 12px 28px -6px rgba(0,0,0,0.6)",
  },
}));

export default function MyPublications() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  /* ---------- Redirección si no está autenticado ---------- */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  /* ---------- Cargar imágenes del usuario desde Supabase Storage ---------- */
  const fetchUserImages = useCallback(async () => {
    if (!user?.id) return;
    setLoadingImages(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.error("Error al obtener imágenes de storage:", error);
        setToast({
          open: true,
          message:
            "No se pudieron cargar las imágenes. Asegúrate de que el bucket 'imagenes' exista en Supabase.",
          severity: "error",
        });
        setImages([]);
        return;
      }

      // Filtrar carpetas/placeholders vacíos si existen
      const validFiles = (data || []).filter(
        (file) => file.name && !file.name.startsWith("."),
      );

      const mappedImages = validFiles.map((file) => {
        const fullPath = `${user.id}/${file.name}`;
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fullPath);

        return {
          id: file.id || file.name,
          name: file.name,
          path: fullPath,
          url: urlData.publicUrl,
          createdAt: file.created_at,
          size: file.metadata?.size || 0,
        };
      });

      setImages(mappedImages);
    } catch (err) {
      console.error("Excepción cargando imágenes:", err);
    } finally {
      setLoadingImages(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserImages();
    }
  }, [user?.id, fetchUserImages]);

  /* ---------- Eliminar imagen de Storage ---------- */
  const handleDeleteImage = async (imagePath) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta imagen?")) {
      return;
    }

    setDeletingId(imagePath);
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([imagePath]);

      if (error) {
        throw error;
      }

      setImages((prev) => prev.filter((img) => img.path !== imagePath));
      setToast({
        open: true,
        message: "Imagen eliminada con éxito",
        severity: "success",
      });
    } catch (err) {
      console.error("Error al eliminar imagen:", err);
      setToast({
        open: true,
        message: "Error al eliminar la imagen de Storage",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Copiar URL pública ---------- */
  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setToast({
      open: true,
      message: "¡Enlace de la imagen copiado al portapapeles!",
      severity: "success",
    });
  };

  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4, textAlign: "left" }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <PhotoLibraryOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Mis Imágenes y Publicaciones
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Sube y administra tus imágenes almacenadas en Supabase Storage
          (Bucket: <strong>{BUCKET_NAME}</strong>).
        </Typography>
      </Box>

      {/* Zona de Subida */}
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "2rem",
          mb: 5,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${
            theme.palette.mode === "light"
              ? alpha("#000", 0.06)
              : alpha("#fff", 0.06)
          }`,
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Subir nuevas imágenes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Puedes seleccionar o arrastrar una o varias imágenes al mismo tiempo.
          Se comprimirán de forma automática antes de guardarse en tu carpeta de
          usuario.
        </Typography>

        <ImageUploader
          user={user}
          onUploadSuccess={() => {
            fetchUserImages();
          }}
          maxFiles={12}
          autoUpload={true}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Galería de Imágenes */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Galería Almacenada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {images.length}{" "}
              {images.length === 1
                ? "imagen encontrada"
                : "imágenes encontradas"}
            </Typography>
          </Box>

          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            size="small"
            onClick={fetchUserImages}
            disabled={loadingImages}
            sx={{ borderRadius: 2 }}
          >
            Actualizar
          </Button>
        </Stack>

        {loadingImages ? (
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
        ) : images.length === 0 ? (
          <Paper
            sx={{
              py: 8,
              px: 3,
              textAlign: "center",
              borderRadius: "1.5rem",
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha("#000", 0.02)
                  : alpha("#fff", 0.02),
              border: `1px dashed ${alpha(theme.palette.divider, 0.7)}`,
            }}
          >
            <PhotoLibraryOutlinedIcon
              sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aún no has subido ninguna imagen
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 450, mx: "auto" }}
            >
              Usa la zona de carga superior para añadir imágenes a tu cuenta.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {images.map((img) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={img.path}>
                <Fade in timeout={300}>
                  <GalleryCard>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: 200,
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? alpha("#000", 0.04)
                            : alpha("#fff", 0.04),
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedPreview(img)}
                    >
                      <CardMedia
                        component="img"
                        image={img.url}
                        alt={img.name}
                        loading="lazy"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    </Box>

                    <CardActions
                      sx={{
                        px: 1.5,
                        py: 1,
                        justifyContent: "space-between",
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? alpha("#000", 0.015)
                            : alpha("#fff", 0.02),
                      }}
                    >
                      <Tooltip title="Ver tamaño completo">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setSelectedPreview(img)}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Copiar enlace público">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyUrl(img.url)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Abrir en pestaña nueva">
                        <IconButton
                          size="small"
                          component="a"
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar imagen">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deletingId === img.path}
                          onClick={() => handleDeleteImage(img.path)}
                        >
                          {deletingId === img.path ? (
                            <CircularProgress size={16} color="error" />
                          ) : (
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </GalleryCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Modal / Dialog de Vista Previa a Pantalla Completa */}
      <Dialog
        open={Boolean(selectedPreview)}
        onClose={() => setSelectedPreview(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "1.5rem",
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        {selectedPreview && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5,
                px: 2.5,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                noWrap
                sx={{ maxWidth: "80%" }}
              >
                {selectedPreview.name}
              </Typography>
              <IconButton size="small" onClick={() => setSelectedPreview(null)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, textAlign: "center", bgcolor: "#000" }}>
              <Box
                component="img"
                src={selectedPreview.url}
                alt={selectedPreview.name}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </DialogContent>
          </>
        )}
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
