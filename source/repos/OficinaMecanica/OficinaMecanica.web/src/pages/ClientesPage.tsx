import { useEffect, useState } from 'react';
import { Plus, Search, Phone, Mail, Users } from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Form';

import type { Cliente } from '../types';
import { clienteService } from '../services/clienteService';

import type { Page } from '../hooks/useNavigation';


interface ClientesPageProps {
  onNavigate: (
    page: Page,
    params?: Record<string,string>
  ) => void;
}



export function ClientesPage({
  onNavigate
}: ClientesPageProps) {


  const [clientes,setClientes] = useState<Cliente[]>([]);
  const [loading,setLoading] = useState(true);

  const [search,setSearch] = useState('');

  const [modalOpen,setModalOpen] = useState(false);
  const [saving,setSaving] = useState(false);


  const [form,setForm] = useState({
    nome:'',
    telefone:'',
    email:''
  });



  async function carregarClientes(){

    try{

      const response = await clienteService.list();

      console.log("CLIENTES:",response);

      setClientes(response);


    }catch(error){

      console.error(
        "Erro ao carregar clientes:",
        error
      );

    }finally{

      setLoading(false);

    }

  }



  useEffect(()=>{

    carregarClientes();

  },[]);




  const clientesFiltrados = clientes.filter((cliente)=>{

    const termo = search.toLowerCase();


    return (

      cliente.nome
      .toLowerCase()
      .includes(termo)

      ||

      cliente.telefone.includes(search)

      ||

      cliente.email
      .toLowerCase()
      .includes(termo)

    );

  });





  const totalVeiculos = clientes.reduce(
    (total,cliente)=>
      total + (cliente.quantidadeVeiculos ?? 0),
    0
  );





  async function handleSubmit(
    e:React.FormEvent
  ){

    e.preventDefault();

    setSaving(true);


    try{


      await clienteService.create({
        ...form,
        quantidadeVeiculos:0
      });



      await carregarClientes();



      setForm({
        nome:'',
        telefone:'',
        email:''
      });


      setModalOpen(false);



    }catch(error){

      console.error(
        "Erro ao criar cliente:",
        error
      );


    }finally{

      setSaving(false);

    }


  }





  if(loading){

    return(

      <div className="flex justify-center py-20">

        <div className="
          animate-spin
          h-8
          w-8
          border-2
          border-accent-500
          border-t-transparent
          rounded-full
        "/>

      </div>

    );

  }







return (

<div className="space-y-5">


<div className="
flex
flex-col
sm:flex-row
justify-between
gap-4
">


<div className="relative flex-1 max-w-sm">


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

onChange={(e)=>
setSearch(e.target.value)
}

placeholder="Buscar cliente..."

className="input-field pl-10"

/>


</div>



<Button

icon={<Plus size={18}/>}

onClick={()=>setModalOpen(true)}

>

Novo Cliente

</Button>


</div>






<div className="grid grid-cols-2 gap-4">


<Card className="p-4 flex items-center gap-3">

<Users size={20}/>

<div>

<p className="text-xl font-bold">
{clientes.length}
</p>

<p className="text-xs">
Clientes
</p>

</div>

</Card>





<Card className="p-4 flex items-center gap-3">

<Users size={20}/>

<div>

<p className="text-xl font-bold">
{totalVeiculos}
</p>

<p className="text-xs">
Veículos
</p>

</div>

</Card>


</div>







<Card className="p-5">


<Table
headers={[
'Nome',
'Telefone',
'Veículos'
]}
>


{
clientesFiltrados.map((cliente)=>(


<TableRow

key={cliente.id}

onClick={()=> 
onNavigate(
'cliente-detalhes',
{
id:cliente.id
}
)
}

className="
cursor-pointer
hover:bg-graphite-800
"

>


<TableCell>


<div className="flex items-center gap-3">


<div className="
w-9
h-9
rounded-full
bg-graphite-700
flex
items-center
justify-center
">

{
cliente.nome
.substring(0,2)
.toUpperCase()
}


</div>



<div>

<p className="font-medium">

{cliente.nome}

</p>


<p className="
text-xs
flex
gap-1
text-graphite-400
">

<Mail size={12}/>

{cliente.email}

</p>


</div>


</div>


</TableCell>






<TableCell>


<span className="flex gap-2">

<Phone size={14}/>

{cliente.telefone}

</span>


</TableCell>






<TableCell>


<span className="
inline-flex
px-3
py-1
rounded-md
bg-graphite-700
">


{cliente.quantidadeVeiculos ?? 0}


</span>


</TableCell>



</TableRow>


))

}



</Table>


</Card>









<Modal

open={modalOpen}

onClose={()=>setModalOpen(false)}

title="Cadastrar Cliente"


footer={

<>

<Button

variant="ghost"

onClick={()=>setModalOpen(false)}

>

Cancelar

</Button>



<Button

onClick={handleSubmit}

disabled={saving}

>

{
saving
?
'Salvando...'
:
'Salvar'
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

<Label>Nome</Label>


<Input

value={form.nome}

onChange={(e)=>
setForm({
...form,
nome:e.target.value
})
}

required

/>


</div>



<div>

<Label>Telefone</Label>


<Input

value={form.telefone}

onChange={(e)=>
setForm({
...form,
telefone:e.target.value
})
}

required

/>


</div>



<div>

<Label>Email</Label>


<Input

type="email"

value={form.email}

onChange={(e)=>
setForm({
...form,
email:e.target.value
})
}

required

/>


</div>



</form>


</Modal>



</div>

);


}