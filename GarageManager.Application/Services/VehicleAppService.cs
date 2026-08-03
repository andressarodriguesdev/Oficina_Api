using GarageManager.Application.DTOs;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Repositories;
using GarageManager.Application.Exceptions;

namespace GarageManager.Application.Services;

public class VehicleAppService
{
    private readonly CustomerRepository _customerRepository;
    private readonly VehicleRepository _repository;

    public VehicleAppService(
        VehicleRepository repository,
        CustomerRepository customerRepository)
    {
        _repository = repository;
        _customerRepository = customerRepository;
    }

    public async Task<VehicleResponseDto> CreateAsync(CreateVehicleDto dto)
    {
        var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);

        if (customer == null)
        {
            throw new CustomerNotFoundException(dto.CustomerId);
        }

        var vehicle = new Vehicle(
            dto.RegistrationNumber,
            dto.Make,
            dto.Model,
            dto.Year,
            customer.Id,
            customer.WorkshopId
        );

        var createdVehicle = await _repository.AddAsync(vehicle);

        return MapToResponse(createdVehicle);
    }

    public async Task<List<VehicleResponseDto>> ListAsync()
    {
        var vehicles = await _repository.ListAsync();

        return vehicles
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<VehicleResponseDto?> GetByIdAsync(Guid id)
    {
        var vehicle = await _repository.GetByIdAsync(id);

        if (vehicle == null)
            return null;

        return MapToResponse(vehicle);
    }

    public async Task<VehicleResponseDto?> UpdateAsync(
        Guid id,
        UpdateVehicleDto dto)
    {
        var vehicle = await _repository.GetByIdAsync(id);

        if (vehicle == null)
            return null;

        vehicle.Update(
            dto.RegistrationNumber,
            dto.Make,
            dto.Year,
            dto.Model
        );

        await _repository.UpdateAsync(vehicle);

        return MapToResponse(vehicle);
    }

    public async Task DeactivateAsync(Guid id)
    {
        var vehicle = await _repository.GetByIdAsync(id);

        if (vehicle == null)
            throw new Exception("Vehicle not found");

        vehicle.Deactivate();

        await _repository.UpdateAsync(vehicle);
    }

    public async Task ReactivateAsync(Guid id)
    {
        var vehicle = await _repository.GetByIdAsync(id);

        if (vehicle == null)
            throw new Exception("Vehicle not found");

        vehicle.Reactivate();

        await _repository.UpdateAsync(vehicle);
    }

    public async Task RemoveAsync(Guid id)
    {
        var vehicle = await _repository.GetByIdAsync(id);

        if (vehicle == null)
            throw new Exception("Vehicle not found");

        if (vehicle.JobCards.Any())
        {
            throw new Exception(
                "This vehicle has job cards linked and cannot be deleted. Deactivate it instead.");
        }

        await _repository.RemoveAsync(vehicle);
    }

    private static VehicleResponseDto MapToResponse(Vehicle vehicle)
    {
        return new VehicleResponseDto
        {
            Id = vehicle.Id,
            RegistrationNumber = vehicle.RegistrationNumber,
            Make = vehicle.Make,
            Model = vehicle.Model,
            Year = vehicle.Year,
            CustomerId = vehicle.CustomerId,
            WorkshopId = vehicle.WorkshopId,
            IsActive = vehicle.IsActive
        };
    }
}
