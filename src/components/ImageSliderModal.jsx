// src/components/ImageSliderModal.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Chip,
  Tooltip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SwipeIcon from "@mui/icons-material/Swipe";

/**
 * ImageSliderModal - Modal de visualización de imágenes con controles de deslizamiento
 * 
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - images: Array<Object> (cada objeto debe tener al menos url y opcionalmente name, path, id)
 * - initialIndex: number (índice inicial al abrir el modal)
 * - ownerName: string opcional (nombre del propietario)
 * - onCopyUrl: (url: string) => void (callback opcional para copiar)
 */
export default function ImageSliderModal({
  open,
  onClose,
  images = [],
  initialIndex = 0,
  ownerName,
  onCopyUrl,
}) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const isDraggingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const currentDragXRef = useRef(0);

  // Asegurar que la lista de imágenes sea un arreglo válido
  const normalizedImages = Array.isArray(images)
    ? images.filter(Boolean)
    : images
    ? [images]
    : [];

  const total = normalizedImages.length;

  // Sincronizar índice inicial cuando cambia o se abre el modal
  useEffect(() => {
    if (open) {
      const validIndex =
        initialIndex >= 0 && initialIndex < total ? initialIndex : 0;
      setCurrentIndex(validIndex);
      setDragOffset(0);
    }
  }, [open, initialIndex, total]);

  const currentImage = normalizedImages[currentIndex] || null;

  // Navegar a la foto anterior
  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    setDragOffset(0);
  }, [total]);

  // Navegar a la siguiente foto
  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
    setDragOffset(0);
  }, [total]);

  // Navegación por teclado (Flechas y Escape)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handlePrev, handleNext, onClose]);

  // Manejadores de gestos táctiles (Touch swipe)
  const handleTouchStart = (e) => {
    if (total <= 1) return;
    isDraggingRef.current = true;
    touchStartXRef.current = e.touches[0].clientX;
    currentDragXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || total <= 1) return;
    currentDragXRef.current = e.touches[0].clientX;
    const diff = currentDragXRef.current - touchStartXRef.current;
    // Resistencia elástica en los extremos si no hay loop
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || total <= 1) return;
    const diff = currentDragXRef.current - touchStartXRef.current;
    const threshold = 45; // Mínimo de px para activar el cambio

    if (diff > threshold) {
      handlePrev();
    } else if (diff < -threshold) {
      handleNext();
    }
    setDragOffset(0);
    isDraggingRef.current = false;
    setIsSwiping(false);
  };

  // Manejadores de arrastre con ratón (Mouse drag swipe)
  const handleMouseDown = (e) => {
    if (total <= 1) return;
    isDraggingRef.current = true;
    touchStartXRef.current = e.clientX;
    currentDragXRef.current = e.clientX;
    setIsSwiping(true);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || total <= 1) return;
    currentDragXRef.current = e.clientX;
    const diff = currentDragXRef.current - touchStartXRef.current;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current || total <= 1) return;
    const diff = currentDragXRef.current - touchStartXRef.current;
    const threshold = 50;

    if (diff > threshold) {
      handlePrev();
    } else if (diff < -threshold) {
      handleNext();
    }
    setDragOffset(0);
    isDraggingRef.current = false;
    setIsSwiping(false);
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      handleMouseUp();
    }
  };

  const handleCopy = () => {
    if (!currentImage?.url) return;
    if (onCopyUrl) {
      onCopyUrl(currentImage.url);
    } else {
      navigator.clipboard.writeText(currentImage.url);
    }
  };

  if (!open || !currentImage) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "1.75rem",
          overflow: "hidden",
          backgroundColor: theme.palette.background.paper,
          backgroundImage: "none",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 25px 50px -12px rgba(0,0,0,0.25)"
              : "0 25px 50px -12px rgba(0,0,0,0.8)",
        },
      }}
    >
      {/* Encabezado del visor */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
          px: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ maxWidth: "70%" }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {currentImage.name || `Imagen ${currentIndex + 1}`}
          </Typography>
          {(ownerName || currentImage.ownerName) && (
            <Typography variant="caption" color="text.secondary">
              Subido por:{" "}
              <strong>{ownerName || currentImage.ownerName}</strong>
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {total > 1 && (
            <Chip
              size="small"
              icon={<SwipeIcon style={{ fontSize: 14 }} />}
              label={`${currentIndex + 1} / ${total}`}
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                bgcolor: alpha(theme.palette.text.primary, 0.08),
              }}
            />
          )}
          <IconButton size="small" onClick={onClose} aria-label="Cerrar visor">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Contenido / Área de deslizamiento de la imagen */}
      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          bgcolor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: { xs: 320, sm: 460 },
          maxHeight: "75vh",
          overflow: "hidden",
          cursor: total > 1 ? (isSwiping ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Contenedor animado con desplazamiento de arrastre */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `translateX(${dragOffset}px)`,
            transition: isSwiping ? "none" : "transform 0.25s ease-out",
          }}
        >
          <Box
            component="img"
            src={currentImage.url}
            alt={currentImage.name || `Imagen ${currentIndex + 1}`}
            draggable={false}
            sx={{
              maxWidth: "100%",
              maxHeight: "75vh",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              pointerEvents: "none",
            }}
          />
        </Box>

        {/* Botón de control deslizante: Anterior */}
        {total > 1 && (
          <Tooltip title="Anterior (flecha izquierda)">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Imagen anterior"
              sx={{
                position: "absolute",
                left: { xs: 8, sm: 16 },
                top: "50%",
                transform: "translateY(-50%)",
                color: "#fff",
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  transform: "translateY(-50%) scale(1.08)",
                },
              }}
            >
              <ChevronLeftIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        )}

        {/* Botón de control deslizante: Siguiente */}
        {total > 1 && (
          <Tooltip title="Siguiente (flecha derecha)">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Imagen siguiente"
              sx={{
                position: "absolute",
                right: { xs: 8, sm: 16 },
                top: "50%",
                transform: "translateY(-50%)",
                color: "#fff",
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  transform: "translateY(-50%) scale(1.08)",
                },
              }}
            >
              <ChevronRightIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        )}

        {/* Indicadores de deslizamiento (Dots interactivos) */}
        {total > 1 && total <= 15 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 0.8,
              py: 0.6,
              px: 1.2,
              borderRadius: 999,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 2,
            }}
          >
            {normalizedImages.map((_, idx) => (
              <Box
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                sx={{
                  width: idx === currentIndex ? 20 : 7,
                  height: 7,
                  borderRadius: 999,
                  backgroundColor:
                    idx === currentIndex
                      ? "#fff"
                      : "rgba(255, 255, 255, 0.4)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                  },
                }}
              />
            ))}
          </Box>
        )}
      </DialogContent>

      {/* Pie del modal con acciones */}
      <Box
        sx={{
          p: 1.8,
          px: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<ContentCopyIcon fontSize="small" />}
            size="small"
            variant="outlined"
            onClick={handleCopy}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.82rem",
            }}
          >
            Copiar enlace
          </Button>

          <Button
            startIcon={<OpenInNewIcon fontSize="small" />}
            size="small"
            variant="text"
            href={currentImage.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.82rem",
            }}
          >
            Abrir original
          </Button>
        </Stack>

        {total > 1 && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}
          >
            Usa las flechas o desliza la imagen para navegar
          </Typography>
        )}
      </Box>
    </Dialog>
  );
}
