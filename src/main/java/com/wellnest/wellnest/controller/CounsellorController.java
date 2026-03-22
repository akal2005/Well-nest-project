package com.wellnest.wellnest.controller;

import com.wellnest.wellnest.model.CravingLog;
import com.wellnest.wellnest.model.User;
import com.wellnest.wellnest.model.Role;
import com.wellnest.wellnest.repository.CravingLogRepository;
import com.wellnest.wellnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/counsellor")
public class CounsellorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CravingLogRepository cravingLogRepository;

    // Fetch all regular users for the counselling list
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getRecoveringUsers() {
        // In a real app we might filter only users with "Mental Wellness" or active
        // craving logs.
        // For the demo, returning all users with Role.USER
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER)
                .collect(Collectors.toList());

        List<Map<String, Object>> response = users.stream().map(u -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName() != null ? u.getFullName() : "Unknown User");
            map.put("email", u.getEmail());
            map.put("goal", u.getGoal() != null ? u.getGoal() : "Unspecified");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Fetch weekly aggregated craving logs for a specific user to build the chart
    @GetMapping("/user/{id}/cravings")
    public ResponseEntity<List<CravingLog>> getUserCravings(@PathVariable Long id) {
        // Returning the raw list of logs, ordered by timestamp descending.
        // The frontend Chart.js logic will process this into a weekly bar chart or
        // timeline.
        List<CravingLog> logs = cravingLogRepository.findByUserIdOrderByTimestampDesc(id);
        return ResponseEntity.ok(logs);
    }
}
