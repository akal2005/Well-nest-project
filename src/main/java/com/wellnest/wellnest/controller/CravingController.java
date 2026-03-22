package com.wellnest.wellnest.controller;

import com.wellnest.wellnest.model.CravingLog;
import com.wellnest.wellnest.repository.CravingLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/craving")
public class CravingController {

    @Autowired
    private CravingLogRepository cravingLogRepository;

    @PostMapping("/log")
    public ResponseEntity<?> saveLog(@RequestBody CravingLog log) {
        try {
            CravingLog saved = cravingLogRepository.save(log);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving log: " + e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    public List<CravingLog> getHistory(@PathVariable Long userId) {
        return cravingLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
