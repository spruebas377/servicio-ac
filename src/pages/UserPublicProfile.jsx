// src/pages/UserPublicProfile.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import GenderHelper from "../helpers/GenderHelper";
import { styled, alpha, useTheme } from "@mui/material/styles";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import VerifiedIcon from "@mui/icons-material/Verified";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import Face4Icon from "@mui/icons-material/Face4";
import HeightOutlinedIcon from "@mui/icons-material/HeightOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import PaymentIcon from "@mui/icons-material/Payment";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { QuestionAnswerOutlined } from "@mui/icons-material";
import { supabase } from "../supabase/client";

const BUCKET_NAME = "imagenes";

/* ---------- Estilos ---------- */
const ProfileHeader = styled(Paper)(({ theme }) => ({
  borderRadius: "1.5rem",
  padding: theme.spacing(4),
  border: `1px solid ${
    theme.palette.mode === "light" ? alpha("#000", 0.06) : alpha("#fff", 0.06)
  }`,
  backgroundColor: theme.palette.background.paper,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    background:
      theme.palette.mode === "light"
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
  },
}));

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

export default function UserPublicProfile() {
  const theme = useTheme();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [meetingPlaces, setMeetingPlaces] = useState([]);
  const [provinceState, setProvinceState] = useState("");
  const [cityState, setCityState] = useState("");
  const [images, setImages] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  /* ---------- Scroll al top ---------- */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  /* ---------- Cargar datos del usuario ---------- */
  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const { data, error } = await supabase
          .from("user_data")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error al obtener datos del usuario:", error);
          setUserData(null);
        } else {
          setUserData(data);
        }
      } catch (err) {
        console.error("Excepción cargando usuario:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!userData) return;
      const prov = await getProvince(userData.province);
      const city = await getCity(userData.city);
      setProvinceState(prov.nombre);
      setCityState(city.nombre);
    };
    fetchLocation();
  }, [userData]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!userData) return;
      try {
        const { data, error } = await supabase
          .from("user_payment")
          .select("payment_methods(name)")
          .eq("id_user", userData.id);

        if (error) {
          console.error("Error al obtener métodos de pago:", error);
          setPaymentMethods([]);
        } else {
          setPaymentMethods(data.map((item) => item.payment_methods.name));
        }
      } catch (err) {
        console.error("Excepción cargando métodos de pago:", err);
      }
    };
    fetchPaymentMethods();
  }, [userData]);

  /* ---------- Cargar lugares de encuentro ---------- */
  useEffect(() => {
    const fetchMeetingPlaces = async () => {
      if (!userData) return;

      try {
        const { data, error } = await supabase
          .from("user_places")
          .select("places(name)")
          .eq("user_id", userData.id);

        if (error) {
          console.error("Error al obtener lugares de encuentro:", error);
          setMeetingPlaces([]);
        } else {
          setMeetingPlaces(
            (data || []).map((item) => item.places?.name).filter(Boolean),
          );
        }
      } catch (err) {
        console.error("Excepción cargando lugares de encuentro:", err);
        setMeetingPlaces([]);
      }
    };

    fetchMeetingPlaces();
  }, [userData]);

  /* ---------- Cargar imágenes del bucket ---------- */
  const fetchUserImages = useCallback(async () => {
    if (!userId) return;
    setLoadingImages(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(userId, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.error("Error al obtener imágenes:", error);
        setImages([]);
        return;
      }

      const validFiles = (data || []).filter(
        (file) => file.name && !file.name.startsWith("."),
      );

      const mapped = validFiles.map((file) => {
        const fullPath = `${userId}/${file.name}`;
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
      console.error("Error cargando imágenes:", err);
    } finally {
      setLoadingImages(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchUserImages();
  }, [userId, fetchUserImages]);

  /* ---------- Handlers ---------- */
  const handleCopyUrl = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setToast({
      open: true,
      message: "¡URL copiada al portapapeles!",
      severity: "success",
    });
  };

  /* ---------- Loading state ---------- */
  if (loadingUser) {
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

  /* ---------- Not found ---------- */
  if (!userData) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Usuario no encontrado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No existe un usuario con este identificador.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate(-1)}
          sx={{ borderRadius: "0.75rem" }}
        >
          Volver
        </Button>
      </Container>
    );
  }

  /* Cargar provincia del usuario */
  const getProvince = async (prov) => {
    const { data } = await supabase
      .from("provincias")
      .select("nombre")
      .eq("id", prov)
      .single();
    return data;
  };

  const getCity = async (loc) => {
    const { data } = await supabase
      .from("localidades")
      .select("nombre")
      .eq("id", loc)
      .single();
    return data;
  };

  const province = getProvince(userData.province);
  const city = getCity(userData.city);

  const userName = userData.name || userData.email?.split("@")[0] || "Usuario";
  const userInitials = (userName || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const createdDate = userData.created_at
    ? new Date(userData.created_at).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

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

      {/* ============ Cabecera del Perfil ============ */}
      <ProfileHeader elevation={0} sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems={{ xs: "center", sm: "flex-end" }}
          sx={{ position: "relative", zIndex: 1, pt: { xs: 2, sm: 4 } }}
        >
          {/* Avatar Grande */}
          <Avatar
            src={userData.avatar_url || undefined}
            alt={userName}
            sx={{
              position: "relative",
              left: { xs: "50%", sm: 0 },
              transform: { xs: "translateX(-50%)", sm: "none" },
              width: { xs: 120, sm: 100 },
              height: { xs: 120, sm: 100 },
              bgcolor: "primary.main",
              fontWeight: 800,
              fontSize: "2.4rem",
              border: `4px solid ${theme.palette.background.paper}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}
          >
            {userInitials}
          </Avatar>

          {/* Info del usuario */}
          <Stack>
            <Box
              sx={{
                flexGrow: 1,
                textAlign: { xs: "center", sm: "left" },
                flexWrap: "wrap",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "center", sm: "center" },
                  gap: { xs: 1, sm: 5 },
                }}
              >
                <Typography variant="h4" fontWeight={800}>
                  {userName}
                </Typography>
                <GenderHelper gender={userData.gender} />
              </Stack>
              <Box
                sx={{
                  mt: 1,
                  mb: 1,
                  padding: "0.5rem",
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={400}
                  sx={{ wordWrap: "break-word" }}
                >
                  {userData.description || "Sin descripción"}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                flexWrap="wrap"
                useFlexGap
                justifyContent={{ xs: "center", sm: "flex-start" }}
                sx={{ mt: 1 }}
              >
                {/* Email */}
                {/* <Stack direction="row" spacing={0.5} alignItems="center">
                  <EmailOutlinedIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {userData.email}
                  </Typography>
                </Stack> */}
                {/* Phone */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PhoneOutlinedIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  {userData.phone ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.85rem" }}
                    >
                      {userData.phone}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      Teléfono no disponible
                    </Typography>
                  )}
                </Stack>
                {/* Location */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOnOutlinedIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {cityState && `${cityState}, `}
                    {provinceState && `${provinceState}`}
                  </Typography>
                </Stack>

                {/* Fecha de creación */}
                {createdDate && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarTodayOutlinedIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Miembro desde {createdDate}
                    </Typography>
                  </Stack>
                )}
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                justifyContent={{ xs: "center", sm: "flex-start" }}
                sx={{ mt: 2 }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Haircolor */}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Face4Icon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      Cabello:{" "}
                      {userData.hair ? userData.hair : "No especificado"}
                    </Typography>
                  </Stack>
                  {/* EyeColor */}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <VisibilityOutlinedIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Ojos: {userData.eyes ? userData.eyes : "No especificado"}
                    </Typography>
                  </Stack>
                  {/* Height */}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <HeightOutlinedIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Altura:{" "}
                      {userData.height
                        ? `${userData.height} m`
                        : "No especificado"}
                    </Typography>
                  </Stack>
                  {/* Age */}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarTodayOutlinedIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Edad: {userData.age ? userData.age : "No especificado"}
                    </Typography>
                  </Stack>
                  {/* Métodos de pago */}
                  <Stack direction="row" spacing={0.5} alignItems="flex-start">
                    <PaymentIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Métodos de pago disponibles:{<br />}
                      {paymentMethods
                        ?.map((paymentMethod) => paymentMethod)
                        .join(", ")}
                    </Typography>
                  </Stack>
                  {/* Lugares de encuentro */}
                  <Stack direction="row" spacing={0.5} alignItems="flex-start">
                    <LocationOnOutlinedIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Lugares de encuentro:{<br />}
                      {meetingPlaces.length > 0
                        ? meetingPlaces.join(", ")
                        : "No especificado"}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                justifyContent={{ xs: "flex-start", sm: "flex-start" }}
                sx={{ mt: 2, alignItems: "flex-start" }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Acerca de mí */}
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="flex-start"
                    sx={{ mt: 1 }}
                  >
                    <QuestionAnswerOutlined
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="justify"
                    >
                      Acerca de mí:
                      <br />
                      {userData.about_me
                        ? userData.about_me
                        : "No especificado"}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Chips */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 2, width: "100%" }}
              justifyContent={{
                xs: "center",
                sm: "flex-start",
              }}
            >
              {userData.verified ? (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: "1rem !important" }} />}
                  label="Perfil verificado"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              ) : (
                <Chip
                  icon={<DoDisturbIcon sx={{ fontSize: "1rem !important" }} />}
                  label="Perfil no verificado"
                  size="small"
                  color="error"
                  sx={{ fontWeight: 500, opacity: 0.8 }}
                />
              )}
              {userData.featured ? (
                <Chip
                  icon={
                    <WorkspacePremiumOutlinedIcon
                      sx={{ fontSize: "1rem !important" }}
                    />
                  }
                  label="Perfil destacado"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              ) : null}

              <Chip
                icon={
                  <PhotoLibraryOutlinedIcon
                    sx={{ fontSize: "1rem !important" }}
                  />
                }
                label={`${images.length} ${
                  images.length === 1 ? "imagen" : "imágenes"
                }`}
                size="small"
                color={images.length > 0 ? "primary" : "default"}
                variant={images.length > 0 ? "filled" : "outlined"}
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            {/* Botón enviar mensaje */}
            <Tooltip title="Enviar mensaje">
              <Button
                variant="outlined"
                onClick={() => navigate(`/chat/new/${userId}`)}
                sx={{
                  mt: 3,
                  borderRadius: "0.75rem",
                  textTransform: "none",
                  alignSelf: "center",
                }}
              >
                Enviar mensaje
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </ProfileHeader>

      <Divider sx={{ my: 2 }} />

      {/* ============ Galería de Imágenes ============ */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ mb: 3, width: "100%" }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Mis fotos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {images.length}{" "}
              {images.length === 1
                ? "imagen encontrada"
                : "imágenes encontradas"}{" "}
              en el portal <strong>{BUCKET_NAME}</strong>
            </Typography>
          </Box>

          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            size="small"
            onClick={fetchUserImages}
            disabled={loadingImages}
            sx={{
              position: "static",
              transform: "none",
              flexShrink: 0,
              borderRadius: "0.75rem",
              fontSize: "0.75rem",
              padding: "4px 8px",
              textTransform: "none",
              alignSelf: { xs: "flex-start", sm: "center" },
            }}
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
            <ImageNotSupportedOutlinedIcon
              sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Este usuario no tiene imágenes
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 450, mx: "auto" }}
            >
              El usuario aún no ha subido imágenes.
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

                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? alpha("#000", 0.015)
                            : alpha("#fff", 0.02),
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: "50%", fontWeight: 500 }}
                      >
                        {img.name}
                      </Typography>

                      <Stack direction="row" spacing={0.5}>
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
                      </Stack>
                    </Box>
                  </GalleryCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ============ Modal Vista Previa ============ */}
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
                <Typography variant="caption" color="text.secondary">
                  Subido por: <strong>{userName}</strong>
                </Typography>
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
