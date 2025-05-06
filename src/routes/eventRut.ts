import express from 'express';
import { crearEvento, listarEventos, editarEvento, eliminarEvento, asistirEvento, eliminarAsistente} from '../controllers/eventCont';
import { verificarToken, esAdmin } from '../middlewares/authMid';


const router = express.Router();

/**
 * @swagger
 * /evento:
 *  post:
 *   summary: Crea un nuevo evento
 *   tags: [Eventos]
 *   security:
 *     - bearerAuth: []
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           required:
 *             - nombre
 *             - descripcion
 *             - fechaInicio
 *             - fechaFin
 *           properties:
 *             nombre:
 *               type: string
 *               description: Nombre del evento.
 *             descripcion:
 *               type: string
 *               description: Descripción detallada del evento.
 *             fechaInicio:
 *               type: string
 *               format: date-time
 *               description: Fecha y hora de inicio del evento.
 *             fechaFin:
 *               type: string
 *               format: date-time
 *               description: Fecha y hora de fin del evento.
 *             ubicacion:
 *               type: string
 *               description: Ubicación del evento (opcional).
 *             imagen:
 *               type: string
 *               description: URL de la imagen del evento (opcional).
 *   responses:
 *     201:
 *       description: Evento creado exitosamente.
 *     400:
 *       description: Datos inválidos en la solicitud.
 *     401:
 *       description: No autorizado, token inválido o no proporcionado.
 *   description: Permite a los usuarios autenticados crear un nuevo evento, proporcionando detalles como el nombre, descripción, fechas y ubicación del evento.
 */
router.post('/evento', verificarToken, crearEvento);

/**
 * @swagger
 * /eventos:
 *   get:
 *     summary: Lista todos los eventos
 *     description: Obtiene una lista de todos los eventos disponibles. Requiere autenticación.
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Una lista de eventos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evento'
 *       401:
 *         description: Usuario no autenticado o token no válido.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/eventos', verificarToken, listarEventos);

/**
 * @swagger
 * /eventos/{id}:
 *  put:
 *   summary: Edita un evento existente
 *   tags: [Eventos]
 *   security:
 *     - bearerAuth: []
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: ID del evento a editar.
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *               description: Nombre actualizado del evento.
 *             descripcion:
 *               type: string
 *               description: Descripción actualizada del evento.
 *             fechaInicio:
 *               type: string
 *               format: date-time
 *               description: Fecha y hora de inicio actualizadas del evento.
 *             fechaFin:
 *               type: string
 *               format: date-time
 *               description: Fecha y hora de fin actualizadas del evento.
 *             ubicacion:
 *               type: string
 *               description: Ubicación actualizada del evento.
 *             imagen:
 *               type: string
 *               description: URL de la imagen actualizada del evento.
 *   responses:
 *     200:
 *       description: Evento editado exitosamente.
 *     400:
 *       description: Datos inválidos en la solicitud.
 *     401:
 *       description: No autorizado, token inválido o no proporcionado.
 *     404:
 *       description: Evento no encontrado.
 *   description: Permite a los usuarios autenticados editar un evento proporcionando un ID válido y los datos actualizados del evento. Todos los campos son opcionales, pero al menos uno debe ser proporcionado para la actualización.
 */
router.put('/eventos/:id', verificarToken, editarEvento);

/**
 * @swagger
 * /eventos/{id}:
 *  delete:
 *   summary: Elimina un evento específico
 *   tags: [Eventos]
 *   security:
 *     - bearerAuth: []
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: ID del evento a eliminar.
 *   responses:
 *     200:
 *       description: Evento eliminado exitosamente.
 *     401:
 *       description: No autorizado, token inválido o no proporcionado.
 *     404:
 *       description: Evento no encontrado.
 *   description: Permite a los usuarios autenticados eliminar un evento proporcionando un ID válido. Esta acción es irreversible.
 */
router.delete('/eventos/:id', verificarToken, esAdmin, eliminarEvento); 

/**
 * @swagger
 * /eventos/{id}/asistente:
 *  post:
 *   summary: Inscribirse o confirmar asistencia a un evento
 *   tags: [Eventos]
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: ID del evento al que el usuario desea inscribirse o confirmar asistencia.
 *   requestBody:
 *     required: false
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             usuarioId:
 *               type: string
 *               description: ID opcional del usuario que se inscribe o confirma asistencia, si es diferente del usuario autenticado.
 *   responses:
 *     200:
 *       description: Inscripción o confirmación de asistencia realizada exitosamente.
 *     400:
 *       description: Datos inválidos en la solicitud.
 *     404:
 *       description: Evento no encontrado.
 *   description: Permite a los usuarios inscribirse o confirmar asistencia a un evento específico. Este endpoint puede requerir que el usuario esté autenticado.
 */
router.post('/eventos/:id/asistente', verificarToken, asistirEvento);

/**
 * @swagger
 * /eventos/{id}/inscripciones:
 *  delete:
 *   summary: Elimina la inscripción de un usuario a un evento
 *   tags: [Eventos]
 *   security:
 *     - bearerAuth: []
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: ID del evento del cual se quiere eliminar una inscripción.
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             usuarioId:
 *               type: string
 *               description: ID del usuario cuya inscripción se desea eliminar.
 *   responses:
 *     200:
 *       description: Inscripción eliminada exitosamente.
 *     400:
 *       description: Solicitud inválida, falta ID de usuario.
 *     401:
 *       description: No autorizado, token inválido o no proporcionado.
 *     404:
 *       description: Evento o usuario no encontrado.
 *   description: Permite a los usuarios autenticados eliminar la inscripción de un usuario a un evento específico, mediante el ID del evento y el ID del usuario.
 */
router.delete('/eventos/:id/inscripciones', verificarToken, esAdmin, eliminarAsistente);



export default router;
