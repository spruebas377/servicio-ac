// src/components/AvatarUploader.jsx
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import {
  Box,
  Avatar,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  alpha,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { DeleteOutlined } from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { supabase } from "../supabase/client";

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

const DropZone = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "isDragActive" && prop !== "hasError" && prop !== "busy",
})(({ theme, isDragActive, hasError, busy }) => ({
  position: "relative",
  width: 120,
  height: 120,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: busy ? "default" : "pointer",
  transition: "all 0.25s ease",
  border: `2px dashed ${
    hasError
      ? alpha("#d32f2f", 0.6)
      : isDragActive
        ? alpha(theme.palette.text.primary, 0.6)
        : theme.palette.divider
  }`,
  backgroundColor:
    theme.palette.mode === "light" ? alpha("#000", 0.015) : alpha("#fff", 0.03),
  "&:hover": {
    borderColor: busy
      ? theme.palette.divider
      : hasError
        ? alpha("#d32f2f", 0.8)
        : alpha(theme.palette.text.primary, 0.4),
    backgroundColor: busy
      ? theme.palette.mode === "light"
        ? alpha("#000", 0.015)
        : alpha("#fff", 0.03)
      : theme.palette.mode === "light"
        ? alpha("#000", 0.03)
        : alpha("#fff", 0.06),
  },
  ...(isDragActive && {
    transform: "scale(1.03)",
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha("#000", 0.05)
        : alpha("#fff", 0.08),
  }),
}));

const ActionsOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.5,
  backgroundColor:
    theme.palette.mode === "light" ? alpha("#000", 0.45) : alpha("#000", 0.6),
  opacity: 0,
  transition: "opacity 0.25s ease",
  "&:hover": { opacity: 1 },
}));

/* ------------------------------------------------------------------ */
/*  Configuración                                                      */
/* ------------------------------------------------------------------ */

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB de entrada máxima
const ACCEPTED = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

// Opciones de compresión
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.4, // ~400 KB objetivo
  maxWidthOrHeight: 600, // 600px de lado máximo (suficiente para avatar)
  useWebWorker: true, // no bloquea la UI
  initialQuality: 0.85,
  fileType: "image/webp", // formato moderno y ligero
};

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

const AvatarUploader = ({ user, onUploaded }) => {
  const theme = useTheme();
  const [preview, setPreview] = useState(user?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(user?.avatar_url || "");
  }, [user?.avatar_url]);

  const busy = uploading || compressing;

  /* ---------- Subida + compresión ---------- */
  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      setError("");

      /* --- Validación cliente --- */
      if (rejectedFiles?.length) {
        const reason = rejectedFiles[0].errors[0];
        if (reason.code === "file-too-large") setError("La imagen supera 5 MB");
        else if (reason.code === "file-invalid-type")
          setError("Formato no válido (PNG, JPG, WEBP)");
        else setError("Archivo no válido");
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      /* --- Preview inmediata (antes de comprimir) --- */
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      try {
        /* --- 1. Compresión client-side --- */
        setCompressing(true);
        const compressedFile = await imageCompression(
          file,
          COMPRESSION_OPTIONS,
        );
        setCompressing(false);

        console.log(
          `Comprimido: ${(file.size / 1024).toFixed(0)} KB → ${(
            compressedFile.size / 1024
          ).toFixed(0)} KB`,
        );

        /* --- 2. Subida a Supabase Storage --- */
        setUploading(true);

        // Extensión derivada del tipo comprimido
        const ext =
          compressedFile.type === "image/webp"
            ? "webp"
            : compressedFile.name.split(".").pop() || "jpg";
        const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, compressedFile, {
            cacheControl: "3600",
            upsert: true,
            contentType: compressedFile.type,
          });

        if (uploadError) throw uploadError;

        /* --- 3. URL pública --- */
        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        const publicUrl = publicData.publicUrl;

        /* --- 4. Actualizar perfil en BD --- */
        const { error: updateError } = await supabase
          .from("user_data") // ← ajusta al nombre de tu tabla
          .update({ avatar_url: publicUrl })
          .eq("id", user.id);

        if (updateError) throw updateError;

        setPreview(publicUrl);
        onUploaded?.(publicUrl);
      } catch (err) {
        console.error("Error subiendo avatar:", err);
        setError("No se pudo subir la imagen");
        setPreview(user?.avatar_url || "");
      } finally {
        setCompressing(false);
        setUploading(false);
        URL.revokeObjectURL(localUrl);
      }
    },
    [user, onUploaded],
  );

  /* ---------- Eliminar avatar ---------- */
  const handleRemove = async (e) => {
    e.stopPropagation();
    setError("");
    try {
      setUploading(true);
      setPreview("");

      const { error: updateError } = await supabase
        .from("user_data")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (updateError) throw updateError;
      onUploaded?.(null);
    } catch (err) {
      console.error("Error eliminando avatar:", err);
      setError("No se pudo eliminar");
      setPreview(user?.avatar_url || "");
    } finally {
      setUploading(false);
    }
  };

  /* ---------- Dropzone ---------- */
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    disabled: busy,
  });

  const initials =
    (user?.name || "?")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  /* ---------- Texto de ayuda dinámico ---------- */
  const helperText = compressing
    ? "Optimizando imagen…"
    : uploading
      ? "Subiendo imagen…"
      : isDragActive
        ? "Suelta la imagen aquí"
        : "Arrastra o haz click para cambiar · PNG, JPG · máx. 5 MB";

  return (
    <Stack spacing={1.2} alignItems="center">
      <Box sx={{ position: "relative" }}>
        <DropZone
          {...getRootProps()}
          isDragActive={isDragActive}
          hasError={!!error}
          busy={busy}
        >
          <input {...getInputProps()} />

          {/* Avatar o iniciales */}
          <Avatar
            src={preview || undefined}
            alt={user?.name || "Avatar"}
            sx={{
              width: 112,
              height: 112,
              bgcolor: theme.palette.mode === "light" ? "#eaeef2" : "#2a2d34",
              color: "text.primary",
              fontSize: "2.2rem",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            {!preview && initials}
          </Avatar>

          {/* Overlay de carga (compresión + subida) */}
          {busy && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                backgroundColor: alpha("#000", 0.55),
                backdropFilter: "blur(4px)",
                color: "#fff",
              }}
            >
              <CircularProgress size={26} sx={{ color: "#fff" }} />
              <Typography
                variant="caption"
                sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 500 }}
              >
                {compressing ? "Optimizando" : "Subiendo"}
              </Typography>
            </Box>
          )}

          {/* Overlay de acciones (hover) */}
          {!busy && (
            <ActionsOverlay>
              <Tooltip title="Cambiar imagen" arrow>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  size="small"
                  sx={{
                    color: "#fff",
                    "&:hover": { backgroundColor: alpha("#fff", 0.15) },
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {preview && (
                <Tooltip title="Eliminar imagen" arrow>
                  <IconButton
                    onClick={handleRemove}
                    size="small"
                    sx={{
                      color: "#fff",
                      "&:hover": { backgroundColor: alpha("#fff", 0.15) },
                    }}
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </ActionsOverlay>
          )}
        </DropZone>

        {/* Badge flotante cuando no hay imagen */}
        {!preview && !busy && (
          <Box
            sx={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.background.paper,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              pointerEvents: "none",
            }}
          >
            <CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
        )}
      </Box>

      {/* Texto de ayuda */}
      <Typography
        variant="caption"
        sx={{
          color: "text.disabled",
          textAlign: "center",
          fontSize: "0.75rem",
          letterSpacing: "-0.005em",
          maxWidth: 220,
        }}
      >
        {helperText}
      </Typography>

      {/* Error */}
      {error && (
        <Typography
          variant="caption"
          sx={{ color: "#d32f2f", fontSize: "0.75rem", fontWeight: 500 }}
        >
          {error}
        </Typography>
      )}
    </Stack>
  );
};

export default AvatarUploader;
