package com.wellnest.wellnest.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class SystemLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action; // e.g., "USER_SIGNUP", "TRAINER_LOGIN", "USER_DELETED"
    private String details; // e.g., "User john@example.com signed up."
    private String userEmail; // The email of the user involved in the action
    private String severity; // e.g., "INFO", "WARNING", "ERROR"

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
