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
import com.stugger.coachflow.repository.person.TrainerRepository;
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
    private final TrainerRepository trainerRepository;
    private final ClientRepository clientRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, TrainerRepository trainerRepository, ClientRepository clientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.trainerRepository = trainerRepository;
        this.clientRepository = clientRepository;
    }

    public AppointmentResponse createAppointment(CreateAppointmentRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
        Trainer trainer = trainerRepository.findById(request.trainerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found"));

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));

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
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment with id " + appointmentId + " not found"));

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));

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
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment with id " + appointmentId + " not found");
        }
        appointmentRepository.deleteById(appointmentId);
    }

    public List<AppointmentResponse> getAppointmentsByTrainerId(Long trainerId) {
        Sort sort = Sort.by("startTime").ascending();
        return appointmentRepository.findByTrainerId(trainerId, sort).stream()
                .map(AppointmentResponse::new)
                .toList();
    }

    public List<AppointmentResponse> getAppointmentsByClientId(Long clientId) {
        Sort sort = Sort.by("startTime").ascending();
        return appointmentRepository.findByClientId(clientId, sort).stream()
                .map(AppointmentResponse::new)
                .toList();
    }

    public List<AppointmentResponse> getAppointmentsOfStatusByTrainerId(Long trainerId, AppointmentStatus status) {
        Sort sort = Sort.by("startTime").ascending();
        return appointmentRepository.findByTrainerIdAndStatus(trainerId, status, sort).stream()
                .map(AppointmentResponse::new)
                .toList();
    }
}