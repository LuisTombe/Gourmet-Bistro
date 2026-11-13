import test from 'node:test';
import assert from 'node:assert/strict';
import {asCents,calcLines,transitionAllowed,ACTIVE_STATES} from '../services/shared/domain.mjs';
test('PU-01 totales con centavos y snapshot',()=>{
  const o=calcLines([{id_producto:1,nombre:'Agua',cantidad:3,precio:'5.25'},{id_producto:2,nombre:'Menú',cantidad:2,precio:'10.20'}]);
  assert.equal(o.total,36.15);assert.equal(o.lines[0].nombre_producto,'Agua');
});
test('PU-02 cantidades enteras positivas',()=>{
 for(const c of [0,-1,1.5,NaN]) assert.throws(()=>calcLines([{id_producto:1,nombre:'X',cantidad:c,precio:1}]));
});
test('PU-03 precios positivos de máximo 2 decimales',()=>{
  assert.equal(asCents('20.10'),2010);
  for(const p of [0,-2,'abc',1.123]) assert.throws(()=>asCents(p));
});
test('PU-04 máquina de estados por rol',()=>{
  assert.equal(transitionAllowed('Pendiente','En preparación','cocinero'),true);
  assert.equal(transitionAllowed('En preparación','Listo','cocinero'),true);
  assert.equal(transitionAllowed('Listo','Entregado','mesero'),true);
  assert.equal(transitionAllowed('Pendiente','Listo','cocinero'),false);
  assert.equal(transitionAllowed('Listo','Entregado','cocinero'),false);
  assert.equal(transitionAllowed('Entregado','Pendiente','administrador'),false);
});
test('PU-05 roles aceptados según acción',()=>{
  assert.equal(transitionAllowed('Listo','Entregado','administrador'),true);
  assert.equal(transitionAllowed('Listo','Entregado','mesero'),true);
  assert.equal(transitionAllowed('En preparación','Listo','administrador'),false);
  assert.deepEqual(ACTIVE_STATES,['Pendiente','En preparación','Listo']);
});
