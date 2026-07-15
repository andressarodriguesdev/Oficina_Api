import { useEffect, useState } from 'react';
import { ArrowLeft, Car, Phone, Mail } from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

import type { Cliente, Veiculo } from '../types';

import { clienteService } from '../services/clienteService';
import { veiculoService } from '../services/veiculoService';
import type { Page } from '../hooks/useNavigation';


interface ClienteDetalhesPageProps {
  clienteId: string;
  onNavigate: (
    page: Page,
    params?: Record<string,string>
  ) => void;
}


export function ClienteDetalhesPage({
  clienteId,
  onNavigate
}: ClienteDetalhesPageProps) {


  const [cliente,setCliente] = useState<Cliente | null>(null);

  const [veiculos,setVeiculos] = useState<Veiculo[]>([]);

  const [loading,setLoading] = useState(true);



  async function carregarDados(){

    try {


      const clienteResponse =
        await clienteService.getById(clienteId);


      const veiculosResponse =
        await veiculoService.list();



      setCliente(clienteResponse);



      const meusVeiculos =
        veiculosResponse.filter(
          (v)=>
            v.clienteId === clienteId
        );


      setVeiculos(meusVeiculos);



    } catch(error){

      console.error(
        "Erro ao carregar detalhes:",
        error
      );


    } finally {

      setLoading(false);

    }

  }



  useEffect(()=>{

    carregarDados();

  },[]);





  if(loading){

    return (

      <div className="flex justify-center py-20">

        <div
          className="
          animate-spin
          h-8
          w-8
          border-2
          border-accent-500
          border-t-transparent
          rounded-full"
        />

      </div>

    );

  }




  if(!cliente){

    return (

      <div>
        Cliente não encontrado.
      </div>

    );

  }





  return (

    <div className="space-y-5">


      <Button
        variant="ghost"
        onClick={()=>onNavigate('clientes')}
      >

        <ArrowLeft size={18}/>

        Voltar

      </Button>





      <Card className="p-6">


        <div className="flex items-center gap-4">


          <div
            className="
            w-14
            h-14
            rounded-full
            bg-graphite-700
            flex
            items-center
            justify-center
            text-xl
            font-bold"
          >

            {
              cliente.nome
              .substring(0,2)
              .toUpperCase()
            }

          </div>



          <div>


            <h1 className="text-xl font-bold">

              {cliente.nome}

            </h1>


            <p className="flex gap-2 text-sm text-graphite-400">

              <Phone size={14}/>

              {cliente.telefone}

            </p>



            <p className="flex gap-2 text-sm text-graphite-400">

              <Mail size={14}/>

              {cliente.email}

            </p>



          </div>



        </div>


      </Card>






      <Card className="p-6">


        <div className="flex justify-between mb-4">


          <h2 className="text-lg font-bold">

            Veículos

          </h2>


          <span>

            {veiculos.length} cadastrados

          </span>


        </div>





        <div className="space-y-3">


          {
            veiculos.length === 0 && (

              <p className="text-graphite-400">

                Nenhum veículo cadastrado.

              </p>

            )
          }




          {
            veiculos.map((v)=>(


              <div
                key={v.id}
                className="
                flex
                items-center
                gap-4
                p-4
                rounded-lg
                bg-graphite-800"
              >


                <Car size={22}/>



                <div>


                  <p className="font-medium">

                    {v.marca} {v.modelo}

                  </p>



                  <p className="text-sm text-graphite-400">

                    {v.ano} • {v.placa}

                  </p>



                </div>



              </div>


            ))
          }



        </div>



      </Card>




    </div>

  );

}