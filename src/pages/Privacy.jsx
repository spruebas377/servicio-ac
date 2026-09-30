// src/pages/Privacy.jsx
import { Link as MuiLink } from "@mui/material";
import { Link } from "react-router";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import LegalPageLayout from "../components/LegalPageLayout";
import { nombrePagina, email } from "../components/datos/pagina";

export default function Privacy() {
  const sections = [
    {
      id: "introduccion",
      title: "Introducción",
      content: (
        <>
          <p>
            En {nombrePagina} nos tomamos en serio tu privacidad. Esta política
            explica qué datos recopilamos, cómo los usamos, con quién los
            compartimos y qué derechos tenés sobre ellos.
          </p>
          <p>
            Al usar la Plataforma, aceptás las prácticas descritas en este
            documento.
          </p>
        </>
      ),
    },
    {
      id: "responsable",
      title: "Responsable del tratamiento",
      content: (
        <>
          <p>El responsable del tratamiento de tus datos personales es:</p>
          <ul>
            <li>
              <strong>{nombrePagina}</strong>
            </li>
            <li>
              Email de contacto: <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li>Domicilio: Ciudad Autónoma de Buenos Aires, Argentina</li>
          </ul>
        </>
      ),
    },
    {
      id: "datos",
      title: "Qué datos recopilamos",
      content: (
        <>
          <p>
            <strong>Datos que nos proporcionás directamente:</strong>
          </p>
          <ul>
            <li>Datos de registro: email, contraseña (cifrada).</li>
            <li>
              Datos de perfil: nombre, teléfono, edad, altura, nacionalidad,
              ubicación, género, descripción, foto de perfil.
            </li>
            <li>
              Datos de servicios: servicios que ofrecés, métodos de pago
              aceptados, lugares de encuentro.
            </li>
            <li>Contenido: imágenes, textos y descripciones que publiques.</li>
          </ul>
          <p>
            <strong>Datos que recopilamos automáticamente:</strong>
          </p>
          <ul>
            <li>Dirección IP, tipo de navegador, sistema operativo.</li>
            <li>Páginas visitadas, tiempo de permanencia, clics.</li>
            <li>Fecha y hora de acceso.</li>
          </ul>
        </>
      ),
    },
    {
      id: "finalidad",
      title: "Para qué usamos tus datos",
      content: (
        <>
          <p>Usamos tus datos para:</p>
          <ul>
            <li>Crear y gestionar tu cuenta.</li>
            <li>
              Mostrar tu perfil a otros usuarios (según tu configuración de
              privacidad).
            </li>
            <li>Permitir el contacto entre usuarios interesados.</li>
            <li>Mejorar la plataforma, detectar fallos y prevenir fraudes.</li>
            <li>Enviarte notificaciones relacionadas con el servicio.</li>
            <li>Cumplir con obligaciones legales.</li>
          </ul>
          <p>
            <strong>Nunca</strong> vendemos tus datos personales a terceros ni
            los usamos para fines publicitarios ajenos a la plataforma.
          </p>
        </>
      ),
    },
    {
      id: "base-legal",
      title: "Base legal del tratamiento",
      content: (
        <>
          <p>Tratamos tus datos sobre las siguientes bases legales:</p>
          <ul>
            <li>
              <strong>Consentimiento:</strong> al registrarte y aceptar esta
              política.
            </li>
            <li>
              <strong>Ejecución del contrato:</strong> para prestarte el
              servicio.
            </li>
            <li>
              <strong>Interés legítimo:</strong> para mejorar la plataforma y
              prevenir fraudes.
            </li>
            <li>
              <strong>Obligación legal:</strong> cuando la ley lo requiera.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "compartir",
      title: "Con quién compartimos tus datos",
      content: (
        <>
          <p>Compartimos datos únicamente con:</p>
          <ul>
            <li>
              <strong>Supabase:</strong> proveedor de base de datos y
              almacenamiento (servidores en la UE).
            </li>
            <li>
              <strong>Vercel:</strong> proveedor de hosting de la aplicación.
            </li>
            <li>
              <strong>Otros usuarios:</strong> los datos de tu perfil público
              son visibles para quienes usan la plataforma.
            </li>
            <li>
              <strong>Autoridades:</strong> solo ante requerimiento legal
              formal.
            </li>
          </ul>
          <p>
            Todos nuestros proveedores cumplen con estándares internacionales de
            seguridad y protección de datos.
          </p>
        </>
      ),
    },
    {
      id: "conservacion",
      title: "Cuánto tiempo conservamos tus datos",
      content: (
        <>
          <p>
            Conservamos tus datos mientras tengas una cuenta activa. Si la
            eliminás, borramos tus datos personales en un plazo máximo de 30
            días, salvo aquellos que debamos conservar por obligación legal.
          </p>
        </>
      ),
    },
    {
      id: "derechos",
      title: "Tus derechos",
      content: (
        <>
          <p>Tenés derecho a:</p>
          <ul>
            <li>
              <strong>Acceder</strong> a los datos que tenemos sobre vos.
            </li>
            <li>
              <strong>Rectificar</strong> datos inexactos o incompletos.
            </li>
            <li>
              <strong>Eliminar</strong> tu cuenta y tus datos personales.
            </li>
            <li>
              <strong>Oponerte</strong> al tratamiento en ciertos casos.
            </li>
            <li>
              <strong>Portar</strong> tus datos a otro servicio.
            </li>
            <li>
              <strong>Retirar tu consentimiento</strong> en cualquier momento.
            </li>
          </ul>
          <p>
            Para ejercerlos, escribinos a{" "}
            <a href={`mailto:${email}`}>{email}</a>. Respondemos en un plazo
            máximo de 30 días.
          </p>
        </>
      ),
    },
    {
      id: "seguridad",
      title: "Seguridad de los datos",
      content: (
        <>
          <p>
            Aplicamos medidas técnicas y organizativas razonables para proteger
            tus datos: cifrado en tránsito (HTTPS), contraseñas hasheadas,
            acceso restringido a la base de datos, y auditorías periódicas.
          </p>
          <p>
            Ningún sistema es 100% infalible. Si detectamos una brecha de
            seguridad que te afecte, te lo notificaremos de inmediato.
          </p>
        </>
      ),
    },
    {
      id: "menores",
      title: "Menores de edad",
      content: (
        <>
          <p>
            La Plataforma está destinada exclusivamente a personas mayores de 18
            años. No recopilamos conscientemente datos de menores. Si detectamos
            una cuenta de un menor, la eliminaremos de inmediato.
          </p>
        </>
      ),
    },
    {
      id: "cambios",
      title: "Cambios en esta política",
      content: (
        <>
          <p>
            Podemos actualizar esta política para reflejar cambios legales o de
            servicio. Te notificaremos por email ante cambios sustanciales.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Política de Privacidad"
      subtitle="Cómo cuidamos tus datos personales y qué derechos tenés sobre ellos."
      lastUpdated="Enero 2026"
      icon={<PrivacyTipOutlinedIcon />}
      summary="Tus datos son tuyos. Esta política explica qué recopilamos, para qué, con quién los compartimos y cómo podés controlarlos. Sin letra chica."
      sections={sections}
      relatedLinks={[
        { label: "Términos y Condiciones", to: "/terms" },
        { label: "Política de Cookies", to: "/cookies" },
        { label: "Contacto", to: "/contact" },
      ]}
    />
  );
}
