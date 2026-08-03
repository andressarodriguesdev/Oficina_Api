# ADR-0002 — Vocabulário britânico do ramo automóvel no domínio

- **Estado:** aceite
- **Data:** 2026-08-03
- **Contexto do produto:** GarageManager, vendido a oficinas independentes em Malta

## Contexto

O sistema foi escrito em português do Brasil: entidades `Oficina`, `Cliente`,
`Veiculo`, `OrdemServico`, propriedades `Placa` e `ValorMaoObra`, enum
`StatusOrdemServico`. Ao mudar o mercado-alvo para Malta, era preciso decidir em
que língua — e em que vocabulário — o domínio passaria a falar.

A tradução literal era a opção óbvia e é a errada. `OrdemServico` traduz-se por
"service order", termo que um mecânico maltês não usa. `Placa` traduz-se por
"plate", quando o termo do ramo é *registration number*. Traduzir palavra a
palavra produz um domínio que ninguém no mercado reconhece.

## Decisão

O domínio fala **inglês britânico do ramo automóvel**, com o vocabulário fixado
em `CONTEXT.md` na raiz do repositório. Esse ficheiro é normativo: define cada
termo e lista explicitamente os termos a evitar, incluindo os que pareceriam
traduções naturais.

Os termos centrais:

| Antes | Agora | Porquê |
|---|---|---|
| `OrdemServico` | `JobCard` | É como se chama a folha de reparação numa oficina britânica ou maltesa |
| `Placa` | `RegistrationNumber` | Termo oficial; "plate" é o objeto físico, não o identificador |
| `ValorMaoObra` | `LabourCharge` | Grafia britânica, e "charge" liga ao que se cobra |
| `OrdemServicoItem` | `Part` | O que se regista é a peça, não uma linha genérica |
| `HistoricoOrdemServico` | `JobCardStatusChange` | Diz o que a linha é, não onde está guardada |
| `Oficina` | `Workshop` | "Garage" em Malta é tanto oficina como o sítio onde se estaciona |

Grafia britânica em todo o lado: `Labour`, `Cancelled`, `Licence` — visível em
`GarageManager.Domain/Enums/JobCardStatus.cs:15`.

## Porquê

**Malta usa convenção britânica.** Inglês é língua oficial, a condução é à
esquerda, o vocabulário do ramo automóvel veio do Reino Unido. Escrever
`Cancelled` com dois L não é preciosismo: `Canceled` sinaliza software americano
a um utilizador que lê inglês britânico todos os dias.

**O vocabulário do código é o vocabulário do ecrã.** Como não há camada de
tradução — instalação dedicada, um só mercado, uma só língua — o nome da
propriedade acaba por ser o rótulo do formulário. Um domínio que fale a língua
do mecânico produz uma UI que fala a língua do mecânico, de graça.

**`Completed` e `Paid` ficam deliberadamente separados.** O modelo original
confundia os dois e reportava trabalho concluído como receita recebida.
`CONTEXT.md` define `Completed` como "o veículo foi entregue" e diz
explicitamente que nada afirma sobre pagamento. Esta separação de vocabulário é
o que torna os números financeiros confiáveis, e é pré-requisito do sprint 4.

## Consequências

**Positivas**

- Não há camada de tradução a manter entre domínio, API e UI.
- Um programador maltês contratado depois lê o domínio sem glossário.
- `CONTEXT.md` dá um teste objetivo para nomes novos: se o termo está na coluna
  "avoid", não entra.

**Negativas**

- O autor do código pensa em português e escreve num vocabulário que não é o seu.
  `CONTEXT.md` tem de ser consultado, não recordado.
- A rutura com o histórico é total: procurar `OrdemServico` no `git log` deixa de
  encontrar o código atual. O commit do rename é a ponte.
- Comentários e mensagens de commit continuam em português, enquanto o domínio
  está em inglês. É deliberado — o código é o produto, as notas de trabalho não —
  mas cria um repositório bilingue que é preciso saber ler.

## Nota sobre a fronteira

`CONTEXT.md` está em inglês porque define o vocabulário do próprio produto. Os
documentos de raciocínio — `MISSION.md`, `NOTES.md`, `plan/`, `reference/` e
estes ADRs — ficam em português, por serem material de trabalho e não parte do
que se vende.
