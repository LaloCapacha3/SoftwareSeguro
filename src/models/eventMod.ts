import mongoose, { Schema } from 'mongoose';
import { IUser } from './userMod';

interface IEvento extends mongoose.Document {
  titulo: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  activo: boolean;
  organizador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  colaboradores: IUser['_id'][]; 
  asistentes: IUser['_id'][]; 
}

const eventoSchema = new mongoose.Schema<IEvento>({
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  activo: {
    type: Boolean,
    required: true,
    default: true 
  },
  organizador: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Usuario' 
  },
  colaboradores: {
    type: [Schema.Types.ObjectId],
    required: false,
    default: [],
    ref: 'Usuario'
  },
  asistentes: {
    type: [Schema.Types.ObjectId],
    required: false,
    default: [],
    ref: 'Usuario' 
  }
});

const Evento = mongoose.model<IEvento>('Evento', eventoSchema);

export default Evento;
