import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User from '../models/userMod';
import { ResponseStatus } from '../utils/response-status';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';


interface UserInterface {
    fullname: string;
    username: string;
    email: string;
    password: string;
}

const registerUser = async (req: Request, res: Response) => {
    try {
        const { fullname, username, email, password }: UserInterface = req.body;

        console.log(`Registrando usuario: ${username}, Email: ${email}, Password: ${password}`);

        let user = await User.findOne({ email });
        if (user) {
            console.log(`El usuario con el email ${email} ya existe.`);
            return res.status(ResponseStatus.BAD_REQUEST).json({ msg: 'El usuario ya existe' });
        }

        user = new User({
            fullname,
            username,
            email,
            password 
        });

        await user.save();
        console.log(`Usuario ${username} creado exitosamente.`);

        res.redirect('/login');
    } catch (err) {
        console.error('Error durante el registro:', err);
        res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send('Error del servidor');
    }
};



const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    logger.info(`Inicio de sesión recibido para usuario: ${username}`);

    const user = await User.findOne({ username });

    if (!user) {
      logger.warn(`Login fallido - Usuario no encontrado: ${username}`);
      return res.status(400).json({ message: 'El usuario no existe' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login fallido - Contraseña incorrecta para: ${username}`);
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, userRole: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    logger.info(`Login exitoso para: ${username}`);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.redirect('/');
  } catch (error) {
    logger.error(`Error durante el inicio de sesión: ${error}`);
    res.status(500).send('Error del servidor');
  }
};



/*
//temporal:
const loginUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.body; 

        console.log(`Intento de inicio de sesión con usuario: ${username}`);

        let user = await User.findOne({ username });
        if (!user) {
            console.log(`El usuario ${username} no existe.`);
            return res.status(400).render('login', { message: 'El usuario no existe' });
        }

        console.log(`Inicio de sesión exitoso para: ${username} (verificación de contraseña omitida)`);

        req.session.userId = user._id;
        req.session.username = user.username;
        console.log(`Sesión iniciada para el usuario: ${username}`);

        res.redirect('/'); 
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        res.status(500).send('Error del servidor');
    }
};
*/


const logoutUser = (req: Request, res: Response) => {
    console.log('Indicación para cerrar sesión enviada al cliente.');
    res.cookie('token', '', { expires: new Date(0) });
    res.send(`
        <script>
            alert('Sesión cerrada exitosamente.');
            window.location.href = '/login';
        </script>
    `);
};


const verPerfil = async (req: Request, res: Response) => {
    try {

        const user = await User.findById(req.usuario.userId);

        if (!user) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const { password, ...userWithoutPassword } = user.toObject();
        res.status(200).json(userWithoutPassword);
    } catch (err) {
        console.error('Error al obtener el perfil del usuario:', err);
        res.status(500).send('Error al obtener el perfil del usuario');
    }
};

const getUserId = async (req: Request, res: Response) => {
    try{

        const user = await User.findById(req.usuario.userId).lean();
        //console.log(user);
        res.render('profile', {
            title:"Editar Usuario (admin)",
            customCss:"/public/styles/edituser.css",
            showNavbar: true,
            user
        })
    } catch(err){
        console.log("Error al mostrar usuario", err);
        res.status(ResponseStatus.INTERNAL_SERVER_ERROR).send("Error al mostrar usuario");
    }
    //console.log("funciona");
    //res.status(200).json({ mensaje: "Consulta de usuario por ID realizada" });
};


const editarPerfil = async (req: Request, res: Response) => {
    try {
        const userId = req.usuario?.userId;

        if (!userId) {
            return res.status(400).json({ mensaje: 'No se pudo obtener el ID del usuario del token' });
        }

        const updates = {
            fullname: req.body.fullname,
            username: req.body.username,
            email: req.body.email,
            interests: req.body.interests
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        
        if (!updatedUser) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const { password, ...updatedUserInfo } = updatedUser.toObject();
        res.status(200).json(updatedUserInfo);
    } catch (err) {
        console.error('Error al editar el perfil del usuario:', err);
        res.status(500).send('Error al editar el perfil del usuario');
    }
};


const eliminarUsuario = async (req: Request, res: Response) => {
    try {
        const userId = req.usuario?.userId;

        if (!userId) {
            return res.status(400).json({ mensaje: 'ID del usuario no disponible. Operación no permitida.' });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).send('Usuario eliminado exitosamente');
    } catch (err) {
        console.error('Error al eliminar el usuario:', err);
        res.status(500).send('Error al eliminar el usuario');
    }
};


const actualizarPP = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ mensaje: 'No se proporcionó ningún archivo.' });
    }
      
    const file = req.file as Express.MulterS3.File; 
    try {
        const userId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ mensaje: 'El ID de usuario proporcionado no es válido.' });
        }  
        const profilePictureUrl = file.location; 

        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePicture: profilePictureUrl
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.status(200).json({ mensaje: 'Foto de perfil actualizada con éxito.', profilePicture: profilePictureUrl });
    } catch (err) {
        console.error('Error al actualizar la foto de perfil:', err);
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            error: err.message
        });
    }
};

export {
    loginUser,
    registerUser,
    logoutUser,
    verPerfil,
    editarPerfil,
    eliminarUsuario,
    actualizarPP,
    getUserId
};


