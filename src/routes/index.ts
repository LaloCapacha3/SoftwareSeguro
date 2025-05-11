import express, { Request, Response } from 'express';
import authRoutes from './authRut';
import adminRoutes from './adminRut';
import { verificarToken, establecerContextoAutenticacion } from '../middlewares/authMid';
import eventRoutes from './eventRut'; 
import cookieParser  from 'cookie-parser';
import User from '../models/userMod';
import Evento from '../models/eventMod';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';


declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}


const router = express.Router();
router.use(cookieParser());
router.use(establecerContextoAutenticacion);
router.use(authRoutes);
router.use(eventRoutes);
router.use(adminRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Muestra la página de inicio.
 *     description: Devuelve la página de inicio HTML con la lista de eventos en línea disponibles.
 *     tags: [HTML]
 *     responses:
 *       200:
 *         description: Página de inicio HTML.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/', async (req: Request, res: Response) => {
  console.log('Datos de res.locals:', res.locals);
  const isAdmin = res.locals.role === 'admin';
  const users = await User.find({}).lean();
  let eventos = [];

  if(res.locals.userLoggedIn){
    const userId = res.locals.userId; 

    eventos = await Evento.aggregate([
      { $match: { organizador: new ObjectId(userId) } }, 
      {
        $lookup: {
          from: "users",
          let: { colaboradorIds: "$colaboradores" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", { $map: { input: "$$colaboradorIds", as: "colaboradorId", in: { $toObjectId: "$$colaboradorId" } } }] } } }
          ],
          as: "infoColaboradores"
        }
      },
      {
        $project: {
          _id: 1,
          titulo: 1,
          descripcion: 1,
          fechaInicio: 1,
          fechaFin: 1,
          activo: 1,
          organizador: 1,
          colaboradores: "$infoColaboradores.fullname"
        }
      }
    ]);
  }

  res.render('home', {
      title: 'Eventos en línea',
      customCss: '/public/styles/home.css',
      showNavbar: true,
      userLoggedIn: res.locals.userLoggedIn,
      is_Admin: isAdmin,
      username: res.locals.username || 'Invitado',
      events: eventos,
      users
  });
});


/**
 * @swagger
 * /register:
 *   get:
 *     summary: Muestra la página de registro.
 *     description: Devuelve la página de registro HTML, permitiendo a los nuevos usuarios crear una cuenta.
 *     tags: [HTML]
 *     responses:
 *       200:
 *         description: Página de registro HTML.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/Register', (req: Request, res: Response) => {
  res.render('register', {
    title: 'Página de Registro',
    customCss: '/public/styles/login.css',
    showNavbar: false 
  });
});

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Muestra la página de inicio de sesión.
 *     description: Devuelve la página de inicio de sesión HTML, permitiendo a los usuarios existentes acceder a su cuenta.
 *     tags: [HTML]
 *     responses:
 *       200:
 *         description: Página de inicio de sesión HTML.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/Login', (req: Request, res: Response) => {
  res.render('login', {
    title: 'Página de Inicio de Sesión',
    customCss: "/public/styles/login.css",
    showNavbar: false 
  });
});


/**
 * @swagger
 * /perfil/editar:
 *   get:
 *     summary: Muestra la página para editar el perfil de usuario.
 *     description: Devuelve la página de edición del perfil HTML, accesible solo para usuarios autenticados.
 *     tags: [HTML]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Página de edición del perfil HTML.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: No autenticado. Usuario no ha proporcionado un token válido o no está logueado.
 */
/*router.get('/Perfil', verificarToken, (req: Request, res: Response) => { //no sirve aun es un dummy
  const isAdmin = res.locals.role === 'admin';
  res.render('profile', {
      title: 'Perfil',
      showNavbar: true,
      customCss: "/public/styles/style.css",
      userLoggedIn: res.locals.userLoggedIn,
      is_Admin: isAdmin,
      username: res.locals.username
  });
});

router.get('/Perfil/Editar', verificarToken, (req: Request, res: Response) => { //no sirve aun es un dummy
  const isAdmin = res.locals.role === 'admin';
  res.render('user_edit', {
      title: 'Editar Perfil',
      showNavbar: true,
      userLoggedIn: res.locals.userLoggedIn,
      is_Admin: isAdmin,
      username: res.locals.username 
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Muestra la página de usuarios.
 *     description: Devuelve la página de usuarios HTML, donde se pueden ver los usuarios registrados. Este endpoint es un dummy y puede no estar funcional.
 *     tags: [HTML]
 *     responses:
 *       200:
 *         description: Página de usuarios HTML.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
/*router.get('/Users', (req: Request, res: Response) => { //no sirve aun es un dummy
  res.render('users', {
      title: 'Página de usuarios',
      showNavbar: true 
  });
});*/

/**
 * @swagger
 * /userChats:
 *   get:
 *     summary: Muestra la página con la lista de usuarios para chats.
 *     description: Devuelve una página HTML con una lista de todos los usuarios registrados, permitiendo iniciar chats privados.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Página HTML con la lista de usuarios disponibles para chat.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: Acceso no autorizado, token no proporcionado o inválido.
 *       500:
 *         description: Error del servidor al intentar recuperar la lista de usuarios.
 */
router.get('/userChats', verificarToken, async (req: Request, res: Response) => {
  const users = await User.find({}).lean();
  res.render('prevchat', {
    title: 'Networking',
    customCss:"/public/styles/listusers.css",
    showNavbar: true,
    userLoggedIn: res.locals.userLoggedIn,
    users    
  })
})

/**
 * @swagger
 * /foro:
 *   get:
 *     summary: Muestra la página del foro.
 *     description: Devuelve la página del foro HTML, permitiendo a los usuarios visualizar y participar en discusiones del foro.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Página del foro HTML cargada correctamente.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: Acceso no autorizado si el usuario no está autenticado.
 */
router.get('/foro', verificarToken, async (req: Request, res: Response) => {
  const users = await User.find({}).lean();
  res.render('foro', {
    title: 'Foro',
    customCss:"/public/styles/foro.css",
    showNavbar: true,
    userLoggedIn: res.locals.userLoggedIn,
    userId: res.locals.userId,
    users    
  })
})

/**
 * @swagger
 * /edit/{id}:
 *   get:
 *     summary: Muestra la página de edición para un evento específico.
 *     description: Devuelve la página de edición de eventos HTML, permitiendo a los administradores modificar la información de un evento existente.
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único del evento que se va a editar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Página de edición de eventos HTML cargada correctamente con datos del evento a editar.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       404:
 *         description: No se encontró el evento solicitado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/edit/:id', async (req, res) => {
  try {
      const eventId = req.params.id;
      const event = await Evento.findById(eventId).lean();
      const users = await User.find({}).lean(); 

      if (!event) {
          res.status(404).send('Evento no encontrado');
          return;
      }
      const eventForTemplate = {
        ...event,
        fechaInicio: event.fechaInicio ? event.fechaInicio.toISOString().split('T')[0] : '',
        fechaFin: event.fechaFin ? event.fechaFin.toISOString().split('T')[0] : '',
      };

      res.render('event_edit', {
          title: 'Editar Evento',
          customCss: '/public/styles/evenedits.css',
          showNavbar: true,
          event: eventForTemplate,
          users   
      });
  } catch (err) {
      console.error('Error al obtener datos:', err);
      res.status(500).send('Error interno del servidor');
  }
});



export default router;
