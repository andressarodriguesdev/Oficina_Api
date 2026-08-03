# Mission: Escalar e vender o Garage_API para oficinas

## Why
Transformar o Garage_API de um MVP mono-oficina num produto que pode ser vendido repetidamente para oficinas de bairro — cada uma com sua própria instalação — sem que cada novo cliente custe um fim de semana de trabalho manual e sem que um bug de acesso exponha o faturamento de uma oficina para a pessoa errada.

## Success looks like
- Consigo justificar, com números e com trechos do próprio código, por que escolhi instalar por cliente em vez de SaaS compartilhado — e sei em que ponto essa escolha deixa de fechar a conta.
- Consigo instalar o sistema para uma oficina nova sem editar código-fonte (hoje `OficinaConstants.cs` exige recompilar).
- Existe login, e o mecânico não enxerga o faturamento total da oficina.
- Consigo aplicar uma migration nova em todas as instalações vendidas sem fazer uma a uma na mão.
- Sei quais customizações por tipo de oficina viram configuração e quais viram código — e por que confundir os dois mata a margem.

## Constraints
- Modelo de entrega escolhido: **uma instalação por cliente** (banco e instância dedicados).
- Cliente-alvo: **oficina de bairro** — 1 a 3 mecânicos, dono no balcão, WhatsApp como canal principal, baixa disposição a pagar.
- Nível: confortável escrevendo C#, EF Core e controllers. A trava está em arquitetura e em decisões de produto, não em sintaxe.
- Stack fixa: .NET 10, EF Core, PostgreSQL, React + Vite no front.

## Out of scope
- Emissão de nota fiscal e integrações fiscais.
- Reescrita para microsserviços ou mensageria.
- App mobile nativo.
