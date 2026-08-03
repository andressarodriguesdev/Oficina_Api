# ADR-0001 — Uma instalação dedicada por oficina

- **Estado:** aceite
- **Data:** 2026-08-03
- **Contexto do produto:** GarageManager, vendido a oficinas independentes em Malta

## Contexto

O sistema nasceu como MVP mono-oficina. O identificador da oficina está fixo em
código-fonte (`GarageManager.Application/Constants/WorkshopConstants.cs:5`) e é
lido por `CustomerAppService.cs:23` e `MechanicAppService.cs:36`. Nenhum
repositório filtra por `WorkshopId`. Na prática, hoje existe exatamente uma
oficina por base de dados — só que por acidente, não por decisão.

Ao transformar isto em produto vendável, havia duas topologias possíveis:

1. **SaaS multi-tenant** — uma instância e uma base partilhadas, com `WorkshopId`
   a discriminar as linhas de todas as tabelas.
2. **Instalação dedicada** — uma instância e uma base por oficina, sem
   discriminador nenhum.

## Decisão

Adotamos **uma instalação dedicada por oficina**: instância própria e base de
dados própria para cada cliente pagante.

## Porquê

**O mercado é pequeno o suficiente para a conta fechar.** Malta tem na ordem de
poucas centenas de oficinas independentes. O custo marginal de uma instalação
dedicada só se torna proibitivo quando a frota chega às centenas ou milhares de
clientes — patamar que este mercado não atinge. Foi precisamente o oposto do
cenário original brasileiro analisado em `reference/topologias-de-entrega.html`,
onde o volume de oficinas de bairro a preços baixos não pagava a instalação
dedicada.

**O isolamento passa a ser topológico, não aplicacional.** Num SaaS
multi-tenant, um único `WHERE` esquecido num repositório expõe o faturamento de
uma oficina a outra. Com base dedicada, esse erro não é sequer expressável: não
há linhas de outro cliente na base para vazar. Dado o estado atual — nenhum
repositório filtra por `WorkshopId` — a alternativa multi-tenant exigiria
auditar e blindar todas as consultas antes da primeira venda.

**Oficinas guardam dados de clientes e valores faturados.** Vender isolamento
físico é argumento comercial concreto junto de um dono de oficina, e simplifica
a conversa de RGPD: os dados de cada oficina vivem numa base que é só dela.

## Consequências

**Positivas**

- Nenhum vazamento entre oficinas é possível por bug de aplicação.
- A pergunta "e se eu quiser levar os meus dados?" resolve-se com um dump.
- Personalizações por cliente (logótipo, texto de WhatsApp, IVA) não precisam de
  ser modeladas como configuração multi-tenant desde o dia um.

**Negativas — e o que fazem ao plano**

- Uma migration nova tem de correr em todas as instalações vendidas. Aplicar à
  mão não escala; é a razão de existir o sprint 5 (instalação repetível) em
  `plan/sprints.html`.
- O custo de infraestrutura cresce linearmente com o número de clientes, ao
  contrário do SaaS. Cada oficina tem de suportar a sua própria instância.
- Diagnosticar um bug relatado por um cliente significa alcançar a instalação
  dele, não uma base central. Observabilidade por instalação passa a ser
  requisito, não luxo.

**Consequência imediata:** `WorkshopConstants.DefaultWorkshopId` continua a ser
um GUID em código. Com instalação dedicada isso deixa de ser um risco de
isolamento, mas continua a obrigar a recompilar para instalar numa oficina nova.
Tem de sair para configuração — está no sprint 5, não no sprint 2.

## Quando reabrir esta decisão

Se o produto sair de Malta para um mercado onde a frota passe as poucas centenas
de clientes, ou se o preço por oficina descer ao ponto de a instância dedicada
consumir a margem. Nessa altura, o caminho não é converter tudo em multi-tenant
de uma vez, mas introduzir `WorkshopId` nos filtros e correr as duas topologias
em paralelo.
