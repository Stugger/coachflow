package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.CreateAppointmentRequest;
import com.stugger.coachflow.api.dto.response.AppointmentResponse;
import com.stugger.coachflow.service.AppointmentService;
import jakarta.validation.Valid;
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

    @GetMapping("/trainer/{trainerId}")
    public List<AppointmentResponse> getAppointmentsByTrainerId(@PathVariable Long trainerId) {
        return appointmentService.getAppointmentsByTrainerId(trainerId);
    }

    @GetMapping("/client/{clientId}")
    public List<AppointmentResponse> getAppointmentsByClientId(@PathVariable Long clientId) {
        return appointmentService.getAppointmentsByClientId(clientId);
    }
}