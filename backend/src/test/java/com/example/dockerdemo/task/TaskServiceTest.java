package com.example.dockerdemo.task;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Plain unit test - no Spring context and no database required, so it also
 * runs inside the Docker build if tests are enabled.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository repository;

    @InjectMocks
    private TaskService service;

    @Test
    void findAllMapsEntitiesToResponses() {
        Task task = new Task();
        task.setTitle("Learn Docker");
        task.setDescription("Build the image");
        task.setStatus(TaskStatus.TODO);

        when(repository.findAll(any(Sort.class))).thenReturn(List.of(task));

        List<TaskResponse> result = service.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Learn Docker");
        assertThat(result.get(0).status()).isEqualTo(TaskStatus.TODO);
    }

    @Test
    void findByIdThrowsWhenTaskDoesNotExist() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(99L))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("99");
    }
}
