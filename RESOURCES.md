# Recursos — Escalar e vender o Garage_API

## Knowledge

- [Tenancy Models for a Multitenant Solution — Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models)
  A fonte primária deste workspace. Define os quatro modelos (single-tenant automatizado, totalmente multitenant, particionado vertical, particionado horizontal) e lista custo, isolamento e carga operacional de cada um. Use para: justificar a escolha de topologia e saber quando ela deixa de servir. Autor: John Downs, Azure Patterns & Practices.

- [Deployment Stamps Pattern — Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/deployment-stamp)
  O padrão que descreve exatamente "uma instalação por cliente" feito de forma sustentável. Use para: automatizar provisionamento e planejar upgrades em lote (deployment rings) quando houver mais de ~5 oficinas instaladas.

- [Multi-tenancy — EF Core | Microsoft Learn](https://learn.microsoft.com/en-us/ef/core/miscellaneous/multitenancy)
  As três abordagens em EF Core: banco por cliente, schema por cliente, coluna discriminadora. Use para: decidir onde o `OficinaId` do Garage_API deve viver.

- [Global Query Filters — EF Core | Microsoft Learn](https://learn.microsoft.com/en-us/ef/core/querying/filters)
  Como aplicar filtro de tenant automaticamente em toda query, em vez de lembrar em cada repositório. Contém a armadilha importante: **o filtro só se aplica na raiz da query — entidades trazidas por `Include` não são filtradas.** Use para: corrigir os repositórios que hoje listam sem filtro.

- [Data Isolation with Entity Framework Core — Finbuckle.MultiTenant](https://www.finbuckle.com/multitenant/docs/EFCore)
  Biblioteca madura e open-source de multi-tenancy para ASP.NET Core. Use para: não escrever à mão a resolução de tenant, caso o modelo mude para SaaS compartilhado.

- [Multitenancy Checklist on Azure — Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/checklist)
  Checklist de decisões comerciais e técnicas. Use para: revisão antes de fechar o primeiro contrato pago.

## Wisdom (Communities)

- [r/dotnet](https://reddit.com/r/dotnet)
  Alta densidade de gente que já operou SaaS em .NET. Use para: crítica de decisão arquitetural e experiências reais de multi-tenancy.

- [r/SaaS](https://reddit.com/r/SaaS) e [Indie Hackers](https://www.indiehackers.com/)
  Use para: a parte comercial — precificação para cliente de baixo ticket, custo de suporte, churn.

- Comunidade local de oficinas / sindicato de mecânicos da região
  A wisdom mais valiosa e a mais ignorada. Use para: validar se o fluxo de OS do sistema bate com o fluxo real de uma oficina de bairro, antes de escrever mais código.

## Gaps

- Falta uma fonte confiável sobre **precificação de software para PMEs brasileiras de baixo ticket** — determina se "instalar por cliente" fecha a conta.
- Falta referência sobre **automação de migrations em frota de bancos PostgreSQL** — vira o gargalo operacional a partir da 5ª oficina instalada.
- Falta material sobre o fluxo operacional real de uma oficina de bairro (ordem de chegada, orçamento verbal, peça comprada na hora) para validar o modelo de domínio.
