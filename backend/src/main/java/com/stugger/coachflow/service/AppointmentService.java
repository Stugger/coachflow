package com.stugger.coachflow.service;

import com.stugger.coachflow.api.dto.request.appointment.CreateAppointmentRequest;
import com.stugger.coachflow.api.dto.request.appointment.UpdateAppointmentRequest;
import com.stugger.coachflow.api.dto.response.appointment.AppointmentResponse;
import com.stugger.coachflow.entity.appointment.Appointment;
import com.stugger.coachflow.entity.appointment.AppointmentStatus;
import com.stugger.coachflow.entity.person.Client;
import com.stugger.coachflow.entity.person.Trainer;
import com.stugger.coachflow.repository.appointment.AppointmentRepository;
import com.stugger.coachflow.repository.person.ClientRepository;
import com.stugger.coachflow.security.CurrentTrainerService;
import com.stugger.coachflow.util.TextUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Jake
 * @since June 1st, 2026
 */
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CurrentTrainerService currentTrainerService;
    private final ClientRepository clientRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, CurrentTrainerService currentTrainerService, ClientRepository clientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.currentTrainerService = currentTrainerService;
        this.clientRepository = clientRepository;
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Appointments
    //
    //---------------------------------------------------------------------------------------------------------

    public AppointmentResponse createAppointment(CreateAppointmentRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Client client = getOwnedClientOrThrow(request.clientId(), trainer);

        Appointment appointment = new Appointment();
        LocalDateTime now = LocalDateTime.now();

        appointment.setTrainer(trainer);
        appointment.setClient(client);
        appointment.setTitle(TextUtils.trimToNull(request.title()));
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(request.endTime());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setNotes(TextUtils.trimToNull(request.notes()));
        appointment.setCreatedAt(now);
        appointment.setUpdatedAt(now);

        return new AppointmentResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse updateAppointment(Long appointmentId, UpdateAppointmentRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Appointment appointment = getOwnedAppointmentOrThrow(appointmentId, trainer);
        Client client = getOwnedClientOrThrow(request.clientId(), trainer);

        appointment.setClient(client);
        appointment.setTitle(TextUtils.trimToNull(request.title()));
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(request.endTime());
        appointment.setStatus(request.status());
        appointment.setNotes(TextUtils.trimToNull(request.notes()));
        appointment.setUpdatedAt(LocalDateTime.now());

        return new AppointmentResponse(appointmentRepository.save(appointment));
    }

    public void deleteAppointment(Long appointmentId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Appointment appointment = getOwnedAppointmentOrThrow(appointmentId, trainer);

        appointmentRepository.delete(appointment);
    }

    public List<AppointmentResponse> getAppointments() {
        Sort sort = Sort.by("startTime").ascending();
        return appointmentRepository.findByTrainerId(currentTrainerService.getCurrentTrainer().getId(), sort).stream()
                .map(AppointmentResponse::new)
                .toList();
    }

    public List<AppointmentResponse> getAppointmentsByClientId(Long clientId) {
        Trainer trainer = currentTrainerService.getCurrentTrainer();
        Sort sort = Sort.by("startTime").ascending();
        return appointmentRepository.findByClient_IdAndTrainer_Id(clientId, trainer.getId(), sort).stream()
                .map(AppointmentResponse::new)
                .toList();
    }

    public List<AppointmentResponse> getAppointmentsOfStatus(AppointmentStatus status) {
        Sort sort = Sort.by("startTime").ascending();
        return appointmentRepository.findByTrainerIdAndStatus(currentTrainerService.getCurrentTrainer().getId(), status, sort).stream()
                .map(AppointmentResponse::new)
                .toList();
    }

    //---------------------------------------------------------------------------------------------------------
    //
    //  Validation
    //
    //---------------------------------------------------------------------------------------------------------

    private Client getOwnedClientOrThrow(Long clientId, Trainer trainer) {
        return clientRepository.findByIdAndTrainer_Id(clientId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found."));
    }

    private Appointment getOwnedAppointmentOrThrow(Long appointmentId, Trainer trainer) {
        return appointmentRepository.findByIdAndTrainer_Id(appointmentId, trainer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found."));
    }
}