import { useEffect, useState } from 'react';

import { obterMinhaOficina } from '../services/oficinaService';

/**
 * Nome da oficina cadastrada no banco, compartilhado entre telas (menu lateral,
 * título da aba...). Busca uma vez por sessão e reaproveita; se o usuário
 * trocar (outro token), busca de novo.
 */

interface Estado {
  nome: string | null;
  carregado: boolean;
}

const TOKEN_KEY = 'accessToken';

let estado: Estado = { nome: null, carregado: false };
let tokenDoCache: string | null = null;
let carregando: Promise<void> | null = null;

const ouvintes = new Set<() => void>();

function tokenAtual(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function publicar(novo: Estado) {
  estado = novo;
  ouvintes.forEach((avisar) => avisar());
}

async function carregar() {
  if (carregando) return carregando;

  const tokenDaBusca = tokenAtual();

  carregando = obterMinhaOficina()
    .then((oficina) => {
      tokenDoCache = tokenDaBusca;
      publicar({ nome: oficina.nome, carregado: true });
    })
    .catch(() => {
      // Sem oficina (404) ou erro: o menu mostra um texto neutro.
      tokenDoCache = tokenDaBusca;
      publicar({ nome: null, carregado: true });
    })
    .finally(() => {
      carregando = null;
    });

  return carregando;
}

/** Chamar depois de salvar os dados da oficina para o menu atualizar na hora. */
export function atualizarNomeOficina(nome: string) {
  tokenDoCache = tokenAtual();
  publicar({ nome, carregado: true });
}

export function useNomeOficina(): Estado {
  const [, forcarRender] = useState(0);

  useEffect(() => {
    const aoMudar = () => forcarRender((n) => n + 1);

    ouvintes.add(aoMudar);

    // Outro usuário entrou desde a última busca: descarta o cache.
    if (estado.carregado && tokenDoCache !== tokenAtual()) {
      estado = { nome: null, carregado: false };
    }

    if (!estado.carregado && tokenAtual()) {
      void carregar();
    }

    return () => {
      ouvintes.delete(aoMudar);
    };
  }, []);

  return estado;
}
