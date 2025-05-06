import express from 'express';
import { loginUser, registerUser, logoutUser, editarPerfil, eliminarUsuario, verPerfil, actualizarPP,getUserId} from '../controllers/authCont'; 
import { verificarToken, esAdmin } from '../middlewares/authMid'; 
import { uploadS3Middleware } from '../middlewares/userMid';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import swaggerConfig from './../../swagger.config.json';
import passport from '../middlewares/passport-config';
import jwt from 'jsonwebtoken'; 
const router = express.Router();
const swaggerDocs = swaggerJsDoc(swaggerConfig);
import { IUser } from "../models/userMod";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}


router.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
/**
 * @swagger
 * /register:
 *  post:
 *   summary: Registra un nuevo usuario
 *   tags: [Autenticacion]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           required:
 *             - nombre
 *             - email
 *             - password
 *           properties:
 *             nombre:
 *               type: string
 *               description: Nombre completo del usuario
 *             email:
 *               type: string
 *               format: email
 *               description: Correo electrónico del usuario
 *             password:
 *               type: string
 *               format: password
 *               description: Contraseña del usuario
 *   responses:
 *     201:
 *       description: Usuario registrado exitosamente.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: El ID único del usuario registrado
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario registrado
 *     400:
 *       description: Datos inválidos suministrados en la solicitud.
 *     409:
 *       description: El usuario ya existe.
 *   description: Permite registrar un nuevo usuario en el sistema.
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /login:
 *  post:
 *   summary: Inicia sesión de usuario
 *   tags: [Autenticacion]
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: Correo electrónico del usuario
 *             password:
 *               type: string
 *               format: password
 *               description: Contraseña del usuario
 *   responses:
 *     200:
 *       description: Inicio de sesión exitoso, devuelve el token de acceso.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de acceso JWT
 *     400:
 *       description: Petición inválida, falta correo electrónico o contraseña.
 *     401:
 *       description: Credenciales no válidas.
 *   description: Permite a los usuarios iniciar sesión y obtener un token de acceso.
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /logout:
 *  get:
 *   summary: Cierra la sesión del usuario
 *   tags: [Autenticacion]
 *   security:
 *     - bearerAuth: []
 *   responses:
 *     200:
 *       description: Sesión cerrada exitosamente.
 *     401:
 *       description: No autorizado, token inválido o no proporcionado.
 *   description: Cierra la sesión del usuario y revoca el token de acceso.
 */
router.get('/logout', verificarToken, logoutUser);


router.get('/me', verificarToken, verPerfil); //no sirve

/**
 * @swagger
 * /miperfil:
 *   get:
 *     summary: Muestra la página de perfil del usuario.
 *     description: Devuelve la página del perfil del usuario, permitiendo al usuario visualizar y actualizar su información personal.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Página de perfil del usuario HTML cargada correctamente.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: Acceso no autorizado si el usuario no está autenticado.
 */
router.get('/miperfil', verificarToken, getUserId);


router.put('/usuarios/actualizar/:userId', verificarToken, editarPerfil);//no sirve

/**
 * @swagger
 * /delete:
 *  delete:
 *   summary: Elimina el usuario autenticado
 *   tags: [Usuarios]
 *   security:
 *     - bearerAuth: []
 *   responses:
 *     200:
 *       description: Usuario eliminado exitosamente.
 *     401:
 *       description: No autorizado, token inválido o no proporcionado.
 *     404:
 *       description: Usuario no encontrado.
 *     500:
 *       description: Error al eliminar el usuario.
 *   description: Elimina el perfil del usuario basado en el token de autenticación proporcionado. Esta acción es irreversible.
 */
router.delete('/delete', verificarToken, eliminarUsuario);

/**
 * @swagger
 * /perfil/foto/:userid:
 *   post:
 *     summary: Sube la foto de perfil del usuario.
 *     description: Permite a un usuario subir una nueva foto de perfil, la cual se guarda en AWS S3. Requiere autenticación.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen para subir como foto de perfil.
 *     responses:
 *       200:
 *         description: Foto de perfil subida con éxito. Devuelve la URL de la nueva foto de perfil.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Foto de perfil subida con éxito.
 *                 fileUrl:
 *                   type: string
 *                   example: https://example-bucket.s3.amazonaws.com/nombre-del-archivo.jpg
 *       400:
 *         description: Error en la solicitud, como falta del archivo.
 *       401:
 *         description: No autenticado. Token no proporcionado o inválido.
 *       403:
 *         description: No autorizado. El usuario no tiene permisos para realizar esta acción.
 */
router.post('/perfil/foto/:userId', verificarToken, uploadS3Middleware, actualizarPP);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Inicio de sesión con Google
 *     description: Redirige al usuario a la pantalla de autenticización de Google.
 *     tags: [Autenticacion]
 *     responses:
 *       302:
 *         description: Redireccionamiento a Google para la autenticación.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /google/callback:
 *   get:
 *     summary: Callback de autenticación de Google
 *     description: Endpoint al que Google redirige tras una autenticación exitosa. Gestiona la creación del token JWT para el usuario y establece una cookie de sesión.
 *     tags: [Autenticacion]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: El código de autorización proporcionado por Google.
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *         required: false
 *         description: El ámbito de los permisos otorgados por el usuario.
 *       - in: query
 *         name: authuser
 *         schema:
 *           type: string
 *         required: false
 *         description: El número de cuenta del usuario si tienen varias cuentas de Google.
 *       - in: query
 *         name: prompt
 *         schema:
 *           type: string
 *         required: false
 *         description: Indica si Google ha requerido al usuario que se reautentique y otorgue de nuevo los permisos.
 *     responses:
 *       302:
 *         description: Redireccionamiento a la página principal con el usuario autenticado.
 *       400:
 *         description: Autenticación fallida, redireccionamiento a la página de login.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
  try {
      if (req.user) {
          const user = req.user;
          const token = jwt.sign(
              { userId: user._id, username: user.username }, 
              process.env.JWT_SECRET,
              { expiresIn: '1h' }
          );
          res.cookie('token', token, { httpOnly: true, secure: true });
          res.locals.userLoggedIn = true;
          res.locals.username = user.username;  
          res.redirect('/');
      } else {
          res.redirect('/login');
      }
  } catch (error) {
      console.error('Error durante la autenticación de Google:', error);
      res.status(500).send('Error del servidor');
  }
});







export default router;