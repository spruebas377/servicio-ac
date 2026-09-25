// src/pages/SearchResults.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Chip,
  Stack,
  Button,
  Skeleton,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Fade,
  Slider,
  Popover,
  Checkbox,
  ListItemText,
  Badge,
  Divider,
  alpha,
  Menu,
  MenuList,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import CheckIcon from "@mui/icons-material/Check";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import { useSearchParams, useNavigate, NavLink } from "react-router";
import { supabase } from "../supabase/client";
import { useGenders } from "../context/GendersContext";

const BUCKET_NAME = "imagenes";

/* Límites del rango de edad */
const AGE_MIN = 18;
const AGE_MAX = 99;
const AGE_DEFAULT = [AGE_MIN, AGE_MAX];

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

const ResultsHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3, 3.5),
  borderRadius: "2rem",
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 20px 35px -8px rgba(0,0,0,0.04), 0 8px 18px -6px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.01)"
      : "0 20px 35px -8px rgba(0,0,0,0.5), 0 8px 18px -6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
  [theme.breakpoints.down("sm")]: {
    borderRadius: "1.5rem",
    padding: theme.spacing(2.5, 2),
  },
}));

const FiltersBar = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  alignItems: "center",
  padding: theme.spacing(2, 2),
  borderRadius: "1.25rem",
  backgroundColor:
    theme.palette.mode === "light" ? alpha("#000", 0.015) : alpha("#fff", 0.02),
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
}));

const UserCardWrapper = styled(Card, {
  shouldForwardProp: (prop) => prop !== "featured",
})(({ theme, featured }) => ({
  borderRadius: "1.25rem",
  border: featured
    ? `2px solid ${theme.palette.warning.main}`
    : `1px solid ${
        theme.palette.mode === "light"
          ? alpha("#000", 0.08)
          : alpha("#fff", 0.08)
      }`,
  backgroundColor:
    theme.palette.mode === "light" && featured
      ? "rgba(247, 194, 36, 0.05)"
      : theme.palette.background.paper,
  backgroundImage: "none",
  boxShadow:
    theme.palette.mode === "light"
      ? featured
        ? `0 0 0 1px rgba(255, 193, 7, 0.2), 0 4px 20px -4px rgba(0,0,0,0.05)`
        : "0 4px 20px -4px rgba(0,0,0,0.05)"
      : featured
        ? "0 0 20px rgba(243, 213, 122, 0.15), 0 4px 20px -4px rgba(0,0,0,0.3)"
        : "0 4px 20px -4px rgba(0,0,0,0.3)",
  transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  minWidth: "320px",
  boxSizing: "border-box",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      theme.palette.mode === "light"
        ? "0 14px 30px -6px rgba(0,0,0,0.12)"
        : "0 14px 30px -6px rgba(0,0,0,0.6)",
  },
}));

const ImageThumbnailContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: "0.75rem",
  overflow: "hidden",
  height: 100,
  backgroundColor:
    theme.palette.mode === "light" ? alpha("#000", 0.03) : alpha("#fff", 0.04),
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: theme.shadows[3],
    "& .overlay-actions": { opacity: 1 },
  },
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(0, 0, 0, 0.45)"
      : "rgba(0, 0, 0, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: "opacity 0.2s ease-in-out",
}));

const SortSelect = styled(Select)(({ theme }) => ({
  fontSize: "0.85rem",
  fontWeight: 500,
  borderRadius: 999,
  minWidth: 200,
  height: 36,
  backgroundColor:
    theme.palette.mode === "light" ? alpha("#000", 0.015) : alpha("#fff", 0.03),
  transition: "all 0.2s ease",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.divider,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: alpha(theme.palette.text.primary, 0.2),
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: alpha(theme.palette.text.primary, 0.5),
    borderWidth: "1.5px",
  },
  "& .MuiSelect-select": {
    paddingTop: "6px",
    paddingBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  borderRadius: "100px",
  fontWeight: 500,
  fontSize: "0.8rem",
  height: 30,
  backgroundColor: alpha(theme.palette.text.primary, 0.05),
  color: theme.palette.text.primary,
  border: "none",
  "& .MuiChip-deleteIcon": {
    color: theme.palette.text.disabled,
    "&:hover": { color: theme.palette.text.primary },
  },
}));

const FilterSelect = styled(Select)(({ theme }) => ({
  fontSize: "0.85rem",
  fontWeight: 500,
  borderRadius: "1rem",
  minWidth: 200,
  height: 40,
  backgroundColor: theme.palette.background.paper,
  transition: "all 0.2s ease",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.divider,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: alpha(theme.palette.text.primary, 0.2),
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: alpha(theme.palette.text.primary, 0.5),
    borderWidth: "1.5px",
  },
  "&.Mui-disabled": {
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha("#000", 0.02)
        : alpha("#fff", 0.02),
  },
}));

const AgeFilterButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.85rem",
  borderRadius: "1rem",
  height: 40,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  minWidth: 200,
  justifyContent: "flex-start",
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${
    active ? alpha(theme.palette.text.primary, 0.3) : theme.palette.divider
  }`,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: alpha(theme.palette.text.primary, 0.25),
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha("#000", 0.015)
        : alpha("#fff", 0.03),
  },
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1),
    color: theme.palette.text.disabled,
  },
}));

const ServiceFilterButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.85rem",
  borderRadius: "1rem",
  height: 40,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  minWidth: 200,
  justifyContent: "flex-start",
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${
    active ? alpha(theme.palette.text.primary, 0.3) : theme.palette.divider
  }`,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: alpha(theme.palette.text.primary, 0.25),
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha("#000", 0.015)
        : alpha("#fff", 0.03),
  },
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1),
    color: theme.palette.text.disabled,
  },
  "& .MuiButton-endIcon": {
    marginLeft: "auto",
    color: theme.palette.text.disabled,
  },
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SORT_OPTIONS = [
  {
    value: "relevance",
    label: "Relevancia",
    icon: <StarBorderOutlinedIcon sx={{ fontSize: 16 }} />,
  },
  {
    value: "name",
    label: "Nombre (A-Z)",
    icon: <SortOutlinedIcon sx={{ fontSize: 16 }} />,
  },
  {
    value: "age",
    label: "Edad (menor a mayor)",
    icon: <SortOutlinedIcon sx={{ fontSize: 16 }} />,
  },
  {
    value: "recent",
    label: "Más recientes",
    icon: <SortOutlinedIcon sx={{ fontSize: 16 }} />,
  },
];

const sortByRelevance = (list) =>
  [...list].sort((a, b) => {
    const featuredA = a.featured ? 1 : 0;
    const featuredB = b.featured ? 1 : 0;
    if (featuredA !== featuredB) return featuredB - featuredA;

    const verifiedA = a.verified ? 1 : 0;
    const verifiedB = b.verified ? 1 : 0;
    if (verifiedA !== verifiedB) return verifiedB - verifiedA;

    return (a.name || "")
      .toLowerCase()
      .localeCompare((b.name || "").toLowerCase(), "es");
  });

const sortByName = (list) =>
  [...list].sort((a, b) =>
    (a.name || "")
      .toLowerCase()
      .localeCompare((b.name || "").toLowerCase(), "es"),
  );

const sortByAge = (list) =>
  [...list].sort((a, b) => {
    const ageA = Number(a.age) || Infinity;
    const ageB = Number(b.age) || Infinity;
    return ageA - ageB;
  });

const sortByRecent = (list) =>
  [...list].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

const applySort = (list, sortBy) => {
  switch (sortBy) {
    case "name":
      return sortByName(list);
    case "age":
      return sortByAge(list);
    case "recent":
      return sortByRecent(list);
    case "relevance":
    default:
      return sortByRelevance(list);
  }
};

/* ------------------------------------------------------------------ */
/*  Subcomponente: Tarjeta de Usuario con galería                      */
/* ------------------------------------------------------------------ */

const UserResultCard = ({
  user,
  onPreviewImage,
  onCopyUrl,
  cityName,
  provinceName,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  const fetchUserBucketImages = useCallback(async () => {
    if (!user?.id) {
      setLoadingImages(false);
      return;
    }

    setLoadingImages(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(user.id, {
          limit: 20,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.warn(`Error al listar imágenes del usuario ${user.id}:`, error);
        setImages([]);
        return;
      }

      const validFiles = (data || []).filter(
        (file) => file.name && !file.name.startsWith("."),
      );

      const mapped = validFiles.map((file) => {
        const fullPath = `${user.id}/${file.name}`;
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fullPath);

        return {
          id: file.id || file.name,
          name: file.name,
          path: fullPath,
          url: urlData?.publicUrl,
          createdAt: file.created_at,
          size: file.metadata?.size || 0,
        };
      });

      setImages(mapped);
    } catch (err) {
      console.error(`Error en fetchUserBucketImages para ${user.id}:`, err);
    } finally {
      setLoadingImages(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserBucketImages();
  }, [fetchUserBucketImages]);

  const userName = user.name || "Usuario";
  const userInitials = (userName || "?")[0].toUpperCase();

  const locationLabel = [cityName, provinceName].filter(Boolean).join(" · ");

  return (
    <UserCardWrapper featured={!!user.featured}>
      <CardHeader
        avatar={
          <Avatar
            src={user.avatar_url || undefined}
            alt={userName}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "primary.main",
              fontWeight: 700,
              fontSize: "1.2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {userInitials}
          </Avatar>
        }
        action={
          <Tooltip title="Actualizar fotos de este usuario">
            <IconButton
              size="small"
              onClick={fetchUserBucketImages}
              disabled={loadingImages}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
        title={
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {userName}
          </Typography>
        }
        subheader={
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ mt: 0.25 }}
          >
            {locationLabel ? (
              <>
                <LocationOnOutlinedIcon
                  sx={{ fontSize: 13, color: "text.disabled" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ maxWidth: 200, fontSize: "0.78rem" }}
                >
                  {locationLabel}
                </Typography>
              </>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ fontSize: "0.78rem" }}
              >
                {user.phone || "---"}
              </Typography>
            )}
          </Stack>
        }
      />

      <Box sx={{ px: 2, pb: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {user.verified ? (
            <Chip
              icon={<VerifiedUserIcon sx={{ fontSize: "1rem !important" }} />}
              label="Verificado"
              size="small"
              color="success"
              variant="outlined"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                boxShadow: "0 0 10px rgba(0, 128, 0, 0.5)",
              }}
            />
          ) : (
            <Chip
              icon={<LockOutlinedIcon sx={{ fontSize: "1rem !important" }} />}
              label="No Verificado"
              size="small"
              color="error"
              variant="outlined"
              sx={{ fontWeight: 500, fontSize: "0.75rem", opacity: 0.8 }}
            />
          )}
          {user.featured && (
            <Chip
              icon={
                <WorkspacePremiumIcon sx={{ fontSize: "1rem !important" }} />
              }
              label="Destacado"
              size="small"
              color="warning"
              variant="outlined"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                boxShadow: "0 0 10px rgba(255, 193, 7, 0.5)",
              }}
            />
          )}
          <Chip
            icon={
              <PhotoLibraryOutlinedIcon sx={{ fontSize: "1rem !important" }} />
            }
            label={`${images.length} ${
              images.length === 1 ? "imagen" : "imágenes"
            }`}
            size="small"
            color={images.length > 0 ? "primary" : "default"}
            variant={images.length > 0 ? "filled" : "outlined"}
            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
          />
        </Stack>
      </Box>

      <CardContent sx={{ pt: 1.5, pb: 2.5, flexGrow: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 1.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <CollectionsOutlinedIcon sx={{ fontSize: 15 }} />
          Galería de imágenes
        </Typography>

        {loadingImages ? (
          <Grid container spacing={1}>
            {[1, 2, 3, 4].map((n) => (
              <Grid item xs={6} key={n}>
                <Skeleton
                  variant="rounded"
                  height={100}
                  sx={{ borderRadius: "0.75rem" }}
                />
              </Grid>
            ))}
          </Grid>
        ) : images.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              py: 3,
              px: 2,
              textAlign: "center",
              borderRadius: "0.75rem",
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha("#000", 0.015)
                  : alpha("#fff", 0.02),
              borderStyle: "dashed",
            }}
          >
            <ImageNotSupportedOutlinedIcon
              sx={{ fontSize: 28, color: "text.disabled", mb: 0.5 }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              fontSize="0.8rem"
            >
              Sin imágenes para mostrar
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={1}>
            {images.slice(0, 4).map((img, idx) => (
              <Grid item xs={6} key={img.id || img.path}>
                <ImageThumbnailContainer
                  onClick={() => onPreviewImage(img, userName)}
                >
                  <Box
                    component="img"
                    src={img.url}
                    alt={img.name}
                    loading="lazy"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {idx === 3 && images.length > 4 && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      +{images.length - 3} más
                    </Box>
                  )}

                  <ImageOverlay className="overlay-actions">
                    <Tooltip title="Ver imagen">
                      <IconButton
                        size="small"
                        sx={{ color: "#fff", bgcolor: "rgba(0,0,0,0.5)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewImage(img, userName);
                        }}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copiar URL">
                      <IconButton
                        size="small"
                        sx={{ color: "#fff", bgcolor: "rgba(0,0,0,0.5)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyUrl(img.url);
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ImageOverlay>
                </ImageThumbnailContainer>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>

      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<PersonSearchOutlinedIcon />}
          onClick={() => navigate(`/user/${user.id}`)}
          sx={{
            borderRadius: "0.75rem",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Ver perfil
        </Button>
      </Box>
    </UserCardWrapper>
  );
};

/* ------------------------------------------------------------------ */
/*  Subcomponente: skeleton de card                                    */
/* ------------------------------------------------------------------ */

const UserCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      padding: 2.5,
      borderRadius: "1.25rem",
      border: (theme) => `1px solid ${theme.palette.divider}`,
      backgroundColor: "background.paper",
      backgroundImage: "none",
    }}
  >
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="70%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={90} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </Stack>
      <Grid container spacing={1}>
        {[1, 2, 3, 4].map((n) => (
          <Grid item xs={6} key={n}>
            <Skeleton variant="rounded" height={100} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  </Paper>
);

/* ------------------------------------------------------------------ */
/*  Subcomponente: Popover de rango de edad                            */
/* ------------------------------------------------------------------ */

const AgeRangePopover = ({
  anchorEl,
  open,
  onClose,
  value,
  onApply,
  onReset,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (open) setLocalValue(value);
  }, [open, value]);

  const handleChange = (_, newValue) => setLocalValue(newValue);

  const handleApply = () => {
    onApply(localValue);
    onClose();
  };

  const handleReset = () => {
    setLocalValue(AGE_DEFAULT);
    onReset();
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            borderRadius: "1.25rem",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundImage: "none",
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0 20px 35px -8px rgba(0,0,0,0.08), 0 8px 18px -6px rgba(0,0,0,0.04)"
                : "0 20px 35px -8px rgba(0,0,0,0.6), 0 8px 18px -6px rgba(0,0,0,0.4)",
          },
        },
      }}
    >
      <Box sx={{ p: 2.5, minWidth: 300 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center">
            <CakeOutlinedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "text.disabled",
              }}
            >
              Rango de edad
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {localValue[0]} – {localValue[1]} años
          </Typography>
        </Stack>

        <Box sx={{ px: 0.5, mb: 2 }}>
          <Slider
            value={localValue}
            onChange={handleChange}
            valueLabelDisplay="auto"
            min={AGE_MIN}
            max={AGE_MAX}
            disableSwap
            sx={{
              color: "text.primary",
              "& .MuiSlider-thumb": {
                width: 18,
                height: 18,
                backgroundColor: "background.paper",
                border: (theme) => `2px solid ${theme.palette.text.primary}`,
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: (theme) =>
                    `0 0 0 6px ${alpha(theme.palette.text.primary, 0.12)}`,
                },
              },
              "& .MuiSlider-track": {
                border: "none",
                backgroundColor: "text.primary",
              },
              "& .MuiSlider-rail": {
                opacity: 0.15,
                backgroundColor: "text.primary",
              },
              "& .MuiSlider-valueLabel": {
                borderRadius: "8px",
                backgroundColor: "text.primary",
                color: "background.paper",
                fontSize: "0.72rem",
                fontWeight: 600,
              },
            }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mt: -0.5 }}
          >
            <Typography sx={{ fontSize: "0.68rem", color: "text.disabled" }}>
              {AGE_MIN}
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "text.disabled" }}>
              {AGE_MAX}+
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            onClick={handleReset}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.8rem",
              borderRadius: 999,
              px: 1.5,
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                backgroundColor: (theme) =>
                  alpha(theme.palette.text.primary, 0.04),
              },
            }}
          >
            Reiniciar
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleApply}
            startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              borderRadius: 999,
              px: 2,
              backgroundColor: "text.primary",
              color: "background.paper",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.text.primary, 0.9),
                boxShadow: "none",
              },
            }}
          >
            Aplicar
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};

/* ------------------------------------------------------------------ */
/*  Subcomponente: Popover de servicios (multi-select)                 */
/* ------------------------------------------------------------------ */

const ServicesPopover = ({ services, loading, value, onApply }) => {
  const [localValue, setLocalValue] = useState(value);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (open) setLocalValue(value);
  }, [open, value]);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const toggle = (id) => {
    setLocalValue((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleApply = () => {
    onApply(localValue);
    handleClose();
  };

  const handleReset = () => {
    setLocalValue([]);
    onApply([]);
    handleClose();
  };

  return (
    <>
      <ServiceFilterButton
        active={value.length > 0}
        onClick={handleOpen}
        startIcon={<MiscellaneousServicesOutlinedIcon fontSize="small" />}
      >
        {value.length > 0
          ? value.length === 1
            ? "1 servicio"
            : `${value.length} servicios`
          : "Todos los servicios"}
      </ServiceFilterButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disablePortal={false}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: "1.25rem",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              backgroundImage: "none",
              boxShadow: (theme) =>
                theme.palette.mode === "light"
                  ? "0 20px 35px -8px rgba(0,0,0,0.08), 0 8px 18px -6px rgba(0,0,0,0.04)"
                  : "0 20px 35px -8px rgba(0,0,0,0.6), 0 8px 18px -6px rgba(0,0,0,0.4)",
            },
          },
        }}
      >
        <Box sx={{ p: 2.5, minWidth: 320, maxWidth: 380 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <MiscellaneousServicesOutlinedIcon
                sx={{ fontSize: 16, color: "text.disabled" }}
              />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "text.disabled",
                }}
              >
                Servicios
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {localValue.length === 0
                ? "Todos"
                : `${localValue.length} seleccionado${
                    localValue.length === 1 ? "" : "s"
                  }`}
            </Typography>
          </Stack>

          <Divider sx={{ mb: 1 }} />

          <Box
            sx={{
              maxHeight: 260,
              overflowY: "auto",
              pr: 0.5,
              mx: -0.5,
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": {
                borderRadius: 3,
                backgroundColor: (theme) =>
                  alpha(theme.palette.text.primary, 0.15),
              },
              "&::-webkit-scrollbar-track": { background: "transparent" },
            }}
          >
            {loading ? (
              <Stack spacing={0.5} sx={{ p: 1 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} variant="text" height={32} />
                ))}
              </Stack>
            ) : services.length === 0 ? (
              <Box sx={{ px: 1, py: 2, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: "text.disabled",
                    fontStyle: "italic",
                  }}
                >
                  No hay servicios disponibles
                </Typography>
              </Box>
            ) : (
              <MenuList>
                {services.map((service) => {
                  const checked = localValue.includes(service.id);
                  return (
                    <MenuItem
                      key={service.id}
                      onClick={() => toggle(service.id)}
                      sx={{
                        borderRadius: 2,
                        px: 1,
                        py: 0.5,
                        mx: 0.5,
                        "&:hover": {
                          backgroundColor: (theme) =>
                            alpha(theme.palette.text.primary, 0.04),
                        },
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        size="small"
                        sx={{
                          mr: 1,
                          p: 0.5,
                          color: "text.disabled",
                          "&.Mui-checked": { color: "text.primary" },
                        }}
                      />
                      <ListItemText
                        primary={service.name || service.nombre}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          fontWeight: checked ? 600 : 500,
                        }}
                      />
                    </MenuItem>
                  );
                })}
              </MenuList>
            )}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              onClick={handleReset}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.8rem",
                borderRadius: 999,
                px: 1.5,
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  backgroundColor: (theme) =>
                    alpha(theme.palette.text.primary, 0.04),
                },
              }}
            >
              Limpiar
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleApply}
              startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                borderRadius: 999,
                px: 2,
                backgroundColor: "text.primary",
                color: "background.paper",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.text.primary, 0.9),
                  boxShadow: "none",
                },
              }}
            >
              Aplicar
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export default function SearchResults() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { genders } = useGenders();

  const genderId = searchParams.get("gender") || "";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  /* Filtros de ubicación */
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  /* Filtro de edad */
  const [ageRange, setAgeRange] = useState(AGE_DEFAULT);
  const [ageAnchorEl, setAgeAnchorEl] = useState(null);
  const ageOpen = Boolean(ageAnchorEl);

  /* Filtro de servicios */
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);

  const [selectedPreview, setSelectedPreview] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const activeGender = useMemo(
    () => genders.find((g) => String(g.id) === String(genderId)),
    [genders, genderId],
  );

  const isAgeFilterActive = ageRange[0] !== AGE_MIN || ageRange[1] !== AGE_MAX;
  const isServicesFilterActive = selectedServices.length > 0;

  /* ---------- Carga de provincias, ciudades y servicios ---------- */
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const [{ data: provincesData, error: provincesError }] =
          await Promise.all([
            supabase
              .from("provincias")
              .select("id, nombre")
              .order("nombre", { ascending: true }),
          ]);

        if (provincesError) throw provincesError;

        setProvinces(provincesData || []);
      } catch (err) {
        console.error("Error cargando ubicaciones:", err);
      } finally {
        setLoadingLocations(false);
      }
    };

    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error("Error cargando servicios:", err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchLocations();
    fetchServices();
  }, []);

  /* ---------- Fetch usuarios filtrados ---------- */
  const fetchUsers = async () => {
    if (!genderId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Usuarios del género
      const { data: usersData, error: usersError } = await supabase
        .from("user_data")
        .select(
          `
        id, name, phone, avatar_url, age, height,
        city, province, verified, featured, created_at
      `,
        )
        .eq("gender", genderId)
        .eq("is_public", true); // opcional: solo perfiles públicos

      if (usersError) throw usersError;

      const userIds = (usersData || []).map((u) => u.id);

      // 2. Servicios de esos usuarios
      let servicesByUser = {};
      if (userIds.length > 0) {
        const { data: usData, error: usError } = await supabase
          .from("user_services")
          .select("user_id, service_id")
          .in("user_id", userIds);

        if (usError) throw usError;

        servicesByUser = (usData || []).reduce((acc, row) => {
          if (!acc[row.user_id]) acc[row.user_id] = [];
          acc[row.user_id].push(row.service_id);
          return acc;
        }, {});
      }

      // 3. Merge
      const normalized = (usersData || []).map((u) => ({
        ...u,
        service_ids: servicesByUser[u.id] || [],
      }));

      setUsers(normalized);
      setError(null);
    } catch (err) {
      console.error("Error cargando resultados:", err);
      setError(err);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genderId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleClearFilter = () => navigate("/search");

  const handleClearAllFilters = () => {
    setSelectedProvince("");
    setSelectedCity("");
    setAgeRange(AGE_DEFAULT);
    setSelectedServices([]);
  };

  const handlePreviewImage = (image, ownerName) => {
    setSelectedPreview({ ...image, ownerName });
  };

  const handleCopyUrl = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setToast({
      open: true,
      message: "¡URL de la imagen copiada al portapapeles!",
      severity: "success",
    });
  };

  /*  Función para cargar ciudades bajo demanda */
  const fetchCitiesByProvince = async (provinceId) => {
    if (!provinceId) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    try {
      const { data, error } = await supabase
        .from("localidades")
        .select("id, nombre, provincia_id")
        .eq("provincia_id", provinceId)
        .order("nombre", { ascending: true });

      if (error) throw error;
      setCities(data || []);
    } catch (err) {
      console.error("Error cargando ciudades:", err);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  /* Usuarios filtrados por provincia + ciudad + edad + servicios */
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesProvince =
        !selectedProvince || String(user.province) === String(selectedProvince);

      const matchesCity =
        !selectedCity || String(user.city) === String(selectedCity);

      /* Edad */
      let matchesAge = true;
      if (isAgeFilterActive) {
        const userAge = Number(user.age);
        if (!userAge || Number.isNaN(userAge)) {
          matchesAge = false;
        } else {
          matchesAge = userAge >= ageRange[0] && userAge <= ageRange[1];
        }
      }

      /* Servicios: OR lógico (basta con que tenga uno de los seleccionados) */
      let matchesServices = true;
      if (isServicesFilterActive) {
        const userServices = user.service_ids || [];
        matchesServices = userServices.some((id) =>
          selectedServices.includes(id),
        );
      }

      return matchesProvince && matchesCity && matchesAge && matchesServices;
    });
  }, [
    users,
    selectedProvince,
    selectedCity,
    ageRange,
    isAgeFilterActive,
    selectedServices,
    isServicesFilterActive,
  ]);

  const sortedUsers = useMemo(
    () => applySort(filteredUsers, sortBy),
    [filteredUsers, sortBy],
  );

  const featuredCount = useMemo(
    () => filteredUsers.filter((u) => u.featured).length,
    [filteredUsers],
  );
  const verifiedCount = useMemo(
    () => filteredUsers.filter((u) => u.verified).length,
    [filteredUsers],
  );

  const getProvinceName = (id) =>
    provinces.find((p) => String(p.id) === String(id))?.nombre || null;
  const getCityName = (id) =>
    cities.find((c) => String(c.id) === String(id))?.nombre || null;
  const getServiceName = (id) =>
    services.find((s) => String(s.id) === String(id))?.name || null;

  const hasLocationFilters = selectedProvince || selectedCity;
  const hasAnyFilter =
    hasLocationFilters || isAgeFilterActive || isServicesFilterActive;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <ResultsHeader>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          gap={2}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              Resultados de búsqueda
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.9rem" }}
            >
              {loading
                ? "Buscando usuarios…"
                : `${filteredUsers.length} ${
                    filteredUsers.length === 1 ? "usuario" : "usuarios"
                  } encontrados`}
              {activeGender && !loading && (
                <>
                  {" "}
                  · Género:{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {activeGender.name}
                  </Box>
                </>
              )}
              {!loading && featuredCount > 0 && (
                <>
                  {" "}
                  · {featuredCount} destacado
                  {featuredCount === 1 ? "" : "s"}
                </>
              )}
              {!loading && verifiedCount > 0 && (
                <>
                  {" "}
                  · {verifiedCount} verificado
                  {verifiedCount === 1 ? "" : "s"}
                </>
              )}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexWrap: "wrap", gap: 1 }}
          >
            {genderId && (
              <FilterChip
                label={activeGender ? activeGender.name : `Género ${genderId}`}
                onDelete={handleClearFilter}
                size="small"
              />
            )}
            {selectedProvince && (
              <FilterChip
                label={getProvinceName(selectedProvince) || "Provincia"}
                onDelete={() => {
                  setSelectedProvince("");
                  setSelectedCity("");
                }}
                size="small"
              />
            )}
            {selectedCity && (
              <FilterChip
                label={getCityName(selectedCity) || "Ciudad"}
                onDelete={() => setSelectedCity("")}
                size="small"
              />
            )}
            {isAgeFilterActive && (
              <FilterChip
                label={`${ageRange[0]}–${ageRange[1]} años`}
                onDelete={() => setAgeRange(AGE_DEFAULT)}
                size="small"
              />
            )}
            {isServicesFilterActive && (
              <FilterChip
                label={
                  selectedServices.length === 1
                    ? getServiceName(selectedServices[0]) || "1 servicio"
                    : `${selectedServices.length} servicios`
                }
                onDelete={() => setSelectedServices([])}
                size="small"
              />
            )}

            <FormControl size="small" variant="outlined">
              <SortSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                renderValue={(value) => {
                  const opt = SORT_OPTIONS.find((o) => o.value === value);
                  return (
                    <Stack
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      component="span"
                    >
                      {opt?.icon}
                      <span>{opt?.label}</span>
                    </Stack>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 3,
                      mt: 0.5,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow:
                        theme.palette.mode === "light"
                          ? "0 20px 35px -8px rgba(0,0,0,0.08)"
                          : "0 20px 35px -8px rgba(0,0,0,0.5)",
                    },
                  },
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ width: "100%" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          color: "text.disabled",
                          "& svg": { fontSize: 16 },
                        }}
                      >
                        {opt.icon}
                      </Box>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                        {opt.label}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </SortSelect>
            </FormControl>

            <Tooltip title="Refrescar" arrow>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing || loading}
                size="small"
                sx={{
                  color: "text.secondary",
                  borderRadius: 2,
                  "&:hover": {
                    color: "text.primary",
                    backgroundColor: alpha(theme.palette.text.primary, 0.06),
                    display: "none",
                  },
                }}
              >
                <RefreshIcon
                  fontSize="small"
                  sx={{
                    animation: refreshing
                      ? "spin 0.8s linear infinite"
                      : "none",
                    "@keyframes spin": {
                      from: { transform: "rotate(0deg)" },
                      to: { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>

            <Button
              component={NavLink}
              to="/profile-update"
              startIcon={<TuneOutlinedIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.85rem",
                borderRadius: 999,
                px: 2,
                py: 0.75,
                color: "text.primary",
                border: `1px solid ${theme.palette.divider}`,
                display: "none",
                "&:hover": {
                  borderColor: alpha(theme.palette.text.primary, 0.2),
                  backgroundColor: alpha(theme.palette.text.primary, 0.03),
                },
              }}
            >
              Ajustar filtros
            </Button>
          </Stack>
        </Stack>
      </ResultsHeader>

      {/* Barra de filtros */}
      {genderId && (
        <FiltersBar>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ color: "text.disabled", mr: 1 }}
          >
            <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "text.disabled",
              }}
            >
              Filtros
            </Typography>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1}
            sx={{
              width: "100%",
            }}
          >
            {/* Provincia */}
            <FormControl size="small" sx={{ minWidth: "100px" }}>
              <FilterSelect
                displayEmpty
                value={selectedProvince}
                onChange={(e) => {
                  const provinceId = e.target.value;
                  setSelectedProvince(provinceId);
                  setSelectedCity("");
                  fetchCitiesByProvince(provinceId); // ← carga solo las de esta provincia
                }}
                disabled={loadingLocations}
                renderValue={(selected) =>
                  selected ? getProvinceName(selected) : "Todas las provincias"
                }
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 3,
                      mt: 0.5,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow:
                        theme.palette.mode === "light"
                          ? "0 20px 35px -8px rgba(0,0,0,0.08)"
                          : "0 20px 35px -8px rgba(0,0,0,0.5)",
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Todas las provincias</em>
                </MenuItem>
                {provinces.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </FilterSelect>
            </FormControl>

            {/* Ciudad */}
            <FormControl size="small">
              <FilterSelect
                displayEmpty
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedProvince || loadingCities}
                renderValue={(selected) =>
                  selected ? getCityName(selected) : "Todas las ciudades"
                }
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 3,
                      mt: 0.5,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow:
                        theme.palette.mode === "light"
                          ? "0 20px 35px -8px rgba(0,0,0,0.08)"
                          : "0 20px 35px -8px rgba(0,0,0,0.5)",
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Todas las ciudades</em>
                </MenuItem>
                {cities.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </FilterSelect>
            </FormControl>

            {/* Rango de edad */}
            <AgeFilterButton
              active={isAgeFilterActive}
              onClick={(e) => setAgeAnchorEl(e.currentTarget)}
              startIcon={<CakeOutlinedIcon fontSize="small" />}
            >
              {isAgeFilterActive
                ? `${ageRange[0]} – ${ageRange[1]} años`
                : "Todas las edades"}
            </AgeFilterButton>

            {/* Servicios */}
            <ServicesPopover
              services={services}
              loading={loadingServices}
              value={selectedServices}
              onApply={setSelectedServices}
            />
          </Stack>

          {/* Limpiar todos los filtros */}
          {hasAnyFilter && (
            <Button
              size="small"
              onClick={handleClearAllFilters}
              startIcon={<FilterAltOffOutlinedIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.8rem",
                borderRadius: 999,
                px: 1.5,
                py: 0.5,
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  backgroundColor: alpha(theme.palette.text.primary, 0.04),
                },
              }}
            >
              Limpiar todo
            </Button>
          )}
        </FiltersBar>
      )}

      {/* Contenido */}
      {!genderId ? (
        <EmptyState
          icon={<SearchOffOutlinedIcon sx={{ fontSize: 40 }} />}
          title="Seleccioná un género para empezar"
          description="Usá el menú 'Géneros' en la barra superior para filtrar usuarios por género."
        />
      ) : loading ? (
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i} sx={{ display: "flex" }}>
              <UserCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <EmptyState
          icon={<SearchOffOutlinedIcon sx={{ fontSize: 40 }} />}
          title="No pudimos cargar los resultados"
          description="Hubo un problema de conexión. Probá refrescar la página."
          action={
            <Button
              onClick={handleRefresh}
              startIcon={<RefreshIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                borderRadius: 999,
                px: 3,
                py: 1,
                backgroundColor: theme.palette.text.primary,
                color: theme.palette.background.paper,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.text.primary, 0.9),
                },
              }}
            >
              Reintentar
            </Button>
          }
        />
      ) : sortedUsers.length === 0 ? (
        <EmptyState
          icon={<SearchOffOutlinedIcon sx={{ fontSize: 40 }} />}
          title="Sin resultados"
          description={
            hasAnyFilter
              ? "No hay usuarios que coincidan con los filtros aplicados. Probá ampliar la búsqueda."
              : `No encontramos usuarios con el género ${
                  activeGender?.name || genderId
                }. Probá con otro filtro.`
          }
          action={
            hasAnyFilter ? (
              <Button
                onClick={handleClearAllFilters}
                startIcon={<FilterAltOffOutlinedIcon fontSize="small" />}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  borderRadius: 999,
                  px: 3,
                  py: 1,
                  color: "text.primary",
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    borderColor: alpha(theme.palette.text.primary, 0.2),
                    backgroundColor: alpha(theme.palette.text.primary, 0.03),
                  },
                }}
              >
                Limpiar filtros
              </Button>
            ) : (
              <Button
                onClick={handleClearFilter}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  borderRadius: 999,
                  px: 3,
                  py: 1,
                  color: "text.primary",
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    borderColor: alpha(theme.palette.text.primary, 0.2),
                    backgroundColor: alpha(theme.palette.text.primary, 0.03),
                  },
                }}
              >
                Limpiar filtro
              </Button>
            )
          }
        />
      ) : (
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {sortedUsers.map((user) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={user.id}
              sx={{ display: "flex", minWidth: 0 }}
            >
              <Fade in timeout={350}>
                <div style={{ width: "100%", display: "flex" }}>
                  <UserResultCard
                    user={user}
                    onPreviewImage={handlePreviewImage}
                    onCopyUrl={handleCopyUrl}
                    cityName={getCityName(user.city)}
                    provinceName={getProvinceName(user.province)}
                  />
                </div>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Popover de rango de edad */}
      <AgeRangePopover
        anchorEl={ageAnchorEl}
        open={ageOpen}
        onClose={() => setAgeAnchorEl(null)}
        value={ageRange}
        onApply={setAgeRange}
        onReset={() => setAgeRange(AGE_DEFAULT)}
      />

      {/* Dialog de vista previa */}
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
            backgroundImage: "none",
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
              <Box sx={{ maxWidth: "80%" }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  {selectedPreview.name}
                </Typography>
                {selectedPreview.ownerName && (
                  <Typography variant="caption" color="text.secondary">
                    Subido por: <strong>{selectedPreview.ownerName}</strong>
                  </Typography>
                )}
              </Box>
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

            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
              }}
            >
              <Button
                startIcon={<ContentCopyIcon />}
                size="small"
                onClick={() => handleCopyUrl(selectedPreview.url)}
              >
                Copiar enlace
              </Button>
              <Button
                startIcon={<OpenInNewIcon />}
                size="small"
                variant="outlined"
                component="a"
                href={selectedPreview.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir imagen
              </Button>
            </Box>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
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

/* ------------------------------------------------------------------ */
/*  Subcomponente: empty state                                         */
/* ------------------------------------------------------------------ */

function EmptyState({ icon, title, description, action }) {
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
        padding: { xs: 4, sm: 6 },
        borderRadius: "2rem",
        backgroundColor: "background.paper",
        backgroundImage: "none",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) =>
          theme.palette.mode === "light"
            ? "0 20px 35px -8px rgba(0,0,0,0.04), 0 8px 18px -6px rgba(0,0,0,0.02)"
            : "0 20px 35px -8px rgba(0,0,0,0.5), 0 8px 18px -6px rgba(0,0,0,0.3)",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          borderRadius: "50%",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? alpha("#000", 0.03)
              : alpha("#fff", 0.05),
          color: "text.disabled",
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          letterSpacing: "-0.02em",
          fontSize: "1.1rem",
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          maxWidth: 420,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>

      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Paper>
  );
}
