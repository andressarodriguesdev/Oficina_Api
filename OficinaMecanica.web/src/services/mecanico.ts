import { api } from "./api";

import type { Mecanico } from "../types";

export interface MecanicoRequest {
  nome: string;
  telefone?: string;
  especialidade?: string;

}

export async function listMecanico() {
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

export interface CriarAcessoRequest {
  email: string;
  senha: string;
}

export async function criarAcessoMecanico(
  id: string,
  data: CriarAcessoRequest
) {
  await api.post(`/Mecanico/${id}/criar-acesso`, data);
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

