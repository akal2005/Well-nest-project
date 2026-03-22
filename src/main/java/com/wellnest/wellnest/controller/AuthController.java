package com.wellnest.wellnest.controller;

import com.wellnest.wellnest.model.Role;
import com.wellnest.wellnest.model.SystemLog;
import com.wellnest.wellnest.model.Trainer;
import com.wellnest.wellnest.model.User;
import com.wellnest.wellnest.repository.SystemLogRepository;
import com.wellnest.wellnest.repository.TrainerRepository;
import com.wellnest.wellnest.repository.UserRepository;
import com.wellnest.wellnest.security.JwtUtil;
import com.wellnest.wellnest.service.EmailService;
import com.wellnest.wellnest.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private SystemLogRepository systemLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpService otpService;

    // ================= CHECK EMAIL =================
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(userRepository.existsByEmail(email));
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> payload) {

        String fullName = (String) payload.get("fullName");
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");

        if (fullName == null || email == null || password == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered");
        }

        Role role = Role.USER;
        if (payload.get("role") != null) {
            try {
                role = Role.valueOf(payload.get("role").toString().toUpperCase());
            } catch (Exception ignored) {
            }
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        if (payload.get("age") != null) {
            try {
                user.setAge(Integer.parseInt(payload.get("age").toString()));
            } catch (Exception ignored) {
            }
        }

        if (payload.get("weight") != null) {
            try {
                user.setWeight(Double.parseDouble(payload.get("weight").toString()));
            } catch (Exception ignored) {
            }
        }

        if (payload.get("height") != null) {
            try {
                user.setHeight(Double.parseDouble(payload.get("height").toString()));
            } catch (Exception ignored) {
            }
        }

        if (payload.get("goal") != null) {
            user.setGoal(payload.get("goal").toString());
        }

        userRepository.save(user);

        // If Role is TRAINER, create a Trainer profile too
        if (role == Role.TRAINER) {
            try {
                Trainer trainer = new Trainer();
                trainer.setName(fullName);
                trainer.setContactEmail(email);
                trainer.setPassword(user.getPassword()); // Store hashed password in Trainer table too

                String specialization = "General Fitness";
                if (payload.get("specialization") != null) {
                    specialization = payload.get("specialization").toString();
                }
                trainer.setSpecialization(specialization);

                int experience = 0;
                if (payload.get("experience") != null) {
                    experience = Integer.parseInt(payload.get("experience").toString());
                }
                trainer.setExperienceYears(experience);

                trainer.setBio("Certified Trainer specializing in " + specialization);
                // Default placeholder image
                trainer.setImageUrl(
                        "https://ui-avatars.com/api/?name=" + fullName.replace(" ", "+") + "&background=random");

                trainerRepository.save(trainer);
            } catch (Exception e) {
                System.out.println("Error creating trainer profile: " + e.getMessage());
            }
        }

        // Log the registration event
        SystemLog log = new SystemLog();
        log.setAction(role == Role.TRAINER ? "TRAINER_SIGNUP" : "USER_SIGNUP");
        log.setDetails("New " + role.name() + " registered: " + fullName);
        log.setUserEmail(email);
        log.setSeverity("INFO");
        systemLogRepository.save(log);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Registration successful"));
    }

    // ================= DEBUG =================
    @GetMapping("/debug/users")
    public java.util.List<User> debugUsers() {
        return userRepository.findAll();
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        try {
            System.out.println("========== LOGIN ATTEMPT ==========");
            System.out.println("Payload: " + payload);

            String email = payload.get("email");
            String password = payload.get("password");

            if (email == null || password == null) {
                System.out.println("Login Failed: Missing fields");
                return ResponseEntity.badRequest().body("Email and password required");
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                System.out.println("Login Failed: User not found for email: " + email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }

            User user = userOpt.get();
            if (!passwordEncoder.matches(password, user.getPassword())) {
                System.out.println("Login Failed: Password mismatch for email: " + email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }

            System.out.println("Login Success: " + user.getEmail());
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getId());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole());
            response.put("token", token);
            response.put("age", user.getAge());
            response.put("weight", user.getWeight());
            response.put("height", user.getHeight());
            response.put("goal", user.getGoal());

            if (user.getRole() == Role.TRAINER) {
                Optional<Trainer> trainerOpt = trainerRepository.findByContactEmail(user.getEmail());
                if (trainerOpt.isPresent()) {
                    response.put("trainerId", trainerOpt.get().getId());
                } else {
                    System.out
                            .println("Warning: Trainer role but no Trainer entity found for email " + user.getEmail());
                }
            }

            // Log the login event
            SystemLog log = new SystemLog();
            log.setAction(user.getRole() == Role.TRAINER ? "TRAINER_LOGIN"
                    : (user.getRole() == Role.ADMIN ? "ADMIN_LOGIN"
                            : (user.getRole() == Role.COUNSELLOR ? "COUNSELLOR_LOGIN" : "USER_LOGIN")));
            log.setDetails(user.getRole().name() + " logged in successfully.");
            log.setUserEmail(user.getEmail());
            log.setSeverity("INFO");
            systemLogRepository.save(log);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("CRITICAL LOGIN ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal Server Error: " + e.getMessage());
        }
    }

    // ================= FORGOT PASSWORD =================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {

        String email = payload.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        String otp = otpService.generateOtp(user);

        emailService.sendOtpEmail(
                email,
                "WellNest Password Reset OTP",
                "Hello " + user.getFullName() +
                        ",\n\nYour OTP is: " + otp +
                        "\nThis OTP is valid for 10 minutes.");

        return ResponseEntity.ok("OTP sent to email");
    }

    // ================= VALIDATE OTP =================
    @PostMapping("/validate-otp")
    public ResponseEntity<?> validateOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        if (!otpService.validateOtp(user, otp)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired OTP");
        }

        return ResponseEntity.ok("OTP verified successfully");
    }

    // ================= RESET PASSWORD =================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {

        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body("All fields are required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        if (!otpService.validateOtp(user, otp)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        otpService.clearOtp(user);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successful");
    }
}
