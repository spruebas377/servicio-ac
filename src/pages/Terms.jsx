// src/pages/Terms.jsx
import { Link as MuiLink } from "@mui/material";
import { Link } from "react-router";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LegalPageLayout from "../components/LegalPageLayout";
import { nombrePagina, email } from "../components/datos/pagina";

export default function Terms() {
  const sections = [
    {
      id: "aceptacion",
      title: "Aceptación de los términos",
      content: (
        <>
          <p>
            Al acceder y utilizar {nombrePagina} (en adelante, "la Plataforma"),
            aceptás quedar vinculado por estos Términos y Condiciones. Si no
            estás de acuerdo con alguna parte, te pedimos que no utilices el
            servicio.
          </p>
          <p>
            Nos reservamos el derecho de actualizar estos términos. Los cambios
            entran en vigencia desde su publicación y el uso continuado implica
            su aceptación.
          </p>
        </>
      ),
    },
    {
      id: "descripcion",
      title: "Descripción del servicio",
      content: (
        <>
          <p>
            {nombrePagina} es una plataforma digital que permite a los usuarios
            crear perfiles, publicar información personal y de servicios, y
            conectar con otras personas de forma directa.
          </p>
          <p>
            El servicio se presta "tal cual está" y puede modificarse,
            suspenderse o discontinuarse en cualquier momento, sin previo aviso.
          </p>
        </>
      ),
    },
    {
      id: "registro",
      title: "Registro y cuenta de usuario",
      content: (
        <>
          <p>
            Para usar ciertas funciones debés crear una cuenta. Al hacerlo, te
            comprometés a:
          </p>
          <ul>
            <li>Proporcionar información veraz, exacta y actualizada.</li>
            <li>Mantener la confidencialidad de tu contraseña.</li>
            <li>
              Notificarnos de inmediato cualquier uso no autorizado de tu
              cuenta.
            </li>
            <li>Ser mayor de 18 años para registrarte y usar la plataforma.</li>
          </ul>
          <p>
            Sos el único responsable de toda actividad que ocurra bajo tu
            cuenta. Nos reservamos el derecho de suspender o eliminar cuentas
            que incumplan estas condiciones.
          </p>
        </>
      ),
    },
    {
      id: "conducta",
      title: "Conducta del usuario",
      content: (
        <>
          <p>Al usar la Plataforma, te comprometés a NO:</p>
          <ul>
            <li>Publicar contenido ilegal, difamatorio, obsceno o violento.</li>
            <li>Suplantar la identidad de otra persona o entidad.</li>
            <li>Utilizar la plataforma para fines fraudulentos o de acoso.</li>
            <li>Publicar información falsa o engañosa sobre tus servicios.</li>
            <li>
              Intentar vulnerar la seguridad de la plataforma o de otros
              usuarios.
            </li>
            <li>Recopilar datos de otros usuarios sin su consentimiento.</li>
          </ul>
          <p>
            El incumplimiento puede derivar en la suspensión inmediata de tu
            cuenta y, en casos graves, en acciones legales.
          </p>
        </>
      ),
    },
    {
      id: "contenido",
      title: "Contenido del usuario",
      content: (
        <>
          <p>
            Sos el único responsable del contenido que publiques (textos,
            imágenes, datos de contacto, etc.). Al subir contenido, nos otorgás
            una licencia no exclusiva, mundial y libre de regalías para
            almacenarlo, mostrarlo y distribuirlo dentro de la Plataforma.
          </p>
          <p>
            Nos reservamos el derecho de eliminar cualquier contenido que
            consideremos inapropiado, sin previo aviso.
          </p>
        </>
      ),
    },
    {
      id: "privacidad",
      title: "Privacidad y datos personales",
      content: (
        <>
          <p>
            El tratamiento de tus datos personales se rige por nuestra{" "}
            <MuiLink
              component={Link}
              to="/privacy"
              sx={{ color: "inherit", fontWeight: 600 }}
            >
              Política de Privacidad
            </MuiLink>
            , que forma parte integrante de estos términos.
          </p>
        </>
      ),
    },
    {
      id: "propiedad",
      title: "Propiedad intelectual",
      content: (
        <>
          <p>
            Todos los elementos de la Plataforma (marca, logo, diseño, código
            fuente, textos institucionales, etc.) son propiedad de
            {nombrePagina} o de sus licenciantes, y están protegidos por las
            leyes de propiedad intelectual.
          </p>
          <p>
            No podés copiar, modificar, distribuir, vender o explotar
            comercialmente ningún elemento sin autorización previa por escrito.
          </p>
        </>
      ),
    },
    {
      id: "responsabilidad",
      title: "Limitación de responsabilidad",
      content: (
        <>
          <p>
            {nombrePagina} actúa como intermediario tecnológico entre usuarios.
            No participamos en las interacciones entre ellos ni garantizamos la
            veracidad de los perfiles, la calidad de los servicios ofrecidos ni
            el cumplimiento de los acuerdos alcanzados.
          </p>
          <p>
            En la máxima medida permitida por la ley, no seremos responsables
            por daños indirectos, incidentales, especiales o consecuentes
            derivados del uso o la imposibilidad de uso de la Plataforma.
          </p>
        </>
      ),
    },
    {
      id: "modificaciones",
      title: "Modificaciones del servicio",
      content: (
        <>
          <p>
            Nos reservamos el derecho de modificar, suspender o discontinuar
            total o parcialmente el servicio en cualquier momento, sin
            responsabilidad frente a vos o terceros.
          </p>
        </>
      ),
    },
    {
      id: "ley",
      title: "Ley aplicable y jurisdicción",
      content: (
        <>
          <p>
            Estos términos se rigen por las leyes de la República Argentina.
            Cualquier controversia se someterá a la jurisdicción de los
            tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
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
            Por cualquier consulta relacionada con estos términos, escribinos a{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Términos y Condiciones"
      subtitle={`Las reglas claras para usar ${nombrePagina} con confianza.`}
      lastUpdated="Enero 2026"
      icon={<GavelOutlinedIcon />}
      summary={`Estos términos describen cómo podés usar ${nombrePagina}, qué
      esperamos de vos como usuario y qué podés esperar de nosotros. Los
      escribimos en lenguaje claro para que se entiendan sin ser abogado.`}
      sections={sections}
      relatedLinks={[
        { label: "Política de Privacidad", to: "/privacy" },
        { label: "Política de Cookies", to: "/cookies" },
        { label: "Contacto", to: "/contact" },
      ]}
    />
  );
}
