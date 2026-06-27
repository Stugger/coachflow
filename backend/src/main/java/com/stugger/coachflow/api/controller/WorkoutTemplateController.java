package com.stugger.coachflow.api.controller;

import com.stugger.coachflow.api.dto.request.workout.CreateWorkoutTemplateRequest;
import com.stugger.coachflow.api.dto.request.workout.UpdateWorkoutTemplateRequest;
import com.stugger.coachflow.api.dto.response.workout.WorkoutTemplateResponse;
import com.stugger.coachflow.api.dto.response.workout.WorkoutTemplateSummaryResponse;
import com.stugger.coachflow.service.WorkoutTemplateService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Jake
 * @since June 15th, 2026
 */
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/workout-templates")
public class WorkoutTemplateController {

    private final WorkoutTemplateService workoutTemplateService;

    public WorkoutTemplateController(WorkoutTemplateService workoutTemplateService) {
        this.workoutTemplateService = workoutTemplateService;
    }

    @GetMapping
    public List<WorkoutTemplateSummaryResponse> getWorkoutTemplates() {
        return workoutTemplateService.getWorkoutTemplateSummaries();
    }
    @GetMapping("/{workoutTemplateId}")
    public WorkoutTemplateResponse getWorkoutTemplate(@PathVariable Long workoutTemplateId) {
        return workoutTemplateService.getWorkoutTemplate(workoutTemplateId);
    }

    @PostMapping
    public WorkoutTemplateResponse createWorkoutTemplate(@Valid @RequestBody CreateWorkoutTemplateRequest request) {
        return workoutTemplateService.createWorkoutTemplate(request);
    }

    @PutMapping("/{workoutTemplateId}")
    public WorkoutTemplateResponse updateWorkoutTemplate(@PathVariable Long workoutTemplateId, @Valid @RequestBody UpdateWorkoutTemplateRequest request) {
        return workoutTemplateService.updateWorkoutTemplate(workoutTemplateId, request);
    }

    @DeleteMapping("/{workoutTemplateId}")
    public void archiveWorkoutTemplate(@PathVariable Long workoutTemplateId) {
        workoutTemplateService.archiveWorkoutTemplate(workoutTemplateId);
    }
}
