// src/components/Accordion.jsx
import * as React from "react";
import MuiAccordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";
import { Stack, Box } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

/* ------------------------------------------------------------------ */
/*  Estilos                                                            */
/* ------------------------------------------------------------------ */

/* ---------- Accordion premium (sin sombras duras, radios sutiles) ---------- */
const PremiumAccordion = styled(MuiAccordion)(({ theme }) => ({
  backgroundColor: "transparent",
  backgroundImage: "none",
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "16px !important",
  marginBottom: theme.spacing(1.25),
  overflow: "hidden",
  transition: "border-color 0.2s ease, background-color 0.2s ease",
  "&:before": { display: "none" },
  "&.Mui-expanded": {
    borderColor: alpha(theme.palette.text.primary, 0.15),
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha("#000", 0.015)
        : alpha("#fff", 0.03),
  },
  "&:hover": {
    borderColor: alpha(theme.palette.text.primary, 0.12),
  },
}));

/* ---------- Summary con tipografía consistente ---------- */
const PremiumSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(0.5, 2),
  minHeight: 52,
  "&.Mui-expanded": { minHeight: 52 },
  "& .MuiAccordionSummary-content": {
    margin: theme.spacing(1.25, 0),
    "&.Mui-expanded": { margin: theme.spacing(1.25, 0) },
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    color: theme.palette.text.disabled,
    transition: "transform 0.25s ease, color 0.2s ease",
  },
  "&:hover .MuiAccordionSummary-expandIconWrapper": {
    color: theme.palette.text.primary,
  },
  "& .MuiTypography-root": {
    fontWeight: 600,
    fontSize: "0.9rem",
    letterSpacing: "-0.01em",
    color: theme.palette.text.primary,
  },
}));

/* ---------- Details con espaciado limpio ---------- */
const PremiumDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0.5, 2, 2.5),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

/* ---------- Item de detalle interno ---------- */
const DetailItem = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box
      sx={{
        color: "text.disabled",
        mt: 0.25,
        display: "flex",
        "& svg": { fontSize: 20 },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          color: "text.disabled",
          lineHeight: 1.2,
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 450, wordBreak: "break-word" }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

/* ---------- Lista de items (pago, lugares) sin <p> ---------- */
const ItemList = ({ items, emptyLabel = "Sin datos" }) => {
  if (!items?.length) {
    return (
      <Typography
        variant="body2"
        sx={{ color: "text.disabled", fontStyle: "italic" }}
      >
        {emptyLabel}
      </Typography>
    );
  }
  return (
    <Stack spacing={0.5}>
      {items.map((item) => (
        <Typography key={item.id} variant="body2" sx={{ fontWeight: 450 }}>
          {item.name}
        </Typography>
      ))}
    </Stack>
  );
};

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export default function AccordionUsage({ userData, paymentMethods, places }) {
  const id = React.useId();

  return (
    <div>
      {/* Aspecto */}
      <PremiumAccordion disableGutters>
        <PremiumSummary
          expandIcon={<ExpandMoreIcon fontSize="small" />}
          aria-controls={`${id}-panel1-content`}
          id={`${id}-panel1-header`}
        >
          <Typography component="span">Aspecto</Typography>
        </PremiumSummary>
        <PremiumDetails>
          <Stack spacing={2.2}>
            <DetailItem
              icon={<RadioButtonCheckedOutlinedIcon />}
              label="Color de cabello"
              value={userData.hair || "—"}
            />
            <DetailItem
              icon={<RadioButtonCheckedOutlinedIcon />}
              label="Color de ojos"
              value={userData.eyes || "—"}
            />
            <DetailItem
              icon={<RadioButtonCheckedOutlinedIcon />}
              label="Altura"
              value={userData.height || "—"}
            />
            <DetailItem
              icon={<RadioButtonCheckedOutlinedIcon />}
              label="Edad"
              value={userData.age || "—"}
            />
          </Stack>
        </PremiumDetails>
      </PremiumAccordion>

      {/* Métodos de pago */}
      <PremiumAccordion disableGutters>
        <PremiumSummary
          expandIcon={<ExpandMoreIcon fontSize="small" />}
          aria-controls={`${id}-panel2-content`}
          id={`${id}-panel2-header`}
        >
          <Typography component="span">Métodos de pago</Typography>
        </PremiumSummary>
        <PremiumDetails>
          <Stack spacing={2.2}>
            <DetailItem
              icon={<RadioButtonCheckedOutlinedIcon />}
              label="Método de pago"
              value={
                <ItemList
                  items={paymentMethods}
                  emptyLabel="Sin métodos de pago"
                />
              }
            />
          </Stack>
        </PremiumDetails>
      </PremiumAccordion>

      {/* Lugares de encuentro */}
      <PremiumAccordion disableGutters>
        <PremiumSummary
          expandIcon={<ExpandMoreIcon fontSize="small" />}
          aria-controls={`${id}-panel3-content`}
          id={`${id}-panel3-header`}
        >
          <Typography component="span">Lugares de encuentro</Typography>
        </PremiumSummary>
        <PremiumDetails>
          <Stack spacing={2.2}>
            <DetailItem
              icon={<RadioButtonCheckedOutlinedIcon />}
              label="Lugares"
              value={<ItemList items={places} emptyLabel="Sin lugares" />}
            />
          </Stack>
        </PremiumDetails>
      </PremiumAccordion>
    </div>
  );
}
