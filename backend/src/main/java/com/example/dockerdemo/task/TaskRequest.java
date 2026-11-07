package com.example.dockerdemo.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for creating/updating a task.
 * "status" is optional: new tasks default to TODO, updates keep the old status.
 */
public record TaskRequest(

        @NotBlank(message = "title must not be blank")
        @Size(max = 200, message = "title must be at most 200 characters")
        String title,

        @Size(max = 1000, message = "description must be at most 1000 characters")
        String description,

        TaskStatus status
) {
}
