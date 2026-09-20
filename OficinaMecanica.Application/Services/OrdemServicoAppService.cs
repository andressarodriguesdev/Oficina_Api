using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Exceptions;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Domain.Enums;
using OficinaMecanica.Infrastructure.Repositories;

namespace OficinaMecanica.Application.Services;

public class OrdemServicoAppService
{
    private readonly OrdemServicoRepository _repository;
    private readonly ClienteRepository _clienteRepository;
    private readonly VeiculoRepository _veiculoRepository;
    private readonly HistoricoOrdemServicoRepository _historicoRepository;
    private readonly MecanicoRepository _mecanicoRepository;
    private readonly OficinaRepository _oficinaRepository;
    private readonly PecasRepository _pecasRepository;


public OrdemServicoAppService(
    OrdemServicoRepository repository,
    ClienteRepository clienteRepository,
    VeiculoRepository veiculoRepository,
    HistoricoOrdemServicoRepository historicoRepository,
    MecanicoRepository mecanicoRepository,
    OficinaRepository oficinaRepository,
    PecasRepository pecasRepository)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _veiculoRepository = veiculoRepository;
        _historicoRepository = historicoRepository;
        _mecanicoRepository = mecanicoRepository;
        _oficinaRepository = oficinaRepository;
        _pecasRepository = pecasRepository;
    }

    public async Task<OrdemServicoResponseDto> CriarAsync(
        CriarOrdemServicoDto dto)
    {
        var oficinaId = await ObterOficinaIdAsync();

        var cliente = await _clienteRepository.ObterPorIdAsync(
            dto.ClienteId,
            oficinaId
        );

        if (cliente == null)
            throw new Exception("Cliente não encontrado.");

        var veiculo = await _veiculoRepository.ObterPorIdAsync(
            dto.VeiculoId,
            oficinaId
        );

        if (veiculo == null)
            throw new Exception("Veículo não encontrado.");

        if (veiculo.ClienteId != dto.ClienteId)
            throw new Exception(
                "O veículo não pertence ao cliente informado."
            );

        if (veiculo.OficinaId != cliente.OficinaId)
            throw new Exception(
                "O veículo não pertence à oficina do cliente."
            );

        var mecanico = await _mecanicoRepository.GetByIdAsync(
            dto.MecanicoId,
            oficinaId
        );

        if (mecanico == null)
            throw new Exception("Mecânico não encontrado.");

        if (mecanico.OficinaId != cliente.OficinaId)
            throw new Exception(
                "O mecânico não pertence à oficina do cliente."
            );

        /*
         * A OS criada começa como ativa e, portanto, suas peças
         * passam a reservar estoque.
         *
         * A validação é feita agrupando as ocorrências da mesma peça,
         * para evitar que duas linhas da mesma OS ultrapassem
         * o estoque disponível quando somadas.
         */
        var itensComPeca = dto.Itens
            .Where(i => i.PecaId.HasValue)
            .GroupBy(i => i.PecaId!.Value);

        foreach (var grupo in itensComPeca)
        {
            var quantidadeSolicitada = grupo.Sum(i => i.Quantidade);

            var peca = await ValidarPecaAsync(
                grupo.Key,
                oficinaId
            );

            await ValidarDisponibilidadePecaAsync(
                peca!,
                quantidadeSolicitada
            );
        }

        var ordemServico = new OrdemServico(
            cliente.OficinaId,
            dto.ClienteId,
            dto.VeiculoId,
            dto.MecanicoId,
            dto.Descricao,
            dto.ValorMaoObra
        );

        foreach (var itemDto in dto.Itens)
        {
            var peca = await ValidarPecaAsync(
                itemDto.PecaId,
                oficinaId
            );

            var descricao = peca != null
                ? peca.Nome
                : itemDto.Descricao;

            var item = new OrdemServicoItem(
                descricao,
                itemDto.Quantidade,
                itemDto.ValorUnitario,
                itemDto.PecaId
            );

            ordemServico.AdicionarItem(item);
        }

        var ordemCriada = await _repository.AdicionarAsync(
            ordemServico
        );

        return MapearResponse(ordemCriada);
    }

    public async Task<OrdemServicoResponseDto?> ObterPorIdAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            return null;

        return MapearResponse(ordem);
    }

    public async Task<OrdemServico?> ObterEntidadePorIdAsync(Guid id)
    {
        return await _repository.ObterPorIdAsync(id);
    }

    public async Task<List<OrdemServicoResponseDto>> ListarAsync()
    {
        var ordens = await _repository.ListarAsync();

        return ordens
            .Select(MapearResponse)
            .ToList();
    }

    public async Task EnviarParaAprovacaoAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception(
                "Ordem de serviço não encontrada."
            );

        var statusAnterior = ordem.Status;

        ordem.EnviarParaAprovacao();

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(
            ordem,
            statusAnterior
        );
    }

    public async Task AprovarAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception(
                "Ordem de serviço não encontrada."
            );

        var statusAnterior = ordem.Status;

        ordem.Aprovar();

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(
            ordem,
            statusAnterior
        );
    }

    public async Task RecusarAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception(
                "Ordem de serviço não encontrada."
            );

        var statusAnterior = ordem.Status;

        ordem.Recusar();

        /*
         * A recusa apenas libera a reserva.
         * O estoque físico não é alterado porque nenhuma peça
         * havia sido baixada.
         */
        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(
            ordem,
            statusAnterior
        );
    }

    public async Task ConcluirAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception(
                "Ordem de serviço não encontrada."
            );

        /*
         * Antes de concluir, as peças deixam de ser apenas
         * reservadas e passam a ser efetivamente consumidas.
         *
         * As ocorrências da mesma peça são somadas para realizar
         * uma única baixa física.
         */
        var itensComPeca = ordem.Itens
            .Where(i => i.PecaId.HasValue)
            .GroupBy(i => i.PecaId!.Value)
            .Select(g => new
            {
                PecaId = g.Key,
                Quantidade = g.Sum(i => i.Quantidade)
            })
            .ToList();

        var oficinaId = ordem.OficinaId;

        var pecasParaBaixa = new List<(Pecas Peca, int Quantidade)>();

        foreach (var item in itensComPeca)
        {
            var peca = await ValidarPecaAsync(
                item.PecaId,
                oficinaId
            );

            if (peca == null)
                continue;

            if (item.Quantidade > peca.QuantidadeEstoque)
            {
                throw new RegraNegocioException(
                    $"Estoque insuficiente para a peça '{peca.Nome}'. " +
                    $"Estoque físico: {peca.QuantidadeEstoque}. " +
                    $"Quantidade necessária: {item.Quantidade}."
                );
            }

            pecasParaBaixa.Add(
                (peca, item.Quantidade)
            );
        }

        foreach (var item in pecasParaBaixa)
        {
            item.Peca.AjustarEstoque(
                item.Peca.QuantidadeEstoque - item.Quantidade
            );

            _pecasRepository.Update(item.Peca);
        }

        var statusAnterior = ordem.Status;

        ordem.Concluir();

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(
            ordem,
            statusAnterior
        );
    }

    public async Task CancelarAsync(
        Guid id,
        string motivo)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception(
                "Ordem de serviço não encontrada."
            );

        var statusAnterior = ordem.Status;

        ordem.Cancelar(motivo);

        /*
         * O cancelamento apenas libera a reserva.
         * Nenhuma quantidade é devolvida ao estoque físico,
         * pois ela ainda não havia sido baixada.
         */
        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(
            ordem,
            statusAnterior,
            motivo
        );
    }

    public async Task ReabrirAsync(
        Guid id,
        string motivo)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception(
                "Ordem de serviço não encontrada."
            );

        var statusAnterior = ordem.Status;

        /*
         * Se a OS estava concluída, suas peças já foram baixadas
         * fisicamente. Ao reabrir, elas precisam voltar ao estoque
         * físico e, depois, passam novamente a ser reservadas
         * pela OS reaberta.
         *
         * Se a OS estava cancelada ou recusada, não há devolução
         * física, pois nesses estados as peças nunca foram baixadas.
         */
        if (statusAnterior == StatusOrdemServico.Concluida)
        {
            var itensComPeca = ordem.Itens
                .Where(i => i.PecaId.HasValue)
                .GroupBy(i => i.PecaId!.Value)
                .Select(g => new
                {
                    PecaId = g.Key,
                    Quantidade = g.Sum(i => i.Quantidade)
                })
                .ToList();

            foreach (var item in itensComPeca)
            {
                var peca = await ValidarPecaAsync(
                    item.PecaId,
                    ordem.OficinaId
                );

                if (peca == null)
                    continue;

                peca.AjustarEstoque(
                    peca.QuantidadeEstoque + item.Quantidade
                );

                _pecasRepository.Update(peca);
            }
        }

        ordem.Reabrir(motivo);

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(
            ordem,
            statusAnterior,
            motivo
        );
    }

    public async Task<List<HistoricoOrdemServicoResponseDto>>
        ObterHistoricoAsync(Guid ordemServicoId)
    {
        var historicos = await _historicoRepository
            .ObterPorOrdemServicoIdAsync(ordemServicoId);

        return historicos
            .Select(h => new HistoricoOrdemServicoResponseDto
            {
                Id = h.Id,
                OrdemServicoId = h.OrdemServicoId,
                StatusAnterior = h.StatusAnterior,
                NovoStatus = h.NovoStatus,
                Observacao = h.Observacao,
                DataAlteracao = h.DataAlteracao
            })
            .ToList();
    }

    private async Task RegistrarHistoricoAsync(
        OrdemServico ordem,
        StatusOrdemServico statusAnterior,
        string? observacao = null)
    {
        var historico = new HistoricoOrdemServico(
            ordem.Id,
            statusAnterior,
            ordem.Status,
            observacao
        );

        await _historicoRepository.AdicionarAsync(
            historico
        );
    }

    private static OrdemServicoResponseDto MapearResponse(
        OrdemServico ordem)
    {
        return new OrdemServicoResponseDto
        {
            Id = ordem.Id,

            ClienteId = ordem.ClienteId,

            VeiculoId = ordem.VeiculoId,

            Cliente = new ClienteResponseDto
            {
                Id = ordem.Cliente.Id,
                Nome = ordem.Cliente.Nome,
                Telefone = ordem.Cliente.Telefone
            },

            Veiculo = new VeiculoResponseDto
            {
                Id = ordem.Veiculo.Id,
                Marca = ordem.Veiculo.Marca,
                Modelo = ordem.Veiculo.Modelo,
                Placa = ordem.Veiculo.Placa
            },

            MecanicoId = ordem.MecanicoId,

            Mecanico = ordem.Mecanico == null
                ? null
                : new MecanicoResponseDto
                {
                    Id = ordem.Mecanico.Id,
                    Nome = ordem.Mecanico.Nome,
                    Telefone = ordem.Mecanico.Telefone,
                    Especialidade = ordem.Mecanico.Especialidade,
                    OficinaId = ordem.Mecanico.OficinaId
                },

            Descricao = ordem.Descricao,

            ValorMaoObra = ordem.ValorMaoObra,

            ValorTotal = ordem.ValorTotal,

            Status = ordem.Status,

            DataCriacao = ordem.DataCriacao,

            Itens = ordem.Itens
                .Select(i => new OrdemServicoItemDto
                {
                    Id = i.Id,
                    PecaId = i.PecaId,
                    Descricao = i.Descricao,
                    Quantidade = i.Quantidade,
                    ValorUnitario = i.ValorUnitario
                })
                .ToList(),

            Historicos = ordem.Historicos
                .Select(h =>
                    new HistoricoOrdemServicoResponseDto
                    {
                        Id = h.Id,
                        OrdemServicoId = h.OrdemServicoId,
                        StatusAnterior = h.StatusAnterior,
                        NovoStatus = h.NovoStatus,
                        Observacao = h.Observacao,
                        DataAlteracao = h.DataAlteracao
                    })
                .ToList()
        };
    }

    public async Task AdicionarItemAsync(
        Guid ordemId,
        OrdemServicoItemDto dto)
    {
        var ordem = await _repository.ObterPorIdAsync(
            ordemId
        );

        if (ordem == null)
            throw new Exception(
                "Ordem não encontrada."
            );

        var oficinaId = await ObterOficinaIdAsync();

        var peca = await ValidarPecaAsync(
            dto.PecaId,
            oficinaId
        );

        if (peca != null)
        {
            /*
             * A OS atual já possui uma quantidade reservada dessa
             * mesma peça. Como estamos adicionando uma nova linha,
             * essa quantidade também precisa ser considerada.
             */
            var quantidadeJaNaOrdem = ordem.Itens
                .Where(i =>
                    i.PecaId == dto.PecaId
                )
                .Sum(i => i.Quantidade);

            await ValidarDisponibilidadePecaAsync(
                peca,
                quantidadeJaNaOrdem + dto.Quantidade,
                ordem.Id
            );
        }

        var descricao = peca != null
            ? peca.Nome
            : dto.Descricao;

        var item = new OrdemServicoItem(
            descricao,
            dto.Quantidade,
            dto.ValorUnitario,
            dto.PecaId
        );

        await _repository.AdicionarItemAsync(
            ordem,
            item
        );
    }

    public async Task AtualizarItemAsync(
        Guid ordemId,
        Guid itemId,
        OrdemServicoItemDto dto)
    {
        var ordem = await _repository.ObterPorIdAsync(
            ordemId
        );

        if (ordem == null)
            throw new Exception(
                "Ordem não encontrada."
            );

        var oficinaId = await ObterOficinaIdAsync();

        var peca = await ValidarPecaAsync(
            dto.PecaId,
            oficinaId
        );

        if (peca != null)
        {
            /*
             * O item que está sendo editado será substituído.
             * Portanto, ele não pode continuar contando como
             * reserva durante a validação.
             *
             * Somamos somente os outros itens da mesma peça
             * existentes na OS.
             */
            var quantidadeDosOutrosItens = ordem.Itens
                .Where(i =>
                    i.Id != itemId &&
                    i.PecaId == dto.PecaId
                )
                .Sum(i => i.Quantidade);

            await ValidarDisponibilidadePecaAsync(
                peca,
                quantidadeDosOutrosItens + dto.Quantidade,
                ordem.Id
            );
        }

        var descricao = peca != null
            ? peca.Nome
            : dto.Descricao;

        ordem.AtualizarItem(
            itemId,
            descricao,
            dto.Quantidade,
            dto.ValorUnitario,
            dto.PecaId
        );

        await _repository.SalvarAsync();
    }

    public async Task RemoverItemAsync(
        Guid ordemId,
        Guid itemId)
    {
        var ordem = await _repository.ObterPorIdAsync(
            ordemId
        );

        if (ordem == null)
            throw new Exception(
                "Ordem não encontrada."
            );

        ordem.RemoverItem(itemId);

        await _repository.SalvarAsync();
    }

    public async Task AtualizarAsync(
        Guid id,
        AtualizarOrdemServicoDto dto)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception(
                "Ordem de serviço não encontrada."
            );

        if (
            ordem.Status != StatusOrdemServico.Aberta &&
            ordem.Status != StatusOrdemServico.AguardandoAprovacao
        )
        {
            throw new Exception(
                "Somente ordens abertas ou aguardando aprovação podem ser editadas."
            );
        }

        var oficinaId = await ObterOficinaIdAsync();

        var cliente = await _clienteRepository.ObterPorIdAsync(
            dto.ClienteId,
            oficinaId
        );

        if (cliente == null)
            throw new Exception(
                "Cliente não encontrado."
            );

        var veiculo = await _veiculoRepository.ObterPorIdAsync(
            dto.VeiculoId,
            oficinaId
        );

        if (veiculo == null)
            throw new Exception(
                "Veículo não encontrado."
            );

        if (veiculo.ClienteId != dto.ClienteId)
            throw new Exception(
                "O veículo não pertence ao cliente informado."
            );

        if (veiculo.OficinaId != cliente.OficinaId)
            throw new Exception(
                "O veículo não pertence à oficina do cliente."
            );

        var mecanico = await _mecanicoRepository.GetByIdAsync(
            dto.MecanicoId,
            oficinaId
        );

        if (mecanico == null)
            throw new Exception(
                "Mecânico não encontrado."
            );

        if (mecanico.OficinaId != cliente.OficinaId)
            throw new Exception(
                "O mecânico não pertence à oficina do cliente."
            );

        if (ordem.OficinaId != cliente.OficinaId)
            throw new Exception(
                "A ordem de serviço não pertence à oficina do cliente."
            );

        ordem.AtualizarDados(
            dto.ClienteId,
            dto.VeiculoId,
            dto.MecanicoId,
            dto.Descricao,
            dto.ValorMaoObra
        );

        await _repository.AtualizarAsync(ordem);
    }

    private async Task<Guid> ObterOficinaIdAsync()
    {
        var oficina = await _oficinaRepository.ObterUnicaAsync();

        if (oficina == null)
            throw new Exception(
                "Nenhuma oficina cadastrada no sistema."
            );

        return oficina.Id;
    }

    private async Task<Pecas?> ValidarPecaAsync(
        Guid? pecaId,
        Guid oficinaId)
    {
        if (pecaId == null)
            return null;

        var peca = await _pecasRepository.GetByIdAsync(
            pecaId.Value,
            oficinaId
        );

        if (peca == null)
            throw new RegraNegocioException(
                "Peça não encontrada."
            );

        if (!peca.Ativa)
            throw new RegraNegocioException(
                "A peça selecionada está inativa."
            );

        return peca;
    }

    private async Task ValidarDisponibilidadePecaAsync(
        Pecas peca,
        int quantidadeSolicitada,
        Guid? excluirOrdemId = null)
    {
        if (quantidadeSolicitada <= 0)
            throw new RegraNegocioException(
                $"A quantidade da peça '{peca.Nome}' deve ser maior que zero."
            );

        var quantidadeReservada =
            await _repository.ObterQuantidadeReservadaAsync(
                peca.Id,
                excluirOrdemId
            );

        var quantidadeDisponivel =
            peca.QuantidadeEstoque - quantidadeReservada;

        if (quantidadeSolicitada > quantidadeDisponivel)
        {
            /*
             * Busca quais Ordens de Serviço estão segurando
             * as reservas dessa peça.
             *
             * Quando estamos editando uma OS, o próprio método
             * exclui essa OS da lista de reservas.
             */
            var reservas =
                await _repository.ObterReservasPorOrdemAsync(
                    peca.Id,
                    excluirOrdemId
                );

            var descricaoReservas = reservas.Count == 0
                ? "Nenhuma outra Ordem de Serviço possui reserva."
                : string.Join(
                    ", ",
                    reservas.Select(reserva =>
                        $"OS #{reserva.OrdemId.ToString()[..8].ToUpper()} " +
                        $"({reserva.Quantidade} unidade(s))"
                    )
                );

            throw new RegraNegocioException(
                $"Estoque insuficiente para a peça '{peca.Nome}'. " +
                $"Estoque físico: {peca.QuantidadeEstoque}. " +
                $"Reservado: {quantidadeReservada}. " +
                $"Disponível: {Math.Max(quantidadeDisponivel, 0)}. " +
                $"Quantidade solicitada: {quantidadeSolicitada}. " +
                $"Reservas: {descricaoReservas}."
            );
        }
    }

}
