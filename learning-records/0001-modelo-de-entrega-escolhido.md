# Modelo de entrega definido: uma instalação por oficina

Daniel decidiu vender o Garage_API como instalação dedicada por cliente (banco e instância próprios), tendo a oficina de bairro — 1 a 3 mecânicos, ticket baixo — como cliente-alvo. Na taxonomia da Azure Architecture Center isso é *automated single-tenant deployment*.

**Implicações para as próximas sessões:** o `OficinaId` presente em todas as entidades deixa de ser mecanismo de isolamento e passa a ser apenas ponteiro de identidade da oficina. Em compensação, os dois gargalos reais passam a ser (a) autorização de usuário dentro da instalação e (b) custo operacional de provisionar e migrar uma frota de bancos. Não gastar tempo ensinando query filters de multi-tenancy pooled enquanto este for o modelo.

**Tensão registrada, ainda não resolvida:** a fonte primária indica que instalação dedicada serve a poucos clientes de ticket alto, e o alvo escolhido é o oposto — muitos clientes de ticket baixo. A resolução depende de automação de provisionamento e migrations, tema de sessão futura. Ver [[MISSION.md]] e [[0002-nivel-tecnico-declarado]].
