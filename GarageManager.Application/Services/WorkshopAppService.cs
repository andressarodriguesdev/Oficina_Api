using GarageManager.Application.DTOs;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Repositories;

namespace GarageManager.Application.Services;

public class WorkshopAppService
{
    private readonly WorkshopRepository _repository;

    public WorkshopAppService(WorkshopRepository repository)
    {
        _repository = repository;
    }

    public async Task<WorkshopResponseDto> CreateAsync(CreateWorkshopDto dto)
    {
        var workshop = new Workshop(
            dto.Name,
            dto.Phone,
            dto.Address,
            dto.Logo
        );

        var createdWorkshop = await _repository.AddAsync(workshop);

        return MapToResponse(createdWorkshop);
    }

    public async Task<WorkshopResponseDto?> GetByIdAsync(Guid id)
    {
        var workshop = await _repository.GetByIdAsync(id);

        if (workshop == null)
            return null;

        return MapToResponse(workshop);
    }

    public async Task<List<WorkshopResponseDto>> ListAsync()
    {
        var workshops = await _repository.ListAsync();

        return workshops
            .Select(MapToResponse)
            .ToList();
    }

    private static WorkshopResponseDto MapToResponse(Workshop workshop)
    {
        return new WorkshopResponseDto
        {
            Id = workshop.Id,
            Name = workshop.Name,
            Phone = workshop.Phone,
            Address = workshop.Address,
            Logo = workshop.Logo
        };
    }
}
