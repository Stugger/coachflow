package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.appointment.CreateAppointmentRequest;
import com.stugger.coachflow.api.dto.request.appointment.UpdateAppointmentRequest;
import com.stugger.coachflow.api.dto.response.appointment.AppointmentResponse;
import com.stugger.coachflow.entity.appointment.AppointmentStatus;
import com.stugger.coachflow.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Jake
 * @since June 1st, 2026
 */
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public AppointmentResponse createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        return appointmentService.createAppointment(request);
    }

    @PutMapping("/{appointmentId}")
    public AppointmentResponse updateAppointment(@PathVariable Long appointmentId, @Valid @RequestBody UpdateAppointmentRequest request) {
        return appointmentService.updateAppointment(appointmentId, request);
    }

    @DeleteMapping("/{appointmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAppointment(@PathVariable Long appointmentId) {
        appointmentService.deleteAppointment(appointmentId);
    }

    @GetMapping("/trainer/{trainerId}")
    public List<AppointmentResponse> getAppointmentsByTrainerId(@PathVariable Long trainerId) {
        return appointmentService.getAppointmentsByTrainerId(trainerId);
    }

    @GetMapping("/client/{clientId}")
    public List<AppointmentResponse> getAppointmentsByClientId(@PathVariable Long clientId) {
        return appointmentService.getAppointmentsByClientId(clientId);
    }

    @GetMapping("/trainer/{trainerId}/scheduled")
    public List<AppointmentResponse> getScheduledAppointmentsByTrainerId(@PathVariable Long trainerId) {
        return appointmentService.getAppointmentsOfStatusByTrainerId(trainerId, AppointmentStatus.SCHEDULED);
    }

}