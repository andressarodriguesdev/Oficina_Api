import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Card } from '../components/ui/Card';
import { PageLoader } from '../components/ui/Spinner';

import { obterFinanceiro, type FinanceiroResponse } from '../services/financeiro';

import { StatusBadge } from '../components/ui/StatusBadge';

export function Financeiro() {

  const [dados, setDados] = useState<FinanceiroResponse | null>(null);


  useEffect(() => {

    async function carregar() {

      const response = await obterFinanceiro();

      setDados(response);

    }


    carregar();

  }, []);



  if (!dados) {

    return (
      <PageLoader label="Carregando financeiro..." />
    );

  }



  return (

    <div className="space-y-5">


      {/* INDICADORES */}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">


        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Faturado
          </p>

          <strong className="text-2xl text-white">
            R$ {dados.totalFaturado.toFixed(2)}
          </strong>

          <p className="mt-2 text-xs text-ink-400">
            {dados.quantidadeConcluidas} OS concluídas
          </p>

        </Card>



        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Previsto
          </p>

          <strong className="text-2xl text-white">
            R$ {dados.totalPrevisto.toFixed(2)}
          </strong>

          <p className="mt-2 text-xs text-ink-400">
            {dados.quantidadePendentes} OS pendentes
          </p>

        </Card>



        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Canceladas
          </p>

          <strong className="text-2xl text-white">
            {dados.quantidadeCanceladas}
          </strong>

          <p className="mt-2 text-xs text-ink-400">
            Ordens canceladas
          </p>

        </Card>



        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Mão de obra
          </p>

          <strong className="text-2xl text-white">
            R$ {dados.totalMaoObra.toFixed(2)}
          </strong>

        </Card>



        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Peças
          </p>

          <strong className="text-2xl text-white">
            R$ {dados.totalPecas.toFixed(2)}
          </strong>

        </Card>


      </div>





      {/* TABELA */}

      <Card className="overflow-hidden">


        <div className="p-5">

          <h2 className="text-lg font-semibold text-white">
            Controle Financeiro das OS
          </h2>

        </div>



        <div className="overflow-x-auto">


          <table className="w-full">


            <thead>

              <tr className="border-b border-ink-700 text-left text-xs uppercase text-ink-400">


                <th className="px-5 py-3">
                  Cliente
                </th>


                <th className="px-5 py-3">
                  Veículo
                </th>


                <th className="px-5 py-3">
                  Mão de obra
                </th>


                <th className="px-5 py-3">
                  Peças
                </th>


                <th className="px-5 py-3">
                  Total
                </th>


                <th className="px-5 py-3">
                  Status
                </th>


                <th className="px-5 py-3">
                  Ação
                </th>


              </tr>

            </thead>




            <tbody className="divide-y divide-ink-700/40">


              {dados.ordens.map((ordem) => (


                <tr
                  key={ordem.id}
                  className="transition hover:bg-ink-800/30"
                >


                  <td className="px-5 py-3 text-white">
                    {ordem.cliente}
                  </td>



                  <td className="px-5 py-3 text-ink-200">
                    {ordem.veiculo}
                  </td>



                  <td className="px-5 py-3 text-ink-200">

                    R$ {ordem.maoObra.toFixed(2)}

                  </td>



                  <td className="px-5 py-3 text-ink-200">

                    R$ {ordem.pecas.toFixed(2)}

                  </td>



                  <td className="px-5 py-3 font-semibold text-white">

                    R$ {ordem.total.toFixed(2)}

                  </td>




                <td className="px-5 py-3">
                <StatusBadge status={ordem.status} />
                </td>




                  <td className="px-5 py-3">


                    <Link

                      to={`/ordens-servico/${ordem.id}`}

                      className="text-sm font-medium text-flame-400 hover:text-flame-300"

                    >

                      Ver OS

                    </Link>


                  </td>



                </tr>


              ))}


            </tbody>


          </table>


        </div>


      </Card>


    </div>

  );

}