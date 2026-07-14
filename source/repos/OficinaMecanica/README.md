# 🔧 Oficina API

Sistema de gestão para oficina mecânica desenvolvido em C# e .NET, criado com o objetivo de praticar conceitos de desenvolvimento backend, arquitetura em camadas e modelagem de domínio.

## 🚀 Funcionalidades

* Cadastro de clientes

* Cadastro de veículos

* Criação de ordens de serviço

* Controle de status da OS

* Regras de negócio para aprovação e conclusão

* API REST com ASP.NET Core

## 🛠️ Tecnologias utilizadas

C#

.NET 10 (ASP.NET Core)

Entity Framework Core

PostgreSQL

Swagger / OpenAPI

Git e GitHub

## 🧱 Estrutura do projeto

📦 OficinaMecanica

┣ 📂 OficinaMecanica.Domain

┣ 📂 OficinaMecanica.Application

┣ 📂 OficinaMecanica.Infrastructure

┣ 📂 OficinaMecanica.Api

┗ 📜 OficinaMecanica.sln

## 📋 Fluxo da Ordem de Serviço

Aberta

Enviada para aprovação

Aguardando aprovação

Aceita ou Recusada

Concluída

## 📦 Como executar

1. Clone o repositório

git clone [https://github.com/andressarodriguesdev/Oficina\_Api.git](https://github.com/andressarodriguesdev/Oficina\_Api.git)

2. Acesse a pasta do projeto

cd Oficina_Api

3. Configure a string de conexão do PostgreSQL

Edite o arquivo appsettings.json com os dados do seu banco.

4. Execute as migrations

dotnet ef database update

5. Inicie a aplicação

dotnet run

## 🔮 Próximas implementações

* Geração de PDF da OS

* Integração com WhatsApp

* Dashboard com métricas

* Autenticação de usuários

* Testes automatizados

## 👩‍💻 Sobre o projeto

Este projeto faz parte dos meus estudos em .NET e foi desenvolvido para consolidar conhecimentos em arquitetura em camadas, APIs REST, Entity Framework Core, PostgreSQL e boas práticas de desenvolvimento backend.

Desenvolvido por Andressa Rodrigues

[www.linkedin.com/in/andressa-rodrigues-dev](http://www.linkedin.com/in/andressa-rodrigues-dev)
