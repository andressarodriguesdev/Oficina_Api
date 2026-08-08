# 🚗 OficinaMecânica

Sistema Full Stack de gerenciamento para oficinas mecânicas, desenvolvido para centralizar o controle de clientes, veículos, mecânicos, ordens de serviço, histórico de atendimentos e indicadores operacionais.

O projeto evoluiu de uma aplicação de gerenciamento de ordens de serviço para uma solução de gestão da operação da oficina, permitindo acompanhar atendimentos, valores, produtividade, histórico dos veículos e desempenho das ordens de serviço.

---

## 📌 Sobre o projeto

O **OficinaMecânica** tem como objetivo auxiliar oficinas mecânicas no gerenciamento de seus atendimentos e informações operacionais.

O sistema permite acompanhar todo o ciclo de uma Ordem de Serviço, desde sua abertura até sua conclusão, além de manter o histórico dos atendimentos realizados para clientes e veículos.

Atualmente, o projeto conta com módulos de:

* 👤 Clientes
* 🚘 Veículos
* 👨‍🔧 Mecânicos
* 🔧 Ordens de Serviço
* 📊 Dashboard
* 💰 Indicadores financeiros
* 📜 Histórico de atendimentos
* 📄 Geração de PDF
* 💬 Integração com WhatsApp

---

# 🚀 Funcionalidades

## 👤 Clientes

O sistema permite gerenciar os clientes da oficina.

### Funcionalidades

* Cadastro de clientes
* Consulta de clientes cadastrados
* Visualização dos detalhes do cliente
* Associação de veículos ao cliente
* Histórico relacionado aos atendimentos
* Informações de contato
* Controle de clientes ativos/inativos

A tela de detalhes permite visualizar as informações do cliente e seus relacionamentos dentro do sistema.

---

## 🚘 Veículos

Os veículos são vinculados aos seus respectivos clientes e possuem histórico próprio de manutenção.

### Funcionalidades

* Cadastro de veículos
* Consulta de veículos
* Visualização dos detalhes do veículo
* Associação com cliente
* Marca
* Modelo
* Ano
* Placa
* Histórico de Ordens de Serviço
* Valor total investido em OS
* Data da última visita à oficina
* Quantidade de dias desde a última visita

Essas informações permitem acompanhar o histórico de manutenção de cada veículo e futuramente criar ações de relacionamento, como lembretes de revisão e retorno à oficina.

---

## 👨‍🔧 Mecânicos

O sistema permite acompanhar informações e indicadores relacionados aos mecânicos da oficina.

### Funcionalidades

* Cadastro de mecânicos
* Visualização dos detalhes do mecânico
* Especialidade
* Telefone
* Ordens de Serviço relacionadas
* OS concluídas
* OS canceladas
* Valor de mão de obra em OS concluídas
* Indicadores de produtividade

A visão por mecânico permite acompanhar a produtividade e os valores relacionados à mão de obra executada.

---

# 🔧 Ordens de Serviço

A Ordem de Serviço é o principal fluxo operacional do sistema.

Cada OS pode estar relacionada a:

* Cliente
* Veículo
* Mecânico
* Serviços
* Peças e materiais
* Mão de obra
* Histórico de alterações

## 🔄 Fluxo da Ordem de Serviço

O fluxo principal da OS é:

```text
Aberta
   ↓
Aguardando Aprovação
   ↓
Aprovada
   ↓
Concluída
```

Também existem situações excepcionais:

### ❌ Recusada

```text
Aberta
   ↓
Aguardando Aprovação
   ↓
Recusada
   ↓
Fim do processo
```

### 🔄 Reaberta

Uma OS concluída pode ser reaberta quando necessário.

O motivo da reabertura deve ser registrado e, após o novo atendimento, a OS retorna para conclusão.

```text
Concluída
   ↓
Reaberta
   ↓
Motivo obrigatório
   ↓
Concluída
```

### ❌ Cancelada

Uma OS pode ser cancelada conforme as regras do sistema.

O motivo do cancelamento deve ser informado e registrado.

```text
Aprovada
   ↓
Cancelada
   ↓
Motivo obrigatório
```

---

## 📋 Detalhes da Ordem de Serviço

A tela de detalhes da OS apresenta:

### Identificação

* Número da OS
* Cliente
* Veículo
* Mecânico
* Status da OS

### Serviço

* Descrição do serviço
* Descrição das peças

### Valores

* Valor unitário
* Valor total dos itens
* Valor da mão de obra
* Valor total de peças
* Valor total da Ordem de Serviço

### Histórico

A OS possui uma timeline que permite acompanhar as alterações ocorridas durante seu ciclo de vida.

---

## ⚙️ Ações da Ordem de Serviço

Dependendo do status da OS, o sistema disponibiliza ações como:

* Reabrir OS
* Enviar mensagem pelo WhatsApp
* Gerar PDF

---

# 💰 Dashboard

O Dashboard apresenta uma visão geral da operação da oficina.

## 📊 Indicadores

Atualmente é possível acompanhar:

* Faturamento
* Quantidade de OS concluídas
* Quantidade de OS aguardando aprovação
* Quantidade de OS abertas
* Quantidade de clientes cadastrados
* Quantidade de veículos cadastrados
* Quantidade total de Ordens de Serviço

## 🕐 Ordens de Serviço recentes

O Dashboard também apresenta as OS mais recentes.

É possível filtrar os resultados por:

* Hoje
* Últimos 7 dias
* Últimos 30 dias
* Todas as OS

Ao selecionar uma OS, o sistema direciona para a tela de detalhes correspondente.

Também é possível acessar a tela completa de Ordens de Serviço.

---

# 📈 Histórico financeiro e produtividade

O sistema possui uma visão mais detalhada dos resultados da oficina, permitindo acompanhar informações como:

* Faturamento
* Valores de mão de obra
* Valores de peças
* Valores das Ordens de Serviço
* OS concluídas
* OS canceladas
* Produtividade por mecânico

Essas informações permitem transformar os dados operacionais em indicadores para acompanhamento da oficina.

---

# 📄 Geração de PDF

O sistema possui geração de Ordem de Serviço em PDF utilizando **QuestPDF**.

O documento pode conter:

* Dados da oficina
* Informações do cliente
* Dados do veículo
* Descrição técnica do serviço
* Lista de peças utilizadas
* Valores de mão de obra
* Resumo financeiro
* Espaço para assinaturas

O PDF foi desenvolvido para servir como documento de registro da Ordem de Serviço.

---

# 💬 WhatsApp

O sistema possui ação para envio de mensagem relacionada à Ordem de Serviço pelo WhatsApp.

A funcionalidade também serve como base para futuras ações de relacionamento com clientes, como lembretes de retorno e revisão preventiva.

---

# 🧭 Navegação

O sistema possui navegação entre listagens e telas de detalhes.

Os principais fluxos incluem:

```text
Dashboard
   ↓
Ordens de Serviço
   ↓
Detalhes da OS
```

```text
Clientes
   ↓
Detalhes do Cliente
```

```text
Veículos
   ↓
Detalhes do Veículo
   ↓
Histórico de OS
```

```text
Mecânicos
   ↓
Detalhes do Mecânico
   ↓
Indicadores e OS relacionadas
```

A navegação está sendo refinada para manter um comportamento consistente entre as diferentes telas do sistema.

---

# 🏗️ Arquitetura

O projeto é dividido entre frontend e backend, seguindo uma organização baseada em camadas no backend.

```text
OficinaMecanica
│
├── Backend
│   ├── API
│   │   └── Controllers
│   │
│   ├── Application
│   │   ├── Services
│   │   └── DTOs
│   │
│   ├── Domain
│   │   └── Entities
│   │
│   └── Infrastructure
│       ├── Database
│       └── Services
│
└── Frontend
    ├── Pages
    ├── Components
    ├── Services
    └── API
```

---

# 🗄️ Principais entidades

A estrutura atual do domínio possui entidades relacionadas à operação da oficina, incluindo:

```text
Oficina
   │
   ├── Cliente
   │      │
   │      └── Veículo
   │
   ├── Mecânico
   │
   └── Ordem de Serviço
          │
          ├── Itens
          └── Histórico
```

A Ordem de Serviço centraliza o relacionamento entre cliente, veículo, mecânico, serviços, valores e histórico.

---

# 💻 Tecnologias utilizadas

## Back-end

* C#
* .NET 10
* ASP.NET Core Web API
* Entity Framework Core
* PostgreSQL
* QuestPDF
* Swagger

## Front-end

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Lucide Icons

---

# 🔐 Autenticação

A autenticação de usuários está prevista como uma das próximas etapas de evolução do sistema.

A proposta é introduzir:

```text
Usuário
   ↓
Oficina
   ↓
Clientes
   ├── Veículos
   └── Ordens de Serviço
           └── Mecânicos
```

O objetivo é permitir que cada usuário tenha acesso aos dados da oficina correspondente, preparando o sistema para controle de acesso e futuras evoluções de perfis e permissões.

---

# 🛣️ Roadmap

## ✅ Implementado

* [x] Gestão de clientes
* [x] Detalhes do cliente
* [x] Gestão de veículos
* [x] Detalhes do veículo
* [x] Histórico de veículos
* [x] Gestão de mecânicos
* [x] Detalhes do mecânico
* [x] Ordens de Serviço
* [x] Fluxo de aprovação
* [x] Controle de status da OS
* [x] Histórico e timeline da OS
* [x] Cálculo de valores
* [x] Dashboard
* [x] Filtros de período
* [x] Filtros por status
* [x] Indicadores financeiros
* [x] Indicadores de produtividade
* [x] Geração de PDF
* [x] Integração com WhatsApp
* [x] Navegação entre listagens e detalhes

## 🚧 Em refinamento

* [ ] Refinamento visual das telas
* [ ] Padronização da navegação
* [ ] Refinamento dos históricos
* [ ] Evolução da experiência de usuário
* [ ] Revisão geral das regras de negócio
* [ ] Documentação técnica do projeto

## 🔮 Próximas evoluções

* [ ] Autenticação de usuários
* [ ] Usuário administrador
* [ ] Associação entre usuário e oficina
* [ ] Controle de acesso e permissões
* [ ] Aprovação de OS pelo cliente
* [ ] Automação de mensagens de retorno/revisão
* [ ] Controle financeiro avançado
* [ ] Gestão de estoque e peças
* [ ] Agenda da oficina
* [ ] Relatórios
* [ ] Deploy da aplicação

---

# 📚 Documentação

A documentação técnica completa do projeto está sendo estruturada e será mantida dentro do próprio repositório.

A documentação deverá contemplar:

* Requisitos funcionais
* Regras de negócio
* Arquitetura
* Modelo de domínio
* Banco de dados
* API
* Fluxos do sistema
* Documentação das telas
* Autenticação e autorização
* Testes
* Deploy
* Roadmap

---

# 📌 Status do projeto

🚧 **Em desenvolvimento**

O OficinaMecânica encontra-se em fase de evolução e refinamento.

O MVP já possui funcionalidades de gestão de clientes, veículos, mecânicos e Ordens de Serviço, além de dashboard, indicadores, histórico operacional, geração de documentos e integração com WhatsApp.

As próximas etapas estão concentradas no refinamento da experiência do usuário, documentação técnica, autenticação e preparação para deploy.

---

# 👩‍💻 Desenvolvido por

**Andressa Rodrigues**

Desenvolvedora Full Stack

### Tecnologias principais

* C#
* .NET
* React
* TypeScript
* PostgreSQL
* Entity Framework Core

---

## 📸 Demonstração

Screenshots das principais telas do sistema serão adicionados conforme a documentação visual do projeto for construída.

---

## 📄 Licença

Este projeto está em desenvolvimento e possui finalidade de estudo, portfólio e demonstração técnica.
