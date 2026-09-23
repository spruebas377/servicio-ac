// src/pages/ProfileUpdate.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import AvatarUploader from "../components/AvatarUploader";
import {
  Button,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  Divider,
  Stack,
  InputAdornment,
  CircularProgress,
  Container,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import Face6OutlinedIcon from "@mui/icons-material/Face6Outlined";
import HeightOutlinedIcon from "@mui/icons-material/HeightOutlined";
import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import QuestionAnswerOutlined from "@mui/icons-material/QuestionAnswerOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router";
import { supabase } from "../supabase/client";

/* ---------- Paper premium ---------- */
const PremiumPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 560,
  borderRadius: "2.5rem",
  padding: theme.spacing(4, 3.5),
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  boxShadow:
    theme.palette.mode === "light"
      ? "0 20px 35px -8px rgba(0,0,0,0.04), 0 8px 18px -6px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.01)"
      : "0 20px 35px -8px rgba(0,0,0,0.5), 0 8px 18px -6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow:
      theme.palette.mode === "light"
        ? "0 30px 50px -12px rgba(0,0,0,0.08), 0 12px 24px -8px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)"
        : "0 30px 50px -12px rgba(0,0,0,0.65), 0 12px 24px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
  },
  [theme.breakpoints.down("sm")]: {
    borderRadius: "2rem",
    padding: theme.spacing(3, 2.2),
  },
}));

/* ---------- Estilo compartido para inputs ---------- */
const fieldSx = (theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha("#000", 0.015)
        : alpha("#fff", 0.03),
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: theme.palette.divider },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.text.primary, 0.2),
    },
    "&.Mui-focused fieldset": {
      borderColor: alpha(theme.palette.text.primary, 0.5),
      borderWidth: "1.5px",
    },
    "&.Mui-focused": {
      backgroundColor:
        theme.palette.mode === "light" ? "#fff" : alpha("#fff", 0.05),
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.9rem",
    "&.Mui-focused": { color: theme.palette.text.primary },
  },
});

/* ---------- Encabezado de sección ---------- */
const SectionLabel = ({ icon, children }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
    <Box
      sx={{
        display: "flex",
        color: "text.disabled",
        "& svg": { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "text.disabled",
        fontSize: "0.7rem",
      }}
    >
      {children}
    </Typography>
  </Stack>
);

/* ---------- Select menu props (DRY) ---------- */
const selectMenuProps = (theme) => ({
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
});

/* ---------- Componente principal ---------- */
const ProfileUpdate = () => {
  const theme = useTheme();
  const { user, setUser, updateUserData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const isFirstLogin = Boolean(
    location.state?.firstLogin ||
      searchParams.get("firstLogin") === "true" ||
      user?.isFirstLogin,
  );

  const [phone, setPhone] = useState(user?.phone || "");
  const [name, setName] = useState(user?.name || "");
  const [description, setDescription] = useState(user?.description || "");
  const [nationality, setNationality] = useState(user?.nationality || "");
  const [height, setHeight] = useState(user?.height || "");
  const [hairColor, setHairColor] = useState(user?.hair || "");
  const [eyeColor, setEyeColor] = useState(user?.eyes || "");
  const [age, setAge] = useState(user?.age || "");
  const [selectedGender, setSelectedGender] = useState(user?.gender || "");
  const [aboutMe, setAboutMe] = useState(user?.about_me || "");

  const [genders, setGenders] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [locations, setLocations] = useState([]);
  const [meetingPlaces, setMeetingPlaces] = useState([]);
  const [selectedMeetingPlaces, setSelectedMeetingPlaces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(
    user?.province || "",
  );
  const [selectedLocation, setSelectedLocation] = useState(user?.city || "");

  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ---------- Scroll al top ---------- */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  /* ---------- Carga inicial (catálogos + datos del usuario + pagos) ---------- */
  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setLoadingInitial(true);
      try {
        const [gendersRes, paymentsRes, provincesRes, placesRes] =
          await Promise.all([
            supabase
              .from("gender")
              .select("*")
              .order("id", { ascending: true }),

            supabase
              .from("payment_methods")
              .select("*")
              .order("name", { ascending: true }),

            supabase
              .from("provincias")
              .select("*")
              .order("nombre", { ascending: true }),

            supabase
              .from("places")
              .select("*")
              .order("name", { ascending: true }),
          ]);

        if (cancelled) return;

        setGenders(gendersRes.data || []);
        setPaymentMethods(paymentsRes.data || []);
        setProvinces(provincesRes.data || []);
        setMeetingPlaces(placesRes.data || []);
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Helpers de datos ---------- */
  const getLocations = useCallback(async (province_id) => {
    const { data, error } = await supabase
      .from("localidades")
      .select("*")
      .eq("provincia_id", province_id)
      .order("nombre", { ascending: true });
    if (error) {
      console.error("Error cargando localidades:", error);
      return [];
    }
    return data;
  }, []);

  /* ---------- Datos del usuario + métodos de pago ya guardados ---------- */
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const fetchUserData = async () => {
      try {
        const [userRes, paymentsRes] = await Promise.all([
          supabase.from("user_data").select("*").eq("id", user.id).single(),
          supabase
            .from("user_payment")
            .select("id_payment_methods")
            .eq("id_user", user.id),
        ]);
        const [meetingPlacesRes] = await Promise.all([
          supabase
            .from("user_places")
            .select("place_id")
            .eq("user_id", user.id),
        ]);

        if (cancelled) return;

        const data = userRes.data;
        if (data && !userRes.error) {
          if (data.name) setName(data.name);
          if (data.phone) setPhone(data.phone);
          if (data.description) setDescription(data.description);
          if (data.nationality) setNationality(data.nationality);
          if (data.gender) setSelectedGender(data.gender);
          if (data.height) setHeight(data.height);
          if (data.hair) setHairColor(data.hair);
          if (data.eyes) setEyeColor(data.eyes);
          if (data.age) setAge(data.age);
          if (data.about_me) setAboutMe(data.about_me);
          if (data.province) {
            setSelectedProvince(data.province);
            const locData = await getLocations(data.province);
            if (!cancelled) setLocations(locData || []);
          }
          if (data.city) setSelectedLocation(data.city);
        }

        if (!paymentsRes.error && paymentsRes.data) {
          setSelectedPaymentMethods(
            paymentsRes.data.map((r) => r.id_payment_methods),
          );
        }

        if (!meetingPlacesRes.error && meetingPlacesRes.data) {
          setSelectedMeetingPlaces(
            meetingPlacesRes.data.map((r) => r.place_id),
          );
        }
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
      }
    };

    fetchUserData();
    return () => {
      cancelled = true;
    };
  }, [user?.id, getLocations]);

  /* ---------- Avatar ---------- */
  const handleAvatarUploaded = (url) => {
    setUser((prev) => ({ ...prev, avatar_url: url }));
  };

  /* ---------- Guardar cambios ---------- */
  const handleUpdateProfile = async () => {
    const userData = {
      id: user.id,
      ...(name && name !== user.name && { name }),
      ...(description && description !== user.description && { description }),
      ...(phone && phone !== user.phone && { phone }),
      ...(nationality && nationality !== user.nationality && { nationality }),
      ...(selectedGender &&
        selectedGender !== user.gender && { gender: selectedGender }),
      ...(height && height !== user.height && { height }),
      ...(hairColor && hairColor !== user.hair && { hair: hairColor }),
      ...(eyeColor && eyeColor !== user.eyes && { eyes: eyeColor }),
      ...(age && age !== user.age && { age }),
      ...(aboutMe && aboutMe !== user.about_me && { about_me: aboutMe }),
      ...(selectedLocation &&
        selectedLocation !== user.city && { city: selectedLocation }),
      ...(selectedProvince &&
        selectedProvince !== user.province && { province: selectedProvince }),
    };

    const hasChanges = Object.keys(userData).length > 1;
    const hasPayments = selectedPaymentMethods.length > 0;
    const hasMeetingPlaces = selectedMeetingPlaces.length > 0;

    if (!hasChanges && !hasPayments && !hasMeetingPlaces) {
      try {
        await supabase.auth.updateUser({
          data: { profile_completed: true },
        });
      } catch (metaErr) {
        console.warn("No se pudo actualizar metadata de usuario:", metaErr);
      }
      navigate("/");
      return;
    }

    setSaving(true);
    try {
      if (hasChanges) {
        const updatedUserData = await updateUserData(userData);
        setUser((prevUser) => ({
          ...prevUser,
          ...updatedUserData,
          isFirstLogin: false,
        }));
      }
      if (hasPayments) await saveSelectedPaymentMethods();

      if (hasMeetingPlaces) await saveSelectedMeetingPlaces();

      try {
        await supabase.auth.updateUser({
          data: { profile_completed: true },
        });
      } catch (metaErr) {
        console.warn("No se pudo actualizar metadata de usuario:", metaErr);
      }

      navigate("/");
    } catch (error) {
      console.error("Error guardando perfil:", error);
      // Podés mostrar un snackbar/toast acá
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Handlers ---------- */
  const handleProvinceChange = async (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setSelectedLocation("");

    if (!provinceId) {
      setLocations([]);
      return;
    }
    setLoadingLocations(true);
    try {
      const data = await getLocations(provinceId);
      setLocations(data || []);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleLocationChange = (e) => setSelectedLocation(e.target.value);
  const handleGenderChange = (e) => setSelectedGender(e.target.value);

  const handlePaymentMethodToggle = (id, isChecked) => {
    setSelectedPaymentMethods((prev) =>
      isChecked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  const handleMeetingPlaceToggle = (id, isChecked) => {
    setSelectedMeetingPlaces((prev) =>
      isChecked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  /* ---------- Guardar métodos de pago (insert bulk, sin duplicados) ---------- */
  const saveSelectedPaymentMethods = async () => {
    const { data: existing, error: fetchError } = await supabase
      .from("user_payment")
      .select("id_payment_methods")
      .eq("id_user", user.id);

    if (fetchError) throw fetchError;

    const existingIds = existing.map((r) => r.id_payment_methods);
    const toAdd = selectedPaymentMethods.filter(
      (id) => !existingIds.includes(id),
    );
    const toRemove = existingIds.filter(
      (id) => !selectedPaymentMethods.includes(id),
    );

    if (toAdd.length) {
      const { error } = await supabase.from("user_payment").insert(
        toAdd.map((id_payment_methods) => ({
          id_user: user.id,
          id_payment_methods,
        })),
      );
      if (error) throw error;
    }

    if (toRemove.length) {
      const { error } = await supabase
        .from("user_payment")
        .delete()
        .eq("id_user", user.id)
        .in("id_payment_methods", toRemove);
      if (error) throw error;
    }
  };

  /* ---------- Guardar lugares de encuentro ---------- */
  const saveSelectedMeetingPlaces = async () => {
    const { data: existing, error: fetchError } = await supabase
      .from("user_places")
      .select("place_id")
      .eq("user_id", user.id);

    if (fetchError) throw fetchError;

    const existingIds = existing.map((r) => r.place_id);

    const toAdd = selectedMeetingPlaces.filter(
      (id) => !existingIds.includes(id),
    );

    const toRemove = existingIds.filter(
      (id) => !selectedMeetingPlaces.includes(id),
    );

    if (toAdd.length) {
      const { error } = await supabase.from("user_places").insert(
        toAdd.map((place_id) => ({
          user_id: user.id,
          place_id,
        })),
      );

      if (error) throw error;
    }

    if (toRemove.length) {
      const { error } = await supabase
        .from("user_places")
        .delete()
        .eq("user_id", user.id)
        .in("place_id", toRemove);

      if (error) throw error;
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, md: 6 },
      }}
    >
      <PremiumPaper elevation={0}>
        {/* Botón volver */}
        <Button
          onClick={() => (isFirstLogin ? navigate("/") : navigate(-1))}
          startIcon={<ArrowBackIcon fontSize="small" />}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.85rem",
            color: "text.secondary",
            borderRadius: 999,
            px: 1.5,
            py: 0.5,
            mb: 2,
            ml: -0.5,
            "&:hover": {
              color: "text.primary",
              backgroundColor: alpha(theme.palette.text.primary, 0.04),
            },
          }}
        >
          Volver
        </Button>

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <AvatarUploader user={user} onUploaded={handleAvatarUploaded} />
          <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                mb: 0.25,
              }}
            >
              {isFirstLogin ? "Completá tus datos" : "Actualizar perfil"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {isFirstLogin
                ? "Te damos la bienvenida. Completá tu información básica para comenzar."
                : "Modifica tu información personal y ubicación"}
            </Typography>
          </Box>
        </Box>

        {isFirstLogin && (
          <Alert
            severity="info"
            icon={<InfoOutlinedIcon sx={{ fontSize: 24 }} />}
            sx={{
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              backgroundColor: alpha(theme.palette.info.main, 0.08),
              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Completá tus datos
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontSize: "0.85rem" }}
            >
              Para brindarte la mejor experiencia y configurar tu cuenta, por favor completá tu información personal y de ubicación.
            </Typography>
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Información personal */}
        <SectionLabel icon={<AccountCircleIcon />}>
          Información personal
        </SectionLabel>
        <Stack spacing={2.5} sx={{ mb: 3.5 }}>
          <TextField
            fullWidth
            label="Nombre para mostrar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={fieldSx(theme)}
          />
          <TextField
            fullWidth
            label="Apodo / alias"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ alignSelf: "flex-start", mt: 1.5 }}
                >
                  <NotesOutlinedIcon
                    sx={{ color: "text.disabled", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlinedIcon
                    sx={{ color: "text.disabled", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Nacionalidad"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FlagOutlinedIcon
                    sx={{ color: "text.disabled", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {/* Ubicación */}
        <SectionLabel icon={<LocationOnOutlinedIcon />}>Ubicación</SectionLabel>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.5,
            mb: 3.5,
          }}
        >
          <FormControl fullWidth sx={fieldSx(theme)}>
            <InputLabel id="province-label">Provincia</InputLabel>
            <Select
              value={selectedProvince}
              onChange={handleProvinceChange}
              labelId="province-label"
              label="Provincia"
              MenuProps={selectMenuProps(theme)}
            >
              <MenuItem value="">
                <em>Seleccione una provincia</em>
              </MenuItem>
              {provinces.map((province) => (
                <MenuItem key={province.id} value={province.id}>
                  {province.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            sx={fieldSx(theme)}
            disabled={!selectedProvince || loadingLocations}
          >
            <InputLabel id="location-label">Localidad</InputLabel>
            <Select
              value={selectedLocation}
              onChange={handleLocationChange}
              labelId="location-label"
              label="Localidad"
              MenuProps={selectMenuProps(theme)}
            >
              <MenuItem value="">
                <em>Seleccione una localidad</em>
              </MenuItem>
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Cómo te definís */}
        <SectionLabel icon={<Face6OutlinedIcon />}>
          Cómo te definís
        </SectionLabel>
        <Box sx={{ mb: 3.5 }}>
          <FormControl fullWidth sx={fieldSx(theme)}>
            <InputLabel id="gender-label">Género</InputLabel>
            <Select
              value={selectedGender}
              onChange={handleGenderChange}
              labelId="gender-label"
              label="Género"
              MenuProps={selectMenuProps(theme)}
            >
              <MenuItem value="">
                <em>Seleccione un género</em>
              </MenuItem>
              {genders.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name || g.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Cómo sos */}
        <SectionLabel icon={<Face6OutlinedIcon />}>Cómo sos</SectionLabel>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.5,
            mb: 3.5,
          }}
        >
          <TextField
            fullWidth
            label="Altura"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HeightOutlinedIcon
                    sx={{ color: "text.disabled", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Color de cabello"
            value={hairColor}
            onChange={(e) => setHairColor(e.target.value)}
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BrushOutlinedIcon
                    sx={{ color: "text.disabled", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Color de ojos"
            value={eyeColor}
            onChange={(e) => setEyeColor(e.target.value)}
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BrushOutlinedIcon
                    sx={{ color: "text.disabled", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Edad"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* About me */}
        <SectionLabel icon={<QuestionAnswerOutlined />}>
          Contanos qué servicios ofrecés, y qué buscás
        </SectionLabel>
        <Box sx={{ mb: 3.5 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="¿Cómo sos y qué servicios ofrecés?"
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            sx={fieldSx(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ alignSelf: "flex-start", mt: 1.5 }}
                >
                  <QuestionAnswerOutlined
                    sx={{ color: "text.disabled", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Métodos de pago */}
        <SectionLabel icon={<PaymentIcon />}>
          Seleccioná los métodos de pago que aceptás
        </SectionLabel>
        <Box sx={{ mb: 3.5 }}>
          <FormControl component="fieldset" fullWidth>
            <FormGroup row>
              {paymentMethods.map((pm) => {
                const checked = selectedPaymentMethods.includes(pm.id);
                return (
                  <FormControlLabel
                    key={pm.id}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) =>
                          handlePaymentMethodToggle(pm.id, e.target.checked)
                        }
                      />
                    }
                    label={pm.name || pm.nombre}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
        </Box>

        {/* Lugares de encuentro */}
        <SectionLabel icon={<LocationOnOutlinedIcon />}>
          Lugares de encuentro
        </SectionLabel>
        <Box sx={{ mb: 3.5 }}>
          <FormControl component="fieldset" fullWidth>
            <FormGroup row>
              {meetingPlaces.map((pm) => {
                const checked = selectedMeetingPlaces.includes(pm.id);
                return (
                  <FormControlLabel
                    key={pm.id}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) =>
                          handleMeetingPlaceToggle(pm.id, e.target.checked)
                        }
                      />
                    }
                    label={pm.name || pm.nombre}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
        </Box>

        {/* Acciones */}
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.5}
          justifyContent="flex-end"
        >
          <Button
            onClick={() => (isFirstLogin ? navigate("/") : navigate(-1))}
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
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateProfile}
            disabled={saving || loadingInitial}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveOutlinedIcon fontSize="small" />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              borderRadius: 999,
              px: 3,
              py: 1,
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.background.paper,
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              "&:hover": {
                backgroundColor: alpha(theme.palette.text.primary, 0.9),
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              },
              "&.Mui-disabled": {
                backgroundColor: alpha(theme.palette.text.primary, 0.4),
                color: theme.palette.background.paper,
              },
            }}
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Stack>
      </PremiumPaper>
    </Container>
  );
};

export default ProfileUpdate;
