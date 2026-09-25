// src/pages/Contact.jsx
import { Box } from "@mui/material";
import ContactForm from "../components/ContactForm";

export default function Contact() {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <ContactForm />
    </Box>
  );
}
