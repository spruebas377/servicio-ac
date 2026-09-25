// src/components/ContactForm.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  InputAdornment,
  CircularProgress,
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import { supabase } from "../supabase/client";

/* ------------------------------------------------------------------ */
/*  Configuración del rate limit                                       */
/* ------------------------------------------------------------------ */

const RATE_LIMIT = {
  maxSends: 3, // máximo 3 envíos
  windowMs: 15 * 60 * 1000, // en 15 minutos
  storageKey: "ac-s:contact:rate-limit",
};

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

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

const LogoBadge = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: "16px",
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)"
      : "linear-gradient(135deg, #f2f2f2 0%, #b8b8b8 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.mode === "light" ? "#fff" : "#1e1e1e",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  marginBottom: theme.spacing(2),
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  borderRadius: 999,
  padding: theme.spacing(1.2, 3),
  backgroundColor: theme.palette.text.primary,
  color: theme.palette.background.paper,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.text.primary, 0.9),
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    transform: "translateY(-1px)",
  },
  "&.Mui-disabled": {
    backgroundColor: alpha(theme.palette.text.primary, 0.4),
    color: theme.palette.background.paper,
  },
}));

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

const SUBJECT_OPTIONS = [
  { value: "consulta", label: "Consulta general" },
  { value: "soporte", label: "Soporte técnico" },
  { value: "reporte", label: "Reportar un problema" },
  { value: "sugerencia", label: "Sugerencia o feedback" },
  { value: "colaboracion", label: "Colaboración / prensa" },
  { value: "otro", label: "Otro" },
];

/* ------------------------------------------------------------------ */
/*  Utilidades de rate limit                                           */
/* ------------------------------------------------------------------ */

const readRateLimit = () => {
  try {
    const raw = localStorage.getItem(RATE_LIMIT.storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((ts) => Date.now() - ts < RATE_LIMIT.windowMs);
  } catch {
    return [];
  }
};

const writeRateLimit = (timestamps) => {
  try {
    localStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify(timestamps));
  } catch {
    /* localStorage puede fallar en modo privado */
  }
};

const getRemainingCooldown = () => {
  const timestamps = readRateLimit();
  if (timestamps.length < RATE_LIMIT.maxSends) {
    return { blocked: false, remainingMs: 0, count: timestamps.length };
  }
  const oldest = Math.min(...timestamps);
  const remainingMs = RATE_LIMIT.windowMs - (Date.now() - oldest);
  return {
    blocked: remainingMs > 0,
    remainingMs: Math.max(remainingMs, 0),
    count: timestamps.length,
  };
};

const formatCooldown = (ms) => {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
};

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

const ContactForm = () => {
  const theme = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const [cooldown, setCooldown] = useState(() => getRemainingCooldown());

  /* ---------- Scroll al top ---------- */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  /* Actualizar countdown cada segundo cuando está bloqueado */
  useEffect(() => {
    if (!cooldown.blocked) return;

    const interval = setInterval(() => {
      const next = getRemainingCooldown();
      setCooldown(next);
      if (!next.blocked) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown.blocked]);

  /* ---------- Handlers ---------- */
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = "Ingresá tu nombre";
    else if (form.name.trim().length < 2)
      next.name = "El nombre es demasiado corto";

    if (!form.email.trim()) next.email = "Ingresá tu email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "El email no es válido";

    if (!form.subject) next.subject = "Seleccioná un asunto";

    if (!form.message.trim()) next.message = "Escribí tu mensaje";
    else if (form.message.trim().length < 10)
      next.message = "El mensaje es demasiado corto (mínimo 10 caracteres)";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    /* 1. Rate limit */
    const rl = getRemainingCooldown();
    if (rl.blocked) {
      setCooldown(rl);
      setServerError(
        `Enviaste varios mensajes seguidos. Esperá ${formatCooldown(
          rl.remainingMs,
        )} antes de intentar de nuevo.`,
      );
      return;
    }

    /* 2. Validación */
    if (!validate()) return;

    setSending(true);
    try {
      /* 3. Guardar en Supabase */
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        subject: form.subject,
        message: form.message.trim(),
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      /* 4. Registrar timestamp en rate limit */
      const next = [...readRateLimit(), Date.now()];
      writeRateLimit(next);
      setCooldown(getRemainingCooldown());

      /* 5. Éxito */
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Error enviando formulario de contacto:", err);
      setServerError(
        err?.message ||
          "No pudimos enviar tu mensaje. Intentá de nuevo en unos minutos.",
      );
    } finally {
      setSending(false);
    }
  };

  /* ---------- Vista de éxito ---------- */
  if (sent) {
    return (
      <PremiumPaper elevation={0}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 2,
          }}
        >
          <LogoBadge>
            <Diversity1Icon sx={{ fontSize: 26 }} />
          </LogoBadge>

          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha("#4caf50", 0.1)
                  : alpha("#4caf50", 0.15),
              color: theme.palette.mode === "light" ? "#2e7d32" : "#81c784",
              "& svg": { fontSize: 42 },
              mb: 1,
            }}
          >
            <CheckCircleOutlineOutlinedIcon />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            ¡Mensaje enviado!
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              maxWidth: 380,
              lineHeight: 1.6,
            }}
          >
            Gracias por escribirnos. Te vamos a responder a la brevedad al
            correo que nos dejaste.
          </Typography>

          <PrimaryButton onClick={() => setSent(false)} sx={{ mt: 1 }}>
            Enviar otro mensaje
          </PrimaryButton>
        </Box>
      </PremiumPaper>
    );
  }

  /* ---------- Vista del formulario ---------- */
  const isRateLimited = cooldown.blocked;
  const isSubmitDisabled = sending || isRateLimited;

  return (
    <PremiumPaper elevation={0}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mb: 3,
        }}
      >
        <LogoBadge>
          <Diversity1Icon sx={{ fontSize: 26 }} />
        </LogoBadge>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            mb: 0.5,
          }}
        >
          Contactanos
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Contanos en qué podemos ayudarte y te respondemos a la brevedad
        </Typography>
      </Box>

      {/* Aviso de rate limit */}
      {isRateLimited && (
        <Alert
          severity="warning"
          icon={<TimerOutlinedIcon sx={{ fontSize: 22 }} />}
          sx={{
            mb: 2.5,
            borderRadius: 2.5,
            fontSize: "0.85rem",
            "& .MuiAlert-icon": { color: "inherit" },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
            Demasiados envíos
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
            Podés volver a enviar un mensaje en{" "}
            <strong>{formatCooldown(cooldown.remainingMs)}</strong>.
          </Typography>
        </Alert>
      )}

      {/* Error del servidor */}
      {serverError && (
        <Alert
          severity="error"
          onClose={() => setServerError("")}
          sx={{ mb: 2.5, borderRadius: 2.5, fontSize: "0.85rem" }}
        >
          {serverError}
        </Alert>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Formulario */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <TextField
          fullWidth
          label="Nombre"
          placeholder="Tu nombre"
          value={form.name}
          onChange={handleChange("name")}
          error={!!errors.name}
          helperText={errors.name}
          autoComplete="name"
          disabled={isRateLimited}
          sx={fieldSx(theme)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineOutlinedIcon
                  sx={{ color: "text.disabled", fontSize: 20 }}
                />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          type="email"
          label="Email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={handleChange("email")}
          error={!!errors.email}
          helperText={errors.email}
          autoComplete="email"
          disabled={isRateLimited}
          sx={fieldSx(theme)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon
                  sx={{ color: "text.disabled", fontSize: 20 }}
                />
              </InputAdornment>
            ),
          }}
        />

        <FormControl
          fullWidth
          error={!!errors.subject}
          sx={fieldSx(theme)}
          disabled={isRateLimited}
        >
          <InputLabel id="subject-label">Asunto</InputLabel>
          <Select
            labelId="subject-label"
            label="Asunto"
            value={form.subject}
            onChange={handleChange("subject")}
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
              <em>Seleccioná un asunto</em>
            </MenuItem>
            {SUBJECT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          {errors.subject && (
            <Typography
              variant="caption"
              sx={{
                color: "#d32f2f",
                mt: 0.5,
                ml: 1.75,
                fontSize: "0.75rem",
              }}
            >
              {errors.subject}
            </Typography>
          )}
        </FormControl>

        <TextField
          fullWidth
          multiline
          minRows={5}
          maxRows={10}
          label="Mensaje"
          placeholder="Escribí tu mensaje con el mayor detalle posible…"
          value={form.message}
          onChange={handleChange("message")}
          error={!!errors.message}
          helperText={
            errors.message || `${form.message.length}/1000 caracteres`
          }
          inputProps={{ maxLength: 1000 }}
          disabled={isRateLimited}
          sx={fieldSx(theme)}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ alignSelf: "flex-start", mt: 1.5 }}
              >
                <ChatBubbleOutlineOutlinedIcon
                  sx={{ color: "text.disabled", fontSize: 20 }}
                />
              </InputAdornment>
            ),
          }}
        />

        <PrimaryButton
          type="submit"
          fullWidth
          disabled={isSubmitDisabled}
          startIcon={
            sending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SendOutlinedIcon fontSize="small" />
            )
          }
          sx={{ mt: 0.5 }}
        >
          {sending
            ? "Enviando…"
            : isRateLimited
              ? `Esperá ${formatCooldown(cooldown.remainingMs)}`
              : "Enviar mensaje"}
        </PrimaryButton>

        <Typography
          variant="caption"
          sx={{
            color: "text.disabled",
            fontSize: "0.72rem",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Al enviar, aceptás que te contactemos por email. No compartimos tus
          datos con terceros.
        </Typography>
      </Box>
    </PremiumPaper>
  );
};

export default ContactForm;
