package com.wellnest.wellnest.controller;

import com.wellnest.wellnest.model.Trainer;
import com.wellnest.wellnest.model.User;
import com.wellnest.wellnest.repository.TrainerRepository;
import com.wellnest.wellnest.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // Seeding some dummy data if empty
    @PostConstruct
    public void init() {
        if (trainerRepository.count() == 0) {
            createTrainer("Alex Fit", "Strength Training", 5, "Expert in weight lifting and muscle gain.",
                    "alex@fit.com",
                    "https://img.freepik.com/premium-photo/gym-instructor-portrait-with-his-arms-crossed_13339-11261.jpg",
                    "Mumbai", "Morning");
            createTrainer("Sarah Strong", "Weight Loss", 7, "Certified nutritionist and fat loss coach.",
                    "sarah@strong.com",
                    "https://t3.ftcdn.net/jpg/02/76/85/06/360_F_276850654_E31QeXy62L6xNn5hXQyP775Bq5Hn6h9l.jpg",
                    "Delhi", "Evening");
            createTrainer("Zen Master", "Yoga", 10, "Specialist in mental wellness and flexibility.", "zen@master.com",
                    "https://img.freepik.com/premium-photo/portrait-mature-yogi-man-sitting-cross-legged-posing-indoor-yoga-studio_351987-1601.jpg",
                    "Bangalore", "Flexible");
            createTrainer("Mike Runner", "HIIT & Cardio", 4, "High energy trainer to boost your stamina.",
                    "mike@runner.com",
                    "https://t4.ftcdn.net/jpg/04/14/19/23/360_F_414192301_dC63VvXvP8kE3Q7VvR9VvO1S6vOQ5k5y.jpg",
                    "Mumbai", "Weekend");
            createTrainer("Elena Swift", "Zumba & Pilates", 6, "Dance your way to a healthier version of yourself.",
                    "elena@swift.com",
                    "https://t3.ftcdn.net/jpg/01/95/96/57/360_F_195965706_0v8VvXvP8kE3Q7VvR9VvO1S6vOQ5k5y.jpg", "Pune",
                    "Flexible");
        }
        syncTrainersToUsers();
    }

    // Ensure all trainers have a corresponding User account
    private void syncTrainersToUsers() {
        List<Trainer> trainers = trainerRepository.findAll();
        for (Trainer t : trainers) {
            if (userRepository.findByEmail(t.getContactEmail()).isEmpty()) {
                User u = new User();
                u.setFullName(t.getName());
                u.setEmail(t.getContactEmail());
                u.setPassword(passwordEncoder.encode("Trainer@123"));
                u.setRole(com.wellnest.wellnest.model.Role.TRAINER);
                userRepository.save(u);
                System.out.println("Synced User account for Trainer: " + t.getName());
            }
        }
    }

    private void createTrainer(String name, String spec, int exp, String bio, String email, String img, String loc,
            String avail) {
        Trainer t = new Trainer();
        t.setName(name);
        t.setSpecialization(spec);
        t.setExperienceYears(exp);
        t.setBio(bio);
        t.setContactEmail(email);
        t.setImageUrl(img);
        t.setLocation(loc);
        t.setAvailability(avail);
        trainerRepository.save(t);
    }

    // Recommend based on user email (and their goal)
    @GetMapping("/recommend")
    public ResponseEntity<?> getRecommended(
            @RequestParam String userEmail,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String name) {

        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        String goal = user.getGoal(); // e.g. "Lose Weight"

        List<Trainer> allTrainers = trainerRepository.findAll();

        // Check if explicit filters are active
        boolean isFiltering = (location != null && !location.isEmpty() && !location.equals("All")) ||
                (availability != null && !availability.isEmpty() && !availability.equals("All")) ||
                (type != null && !type.isEmpty() && !type.equals("All")) ||
                (name != null && !name.isEmpty());

        List<Trainer> matches = allTrainers.stream()
                .filter(t -> {
                    boolean match = true;

                    // 0. Name Filter (NEW)
                    if (name != null && !name.isEmpty()) {
                        if (t.getName() == null || !t.getName().toLowerCase().contains(name.toLowerCase())) {
                            match = false;
                        }
                    }

                    // 1. Goal Match (Skip if explicit Type filter or Name filter is on)
                    if (match && type != null && !type.isEmpty() && !type.equals("All")) {
                        if (t.getSpecialization() == null
                                || !t.getSpecialization().toLowerCase().contains(type.toLowerCase())) {
                            match = false;
                        }
                    } else if (match && !isFiltering && goal != null && !goal.isEmpty()) {
                        String spec = t.getSpecialization().toLowerCase();
                        String g = goal.toLowerCase();

                        if (g.contains("weight") || g.contains("fat")) {
                            if (!(spec.contains("weight") || spec.contains("fat") || spec.contains("cardio")
                                    || spec.contains("hiit")))
                                match = false;
                        } else if (g.contains("muscle") || g.contains("strength")) {
                            if (!(spec.contains("muscle") || spec.contains("strength") || spec.contains("power")
                                    || spec.contains("lift")))
                                match = false;
                        } else if (g.contains("yoga") || g.contains("flexibility")) {
                            if (!(spec.contains("yoga") || spec.contains("flexibility")))
                                match = false;
                        } else if (g.contains("run") || g.contains("cardio") || g.contains("endurance")) {
                            if (!(spec.contains("run") || spec.contains("cardio") || spec.contains("endurance")))
                                match = false;
                        }
                    }

                    // 2. Location
                    if (match && location != null && !location.isEmpty() && !location.equals("All")) {
                        String trLocation = t.getLocation() != null ? t.getLocation() : "Online";
                        if (!trLocation.toLowerCase().contains(location.toLowerCase())) {
                            match = false;
                        }
                    }

                    // 3. Availability
                    if (match && availability != null && !availability.isEmpty() && !availability.equals("All")) {
                        String trAvailability = t.getAvailability() != null ? t.getAvailability() : "Flexible";
                        if (!trAvailability.toLowerCase().contains(availability.toLowerCase())) {
                            match = false;
                        }
                    }

                    return match;
                })
                .toList();

        // Fallback: if no specific matches, return all ONLY IF NOT FILTERING
        if (matches.isEmpty() && !isFiltering) {
            return ResponseEntity.ok(allTrainers);
        }

        return ResponseEntity.ok(matches);
    }

    // Get Single Trainer Profile
    @GetMapping("/profile")
    public ResponseEntity<?> getTrainerProfile(@RequestParam String email) {
        Trainer trainer = trainerRepository.findAll().stream()
                .filter(t -> t.getContactEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
        if (trainer == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(trainer);
    }

    // Update Profile
    @PutMapping("/update")
    public ResponseEntity<?> updateTrainer(
            @RequestParam("email") String email,
            @RequestParam("name") String name,
            @RequestParam("specialization") String specialization,
            @RequestParam("bio") String bio,
            @RequestParam("location") String location,
            @RequestParam("experience") int experience,
            @RequestParam("availability") String availability,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {

        Trainer trainer = trainerRepository.findAll().stream()
                .filter(t -> t.getContactEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);

        if (trainer == null)
            return ResponseEntity.badRequest().body("Trainer not found");

        trainer.setName(name);
        trainer.setSpecialization(specialization);
        trainer.setBio(bio);
        trainer.setLocation(location);
        trainer.setExperienceYears(experience);
        trainer.setAvailability(availability);

        if (image != null && !image.isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/uploads/";
                java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                String fileName = java.util.UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                java.nio.file.Path filePath = uploadPath.resolve(fileName);
                java.nio.file.Files.copy(image.getInputStream(), filePath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                trainer.setImageUrl("uploads/" + fileName);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        trainerRepository.save(trainer);

        // Sync Name to User Table
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            user.setFullName(name);
            userRepository.save(user);
        }

        return ResponseEntity.ok("Profile updated successfully");
    }
}
