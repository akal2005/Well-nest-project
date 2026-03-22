package com.wellnest.wellnest.scheduler;

import com.wellnest.wellnest.model.Notification;
import com.wellnest.wellnest.model.User;
import com.wellnest.wellnest.model.WaterSleepLog;
import com.wellnest.wellnest.repository.NotificationRepository;
import com.wellnest.wellnest.repository.UserRepository;
import com.wellnest.wellnest.repository.WaterSleepLogRepository;
import com.wellnest.wellnest.repository.WorkoutLogRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Configuration
@EnableScheduling
@Component
public class NotificationScheduler {

    private final UserRepository userRepo;
    private final NotificationRepository notificationRepo;
    private final WaterSleepLogRepository waterSleepRepo;
    private final WorkoutLogRepository workoutRepo;

    public NotificationScheduler(UserRepository userRepo, NotificationRepository notificationRepo, WaterSleepLogRepository waterSleepRepo, WorkoutLogRepository workoutRepo) {
        this.userRepo = userRepo;
        this.notificationRepo = notificationRepo;
        this.waterSleepRepo = waterSleepRepo;
        this.workoutRepo = workoutRepo;
    }

    // Runs every day at 8 PM (20:00) server time
    @Scheduled(cron = "0 0 20 * * ?")
    public void dailyWaterSleepReminder() {
        List<User> users = userRepo.findAll();
        LocalDate today = LocalDate.now();

        for (User user : users) {
            if ("TRAINER".equals(user.getRole().name()) || "ADMIN".equals(user.getRole().name())) continue;

            List<WaterSleepLog> logs = waterSleepRepo.findByUserIdAndLogDate(user.getId(), today);
            if (logs.isEmpty()) {
                createNotification(user.getId(), "REMINDER", "Don't forget to gently log your water intake and sleep for today! Hydration is key to recovery. 💧");
            }
        }
    }

    // Runs every day at 10 AM (10:00)
    @Scheduled(cron = "0 0 10 * * ?")
    public void inactivityMotivation() {
        List<User> users = userRepo.findAll();
        LocalDate threeDaysAgo = LocalDate.now().minusDays(3);

        for (User user : users) {
            if ("TRAINER".equals(user.getRole().name()) || "ADMIN".equals(user.getRole().name())) continue;

            // Simple check: Did they workout in the last 3 days?
            int recentWorkouts = workoutRepo.findByUserIdAndLogDateBetween(user.getId(), threeDaysAgo, LocalDate.now()).size();
            
            if (recentWorkouts == 0) {
                createNotification(user.getId(), "MOTIVATION", "We miss seeing you around! Remember, every small step counts towards your journey. You got this! 🌟");
            }
        }
    }

    private void createNotification(Long userId, String type, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setMessage(message);
        notificationRepo.save(n);
    }
}
