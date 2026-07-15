# 🚗 OficinaMecanica API

Sistema de gerenciamento para oficinas mecânicas desenvolvido com foco em organização de serviços, controle de clientes, veículos e ordens de serviço.

Este projeto nasceu como um estudo prático de **arquitetura de software, desenvolvimento Full Stack e aplicação de regras de negócio reais**, simulando um sistema utilizado no dia a dia de uma oficina.

---

## 📌 Sobre o Projeto

O **OficinaMecanica** é uma aplicação web para auxiliar oficinas no controle dos seus atendimentos.

A ideia é centralizar o processo desde o cadastro do cliente e veículo até a criação, aprovação e conclusão de uma Ordem de Serviço.

### Fluxo principal:

```
Cliente
   ↓
Veículo
   ↓
Ordem de Serviço
   ↓
Aguardando Aprovação
   ↓
Serviço Concluído
```

---

# 🚀 Funcionalidades

## 👤 Clientes

✅ Cadastro de clientes
✅ Listagem de clientes
✅ Integração Front-end e Back-end
✅ Persistência no banco de dados

---

## 🚘 Veículos

✅ Cadastro de veículos vinculados aos clientes
✅ Consulta de veículos
✅ Controle de informações do veículo

---

## 🔧 Ordens de Serviço

✅ Criação de Ordem de Serviço
✅ Controle de status do serviço

Status disponíveis:

* Aberta
* Aguardando aprovação
* Aprovada
* Recusada
* Concluída
* Cancelada
* Reaberta

✅ Histórico de alterações da OS
✅ Inclusão de itens/peças
✅ Cálculo de valores
✅ Geração de PDF da Ordem de Serviço
✅ Estrutura preparada para envio via WhatsApp

---

# 🏗️ Arquitetura do Projeto

O projeto utiliza uma arquitetura organizada em camadas:

```
OficinaMecanica
│
├── OficinaMecanica.Api
│   └── Controllers
│
├── OficinaMecanica.Application
│   ├── DTOs
│   └── Services
│
├── OficinaMecanica.Domain
│   ├── Entities
│   └── Enums
│
└── OficinaMecanica.Infrastructure
    ├── Data
    ├── Repositories
    └── External Services
```

---

# 🛠️ Tecnologias Utilizadas

## Back-end

* C#
* .NET 10
* ASP.NET Core Web API
* Entity Framework Core
* PostgreSQL
* Dependency Injection
* REST API
* Swagger/OpenAPI

---

## Front-end

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide Icons

---

## Outros

* Git
* GitHub
* Postman
* Swagger
* QuestPDF

---

# 🔌 Integração Front-end + Back-end

A aplicação possui comunicação entre:

```
React
 |
 | HTTP Requests
 ↓
ASP.NET Core API
 |
 ↓
Entity Framework Core
 |
 ↓
PostgreSQL
```

Os módulos de clientes, veículos e ordens de serviço são consumidos através de endpoints REST.

---

# 📄 Geração de PDF

O sistema possui geração automática de PDF para Ordem de Serviço utilizando:

* QuestPDF

A ideia é permitir que a oficina gere documentos profissionais para apresentar ao cliente.

---

# 📱 Integração WhatsApp

A estrutura do projeto já possui preparação para envio de aprovação de orçamento via WhatsApp.

Fluxo planejado:

```
Mecânico cria OS
        ↓
Enviar para aprovação
        ↓
Cliente recebe link
        ↓
Cliente aprova ou recusa
```

---

# 🗄️ Banco de Dados

Banco utilizado:

* PostgreSQL

Principais entidades:

```
Cliente
   |
   |
Veículo
   |
   |
Ordem de Serviço
   |
   |
Itens da OS
```

---

# 🔮 Próximas Implementações

* [ ] Dashboard completo com indicadores
* [ ] Tela de detalhes da Ordem de Serviço
* [ ] Aprovação pelo cliente
* [ ] Upload de fotos do veículo
* [ ] Controle de peças em estoque
* [ ] Autenticação e autorização de usuários
* [ ] Multi-tenancy para várias oficinas
* [ ] Deploy em ambiente cloud

---

# 🎯 Objetivo

Este projeto tem como objetivo aplicar na prática conceitos de:

* Arquitetura em camadas
* Desenvolvimento de APIs REST
* Regras de negócio
* Integração Full Stack
* Banco de dados relacional
* Boas práticas de desenvolvimento

---

# 👩‍💻 Desenvolvido por

**Andressa Rodrigues**

Desenvolvedora Full Stack em formação, apaixonada por tecnologia, desenvolvimento de sistemas e criação de soluções que resolvem problemas reais.

---

⭐ Se este projeto te interessou, fique à vontade para acompanhar sua evolução!
