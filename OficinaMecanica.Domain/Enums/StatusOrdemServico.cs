using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Domain.Enums
{
    public enum StatusOrdemServico
    {
        Aberta,

        AguardandoAprovacao,

        Aprovada,

        Recusada,

        Concluida,

        Cancelada,

        Reaberta
    }
}
