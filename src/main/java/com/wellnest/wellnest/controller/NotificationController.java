package com.wellnest.wellnest.controller;

import com.wellnest.wellnest.model.Notification;
import com.wellnest.wellnest.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepo;

    public NotificationController(NotificationRepository notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/{userId}/unread-count")
    public Map<String, Integer> getUnreadCount(@PathVariable Long userId) {
        return Map.of("count", notificationRepo.countByUserIdAndIsReadFalse(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Optional<Notification> opt = notificationRepo.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            n.setRead(true);
            notificationRepo.save(n);
            return ResponseEntity.ok("Marked as read");
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        List<Notification> unread = notificationRepo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for(Notification n : unread) {
            n.setRead(true);
        }
        notificationRepo.saveAll(unread);
        return ResponseEntity.ok("All marked as read");
    }
}
