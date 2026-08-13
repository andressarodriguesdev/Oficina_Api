import {api} from './api';
import type { UsuarioCadastro } from '../types';

export async function cadastrarUsuario(
  dados: UsuarioCadastro,
): Promise<void> {
  await api.post('/Auth/register', dados);
}