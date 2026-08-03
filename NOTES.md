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

## Estado em 2026-08-03: sprints 0, 1 e 2 commitados

Branch `sprint-1-garagemanager-rebrand`, três commits sobre `main`. Ainda não
mergeado nem enviado — `main` continua em `169a589`.

Sprints 0 e 1 (rename + Malta) num commit só, mais os dois ADRs em `docs/adr/`,
mais o sprint 2 (autenticação e perímetro). Sprint 2 foi validado de ponta a
ponta contra um Postgres em container: sem token dá 401; o Proprietor passa em
tudo; o mecânico recebe 403 em `/api/finance`, `/api/users`, `POST /api/Mechanic`
e nas transições `approve`/`decline`/`cancel`/`reopen`; `/api/auth/register` está
fechado (404) e os DELETE removidos dão 405.

Decisões do usuário nesta sessão:
- Sprint 1 commitado como um commit único.
- Os dois ADRs escritos.
- `DELETE` de Customer, Vehicle e Mechanic removidos da API (o `IsActive` já
  cobre o caso e apagar destruía histórico).
- CORS com origens vindas de configuração agora; servir a SPA pelo .NET fica
  para o sprint 5.

Decisões que eu tomei e que valem revisão:
- O papel do dono chama-se **`Proprietor`**, não `Owner` — `CONTEXT.md` lista
  "owner" como termo a evitar, porque o dono do *veículo* é o Customer.
- Criei `UserController` e `IdentityBootstrap` sem estarem nas 10 tarefas do
  sprint: sem eles ninguém consegue criar a conta do mecânico e o sprint não
  entrega um sistema utilizável.
- `POST`/`GET` de `/api/Workshop` ficaram restritos ao Proprietor por não haver
  conta de instalador; deviam sair da API no sprint 5.

Sprints 0, 1 e 2 de `plan/sprints.html` estão prontos — as checkboxes do tracker
são client-side (localStorage), então não refletem isso automaticamente.

Próximo passo: sprint 3 (Job Card com o ciclo certo) — separar `Description` em
`Complaint`, `Cause` e `Correction`.

## Achados abertos, não corrigidos (verificados em 2026-08-03)
- `/status-history` no React chama `GET /api/status-history`, que **não tem
  controller**. A página está quebrada desde antes do rename.
- Domínio lança `Exception` genérica: pedir um Job Card inexistente devolve 500,
  não 404. Confirmado por teste.
- Rotas inconsistentes: `api/Workshop`, `api/Mechanic` e `api/Vehicle` usam
  `[controller]` (singular, PascalCase); as outras são kebab-case plural.
- A connection string em user-secrets ainda aponta para a base `oficinamecanica`.
- `JobCardRepository.RemoveAsync` e `WorkshopRepository.RemoveAsync` continuam
  como código morto.

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
