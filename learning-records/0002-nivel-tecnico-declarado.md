# Conhecimento prévio: confortável com o código, travado na arquitetura

Daniel declarou estar confortável escrevendo controllers, services e EF Core — a trava está em decisões de arquitetura e de produto, não em sintaxe C#.

**Implicações:** lições não devem gastar espaço explicando injeção de dependência, ciclo de vida de requisição ou como escrever um repositório. Devem ir direto a tradeoffs, custos comparados e critérios de decisão, usando o código do próprio Garage_API como evidência. O formato que funciona é: afirmação → trecho real do repositório que prova → consequência comercial.

**A confirmar:** ainda não há evidência sobre profundidade em EF Core avançado (global query filters, interceptors) nem em pipeline de autenticação do ASP.NET Core. Sondar antes de assumir. Ver [[0001-modelo-de-entrega-escolhido]].
