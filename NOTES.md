# Notas de trabalho

## Preferências do usuário
- Idioma: português, sempre.
- Nível: confortável com C#/EF Core. Não explicar básico de DI, camadas ou sintaxe.
- Formato que funciona: afirmação → evidência no código real (`arquivo.cs:linha`) → consequência comercial.

## Estado do workspace
- `MISSION.md` — preenchida na sessão 1.
- `GLOSSARY.md` — **ainda não criado de propósito.** Os termos (tenant, stamp, tenant resolution, noisy neighbor) foram introduzidos na referência mas Daniel ainda não demonstrou usá-los. Promover ao glossário quando ele usar corretamente numa conversa.
- Componentes em `assets/`: `lesson.css` (base de todas as páginas), `quiz.js` (prática de recuperação). Reutilizar sempre; só criar componente novo se for genuinamente reaproveitável.

## Achados no codebase (sessão 1, verificados)
Servem de matéria-prima para lições futuras — não são para corrigir sem ele pedir:
- Sem autenticação. `Program.cs:66` tem `UseAuthorization()` sem `UseAuthentication()`, e nenhum `[Authorize]` no projeto.
- `Program.cs:18` — `AllowAnyOrigin()`.
- `Program.cs:71` — bloco `AddCors` morto, depois de `app.Run()`. Nunca executa.
- `OficinaConstants.cs:5` — GUID de oficina fixo em código; usado por `ClienteAppService` e `MecanicoAppService`.
- Nenhum repositório filtra por `OficinaId`. `ClienteRepository.cs:27`, `OrdemServicoRepository.cs:92`, `MecanicoRepository.cs:19`.
- `appsettings.json:10` — senha do Postgres em texto plano e versionada.
- `source/repos/OficinaMecanica/` — cópia duplicada do projeto dentro do próprio repo.
- Pastas `obj/` versionadas apesar do `.gitignore` listá-las (foram commitadas antes do ignore).
- Domínio lança `throw new Exception` genérico em todas as regras de `OrdemServico`.

## Estado em 2026-08-03: sprint 1 completo, aguardando commit

Rename total OficinaMecanica → GarageManager executado por completo (backend +
frontend), localizado para Malta (EUR, +356, inglês). 749 arquivos alterados,
**nada commitado ainda** — usuário pediu para revisar o diff antes de decidir.
Revisão feita: máquina de estados de JobCard verificada guarda-por-guarda contra
o original, build e typecheck 100% limpos, bug conhecido do Approved sumindo do
financeiro preservado de propósito (correção é sprint 4).

Sprints 0 e 1 de `plan/sprints.html` estão de fato prontos — as checkboxes do
tracker são client-side (localStorage), então não refletem isso automaticamente;
o usuário precisa marcá-las manualmente ou eu preciso confirmar ao reabrir.

Pendências levantadas na sessão anterior e ainda não respondidas:
- Se quer os dois ADRs propostos (instalação dedicada por oficina + vocabulário
  britânico) escritos em `docs/adr/`.
- Se decide commitar o diff do sprint 1 como está.

Próximo passo do plano: sprint 2 (autenticação e perímetro) — `Login.tsx` ainda
autentica com `setTimeout`, `/api/finance` continua aberto sem `[Authorize]`.

## Sequência provável de lições
1. ✅ Dois isolamentos que parecem um só — topologia vs. autorização.
2. ✅ Quem realmente usa o sistema — os quatro atores, antes de escrever auth.
3. Tirar o tenant do código-fonte — instalar oficina nova sem recompilar.
4. Custo de frota: migrations e provisionamento automatizados.
5. Configuração vs. código — o que customizar por tipo de oficina sem forkar.

## Achado da sessão 2: o quarto ator
O README lista "link de aprovação para cliente" como próxima evolução, e
`POST /api/ordens-servico/{id}/aprovar` e `/recusar` já existem abertos. Quando o link
for ao ar, o dono do carro — sem conta, sem senha — precisa alcançar aquele endpoint.
Isso **não é papel**: é token de capacidade por ordem, com validade, revogado quando a OS
sai de `AguardandoAprovacao`. Se ele resolver isso mandando o GUID da OS na URL, vira
buraco de segurança direto (identificador usado como credencial). Vigiar isso quando ele
for implementar — é o erro mais provável de toda a missão.

Vazamento residual registrado na matriz: bloquear `/api/financeiro` não esconde valores
do mecânico, porque `GET /api/ordens-servico` devolve `ValorMaoObra` e `ValorUnitario`
por ordem. É decisão de produto, não bug — mas precisa ser consciente.
