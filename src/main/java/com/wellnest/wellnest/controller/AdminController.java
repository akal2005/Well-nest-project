package com.wellnest.wellnest.controller;

import com.wellnest.wellnest.model.User;
import com.wellnest.wellnest.model.Trainer;
import com.wellnest.wellnest.repository.UserRepository;
import com.wellnest.wellnest.repository.TrainerRepository;
import com.wellnest.wellnest.repository.MealLogRepository;
import com.wellnest.wellnest.repository.WorkoutLogRepository;
import com.wellnest.wellnest.repository.SystemLogRepository;
import com.wellnest.wellnest.model.SystemLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private MealLogRepository mealLogRepository;

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    @Autowired
    private SystemLogRepository systemLogRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTrainers", trainerRepository.count());
        stats.put("totalMealLogs", mealLogRepository.count());
        stats.put("totalWorkoutLogs", workoutLogRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/trainers")
    public List<Trainer> getAllTrainers() {
        return trainerRepository.findAll();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // Log deletion
        SystemLog log = new SystemLog();
        log.setAction("USER_DELETED");
        log.setDetails("User ID " + id + " was deleted by Admin.");
        log.setUserEmail("ID: " + id); // Might not have email if we don't fetch the user first, but ID works
        log.setSeverity("WARNING");
        systemLogRepository.save(log);

        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @DeleteMapping("/trainers/{id}")
    public ResponseEntity<?> deleteTrainer(@PathVariable Long id) {
        if (!trainerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // Log deletion
        SystemLog log = new SystemLog();
        log.setAction("TRAINER_DELETED");
        log.setDetails("Trainer ID " + id + " was deleted by Admin.");
        log.setUserEmail("ID: " + id);
        log.setSeverity("WARNING");
        systemLogRepository.save(log);

        trainerRepository.deleteById(id);
        return ResponseEntity.ok("Trainer deleted successfully");
    }

    // ================= ACTIVITY LOGS =================
    @GetMapping("/logs")
    public List<SystemLog> getSystemLogs() {
        return systemLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
