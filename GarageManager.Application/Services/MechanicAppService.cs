using GarageManager.Application.Constants;
using GarageManager.Application.DTOs;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Repositories;

namespace GarageManager.Application.Services;

public class MechanicAppService
{
    private readonly MechanicRepository _repository;

    public MechanicAppService(MechanicRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Mechanic>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Mechanic?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<MechanicResponseDto> CreateAsync(MechanicRequestDto dto)
    {
        var mechanic = new Mechanic
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Phone = dto.Phone ?? "",
            Speciality = dto.Speciality,
            IsActive = true,
            WorkshopId = WorkshopConstants.DefaultWorkshopId
        };

        await _repository.AddAsync(mechanic);
        await _repository.SaveChangesAsync();

        return new MechanicResponseDto
        {
            Id = mechanic.Id,
            Name = mechanic.Name,
            Phone = mechanic.Phone,
            Speciality = mechanic.Speciality,
            WorkshopId = mechanic.WorkshopId
        };
    }

    public async Task<bool> UpdateAsync(Guid id, MechanicRequestDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);

        if (existing == null)
            return false;

        existing.Name = dto.Name;
        existing.Phone = dto.Phone ?? "";
        existing.Speciality = dto.Speciality;

        _repository.Update(existing);
        await _repository.SaveChangesAsync();

        return true;
    }

    public async Task DeactivateAsync(Guid id)
    {
        var mechanic = await _repository.GetByIdAsync(id);

        if (mechanic == null)
            throw new Exception("Mechanic not found");

        mechanic.IsActive = false;

        await _repository.SaveChangesAsync();
    }

    public async Task ReactivateAsync(Guid id)
    {
        var mechanic = await _repository.GetByIdAsync(id);

        if (mechanic == null)
            throw new Exception("Mechanic not found");

        mechanic.IsActive = true;

        await _repository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var mechanic = await _repository.GetByIdAsync(id);

        if (mechanic == null)
            return false;

        _repository.Delete(mechanic);
        await _repository.SaveChangesAsync();

        return true;
    }
}
