// src/pages/Cookies.jsx
import { Link as MuiLink } from "@mui/material";
import { Link } from "react-router";
import CookieOutlinedIcon from "@mui/icons-material/CookieOutlined";
import LegalPageLayout from "../components/LegalPageLayout";
import { nombrePagina, email } from "../components/datos/pagina";

export default function Cookies() {
  const sections = [
    {
      id: "que-son",
      title: "¿Qué son las cookies?",
      content: (
        <>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu
            dispositivo cuando visitás un sitio web. Sirven para recordar tus
            preferencias, mantener tu sesión activa y entender cómo usás la
            plataforma.
          </p>
          <p>
            Además de cookies, usamos otras tecnologías similares como{" "}
            <strong>localStorage</strong> y <strong>sessionStorage</strong>, que
            cumplen funciones parecidas.
          </p>
        </>
      ),
    },
    {
      id: "tipos",
      title: "Tipos de cookies que usamos",
      content: (
        <>
          <p>
            <strong>1. Cookies técnicas (necesarias)</strong>
          </p>
          <ul>
            <li>Mantener tu sesión iniciada.</li>
            <li>Recordar tus preferencias de tema (claro/oscuro).</li>
            <li>Proteger contra ataques CSRF.</li>
            <li>Balancear la carga del servidor.</li>
          </ul>
          <p>
            Estas cookies son imprescindibles para el funcionamiento de la
            plataforma y no requieren consentimiento.
          </p>

          <p>
            <strong>2. Cookies de preferencias</strong>
          </p>
          <ul>
            <li>Recordar el idioma seleccionado.</li>
            <li>Guardar filtros de búsqueda.</li>
            <li>Mantener el estado de formularios.</li>
          </ul>

          <p>
            <strong>3. Cookies analíticas (opcionales)</strong>
          </p>
          <ul>
            <li>Contar visitas y páginas más vistas.</li>
            <li>Medir el rendimiento de la plataforma.</li>
            <li>Detectar errores y cuellos de botella.</li>
          </ul>
          <p>Estas cookies solo se activan si las aceptás expresamente.</p>

          <p>
            <strong>4. Cookies de terceros</strong>
          </p>
          <ul>
            <li>
              <strong>Supabase:</strong> gestiona la autenticación y la sesión.
            </li>
            <li>
              <strong>Vercel:</strong> hosting y métricas de rendimiento.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "localstorage",
      title: "Uso de localStorage y sessionStorage",
      content: (
        <>
          <p>
            Además de cookies, usamos almacenamiento local del navegador para:
          </p>
          <ul>
            <li>
              <strong>Preferencia de tema</strong> (claro/oscuro) —
              localStorage.
            </li>
            <li>
              <strong>Rate limit del formulario de contacto</strong> —
              localStorage.
            </li>
            <li>
              <strong>Detección de login OAuth</strong> — sessionStorage (se
              borra al cerrar la pestaña).
            </li>
            <li>
              <strong>Caché de géneros y catálogos</strong> — sessionStorage.
            </li>
          </ul>
          <p>
            Esta información nunca se comparte con terceros y se borra cuando
            limpiás los datos del navegador.
          </p>
        </>
      ),
    },
    {
      id: "control",
      title: "Cómo controlar las cookies",
      content: (
        <>
          <p>Podés gestionar o deshabilitar las cookies desde tu navegador:</p>
          <ul>
            <li>
              <strong>Chrome:</strong> Configuración → Privacidad y seguridad →
              Cookies.
            </li>
            <li>
              <strong>Firefox:</strong> Preferencias → Privacidad y seguridad.
            </li>
            <li>
              <strong>Safari:</strong> Preferencias → Privacidad.
            </li>
            <li>
              <strong>Edge:</strong> Configuración → Cookies y permisos del
              sitio.
            </li>
          </ul>
          <p>
            ⚠️ Si deshabilitás las cookies técnicas, algunas funciones de la
            plataforma pueden dejar de funcionar (por ejemplo, mantener la
            sesión iniciada).
          </p>
        </>
      ),
    },
    {
      id: "duracion",
      title: "Duración de las cookies",
      content: (
        <>
          <p>Las cookies que usamos pueden ser:</p>
          <ul>
            <li>
              <strong>De sesión:</strong> se borran al cerrar el navegador.
            </li>
            <li>
              <strong>Persistentes:</strong> permanecen hasta su fecha de
              expiración o hasta que las elimines manualmente. Nuestras cookies
              de sesión duran hasta 7 días.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "cambios",
      title: "Cambios en esta política",
      content: (
        <>
          <p>
            Podemos actualizar esta política si incorporamos nuevas tecnologías
            o si cambia la legislación aplicable. Te notificaremos ante cambios
            sustanciales.
          </p>
        </>
      ),
    },
    {
      id: "contacto",
      title: "Contacto",
      content: (
        <>
          <p>
            Si tenés dudas sobre el uso de cookies, escribinos a{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Política de Cookies"
      subtitle="Qué guardamos en tu navegador y por qué."
      lastUpdated="Enero 2026"
      icon={<CookieOutlinedIcon />}
      summary="Usamos cookies y almacenamiento local para que la plataforma funcione bien y recuerde tus preferencias. Nada de rastreo publicitario ni venta de datos."
      sections={sections}
      relatedLinks={[
        { label: "Términos y Condiciones", to: "/terms" },
        { label: "Política de Privacidad", to: "/privacy" },
        { label: "Contacto", to: "/contact" },
      ]}
    />
  );
}
