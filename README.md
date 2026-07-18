# 🚗 Oficina Mecânica API

Sistema de gerenciamento para oficinas mecânicas, desenvolvido como um projeto Full Stack com foco em organização de atendimentos, controle de veículos e gerenciamento de ordens de serviço.

O objetivo do projeto é criar uma solução simples e eficiente para auxiliar oficinas no controle dos serviços realizados, desde o cadastro do cliente até a aprovação e conclusão da ordem de serviço.

---

## 🚀 Funcionalidades

### 👤 Clientes

* Cadastro de clientes
* Consulta de clientes cadastrados
* Associação de veículos ao cliente
* Armazenamento de informações de contato

### 🚘 Veículos

* Cadastro de veículos vinculados ao cliente
* Controle de:

  * Marca
  * Modelo
  * Ano
  * Placa

### 📋 Ordens de Serviço

Fluxo completo de atendimento:

```
Aberta
  ↓
Aguardando Aprovação
  ↓
Aprovada
  ↓
Concluída
```

Também possui os estados:

* Recusada
* Cancelada
* Reaberta

Funcionalidades:

* Criação de ordens de serviço
* Associação entre cliente e veículo
* Cadastro de descrição do serviço
* Controle de mão de obra
* Cadastro de peças e materiais
* Cálculo do valor total
* Histórico de alterações de status

---

## 📄 Geração de PDF

O sistema possui geração de Ordem de Serviço em PDF utilizando **QuestPDF**.

O documento contém:

* Dados da oficina
* Informações do cliente
* Dados do veículo
* Descrição técnica do serviço
* Lista de peças utilizadas
* Valores da mão de obra
* Resumo financeiro
* Espaço para assinaturas

O PDF foi pensado para funcionar como documento de registro da oficina.

---

## 💻 Tecnologias utilizadas

### Back-end

* C#
* .NET
* ASP.NET Core Web API
* Entity Framework Core
* PostgreSQL
* QuestPDF
* Swagger

### Front-end

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Lucide Icons

---

## 🏗️ Arquitetura

O projeto segue uma organização baseada em camadas:

```
OficinaMecanica
│
├── API
│   └── Controllers
│
├── Application
│   ├── Services
│   └── DTOs
│
├── Domain
│   └── Entities
│
└── Infrastructure
    ├── Database
    └── Services
```

---

## 🔄 Integrações planejadas

Próximas evoluções:

* [ ] Envio automático da OS pelo WhatsApp
* [ ] Link de aprovação para cliente
* [ ] Dashboard com indicadores da oficina
* [ ] Melhorias no histórico de atendimento
* [ ] Emissão de documentos fiscais
* [ ] Controle financeiro da oficina

---

## 📌 Status do projeto

🚧 Em desenvolvimento

O projeto está sendo desenvolvido como MVP, evoluindo gradualmente com novas funcionalidades e melhorias de experiência do usuário.

---

## 👩‍💻 Desenvolvido por

**Andressa Rodrigues**

Desenvolvedora Full Stack

Tecnologias principais:

* C#
* .NET
* React
* TypeScript
* Banco de dados relacional

---

## 📸 Demonstração

Em breve serão adicionadas imagens das telas do sistema e exemplos dos documentos gerados.
