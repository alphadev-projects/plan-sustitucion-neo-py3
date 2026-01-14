import { getDb } from '../server/db.ts';
import { createUsuarioLocal } from '../server/db.ts';
import bcrypt from 'bcrypt';

const db = await getDb();

const usuario = 'alexisrobledo';
const contraseña = '4225';
const nombre = 'Alexis Robledo';
const email = 'admin@system.local';

const hashedPassword = await bcrypt.hash(contraseña, 10);

try {
  const result = await createUsuarioLocal({
    usuario,
    contraseña: hashedPassword,
    nombre,
    email,
    role: 'admin',
    activo: 1,
  });
  console.log('✓ Usuario creado:', result);
} catch (error) {
  console.error('Error:', error);
}

process.exit(0);
