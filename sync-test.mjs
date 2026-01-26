import fetch from 'node-fetch';

// Hacer llamada al procedimiento sincronizar
const response = await fetch('https://3000-i1yo5gokal28hvl6x2y35-cb2ce3b7.us1.manus.computer/api/trpc/planes.sincronizar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
});

const data = await response.json();
console.log('Sincronización completada:', data);
