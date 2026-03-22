package com.wellnest.wellnest.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class CravingLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private int intensity; // 0-10
    private int stressLevel; // 1-10
    private int moodScore; // 1-10

    // Triggers
    private boolean highRiskLocation;
    private boolean socialTrigger;
    private boolean workStress;
    private boolean fatigue;
    private boolean hunger;
    private boolean pain;
    private boolean medicationTaken;

    private String socialContext; // Alone, Supportive Environment, Risky Environment

    private LocalDateTime timestamp;

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setIntensity(int intensity) {
        this.intensity = intensity;
    }

    public void setStressLevel(int stressLevel) {
        this.stressLevel = stressLevel;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
