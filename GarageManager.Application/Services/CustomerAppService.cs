using GarageManager.Application.DTOs;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Repositories;
using GarageManager.Application.Constants;

namespace GarageManager.Application.Services;

public class CustomerAppService
{
    private readonly CustomerRepository _repository;

    public CustomerAppService(CustomerRepository repository)
    {
        _repository = repository;
    }

    public async Task<CustomerResponseDto> CreateAsync(CreateCustomerDto dto)
    {
        var customer = new Customer(
            dto.Name,
            dto.Phone,
            dto.Email,
            WorkshopConstants.DefaultWorkshopId
        );

        var createdCustomer = await _repository.AddAsync(customer);

        return new CustomerResponseDto
        {
            Id = createdCustomer.Id,
            Name = createdCustomer.Name,
            Phone = createdCustomer.Phone,
            Email = createdCustomer.Email
        };
    }

    public async Task<List<CustomerResponseDto>> ListAsync()
    {
        var customers = await _repository.ListAsync();

        return customers.Select(customer => new CustomerResponseDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            IsActive = customer.IsActive,
            VehicleCount = customer.Vehicles.Count

        }).ToList();
    }

    public async Task<CustomerDetailResponseDto?> GetByIdAsync(Guid id)
    {
        var customer = await _repository.GetByIdAsync(id);

        if (customer == null)
            return null;

        return new CustomerDetailResponseDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,

            IsActive = customer.IsActive,

            Vehicles = customer.Vehicles
                .Select(v => new VehicleSummaryDto
                {
                    Id = v.Id,
                    RegistrationNumber = v.RegistrationNumber,
                    Make = v.Make,
                    Model = v.Model

                })
                .ToList()
        };
    }

    public async Task<CustomerResponseDto?> UpdateAsync(
        Guid id,
        UpdateCustomerDto dto)
    {
        var customer = await _repository.GetByIdAsync(id);

        if (customer == null)
            return null;

        customer.Update(
            dto.Name,
            dto.Phone,
            dto.Email
        );

        await _repository.UpdateAsync(customer);

        return new CustomerResponseDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email
        };
    }

    public async Task DeactivateAsync(Guid id)
    {
        var customer = await _repository.GetByIdAsync(id);

        if (customer == null)
            throw new Exception("Customer not found");

        customer.Deactivate();

        await _repository.UpdateAsync(customer);
    }

    public async Task ReactivateAsync(Guid id)
    {
        var customer = await _repository.GetByIdAsync(id);

        if (customer == null)
            throw new Exception("Customer not found");

        customer.Reactivate();

        await _repository.UpdateAsync(customer);
    }
}
