# GarageManager

Software sold to small independent vehicle repair workshops in Malta. One dedicated
installation per workshop. The language below is British motor-trade vocabulary, chosen
to match what a Maltese garage owner actually says — not literal translation from the
original Portuguese model.

## Language

### Parties

**Workshop**:
An independent vehicle repair business. It is the paying customer of this software, and
each one gets its own installation.
_Avoid_: Oficina, garage, tenant, shop, company

**Customer**:
A person or business whose vehicle is repaired by the Workshop.
_Avoid_: Cliente, client, owner, account

**Mechanic**:
A person employed by the Workshop who carries out repairs. Work is assigned to a Mechanic
whether or not that person ever signs in.
_Avoid_: Mecânico, technician, employee, worker

**User**:
A person who can sign in to a Workshop's installation. A Mechanic may or may not be one,
and a User need not be a Mechanic.
_Avoid_: Utilizador, login, account, operator

**Proprietor**:
The User who owns and runs the Workshop. Sees the money, hires and stands down staff, and
decides anything that changes what has already been agreed with a Customer. One of the two
roles a User can hold; the other is Mechanic.
_Avoid_: Dono, owner, admin, administrator, boss, manager

Note that a Vehicle's **owner** is a Customer, never a Proprietor — which is why the role
is not called Owner.

### Vehicles

**Vehicle**:
A car or van belonging to a Customer, identified by its Registration Number.
_Avoid_: Veículo, car, automobile, asset

**Registration Number**:
The official plate identifier of a Vehicle, known in the trade as the VRM.
_Avoid_: Placa, plate number, licence plate, VRM

### Work

**Job Card**:
The record of one repair visit, opened when the Vehicle arrives and completed as the work
progresses. It is the central record of the system.
_Avoid_: Ordem de Serviço, service order, work order, repair order, RO, ticket

**Complaint**:
The fault as reported by the Customer, in their own words, recorded when the Vehicle
arrives.
_Avoid_: Descrição, problem, issue, symptom

**Cause**:
What the Mechanic found to be wrong after inspecting the Vehicle.
_Avoid_: Diagnóstico, diagnosis, root cause, finding

**Correction**:
The work actually carried out on the Vehicle.
_Avoid_: Serviço executado, work done, repair, solution

**Part**:
A component or material fitted during a repair, recorded on a Job Card with a quantity
and a unit price.
_Avoid_: Item, OrdemServicoItem, material, product

**Labour Charge**:
The amount charged for the Mechanic's time on a Job Card, separate from Parts.
_Avoid_: ValorMaoObra, labor cost, service fee, workmanship

**Completed**:
The state of a Job Card whose repair work is finished and the Vehicle handed back. It
says nothing about whether the Customer has paid.
_Avoid_: Concluída, closed, finished, delivered, invoiced, faturado

### Money

**Payment**:
Money actually received from a Customer against a Job Card. A single Job Card may have
several, and their sum may be less than what is owed.
_Avoid_: Pagamento, receipt, settlement, transaction

**Outstanding Balance**:
What a Customer still owes on a Job Card — its total less the Payments received.
_Avoid_: Saldo devedor, debt, arrears, credit

**VAT**:
Maltese value added tax charged on a Job Card, at the standard rate unless an exemption
applies.
_Avoid_: IVA, tax, sales tax, imposto

**Tax Invoice**:
The document issued when the Customer is VAT-registered, carrying their VAT number.
_Avoid_: Nota fiscal, invoice, bill

**Fiscal Receipt**:
The document issued when the Customer is not VAT-registered.
_Avoid_: Recibo, receipt, cupom

## Notes on the language

- **British spelling throughout.** `Labour`, `Cancelled`, `Licence`. Malta follows British
  convention and the UI is read by Maltese users.
- **`Completed` and `Paid` are deliberately separate.** The original model conflated them,
  reporting completed work as revenue received. Keeping them apart is the reason the
  financial figures can be trusted.
- **Four parties, two roles.** Customer and installer both interact with the system but
  hold no role: the installer works outside it, and the Customer will reach a single Job
  Card through a capability token, never an account. Only Proprietor and Mechanic sign in.
