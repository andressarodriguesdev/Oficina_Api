import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Card } from '../components/ui/Card';
import { PageLoader } from '../components/ui/Spinner';

import { getFinance, type FinanceResponse } from '../services/finance';

import { StatusBadge } from '../components/ui/StatusBadge';

export function Finance() {

  const [data, setData] = useState<FinanceResponse | null>(null);


  useEffect(() => {

    async function load() {

      const response = await getFinance();

      setData(response);

    }


    load();

  }, []);



  if (!data) {

    return (
      <PageLoader label="Loading finance..." />
    );

  }



  return (

    <div className="space-y-5">


      {/* SUMMARY */}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">


        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Invoiced
          </p>

          <strong className="text-2xl text-white">
            € {data.totalInvoiced.toFixed(2)}
          </strong>

          <p className="mt-2 text-xs text-ink-400">
            {data.completedCount} completed job cards
          </p>

        </Card>



        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Forecast
          </p>

          <strong className="text-2xl text-white">
            € {data.totalForecast.toFixed(2)}
          </strong>

          <p className="mt-2 text-xs text-ink-400">
            {data.pendingCount} pending job cards
          </p>

        </Card>



        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Cancelled
          </p>

          <strong className="text-2xl text-white">
            {data.cancelledCount}
          </strong>

          <p className="mt-2 text-xs text-ink-400">
            Cancelled job cards
          </p>

        </Card>



        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Labour
          </p>

          <strong className="text-2xl text-white">
            € {data.totalLabour.toFixed(2)}
          </strong>

        </Card>



        <Card className="p-5">

          <p className="text-sm text-ink-400">
            Parts
          </p>

          <strong className="text-2xl text-white">
            € {data.totalParts.toFixed(2)}
          </strong>

        </Card>


      </div>





      {/* TABLE */}

      <Card className="overflow-hidden">


        <div className="p-5">

          <h2 className="text-lg font-semibold text-white">
            Job Card Financial Control
          </h2>

        </div>



        <div className="overflow-x-auto">


          <table className="w-full">


            <thead>

              <tr className="border-b border-ink-700 text-left text-xs uppercase text-ink-400">


                <th className="px-5 py-3">
                  Customer
                </th>


                <th className="px-5 py-3">
                  Vehicle
                </th>


                <th className="px-5 py-3">
                  Labour
                </th>


                <th className="px-5 py-3">
                  Parts
                </th>


                <th className="px-5 py-3">
                  Total
                </th>


                <th className="px-5 py-3">
                  Status
                </th>


                <th className="px-5 py-3">
                  Action
                </th>


              </tr>

            </thead>




            <tbody className="divide-y divide-ink-700/40">


              {data.jobCards.map((jobCard) => (


                <tr
                  key={jobCard.id}
                  className="transition hover:bg-ink-800/30"
                >


                  <td className="px-5 py-3 text-white">
                    {jobCard.customer}
                  </td>



                  <td className="px-5 py-3 text-ink-200">
                    {jobCard.vehicle}
                  </td>



                  <td className="px-5 py-3 text-ink-200">

                    € {jobCard.labour.toFixed(2)}

                  </td>



                  <td className="px-5 py-3 text-ink-200">

                    € {jobCard.parts.toFixed(2)}

                  </td>



                  <td className="px-5 py-3 font-semibold text-white">

                    € {jobCard.total.toFixed(2)}

                  </td>




                <td className="px-5 py-3">
                <StatusBadge status={jobCard.status} />
                </td>




                  <td className="px-5 py-3">


                    <Link

                      to={`/job-cards/${jobCard.id}`}

                      className="text-sm font-medium text-flame-400 hover:text-flame-300"

                    >

                      View job card

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
