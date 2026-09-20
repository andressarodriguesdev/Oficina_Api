# 🚗 Oficina Prime

<img width="1913" height="920" alt="Oficina Prime" src="https://github.com/user-attachments/assets/089d09a0-7ade-451f-aea4-dac0434af256" />

Sistema **Full Stack de gerenciamento para oficinas mecânicas**, desenvolvido para centralizar a operação da oficina em um único sistema.

O **Oficina Prime** permite gerenciar clientes, veículos, mecânicos, peças, estoque, ordens de serviço, histórico de atendimentos, indicadores financeiros e produtividade.

O projeto evoluiu de uma aplicação de gerenciamento de Ordens de Serviço para uma solução mais completa de gestão da operação da oficina, contemplando também autenticação, cadastro da oficina, controle de estoque e regras de negócio relacionadas ao ciclo de vida das OS.

---

## 📌 Sobre o projeto

O **Oficina Prime** tem como objetivo auxiliar oficinas mecânicas no gerenciamento de seus atendimentos e informações operacionais.

O sistema acompanha o ciclo completo de uma Ordem de Serviço, desde sua abertura até sua conclusão, incluindo aprovação, recusa, cancelamento e reabertura.

Além disso, mantém o histórico dos atendimentos, controla peças e estoque e disponibiliza indicadores para acompanhamento da operação.

### Módulos atuais

* 👤 Clientes
* 🚘 Veículos
* 👨‍🔧 Mecânicos
* 🔧 Ordens de Serviço
* 🔩 Peças e estoque
* 🏢 Dados da oficina
* 📊 Dashboard
* 💰 Indicadores financeiros
* 📈 Indicadores de produtividade
* 📜 Histórico de atendimentos
* 🔐 Autenticação
* ✉️ Verificação de e-mail
* 📄 Geração de PDF
* 💬 Integração com WhatsApp

---

# 🚀 Funcionalidades

## 🔐 Autenticação e usuários

O sistema possui fluxo de cadastro e autenticação de usuários.

### Funcionalidades

* Cadastro de usuário
* Verificação de e-mail por código
* Login
* Logout
* Autenticação baseada em token
* Validação de acesso às APIs protegidas
* Persistência do e-mail cadastrado durante o fluxo de verificação e retorno ao login

O fluxo de cadastro e acesso segue:

```text
Cadastro
   ↓
Envio do código de verificação
   ↓
Verificação do e-mail
   ↓
Retorno para o Login
   ↓
E-mail preenchido automaticamente
   ↓
Login
   ↓
Acesso ao sistema
```

O envio de e-mails é realizado através de integração com serviço externo de e-mail.

---

# 🏢 Oficina

O sistema possui cadastro e gerenciamento dos dados da oficina.

### Informações armazenadas

* Nome fantasia
* Razão social
* CNPJ
* Inscrição Estadual
* Telefone
* E-mail
* CEP
* Logradouro
* Número
* Complemento
* Bairro
* Cidade
* UF
* Endereço
* Logotipo

### Funcionalidades

* Cadastro da oficina
* Consulta dos dados cadastrados
* Edição dos dados da oficina
* Persistência das informações no banco de dados

A estrutura foi preparada para permitir futuras integrações relacionadas à emissão de documentos fiscais e outros serviços.

---

# 👤 Clientes

O sistema permite gerenciar os clientes da oficina.

### Funcionalidades

* Cadastro de clientes
* Consulta de clientes cadastrados
* Visualização dos detalhes do cliente
* Associação de veículos ao cliente
* Histórico relacionado aos atendimentos
* Informações de contato
* Controle de clientes ativos e inativos

A tela de detalhes permite visualizar as informações do cliente e seus relacionamentos dentro do sistema.

---

# 🚘 Veículos

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

Essas informações permitem acompanhar o histórico de manutenção de cada veículo e servem como base para futuras ações de relacionamento, como lembretes de revisão e retorno à oficina.

---

# 👨‍🔧 Mecânicos

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
* Controle de mecânicos ativos e inativos

Mecânicos inativos não podem ser atribuídos a novas Ordens de Serviço.

Além disso, um mecânico que possua vínculo com Ordens de Serviço não pode ser excluído fisicamente do sistema.

---

# 🔩 Peças e estoque

O módulo de peças permite controlar os materiais utilizados nas Ordens de Serviço.

### Informações da peça

* Nome
* Código
* Valor de custo
* Valor de venda
* Quantidade em estoque
* Estoque mínimo
* Situação ativa/inativa

### Funcionalidades

* Cadastro de peças
* Consulta de peças
* Controle de quantidade em estoque
* Ajuste da quantidade final em estoque
* Controle de estoque mínimo
* Ativação e inativação de peças
* Associação de peças às Ordens de Serviço
* Validação de disponibilidade de estoque
* Controle de reservas de estoque

Peças utilizadas em Ordens de Serviço não podem ser excluídas fisicamente. Nesses casos, a peça deve ser inativada.

---

## 📦 Controle de estoque

O sistema diferencia o **estoque físico** da quantidade disponível para novas Ordens de Serviço.

As peças utilizadas em Ordens de Serviço ativas podem ficar reservadas.

Os status que geram reserva de estoque são:

```text
Aberta
   ↓
Aguardando Aprovação
   ↓
Aprovada
   ↓
Reaberta
```

O sistema considera essas reservas para determinar a quantidade realmente disponível.

### Exemplo

```text
Estoque físico:       6
Reservado:            2
Disponível:           4
```

Nesse cenário, uma nova OS não poderá solicitar mais de 4 unidades daquela peça.

O backend é responsável pela validação definitiva do estoque.

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
* Valores
* Histórico de alterações

---

# 🔄 Fluxo da Ordem de Serviço

O fluxo principal é:

```text
Aberta
   ↓
Aguardando Aprovação
   ↓
Aprovada
   ↓
Concluída
```

Também existem situações excepcionais.

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

Ao ser recusada, as reservas de estoque relacionadas à OS são liberadas.

### 🔄 Reaberta

Uma OS concluída pode ser reaberta quando necessário.

O motivo da reabertura deve ser informado.

```text
Concluída
   ↓
Reaberta
   ↓
Motivo obrigatório
   ↓
Novo atendimento
   ↓
Concluída
```

Quando uma OS concluída é reaberta, o sistema ajusta novamente o estoque e as reservas de acordo com as regras do processo.

### ❌ Cancelada

Uma OS pode ser cancelada conforme as regras do sistema.

O motivo do cancelamento é obrigatório.

```text
Aprovada
   ↓
Cancelada
   ↓
Motivo obrigatório
```

Ao cancelar a OS, as reservas correspondentes são liberadas.

---

# 📋 Detalhes da Ordem de Serviço

A tela de detalhes apresenta informações completas da OS.

### Identificação

* Número da OS
* Cliente
* Veículo
* Mecânico
* Status

### Serviços e peças

* Descrição do serviço
* Peças utilizadas
* Quantidade
* Valor unitário
* Valor total dos itens

### Valores

* Valor de mão de obra
* Valor total de peças
* Valor total dos itens
* Valor total da Ordem de Serviço

### Estoque

A tela também considera a disponibilidade da peça no estoque, respeitando as reservas existentes.

---

# 📦 Regras de estoque nas Ordens de Serviço

O sistema possui validações para impedir operações inconsistentes.

Entre elas:

* Não permitir quantidade maior que o estoque disponível
* Considerar reservas de outras OS
* Permitir o uso do estoque próprio da OS durante edição
* Impedir redução de estoque abaixo das quantidades reservadas
* Consumir fisicamente o estoque ao concluir a OS
* Liberar reservas ao cancelar ou recusar uma OS
* Recalcular reservas ao reabrir uma OS

Quando uma operação não pode ser realizada, o backend retorna um erro de regra de negócio tratado pela API.

O frontend apresenta a mensagem ao usuário sem interromper a aplicação.

---

# 🕐 Histórico da Ordem de Serviço

Cada Ordem de Serviço possui histórico de alterações.

A timeline permite acompanhar eventos importantes durante o ciclo da OS, incluindo alterações de status e ações que exigem justificativa.

---

# ⚙️ Ações da Ordem de Serviço

Dependendo do status, o sistema disponibiliza ações específicas, como:

* Editar OS
* Reabrir OS
* Cancelar OS
* Gerar PDF
* Enviar mensagem pelo WhatsApp
* Adicionar peças
* Atualizar itens
* Consultar disponibilidade de estoque

Ordens de Serviço concluídas possuem regras específicas e não podem ser editadas livremente.

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

---

## 🕐 Ordens de Serviço recentes

O Dashboard apresenta as Ordens de Serviço mais recentes.

É possível filtrar os resultados por:

* Hoje
* Últimos 7 dias
* Últimos 30 dias
* Todas as OS

Ao selecionar uma OS, o sistema direciona para sua respectiva tela de detalhes.

---

# 📈 Indicadores financeiros e produtividade

O sistema possui uma visão dos resultados operacionais da oficina.

Entre os indicadores estão:

* Faturamento
* Valores de mão de obra
* Valores de peças
* Valores das Ordens de Serviço
* OS concluídas
* OS canceladas
* Produtividade por mecânico

As informações são calculadas a partir dos dados operacionais registrados no sistema.

---

# 📄 Geração de PDF

O sistema possui geração de Ordem de Serviço em PDF utilizando **QuestPDF**.

O documento pode apresentar:

* Dados da oficina
* Informações do cliente
* Dados do veículo
* Descrição técnica do serviço
* Lista de peças utilizadas
* Valores de mão de obra
* Resumo financeiro
* Espaço para assinaturas

O PDF funciona como documento de registro da Ordem de Serviço.

---

# 💬 WhatsApp

O sistema possui integração para envio de mensagens relacionadas à Ordem de Serviço através do WhatsApp.

A funcionalidade também serve como base para futuras ações de relacionamento com clientes, como:

* Avisos sobre andamento da OS
* Comunicação de conclusão
* Lembretes de retorno
* Revisões preventivas

---

# 🧭 Navegação

O sistema possui navegação entre listagens, cadastros e telas de detalhes.

Principais fluxos:

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
   ↓
Veículos relacionados
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

```text
Peças
   ↓
Estoque
   ↓
Ordens de Serviço
```

```text
Configurações
   ↓
Dados da oficina
```

---

# 🏗️ Arquitetura

O projeto possui frontend separado do backend e utiliza uma arquitetura em camadas no backend.

```text
OficinaMecanica
│
├── OficinaMecanica.Api
│   └── Controllers
│
├── OficinaMecanica.Application
│   ├── Services
│   ├── DTOs
│   └── Exceptions
│
├── OficinaMecanica.Domain
│   └── Entities
│
├── OficinaMecanica.Infrastructure
│   ├── Data
│   ├── Repositories
│   └── Services
│
└── OficinaMecanica.web
    ├── Pages
    ├── Components
    ├── Services
    └── API
```

A separação por camadas busca manter as responsabilidades do sistema organizadas entre domínio, regras de negócio, infraestrutura e exposição da API.

---

# 🗄️ Principais entidades

A estrutura atual do domínio possui entidades relacionadas à operação da oficina.

```text
Oficina
│
├── Cliente
│   │
│   └── Veículo
│
├── Mecânico
│
├── Peças
│
└── Ordem de Serviço
       │
       ├── Itens
       │   └── Peças
       │
       └── Histórico
```

A Ordem de Serviço centraliza o relacionamento entre cliente, veículo, mecânico, serviços, peças, valores e histórico.

---

# 🛡️ Tratamento de regras de negócio

As regras críticas são validadas no backend.

Quando uma operação não pode ser realizada, a API retorna uma resposta adequada para que o frontend apresente a mensagem ao usuário.

Exemplo:

```text
Frontend
   ↓
Solicitação
   ↓
API
   ↓
Validação da regra de negócio
   ↓
409 Conflict
   ↓
Mensagem apresentada na interface
```

Esse comportamento evita que uma exceção de regra de negócio interrompa o processo de execução da API durante uma operação normal do sistema.

---

# 💻 Tecnologias utilizadas

## Back-end

* C#
* .NET 10
* ASP.NET Core Web API
* Entity Framework Core
* PostgreSQL
* Npgsql
* QuestPDF
* Swagger
* JWT
* Resend

## Front-end

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Lucide Icons

---

# 🔐 Segurança e autenticação

O sistema possui autenticação para proteger as operações da API.

As APIs que exigem usuário autenticado utilizam autorização baseada em token.

As credenciais e chaves de serviços externos não fazem parte do código-fonte e devem ser configuradas através de variáveis de ambiente no ambiente de execução.

A estrutura foi preparada para permitir futuras evoluções relacionadas a:

* Perfis de usuário
* Permissões
* Controle de acesso
* Administração de usuários
* Evolução da gestão de oficinas

---

# 🧪 Testes

O projeto passou por testes funcionais dos principais fluxos da aplicação.

Entre os cenários testados estão:

* Cadastro de usuário
* Verificação de e-mail
* Login
* Persistência do e-mail após verificação
* Cadastro e edição da oficina
* Cadastro de clientes
* Cadastro de veículos
* Cadastro de mecânicos
* Cadastro e manutenção de peças
* Controle de estoque
* Reserva de peças
* Criação de Ordem de Serviço
* Edição de Ordem de Serviço
* Validação de estoque insuficiente
* Cancelamento de OS
* Recusa de OS
* Reabertura de OS
* Conclusão de OS
* Geração de PDF
* Indicadores do Dashboard

A aplicação continua em processo de validação e refinamento antes da disponibilização da primeira versão em produção.

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
* [x] Gestão de peças
* [x] Controle de estoque
* [x] Reserva de estoque
* [x] Ajuste de estoque
* [x] Ordens de Serviço
* [x] Fluxo de aprovação
* [x] Controle de status da OS
* [x] Histórico e timeline da OS
* [x] Reabertura de OS
* [x] Cancelamento de OS
* [x] Recusa de OS
* [x] Validação de estoque
* [x] Cálculo de valores
* [x] Dashboard
* [x] Filtros de período
* [x] Indicadores financeiros
* [x] Indicadores de produtividade
* [x] Geração de PDF
* [x] Integração com WhatsApp
* [x] Autenticação
* [x] Cadastro de usuário
* [x] Verificação de e-mail
* [x] Cadastro da oficina
* [x] Edição dos dados da oficina
* [x] Tratamento de erros de regras de negócio
* [x] Navegação entre listagens e detalhes

## 🚧 Em refinamento

* [ ] Refinamento visual das telas
* [ ] Padronização da navegação
* [ ] Refinamento dos históricos
* [ ] Evolução da experiência do usuário
* [ ] Revisão geral das regras de negócio
* [ ] Documentação técnica
* [ ] Revisão final de segurança
* [ ] Testes de regressão
* [ ] Preparação do ambiente de produção

## 🔮 Próximas evoluções

* [ ] Perfis de usuário
* [ ] Usuário administrador
* [ ] Controle de acesso e permissões
* [ ] Aprovação de OS pelo cliente
* [ ] Automação de mensagens de retorno e revisão
* [ ] Controle financeiro avançado
* [ ] Agenda da oficina
* [ ] Relatórios
* [ ] Integrações fiscais
* [ ] Evolução da gestão de estoque
* [ ] Deploy da aplicação

---

# 🚀 Estratégia de Deploy

O projeto está sendo preparado para utilizar o mesmo código-fonte em diferentes ambientes.

A arquitetura planejada permite separar as configurações de cada implantação através de variáveis de ambiente.

```text
                    Mesmo código
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      Portfólio       Cliente A      Cliente B
          │              │              │
       Banco A         Banco B         Banco C
```

Cada implantação poderá possuir suas próprias configurações, incluindo:

* Banco de dados
* Chaves de autenticação
* Chaves de serviços externos
* Configurações da aplicação

A estratégia permite manter o código centralizado enquanto os ambientes permanecem isolados.

---

# 📚 Documentação

A documentação técnica do projeto está sendo estruturada e deverá contemplar:

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

O **Oficina Prime** possui atualmente um MVP funcional com módulos de clientes, veículos, mecânicos, peças, estoque e Ordens de Serviço, além de autenticação, cadastro da oficina, dashboard, indicadores, histórico operacional, geração de documentos e integração com WhatsApp.

A aplicação encontra-se em fase de **refinamento, testes de regressão e preparação para o primeiro deploy**.

O próximo objetivo é disponibilizar uma versão online para demonstração e validação em ambiente real.

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

# 📸 Demonstração

Screenshots das principais telas do sistema serão adicionados conforme a documentação visual do projeto for construída.

---

# 📄 Licença

Este projeto está em desenvolvimento e possui finalidade de **estudo, portfólio e demonstração técnica**.
