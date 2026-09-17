// src/components/ImageUploader.jsx
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Alert,
  Fade,
  Chip,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import { supabase } from "../supabase/client";

/* ---------- Bucket Name ---------- */
const BUCKET_NAME = "imagenes";

/* ---------- Estilos Visuales ---------- */
const DropZoneContainer = styled(Paper, {
  shouldForwardProp: (prop) =>
    prop !== "isDragActive" && prop !== "hasError" && prop !== "busy",
})(({ theme, isDragActive, hasError, busy }) => ({
  border: `2px dashed ${
    hasError
      ? alpha(theme.palette.error.main, 0.7)
      : isDragActive
      ? alpha(theme.palette.primary.main, 0.9)
      : alpha(theme.palette.divider, 0.9)
  }`,
  borderRadius: "1.5rem",
  padding: theme.spacing(4, 3),
  textAlign: "center",
  cursor: busy ? "not-allowed" : "pointer",
  backgroundColor:
    theme.palette.mode === "light"
      ? isDragActive
        ? alpha(theme.palette.primary.main, 0.06)
        : alpha("#000", 0.015)
      : isDragActive
      ? alpha(theme.palette.primary.main, 0.12)
      : alpha("#fff", 0.02),
  transition: "all 0.25s ease-in-out",
  boxShadow: "none",
  "&:hover": {
    borderColor: busy
      ? theme.palette.divider
      : alpha(theme.palette.primary.main, 0.6),
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha(theme.palette.primary.main, 0.03)
        : alpha("#fff", 0.04),
    transform: busy ? "none" : "translateY(-1px)",
  },
  ...(isDragActive && {
    transform: "scale(1.01)",
  }),
}));

const PreviewCard = styled(Paper)(({ theme }) => ({
  position: "relative",
  borderRadius: "1rem",
  overflow: "hidden",
  height: 140,
  backgroundColor:
    theme.palette.mode === "light" ? alpha("#000", 0.03) : alpha("#fff", 0.05),
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[4],
    "& .overlay-actions": {
      opacity: 1,
    },
  },
}));

const ImageThumbnail = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const OverlayActions = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(0, 0, 0, 0.45)"
      : "rgba(0, 0, 0, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  opacity: 0,
  transition: "opacity 0.2s ease-in-out",
}));

/* ---------- Configuración de Archivos y Compresión ---------- */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB máximo por archivo antes de comprimir
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/avif": [".avif"],
};

const COMPRESSION_CONFIG = {
  maxSizeMB: 0.9, // Comprime hacia < 900 KB
  maxWidthOrHeight: 1600, // Máximo 1600px manteniendo proporción
  useWebWorker: true,
  initialQuality: 0.85,
  fileType: "image/webp",
};

/**
 * Limpia y genera un nombre seguro de archivo
 */
const sanitizeFilename = (filename) => {
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf(".")) || filename;
  const safeName = nameWithoutExt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover acentos
    .replace(/[^a-z0-9]/g, "-") // reemplazar no alfanuméricos por guiones
    .replace(/-+/g, "-") // evitar guiones repetidos
    .slice(0, 50); // limitar largo
  return safeName;
};

export default function ImageUploader({
  user,
  onUploadSuccess,
  maxFiles = 10,
  autoUpload = true,
}) {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isBusy = uploading || compressing;

  /* ---------- Subida de Archivos ---------- */
  const processAndUploadFiles = async (filesToUpload) => {
    if (!user?.id) {
      setErrorMsg("Debes iniciar sesión para subir imágenes");
      return;
    }

    if (!filesToUpload || filesToUpload.length === 0) return;

    setErrorMsg("");
    setSuccessMsg("");
    setCompressing(true);
    setUploadProgress(10);

    const uploadedResults = [];
    const totalFiles = filesToUpload.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const item = filesToUpload[i];
        const rawFile = item.file || item;

        // 1. Compresión client-side (si no es GIF animado)
        let fileToUpload = rawFile;
        if (rawFile.type !== "image/gif") {
          try {
            fileToUpload = await imageCompression(rawFile, COMPRESSION_CONFIG);
          } catch (compErr) {
            console.warn("Fallo compresión, subiendo archivo original:", compErr);
            fileToUpload = rawFile;
          }
        }

        setCompressing(false);
        setUploading(true);

        // 2. Definir ruta y nombre seguro en Storage
        const fileExt =
          fileToUpload.type === "image/webp"
            ? "webp"
            : rawFile.name.split(".").pop().toLowerCase() || "jpg";
        const cleanBaseName = sanitizeFilename(rawFile.name);
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const filePath = `${user.id}/${uniqueId}-${cleanBaseName}.${fileExt}`;

        // 3. Subir a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, fileToUpload, {
            cacheControl: "3600",
            upsert: false,
            contentType: fileToUpload.type,
          });

        if (uploadError) {
          console.error("Error al subir a Supabase Storage:", uploadError);
          throw uploadError;
        }

        // 4. Obtener URL pública
        const { data: publicData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        uploadedResults.push({
          path: filePath,
          url: publicData.publicUrl,
          name: rawFile.name,
          size: fileToUpload.size,
        });

        // Actualizar porcentaje de progreso
        const percent = Math.round(((i + 1) / totalFiles) * 100);
        setUploadProgress(percent);
      }

      setSuccessMsg(
        totalFiles === 1
          ? "¡Imagen subida exitosamente!"
          : `¡${totalFiles} imágenes subidas exitosamente!`
      );

      // Limpiar cola local
      setSelectedFiles([]);
      if (onUploadSuccess) {
        onUploadSuccess(uploadedResults);
      }
    } catch (err) {
      console.error("Error en proceso de subida:", err);
      setErrorMsg(
        err.message ||
          "Ocurrió un error al subir las imágenes. Verifica que el bucket 'imagenes' exista en Supabase."
      );
    } finally {
      setCompressing(false);
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  /* ---------- Dropzone Callback ---------- */
  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      setErrorMsg("");
      setSuccessMsg("");

      if (rejectedFiles?.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === "file-too-large") {
          setErrorMsg("Uno o más archivos superan el límite de 10 MB");
        } else if (error.code === "file-invalid-type") {
          setErrorMsg("Formato de imagen no compatible (JPG, PNG, WEBP, GIF, AVIF)");
        } else {
          setErrorMsg("Error al seleccionar los archivos");
        }
        return;
      }

      if (!acceptedFiles || acceptedFiles.length === 0) return;

      // Crear objetos con preview
      const newItems = acceptedFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));

      if (autoUpload) {
        setSelectedFiles(newItems);
        await processAndUploadFiles(newItems);
      } else {
        setSelectedFiles((prev) => [...prev, ...newItems]);
      }
    },
    [user, autoUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    disabled: isBusy,
    multiple: true,
  });

  const handleRemoveStaged = (idToRemove) => {
    setSelectedFiles((prev) => {
      const filtered = prev.filter((item) => item.id !== idToRemove);
      const target = prev.find((item) => item.id === idToRemove);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return filtered;
    });
  };

  return (
    <Box sx={{ width: "100%", my: 2 }}>
      {/* Contenedor Dropzone */}
      <DropZoneContainer
        {...getRootProps()}
        isDragActive={isDragActive}
        hasError={Boolean(errorMsg)}
        busy={isBusy}
      >
        <input {...getInputProps()} />
        <Stack spacing={1.5} alignItems="center" justifyContent="center">
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.2),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease",
              transform: isDragActive ? "scale(1.15)" : "scale(1)",
            }}
          >
            {isBusy ? (
              <CircularProgress size={30} color="primary" />
            ) : (
              <CloudUploadOutlinedIcon sx={{ fontSize: 32 }} />
            )}
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {isDragActive
                ? "Suelta las imágenes aquí..."
                : "Haz clic o arrastra tus imágenes aquí"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sube una o múltiples imágenes (PNG, JPG, WEBP, GIF hasta 10 MB)
            </Typography>
          </Box>

          <Chip
            size="small"
            icon={<CollectionsOutlinedIcon sx={{ fontSize: 16 }} />}
            label={`Almacenamiento: ${BUCKET_NAME}`}
            variant="outlined"
            sx={{ opacity: 0.75, fontSize: "0.75rem" }}
          />
        </Stack>
      </DropZoneContainer>

      {/* Barra de progreso de subida / compresión */}
      {isBusy && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {compressing
                ? "Optimizando y comprimiendo imágenes..."
                : `Subiendo imágenes al storage (${uploadProgress}%)...`}
            </Typography>
            <Typography variant="caption" fontWeight={600} color="primary">
              {uploadProgress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant={compressing ? "indeterminate" : "determinate"}
            value={uploadProgress}
            sx={{
              height: 6,
              borderRadius: 3,
            }}
          />
        </Box>
      )}

      {/* Mensajes de Alerta */}
      {errorMsg && (
        <Fade in={Boolean(errorMsg)}>
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        </Fade>
      )}

      {successMsg && (
        <Fade in={Boolean(successMsg)}>
          <Alert
            icon={<CheckCircleOutlinedIcon fontSize="inherit" />}
            severity="success"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            {successMsg}
          </Alert>
        </Fade>
      )}

      {/* Previews de imágenes seleccionadas en modo manual (si autoUpload = false) */}
      {!autoUpload && selectedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Imágenes seleccionadas ({selectedFiles.length})
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddPhotoAlternateOutlinedIcon />}
              onClick={() => processAndUploadFiles(selectedFiles)}
              disabled={isBusy}
              sx={{ borderRadius: 2 }}
            >
              Subir al Storage
            </Button>
          </Stack>

          <Grid container spacing={1.5}>
            {selectedFiles.map((item) => (
              <Grid item xs={6} sm={4} md={3} key={item.id}>
                <PreviewCard>
                  <ImageThumbnail src={item.previewUrl} alt={item.name} />
                  <OverlayActions className="overlay-actions">
                    <Tooltip title="Quitar">
                      <IconButton
                        size="small"
                        sx={{ color: "#fff", bgcolor: "rgba(0,0,0,0.5)" }}
                        onClick={() => handleRemoveStaged(item.id)}
                        disabled={isBusy}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </OverlayActions>
                </PreviewCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
