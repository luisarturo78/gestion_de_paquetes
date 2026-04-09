const express = require('express');
const prisma = require('./lib/prisma'); // El cliente configurado
const app = express();

app.use(express.json());

// GET: Obtener la lista de TODOS los paquetes
app.get('/api/packages', async (req, res) => {
  try {
    // findMany() sin condiciones nos trae toda la tabla
    const packages = await prisma.package.findMany({
      include: {
        versions: true // Incluimos las versiones para ver un resumen útil
      }
    });
    
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno al obtener los paquetes." });
  }
});

// POST: Registrar un nuevo paquete con version y dependencias

app.post('/api/packages', async (req, res) => {
    const {name, description, author, versionNumber, repositoryUrl, dependencies } = req.body;

    try {
      const newPackage = await prisma.package.create({
        data: {
          name,
          description,
          author,
          versions: {
            create: {
              versionNumber,
              repositoryUrl,
              dependencies: {
                create: dependencies || [] // Esto espera un array de { packageId, versionRequirement }
              }
            }
          }
        },
        // Esto le dice a Prisma que nos devuelva todo lo que creo para confirmar
        include: {
          versions: {
            include: {
              dependencies: true
            }
          }
        }
      });
      
      res.status(201).json(newPackage);
    } catch (error) {
      console.error(error);
      if (error.code === 'P2002') {
        return res.status(400).json({ error: "Ese nombre de paquete ya existe"});
      }
      res.status(500).json({ error: "Error interno al crear el paquete."});
    }
});

app.get('/api/packages/:name', async (req, res) => {
  const { name } = req.params;

  try {
    // Buscamos el paquete por nombre y le pedimos a Prisma que traiga sus relaciones
    const pkg = await prisma.package.findUnique({
      where: {
        name: name
      },
      include: {
        versions: {
          include: {
            dependencies:true // Trae las dependencias de cada version.
          }
        }
      }
    });

    // Si el paquete no existe, devolvemos un (404)
    if(!pkg) {
      return res.status(404).json({ error: "Paquete no encontrado"});
    }

    // Si existe, lo devolvemos con status (200) Ok
    res.json(pkg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno al buscar el paquete"});
  }
});


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
})