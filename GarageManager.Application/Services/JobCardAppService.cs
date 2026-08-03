using GarageManager.Application.DTOs;
using GarageManager.Domain.Entities;
using GarageManager.Domain.Enums;
using GarageManager.Infrastructure.Repositories;

namespace GarageManager.Application.Services;

public class JobCardAppService
{
    private readonly JobCardRepository _repository;
    private readonly CustomerRepository _customerRepository;
    private readonly VehicleRepository _vehicleRepository;
    private readonly JobCardStatusChangeRepository _statusChangeRepository;
    private readonly MechanicRepository _mechanicRepository;

    public JobCardAppService(
        JobCardRepository repository,
        CustomerRepository customerRepository,
        VehicleRepository vehicleRepository,
        JobCardStatusChangeRepository statusChangeRepository,
        MechanicRepository mechanicRepository)
    {
        _repository = repository;
        _customerRepository = customerRepository;
        _vehicleRepository = vehicleRepository;
        _statusChangeRepository = statusChangeRepository;
        _mechanicRepository = mechanicRepository;
    }

    public async Task<JobCardResponseDto> CreateAsync(CreateJobCardDto dto)
    {
        var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);

        if (customer == null)
            throw new Exception("Customer not found.");

        var vehicle = await _vehicleRepository.GetByIdAsync(dto.VehicleId);

        if (vehicle == null)
            throw new Exception("Vehicle not found.");

        if (vehicle.CustomerId != dto.CustomerId)
            throw new Exception("The vehicle does not belong to the given customer.");

        var mechanic = await _mechanicRepository.GetByIdAsync(dto.MechanicId);

        if (mechanic == null)
            throw new Exception("Mechanic not found.");

        var jobCard = new JobCard(
            customer.WorkshopId,
            dto.CustomerId,
            dto.VehicleId,
            dto.MechanicId,
            dto.Description,
            dto.LabourCharge
        );

        foreach (var partDto in dto.Parts)
        {
            var part = new Part(
                partDto.Description,
                partDto.Quantity,
                partDto.UnitPrice
            );

            jobCard.AddPart(part);
        }

        var createdJobCard = await _repository.AddAsync(jobCard);

        return MapToResponse(createdJobCard);
    }

    public async Task<JobCardResponseDto?> GetByIdAsync(Guid id)
    {
        var jobCard = await _repository.GetByIdAsync(id);

        if (jobCard == null)
            return null;

        return MapToResponse(jobCard);
    }

    // Used by PDF generation and other internal services that need the full entity
    public async Task<JobCard?> GetEntityByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<List<JobCardResponseDto>> ListAsync()
    {
        var jobCards = await _repository.ListAsync();

        return jobCards
            .Select(MapToResponse)
            .ToList();
    }

    public async Task SendForApprovalAsync(Guid id)
    {
        var jobCard = await _repository.GetByIdAsync(id);

        if (jobCard == null)
            throw new Exception("Job card not found.");

        var previousStatus = jobCard.Status;

        jobCard.SendForApproval();

        await _repository.UpdateAsync(jobCard);

        await RecordStatusChangeAsync(jobCard, previousStatus);
    }

    public async Task ApproveAsync(Guid id)
    {
        var jobCard = await _repository.GetByIdAsync(id);

        if (jobCard == null)
            throw new Exception("Job card not found.");

        var previousStatus = jobCard.Status;

        jobCard.Approve();

        await _repository.UpdateAsync(jobCard);

        await RecordStatusChangeAsync(jobCard, previousStatus);
    }

    public async Task DeclineAsync(Guid id)
    {
        var jobCard = await _repository.GetByIdAsync(id);

        if (jobCard == null)
            throw new Exception("Job card not found.");

        var previousStatus = jobCard.Status;

        jobCard.Decline();

        await _repository.UpdateAsync(jobCard);

        await RecordStatusChangeAsync(jobCard, previousStatus);
    }

    public async Task CompleteAsync(Guid id)
    {
        var jobCard = await _repository.GetByIdAsync(id);

        if (jobCard == null)
            throw new Exception("Job card not found.");

        var previousStatus = jobCard.Status;

        jobCard.Complete();

        await _repository.UpdateAsync(jobCard);

        await RecordStatusChangeAsync(jobCard, previousStatus);
    }

    public async Task CancelAsync(Guid id, string reason)
    {
        var jobCard = await _repository.GetByIdAsync(id);

        if (jobCard == null)
            throw new Exception("Job card not found.");

        var previousStatus = jobCard.Status;

        jobCard.Cancel(reason);

        await _repository.UpdateAsync(jobCard);

        await RecordStatusChangeAsync(
            jobCard,
            previousStatus,
            reason
        );
    }

    public async Task ReopenAsync(Guid id, string reason)
    {
        var jobCard = await _repository.GetByIdAsync(id);

        if (jobCard == null)
            throw new Exception("Job card not found.");

        var previousStatus = jobCard.Status;

        jobCard.Reopen(reason);

        await _repository.UpdateAsync(jobCard);

        await RecordStatusChangeAsync(
            jobCard,
            previousStatus,
            reason
        );
    }

    public async Task<List<JobCardStatusChangeResponseDto>> GetStatusHistoryAsync(Guid jobCardId)
    {
        var statusChanges = await _statusChangeRepository
            .GetByJobCardIdAsync(jobCardId);

        return statusChanges
            .Select(h => new JobCardStatusChangeResponseDto
            {
                Id = h.Id,

                JobCardId = h.JobCardId,

                PreviousStatus = h.PreviousStatus,

                NewStatus = h.NewStatus,

                Note = h.Note,

                ChangedAt = h.ChangedAt

            })
            .ToList();
    }

    private async Task RecordStatusChangeAsync(
        JobCard jobCard,
        JobCardStatus previousStatus,
        string? note = null)
    {
        var statusChange = new JobCardStatusChange(
            jobCard.Id,
            previousStatus,
            jobCard.Status,
            note
        );

        await _statusChangeRepository.AddAsync(statusChange);
    }

    private static JobCardResponseDto MapToResponse(JobCard jobCard)
    {
        return new JobCardResponseDto
        {
            Id = jobCard.Id,

            CustomerId = jobCard.CustomerId,

            VehicleId = jobCard.VehicleId,

            Customer = new CustomerResponseDto
            {
                Id = jobCard.Customer.Id,
                Name = jobCard.Customer.Name,
                Phone = jobCard.Customer.Phone
            },

            Vehicle = new VehicleResponseDto
            {
                Id = jobCard.Vehicle.Id,
                Make = jobCard.Vehicle.Make,
                Model = jobCard.Vehicle.Model,
                RegistrationNumber = jobCard.Vehicle.RegistrationNumber
            },

            MechanicId = jobCard.MechanicId,

            Mechanic = jobCard.Mechanic == null
            ? null
            : new MechanicResponseDto
            {
                Id = jobCard.Mechanic.Id,
                Name = jobCard.Mechanic.Name,
                Phone = jobCard.Mechanic.Phone,
                Speciality = jobCard.Mechanic.Speciality,
                WorkshopId = jobCard.Mechanic.WorkshopId
            },

            Description = jobCard.Description,

            LabourCharge = jobCard.LabourCharge,

            TotalAmount = jobCard.TotalAmount,

            Status = jobCard.Status,

            CreatedAt = jobCard.CreatedAt,

            Parts = jobCard.Parts
                .Select(p => new PartDto
                {
                    Description = p.Description,
                    Quantity = p.Quantity,
                    UnitPrice = p.UnitPrice
                })
                .ToList(),

            StatusChanges = jobCard.StatusChanges
                .Select(h => new JobCardStatusChangeResponseDto
                {
                    Id = h.Id,
                    JobCardId = h.JobCardId,
                    PreviousStatus = h.PreviousStatus,
                    NewStatus = h.NewStatus,
                    Note = h.Note,
                    ChangedAt = h.ChangedAt
                })
                .ToList()
        };
    }

    public async Task AddPartAsync(Guid jobCardId, PartDto dto)
    {
        var jobCard = await _repository.GetByIdAsync(jobCardId);

        if (jobCard == null)
            throw new Exception("Job card not found.");

        var part = new Part(
            dto.Description,
            dto.Quantity,
            dto.UnitPrice
        );

        jobCard.AddPart(part);

        await _repository.UpdateAsync(jobCard);
    }

    public async Task UpdateAsync(
        Guid id,
        UpdateJobCardDto dto)
    {
        var jobCard = await _repository.GetByIdAsync(id);

        if (jobCard == null)
            throw new Exception("Job card not found.");

        if (jobCard.Status != JobCardStatus.Open)
            throw new Exception(
                "Only open job cards can be edited."
            );

        var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);

        if (customer == null)
            throw new Exception("Customer not found.");

        var vehicle = await _vehicleRepository.GetByIdAsync(dto.VehicleId);

        if (vehicle == null)
            throw new Exception("Vehicle not found.");

        if (vehicle.CustomerId != dto.CustomerId)
            throw new Exception(
                "The vehicle does not belong to the given customer."
            );

        jobCard.UpdateDetails(
            dto.CustomerId,
            dto.VehicleId,
            dto.MechanicId,
            dto.Description,
            dto.LabourCharge
        );

        await _repository.UpdateAsync(jobCard);
    }
}
