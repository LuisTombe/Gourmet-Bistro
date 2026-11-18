/** Efecto opcional y ligero para la pantalla de acceso; no añadirlo a tablas ni cocina. */
import React from 'react';
import './ambient-twinkle.css';
export function AmbientTwinkle(){
  return <div aria-hidden="true" className="gb-twinkle-layer"><i/><i/><i/><i/><i/><i/></div>;
}
