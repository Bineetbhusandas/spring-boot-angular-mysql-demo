package com.example.dockerdemo.hello;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tiny endpoint used to check that the application is reachable and to see
 * which container served the request (the container hostname is returned).
 */
@RestController
@RequestMapping("/api/hello")
public class HelloController {

    @GetMapping
    public Map<String, Object> hello() {
        return Map.of(
                "message", "Hello from Spring Boot running in Docker!",
                "javaVersion", System.getProperty("java.version"),
                "containerHostname", System.getenv().getOrDefault("HOSTNAME", "unknown"),
                "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/{name}")
    public Map<String, Object> helloName(@PathVariable String name) {
        return Map.of(
                "message", "Hello, " + name + "!",
                "containerHostname", System.getenv().getOrDefault("HOSTNAME", "unknown"),
                "timestamp", Instant.now().toString()
        );
    }
}
