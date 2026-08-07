using OficinaMecanica.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs;
 
   
public class ClienteHistoricoResponseDto
{
    public Guid OrdemServicoId { get; set; }

    public decimal ValorTotal { get; set; }

    public StatusOrdemServico StatusAtual { get; set; }

    public DateTime DataCriacao { get; set; }

    public List<HistoricoOrdemServicoResponseDto> Historicos { get; set; } = new();
}
