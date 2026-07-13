using System.Linq;
using OficinaMecanica.Application.DTOs;

using OficinaMecanica.Domain.Entities;

using OficinaMecanica.Infrastructure.Repositories;

namespace OficinaMecanica.Application.Services;

public class OrdemServicoAppService

{

    private readonly OrdemServicoRepository _repository;

    private readonly ClienteRepository _clienteRepository;

    private readonly VeiculoRepository _veiculoRepository;

    public OrdemServicoAppService(

    OrdemServicoRepository repository,

    ClienteRepository clienteRepository,

    VeiculoRepository veiculoRepository)

    {

        _repository = repository;

        _clienteRepository = clienteRepository;

        _veiculoRepository = veiculoRepository;

    }

    public async Task<OrdemServicoResponseDto> CriarAsync(CriarOrdemServicoDto dto)

    {

        var cliente = await _clienteRepository.ObterPorIdAsync(dto.ClienteId);

        if (cliente == null)

            throw new Exception("Cliente não encontrado.");

        var veiculo = await _veiculoRepository.ObterPorIdAsync(dto.VeiculoId);

        if (veiculo == null)

            throw new Exception("Veículo não encontrado.");

        if (veiculo.ClienteId != dto.ClienteId)

            throw new Exception("O veículo não pertence ao cliente informado.");

        var ordemServico = new OrdemServico(

        dto.ClienteId,

        dto.VeiculoId,

        dto.Descricao,

        dto.Valor);

        var ordemCriada = await _repository.AdicionarAsync(ordemServico);

        return new OrdemServicoResponseDto
        {
            Id = ordemCriada.Id,
            ClienteId = ordemCriada.ClienteId,
            VeiculoId = ordemCriada.VeiculoId,
            Descricao = ordemCriada.Descricao,
            Valor = ordemCriada.Valor,
            Status = ordemCriada.Status,
            DataCriacao = ordemCriada.DataCriacao,
            DataEnvioAprovacao = ordemCriada.DataEnvioAprovacao,
            DataConclusao = ordemCriada.DataConclusao,

            DataCancelamento = ordemCriada.DataCancelamento,
            MotivoCancelamento = ordemCriada.MotivoCancelamento,

            DataReabertura = ordemCriada.DataReabertura,
            MotivoReabertura = ordemCriada.MotivoReabertura
        };

    }

    public async Task<OrdemServicoResponseDto?> ObterPorIdAsync(Guid id)

    {

        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)

            return null;

        return new OrdemServicoResponseDto

        {

            Id = ordem.Id,

            ClienteId = ordem.ClienteId,

            VeiculoId = ordem.VeiculoId,

            Descricao = ordem.Descricao,

            Valor = ordem.Valor,

            Status = ordem.Status,

            DataCriacao = ordem.DataCriacao,

            DataEnvioAprovacao = ordem.DataEnvioAprovacao,

            DataConclusao = ordem.DataConclusao,

            DataCancelamento = ordem.DataCancelamento,

            MotivoCancelamento = ordem.MotivoCancelamento,

            DataReabertura = ordem.DataReabertura,

            MotivoReabertura = ordem.MotivoReabertura

        };

    }

    public async Task<List<OrdemServicoResponseDto>> ListarAsync()

    {

        var ordens = await _repository.ListarAsync();

        return ordens.Select(ordem => new OrdemServicoResponseDto

        {

            Id = ordem.Id,

            ClienteId = ordem.ClienteId,

            VeiculoId = ordem.VeiculoId,

            Descricao = ordem.Descricao,

            Valor = ordem.Valor,

            Status = ordem.Status,

            DataCriacao = ordem.DataCriacao,

            DataEnvioAprovacao = ordem.DataEnvioAprovacao,

            DataConclusao = ordem.DataConclusao,

            DataCancelamento = ordem.DataCancelamento,

            MotivoCancelamento = ordem.MotivoCancelamento,

            DataReabertura = ordem.DataReabertura,

            MotivoReabertura = ordem.MotivoReabertura

        }).ToList();

    }

    public async Task EnviarParaAprovacaoAsync(Guid id)

    {

        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)

            throw new Exception("Ordem de serviço não encontrada.");

        ordem.EnviarParaAprovacao();

        await _repository.AtualizarAsync(ordem);

    }


    public async Task AprovarAsync(Guid id)

    {

        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)

            throw new Exception("Ordem de serviço não encontrada.");

        ordem.Aprovar();

        await _repository.AtualizarAsync(ordem);

    }


    public async Task RecusarAsync(Guid id)

    {

        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)

            throw new Exception("Ordem de serviço não encontrada.");

        ordem.Recusar();

        await _repository.AtualizarAsync(ordem);

    }


    public async Task ConcluirAsync(Guid id)

    {

        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)

            throw new Exception("Ordem de serviço não encontrada.");

        ordem.Concluir();

        await _repository.AtualizarAsync(ordem);

    }


    public async Task CancelarAsync(Guid id, string motivo)

    {

        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)

            throw new Exception("Ordem de serviço não encontrada.");

        ordem.Cancelar(motivo);

        await _repository.AtualizarAsync(ordem);

    }


    public async Task ReabrirAsync(Guid id, string motivo)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception("Ordem de serviço não encontrada.");

        ordem.Reabrir(motivo);

        await _repository.AtualizarAsync(ordem);
    }

}