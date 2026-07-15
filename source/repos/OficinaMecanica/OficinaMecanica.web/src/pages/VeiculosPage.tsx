import { useEffect, useState } from 'react';
import { Plus, Search, Car } from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, Label } from '../components/ui/Form';

import type { Cliente, Veiculo } from '../types';

import { clienteService } from '../services/clienteService';
import { veiculoService } from '../services/veiculoService';


export function VeiculosPage() {

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);


  const [form, setForm] = useState({

    clienteId: '',
    modelo: '',
    marca: '',
    ano: '',
    placa: '',

  });



  useEffect(() => {

    async function carregarDados() {

      try {

        const [veiculosResponse, clientesResponse] =
          await Promise.all([
            veiculoService.list(),
            clienteService.list(),
          ]);


        console.log("VEICULOS:", veiculosResponse);
        console.log("CLIENTES:", clientesResponse);


        setVeiculos(veiculosResponse);

        setClientes(clientesResponse);


      } catch (error) {

        console.error(
          "Erro ao carregar veículos:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    carregarDados();


  }, []);




  const filtered = veiculos.filter((v) =>

    v.modelo
      .toLowerCase()
      .includes(search.toLowerCase())

    ||

    v.marca
      .toLowerCase()
      .includes(search.toLowerCase())

    ||

    v.placa
      .toLowerCase()
      .includes(search.toLowerCase())

  );




  const getCliente = (id: string) => {

    return (
      clientes.find((c) => c.id === id)?.nome
      ?? '—'
    );

  };





  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setSaving(true);


    try {


      await veiculoService.create({

        clienteId: form.clienteId,

        modelo: form.modelo,

        marca: form.marca,

        ano: form.ano,

        placa: form.placa.toUpperCase(),

      });



      const [
        veiculosAtualizados,
        clientesAtualizados
      ] = await Promise.all([

        veiculoService.list(),

        clienteService.list(),

      ]);



      setVeiculos(
        veiculosAtualizados
      );


      setClientes(
        clientesAtualizados
      );



      setForm({

        clienteId: '',

        modelo: '',

        marca: '',

        ano: '',

        placa: '',

      });



      setModalOpen(false);



    } catch(error) {


      console.error(
        "Erro ao cadastrar veículo:",
        error
      );


    } finally {


      setSaving(false);


    }

  };





  if (loading) {

    return (

      <div className="flex items-center justify-center py-20">

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





  return (

    <div className="space-y-5">


      {/* Toolbar */}

      <div className="
        flex 
        flex-col 
        sm:flex-row 
        sm:items-center 
        justify-between 
        gap-4
      ">


        <div className="
          relative 
          flex-1 
          max-w-sm
        ">


          <Search

            size={18}

            className="
            absolute 
            left-3 
            top-1/2 
            -translate-y-1/2 
            text-graphite-400
            "

          />



          <input

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

            placeholder="Buscar veículo..."

            className="
            input-field 
            pl-10
            "

          />


        </div>





        <Button

          icon={<Plus size={18}/>}

          onClick={() =>
            setModalOpen(true)
          }

        >

          Novo Veículo

        </Button>


      </div>






      {/* Tabela */}


      <Card className="p-5">


        <Table

          headers={[
            'Modelo',
            'Marca',
            'Ano',
            'Placa',
            'Cliente'
          ]}

        >


          {
            filtered.map((v) => (

              <TableRow key={v.id}>


                <TableCell>


                  <div className="
                    flex 
                    items-center 
                    gap-3
                  ">


                    <div className="
                      p-2 
                      rounded-lg 
                      bg-graphite-700 
                      text-accent-400
                    ">

                      <Car size={18}/>

                    </div>


                    <span className="
                      font-medium 
                      text-graphite-100
                    ">

                      {v.modelo}

                    </span>


                  </div>


                </TableCell>





                <TableCell className="text-graphite-300">

                  {v.marca}

                </TableCell>





                <TableCell className="text-graphite-300">

                  {v.ano}

                </TableCell>





                <TableCell>


                  <span className="
                    font-mono 
                    text-sm 
                    bg-graphite-700 
                    px-2 
                    py-1 
                    rounded 
                    text-graphite-200
                  ">

                    {v.placa}

                  </span>


                </TableCell>





                <TableCell className="text-graphite-300">

                  {getCliente(v.clienteId)}

                </TableCell>


              </TableRow>


            ))
          }


        </Table>


      </Card>







      {/* Modal Cadastro */}



      <Modal

        open={modalOpen}

        onClose={() =>
          setModalOpen(false)
        }

        title="Cadastrar Veículo"


        footer={

          <>

            <Button

              variant="ghost"

              onClick={() =>
                setModalOpen(false)
              }

            >

              Cancelar

            </Button>



            <Button

              onClick={handleSubmit}

              disabled={
                saving ||
                !form.clienteId
              }

              icon={
                saving
                ? undefined
                : <Plus size={18}/>
              }

            >

              {
                saving
                ? 'Salvando...'
                : 'Salvar'
              }

            </Button>


          </>

        }


      >


        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >



          <div>


            <Label>
              Cliente
            </Label>



            <Select

              value={form.clienteId}

              onChange={(e)=>
                setForm({
                  ...form,
                  clienteId:e.target.value
                })
              }

              required

            >


              <option value="">
                Selecione um cliente...
              </option>


              {
                clientes.map((c)=>(

                  <option

                    key={c.id}

                    value={c.id}

                  >

                    {c.nome}

                  </option>


                ))
              }


            </Select>


          </div>





          <div className="
            grid 
            grid-cols-2 
            gap-4
          ">


            <div>

              <Label>
                Modelo
              </Label>


              <Input

                value={form.modelo}

                onChange={(e)=>
                  setForm({
                    ...form,
                    modelo:e.target.value
                  })
                }

                required

              />


            </div>





            <div>

              <Label>
                Marca
              </Label>


              <Input

                value={form.marca}

                onChange={(e)=>
                  setForm({
                    ...form,
                    marca:e.target.value
                  })
                }

                required

              />


            </div>


          </div>





          <div className="
            grid 
            grid-cols-2 
            gap-4
          ">


            <div>

              <Label>
                Ano
              </Label>


              <Input

                value={form.ano}

                onChange={(e)=>
                  setForm({
                    ...form,
                    ano:e.target.value
                  })
                }

                required

              />


            </div>





            <div>

              <Label>
                Placa
              </Label>


              <Input

                value={form.placa}

                onChange={(e)=>
                  setForm({
                    ...form,
                    placa:e.target.value
                  })
                }

                className="uppercase"

                required

              />


            </div>


          </div>



        </form>


      </Modal>



    </div>

  );

}