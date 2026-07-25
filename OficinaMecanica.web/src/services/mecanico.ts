import { api } from "./api";

export interface Mecanico {
  id: string;
  nome: string;
  telefone?: string;
  especialidade?: string;
  ativo: boolean;
  oficinaId: string;
}

export interface MecanicoRequest {
  nome: string;
  telefone?: string;
  especialidade?: string;
  oficinaId: string;
}

export async function listMecanicos() {
  return await api.get<Mecanico[]>("/Mecanico");
}

export async function getMecanico(id: string) {
  return await api.get<Mecanico>(`/Mecanico/${id}`);
 
}

export async function createMecanico(data: MecanicoRequest) {
   return await api.post<Mecanico>("/Mecanico", data);
  
}

export async function updateMecanico(
  id: string,
  data: MecanicoRequest
) {
  return await api.put<Mecanico>(
    `/Mecanico/${id}`,
    data
  );
}

export async function deleteMecanico(id: string) {
  await api.delete(`/Mecanico/${id}`);
}


export async function inativarMecanico(id: string) {
  return api.patch(`/Mecanico/${id}/inativar`);
}


export async function reativarMecanico(id: string) {
  return api.patch(`/Mecanico/${id}/reativar`);
}

