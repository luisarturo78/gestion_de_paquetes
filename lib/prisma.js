const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

// 1. Creamos una conexión nativa usando la URL de .env
const pool = new Pool({ 
  connectionString: process.env.DATABSE_URL="postgresql://postgres:30211480Lg@localhost:5432/gestor_paqueteria?schema=public"
 
});

// 2. Envolvemos esa conexión en el Adaptador de Prisma
const adapter = new PrismaPg(pool);

// 3. Le pasamos el adaptador a Prisma (¡Justo lo que nos pedía el error!)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;