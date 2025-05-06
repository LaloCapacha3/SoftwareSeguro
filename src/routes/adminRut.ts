import express from 'express';
import { getUsers, getUserById, updateUserById, deleteUserById } from '../controllers/adminCont'; 
import { verificarToken, esAdmin } from '../middlewares/authMid'; 


const router = express.Router();


/**
 * @swagger
 * /usersLists:
 *   get:
 *     summary: Lista todos los usuarios
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/usersLists', verificarToken, esAdmin, getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del usuario
 *     responses:
 *       200:
 *         description: Detalles del usuario
 */
router.get('/users/:id', verificarToken, esAdmin, getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza un usuario por su ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/users/update/:id', verificarToken, esAdmin, updateUserById);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario por su ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.delete('/users/delete/:id', verificarToken, esAdmin, deleteUserById)

export default router;
