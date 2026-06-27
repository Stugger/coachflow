package com.stugger.coachflow.repository.appointment;

import com.stugger.coachflow.entity.appointment.Appointment;
import com.stugger.coachflow.entity.appointment.AppointmentStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Jake
 * @since June 1st, 2026
 */
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByIdAndTrainer_Id(Long appointmentId, Long trainerId);

    List<Appointment> findByTrainerId(Long trainerId, Sort sort);

    List<Appointment> findByClient_IdAndTrainer_Id(Long clientId, Long trainerId, Sort sort);

    List<Appointment> findByTrainerIdAndStatus(Long trainerId, AppointmentStatus status, Sort sort);

}