import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Fade,
  Button,
  MenuItem,
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { styled, alpha, useTheme } from "@mui/material/styles";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { supabase } from "../supabase/client";

const BUCKET_NAME = "imagenes";

/* ---------- Estilos Visuales ---------- */
const UserCardWrapper = styled(Card)(({ theme }) => ({
  borderRadius: "1.25rem",
  border: `1px solid ${
    theme.palette.mode === "light" ? alpha("#000", 0.08) : alpha("#fff", 0.08)
  }`,
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 4px 20px -4px rgba(0,0,0,0.05)"
      : "0 4px 20px -4px rgba(0,0,0,0.3)",
  transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  minWidth: 0,
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
    "& .overlay-actions": {
      opacity: 1,
    },
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

/* ---------- Componente de Tarjeta Individual de Usuario ---------- */
const UserCardItem = ({ user, onPreviewImage, onCopyUrl }) => {
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

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const userName = user.name || user.email?.split("@")[0] || "Usuario";
  const userInitials = (userName || "?")[0].toUpperCase();

  return (
    <UserCardWrapper
      sx={{
        flex: 1,
        minWidth: 300,
        border: user.featured
          ? `2px solid ${theme.palette.warning.main}`
          : "1px solid " + alpha(theme.palette.divider, 0.5),
        boxShadow:
          user.featured && theme.palette.mode === "dark"
            ? "0 0 20px rgba(243, 213, 122, 0.15)"
            : undefined,
        backgroundColor:
          theme.palette.mode === "light" && user.featured
            ? "rgba(247, 194, 36, 0.05)"
            : undefined,
        boxShadow:
          theme.palette.mode === "light" && user.featured
            ? `0 0 0 1px rgba(255, 193, 7, 0.2)`
            : undefined,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 14px 30px -6px rgba(0,0,0,0.12)"
              : "0 14px 30px -6px rgba(0,0,0,0.6)",
        },
      }}
    >
      {/* Cabecera del Usuario */}
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
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ maxWidth: 220 }}
          >
            {user.email}
          </Typography>
        }
      />

      {/* Badges de Estado y Contador */}
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
          {user.featured ? (
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
          ) : null}
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

      {/* Contenido / Galería de Imágenes de Supabase */}
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

                  {/* Si es la 4ta foto y hay más de 4, mostrar badge de "+X más" */}
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

                  {/* Acciones flotantes al pasar el mouse */}
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

      {/* Botón Ver perfil */}
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

/* ---------- Componente Principal UserList ---------- */
const UserList = ({ users = [] }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);

      try {
        const [
          { data: provincesData, error: provincesError },
          { data: citiesData, error: citiesError },
        ] = await Promise.all([
          supabase
            .from("provincias")
            .select("id, nombre")
            .order("nombre", { ascending: true }),

          supabase
            .from("localidades")
            .select("id, nombre, provincia_id")
            .order("nombre", { ascending: true }),
        ]);

        if (provincesError) throw provincesError;
        if (citiesError) throw citiesError;

        setProvinces(provincesData || []);
        setCities(citiesData || []);
      } catch (error) {
        console.error("Error cargando ubicaciones:", error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

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

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedProvince("");
    setSelectedCity("");
    setFilterMode("all");
  };

  // Filtrado de usuarios según búsqueda y visibilidad
  const filteredUsers = (users || []).filter((user) => {
    const search = searchTerm.toLowerCase().trim();

    const province = provinces.find((item) => item.id === user.province);

    const city = cities.find((item) => item.id === user.city);

    const matchesSearch =
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      city?.nombre?.toLowerCase().includes(search) ||
      province?.nombre?.toLowerCase().includes(search);

    const matchesProvince =
      !selectedProvince || String(user.province) === String(selectedProvince);

    const matchesCity =
      !selectedCity || String(user.city) === String(selectedCity);

    if (!matchesSearch) return false;
    if (!matchesProvince) return false;
    if (!matchesCity) return false;

    if (filterMode === "verified") {
      return user.verified === true;
    }

    if (filterMode === "not-verified") {
      return !user.verified;
    }

    return true;
  });

  const filteredCities = cities.filter(
    (city) =>
      !selectedProvince ||
      String(city.provincia_id) === String(selectedProvince),
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Accordion
        disableGutters
        sx={{
          mb: 3,
          borderRadius: "1.25rem !important",
          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === "light"
              ? "0 6px 24px rgba(0,0,0,0.06)"
              : "0 6px 24px rgba(0,0,0,0.22)",
          overflow: "hidden",
          "&::before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{
            px: { xs: 2, sm: 3 },
            py: 0.75,
            minHeight: 62,
            "&.Mui-expanded": { minHeight: 62 },
            "& .MuiAccordionSummary-content": {
              my: 1.25,
              alignItems: "center",
              gap: 1,
            },
            "& .MuiAccordionSummary-expandIconWrapper": {
              color: "primary.main",
            },
          }}
        >
          <SearchIcon color="primary" fontSize="small" />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Buscar y filtrar usuarios
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Nombre, correo, provincia y ciudad
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            px: { xs: 2, sm: 3 },
            pt: 0,
            pb: 3,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          {/* Barra de Filtros y Búsqueda */}
          <Box sx={{ pt: 2, mb: 1 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              {/* Input de Búsqueda */}
              <TextField
                size="small"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  maxWidth: { sm: 380 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "1rem",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  ...(searchTerm && {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }),
                }}
              />

              {/* Filtros de Visibilidad */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`Todos (${users.length})`}
                  clickable
                  color={filterMode === "all" ? "primary" : "default"}
                  variant={filterMode === "all" ? "filled" : "outlined"}
                  onClick={() => setFilterMode("all")}
                  sx={{ borderRadius: "0.75rem", fontWeight: 600 }}
                />
                <Chip
                  label="Verificados"
                  clickable
                  color={filterMode === "verified" ? "success" : "default"}
                  variant={filterMode === "verified" ? "filled" : "outlined"}
                  onClick={() => setFilterMode("verified")}
                  sx={{ borderRadius: "0.75rem", fontWeight: 600 }}
                />
                <Chip
                  label="No Verificados"
                  clickable
                  color={filterMode === "not-verified" ? "default" : "default"}
                  variant={
                    filterMode === "not-verified" ? "filled" : "outlined"
                  }
                  onClick={() => setFilterMode("not-verified")}
                  sx={{ borderRadius: "0.75rem", fontWeight: 600 }}
                />
              </Stack>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ my: 2 }}
            >
              {/* Provincia */}
              <TextField
                select
                size="small"
                label="Provincia"
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedCity("");
                }}
                sx={{ minWidth: 220 }}
                disabled={loadingLocations}
              >
                <MenuItem value="">Todas las provincias</MenuItem>

                {provinces.map((province) => (
                  <MenuItem key={province.id} value={province.id}>
                    {province.nombre}
                  </MenuItem>
                ))}
              </TextField>

              {/* Ciudad */}
              <TextField
                select
                size="small"
                label="Ciudad"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                sx={{ minWidth: 220 }}
                disabled={loadingLocations || !selectedProvince}
              >
                <MenuItem value="">Todas las ciudades</MenuItem>

                {filteredCities.map((city) => (
                  <MenuItem key={city.id} value={String(city.id)}>
                    {city.nombre}
                  </MenuItem>
                ))}
              </TextField>

              {/* Limpiar filtros */}
              <Button
                variant="outlined"
                size="small"
                type="button"
                onClick={handleClearFilters}
                sx={{
                  minHeight: 40,
                  px: 2,
                  borderRadius: "0.75rem",
                  textTransform: "none",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  alignSelf: { xs: "stretch", sm: "center" },
                }}
              >
                Limpiar filtros
              </Button>
            </Stack>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Grid de Tarjetas de Usuarios */}
      {filteredUsers.length === 0 ? (
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
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm
              ? `No hay resultados que coincidan con "${searchTerm}"`
              : "Aún no hay usuarios registrados en el sistema."}
          </Typography>
          {searchTerm && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSearchTerm("")}
              sx={{ mt: 2, borderRadius: "0.75rem" }}
            >
              Limpiar búsqueda
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {filteredUsers.map((user) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={user.id}
              sx={{ display: "flex", minWidth: 0 }}
            >
              <Fade in timeout={350}>
                <div>
                  <UserCardItem
                    user={user}
                    onPreviewImage={handlePreviewImage}
                    onCopyUrl={handleCopyUrl}
                  />
                </div>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal / Dialog de Vista Previa de Imagen */}
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

      {/* Notificaciones Snackbar */}
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
};

export default UserList;
