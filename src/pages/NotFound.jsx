import React from "react";
import { Link } from "react-router";
const NotFound = () => {
  return (
    <div>
      <h1>404</h1>
      <p>Página no encontrada</p>
      <button>
        <Link to="/">Volver al inicio</Link>
      </button>
    </div>
  );
};

export default NotFound;
