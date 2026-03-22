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
import java.util.Optional;

@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

        @Autowired
        private TrainerRepository trainerRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private com.wellnest.wellnest.repository.SessionRepository sessionRepository;

        @Autowired
        private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

        // Seeding some dummy data if empty
        @PostConstruct
        public void init() {
                if (trainerRepository.count() < 35) {
                        createTrainer("Alex Fit", "Strength Training", 5, "Expert in weight lifting and muscle gain.",
                                        "alex@fit.com",
                                        "https://img.freepik.com/premium-photo/gym-instructor-portrait-with-his-arms-crossed_13339-11261.jpg",
                                        "Mumbai", "Morning");
                        createTrainer("Sarah Strong", "Weight Loss", 7, "Certified nutritionist and fat loss coach.",
                                        "sarah@strong.com",
                                        "https://t3.ftcdn.net/jpg/02/76/85/06/360_F_276850654_E31QeXy62L6xNn5hXQyP775Bq5Hn6h9l.jpg",
                                        "Delhi", "Evening");
                        createTrainer("Zen Master", "Yoga", 10, "Specialist in mental wellness and flexibility.",
                                        "zen@master.com",
                                        "https://img.freepik.com/premium-photo/portrait-mature-yogi-man-sitting-cross-legged-posing-indoor-yoga-studio_351987-1601.jpg",
                                        "Bangalore", "Flexible");
                        createTrainer("Mike Runner", "HIIT & Cardio", 4, "High energy trainer to boost your stamina.",
                                        "mike@runner.com",
                                        "https://t4.ftcdn.net/jpg/04/14/19/23/360_F_414192301_dC63VvXvP8kE3Q7VvR9VvO1S6vOQ5k5y.jpg",
                                        "Mumbai", "Weekend");
                        createTrainer("Elena Swift", "Zumba & Pilates", 6,
                                        "Dance your way to a healthier version of yourself.",
                                        "elena@swift.com",
                                        "https://t3.ftcdn.net/jpg/01/95/96/57/360_F_195965706_0v8VvXvP8kE3Q7VvR9VvO1S6vOQ5k5y.jpg",
                                        "Pune",
                                        "Flexible");
                        createTrainer("David Power", "CrossFit", 8,
                                        "High-intensity functional movements for elite fitness.",
                                        "david@power.com",
                                        "https://img.freepik.com/free-photo/muscular-man-doing-cross-training-gym_23-2148818541.jpg",
                                        "London", "Morning");
                        createTrainer("Sophia Calm", "Meditation & Mindfulness", 12,
                                        "Find your inner peace and mental clarity.",
                                        "sophia@calm.com",
                                        "https://img.freepik.com/free-photo/woman-meditating-peaceful-park_23-2148821423.jpg",
                                        "New York",
                                        "Evening");
                        createTrainer("Marcus Iron", "Bodybuilding", 15,
                                        "Specialized in hypertrophy and contest preparation.",
                                        "marcus@iron.com",
                                        "https://img.freepik.com/free-photo/bodybuilder-showing-his-muscles_23-2148821612.jpg",
                                        "Los Angeles", "Flexible");
                        createTrainer("Jessica Flow", "Vinyasa Yoga", 6, "Dynamic movement synchronized with breath.",
                                        "jessica@flow.com",
                                        "https://img.freepik.com/free-photo/woman-doing-yoga-outdoors_23-2148821654.jpg",
                                        "San Francisco",
                                        "Morning");
                        createTrainer("Ryan Speed", "Athletic Performance", 9,
                                        "Training athletes for peak speed and agility.",
                                        "ryan@speed.com",
                                        "https://img.freepik.com/free-photo/man-running-track_23-2148821678.jpg",
                                        "Chicago", "Evening");
                        createTrainer("Chloe Balance", "Core & Stability", 5,
                                        "Build a strong foundation and improve posture.",
                                        "chloe@balance.com",
                                        "https://img.freepik.com/free-photo/woman-doing-core-exercises_23-2148821701.jpg",
                                        "Sydney",
                                        "Flexible");
                        createTrainer("Liam Bulk", "Hypertrophy", 7,
                                        "Scientifically-backed muscle building strategies.",
                                        "liam@bulk.com",
                                        "https://img.freepik.com/free-photo/man-lifting-weights_23-2148821712.jpg",
                                        "Toronto", "Weekend");
                        createTrainer("Isabella Tone", "Barre & Sculpt", 4, "Low-impact, high-intensity muscle toning.",
                                        "isabella@tone.com",
                                        "https://img.freepik.com/free-photo/woman-doing-barre-exercises_23-2148821723.jpg",
                                        "Paris",
                                        "Flexible");
                        createTrainer("Ethan Rugged", "Outdoor Fitness", 11,
                                        "Bootcamps and fitness in the great outdoors.",
                                        "ethan@rugged.com",
                                        "https://img.freepik.com/free-photo/man-training-park_23-2148821734.jpg",
                                        "Seattle", "Morning");
                        createTrainer("Mia Hatha", "Hatha Yoga", 13,
                                        "Classical yoga postures and breathing techniques.",
                                        "mia@hatha.com",
                                        "https://img.freepik.com/free-photo/woman-doing-hatha-yoga_23-2148821745.jpg",
                                        "Austin", "Evening");
                        createTrainer("Olivia Flex", "Pilates & Core", 6,
                                        "Focus on core strength and graceful movement.",
                                        "olivia@flex.com",
                                        "https://img.freepik.com/free-photo/young-fitness-woman-doing-pilates-stretching-exercises_23-2148053423.jpg",
                                        "Chicago", "Morning");
                        createTrainer("Noah Peak", "Endurance & Cycling", 9,
                                        "Training for marathons and long-distance cycling.",
                                        "noah@peak.com",
                                        "https://img.freepik.com/free-photo/man-riding-bicycle-nature_23-2148821756.jpg",
                                        "Denver",
                                        "Weekend");
                        createTrainer("Ava Glow", "Holistic Nutrition", 11, "Skin health starting from within.",
                                        "ava@glow.com",
                                        "https://img.freepik.com/free-photo/healthy-woman-eating-salad_23-2148821767.jpg",
                                        "Miami",
                                        "Flexible");
                        createTrainer("Lucas Grind", "MMA & Combat Fitness", 8,
                                        "Learn boxing and self-defense while getting fit.",
                                        "lucas@grind.com",
                                        "https://img.freepik.com/free-photo/boxer-training-gym_23-2148821778.jpg",
                                        "Las Vegas", "Evening");
                        createTrainer("Mia Pulse", "Spin & High Intensity", 5,
                                        "High-cadence cycling for maximum calorie burn.",
                                        "mia@pulse.com",
                                        "https://img.freepik.com/free-photo/woman-instructor-indoor-cycling-class_23-2148821789.jpg",
                                        "Atlanta",
                                        "Morning");
                        createTrainer("Ethan Reach", "Rehab & Recovery", 14,
                                        "Corrective exercise specialist for post-injury health.",
                                        "ethan@reach.com",
                                        "https://img.freepik.com/free-photo/physiotherapist-helping-patient-with-exercises_23-2148821800.jpg",
                                        "Boston", "Flexible");
                        createTrainer("Sophia Zen", "Tai Chi & Qigong", 20, "Ancient soft martial arts for longevity.",
                                        "sophia@zen.com",
                                        "https://img.freepik.com/free-photo/old-man-doing-tai-chi-park_23-2148821811.jpg",
                                        "Seattle",
                                        "Morning");
                        createTrainer("James Heavy", "Powerlifting", 12, "Squat, bench, and deadlift like a pro.",
                                        "james@heavy.com",
                                        "https://img.freepik.com/free-photo/powerlifter-preparing-lifting-barbell_23-2148821822.jpg",
                                        "Dallas",
                                        "Evening");
                        createTrainer("Lily Breath", "Pranayama & Meditation", 9,
                                        "Master your breath to control your mind.",
                                        "lily@breath.com",
                                        "https://img.freepik.com/free-photo/woman-practicing-yoga-outdoors_23-2148821833.jpg",
                                        "Portland",
                                        "Flexible");
                        createTrainer("Benjamin Fast", "Sprinting & Speed", 7,
                                        "Elite track coaching for explosiveness.",
                                        "benjamin@fast.com",
                                        "https://img.freepik.com/free-photo/sprinter-starting-position-stadium_23-2148821844.jpg",
                                        "Phoenix",
                                        "Morning");
                        createTrainer("Charlotte Sculpt", "Body Contouring", 10,
                                        "Targeted resistance training for a lean physique.",
                                        "charlotte@sculpt.com",
                                        "https://img.freepik.com/free-photo/fitness-woman-lifting-dumbbells_23-2148821855.jpg",
                                        "San Diego",
                                        "Evening");
                        createTrainer("Daniel Tough", "Military Bootcamp", 15,
                                        "Discipline and strength through functional training.",
                                        "daniel@tough.com",
                                        "https://img.freepik.com/free-photo/man-doing-pushups-gym_23-2148821866.jpg",
                                        "Fort Bragg",
                                        "Morning");
                        createTrainer("Emily Pure", "Detox & Clean Eating", 8,
                                        "Simple, sustainable plans for a cleaner you.",
                                        "emily@pure.com",
                                        "https://img.freepik.com/free-photo/woman-making-smoothie_23-2148821877.jpg",
                                        "Boulder",
                                        "Flexible");
                        createTrainer("Jacob Agility", "Sport Specific / Basketball", 6,
                                        "Vertical jump and lateral speed specialist.",
                                        "jacob@agility.com",
                                        "https://img.freepik.com/free-photo/basketball-player-training-court_23-2148821888.jpg",
                                        "Charlotte",
                                        "Weekend");
                        createTrainer("Abigail Rest", "Sleep & Circadian Science", 11,
                                        "Optimizing recovery through better rest habits.",
                                        "abigail@rest.com",
                                        "https://img.freepik.com/free-photo/woman-sleeping-comfortably_23-2148821899.jpg",
                                        "Nashville",
                                        "Flexible");
                        createTrainer("Michael Build", "Calisthenics Mastery", 9,
                                        "Using bodyweight to achieve superhuman strength.",
                                        "michael@build.com",
                                        "https://img.freepik.com/free-photo/man-doing-pull-ups-street-workout_23-2148821910.jpg",
                                        "New York",
                                        "Morning");
                        createTrainer("Elizabeth Grace", "Ballet & Floor Fitness", 13,
                                        "Build long, lean muscles with dance-inspired moves.",
                                        "elizabeth@grace.com",
                                        "https://img.freepik.com/free-photo/ballerina-posing-studio_23-2148821921.jpg",
                                        "Vienna",
                                        "Evening");
                        createTrainer("William Core", "Functional Movement", 7,
                                        "Fixing movement patterns for everyday strength.",
                                        "william@core.com",
                                        "https://img.freepik.com/free-photo/man-lifting-kettlebell_23-2148821932.jpg",
                                        "Sarasota",
                                        "Flexible");
                        createTrainer("Madison Swim", "Aquatic Fitness", 10,
                                        "Low-impact water aerobics and swim coaching.",
                                        "madison@swim.com",
                                        "https://img.freepik.com/free-photo/woman-swimming-pool_23-2148821943.jpg",
                                        "Tampa", "Morning");
                        createTrainer("Alexander Flow", "Acro Yoga", 5, "Partner yoga and advanced balance techniques.",
                                        "alexander@flow.com",
                                        "https://img.freepik.com/free-photo/couple-doing-acroyoga_23-2148821954.jpg",
                                        "Vancouver",
                                        "Weekend");
                        createTrainer("Leo Fit", "Calisthenics", 4, "High energy bodyweight expert.",
                                        "leo@fit.com",
                                        "https://img.freepik.com/free-photo/young-fitness-man-studio_7502-5008.jpg",
                                        "Los Angeles", "Flexible");
                        createTrainer("Maya Core", "Pilates", 8, "Core strength and mobility focus.",
                                        "maya@core.com",
                                        "https://img.freepik.com/free-photo/beautiful-young-sporty-woman-doing-stretching-exercises_23-2147876127.jpg",
                                        "Miami", "Morning");
                        createTrainer("Samuel Lift", "Olympic Weightlifting", 12, "Specialist in Olympic lifts.",
                                        "samuel@lift.com",
                                        "https://img.freepik.com/free-photo/fit-strong-handsome-man-doing-weight-lifting-gym_1150-13765.jpg",
                                        "Dallas", "Evening");
                        createTrainer("Nina Flow", "Ashtanga Yoga", 6, "Dynamic and traditional yoga sequence.",
                                        "nina@flow.com",
                                        "https://img.freepik.com/free-photo/beautiful-young-woman-doing-yoga-home_23-2148002622.jpg",
                                        "San Diego", "Morning");
                        createTrainer("Victor Run", "Marathon Training", 14, "Distance running and stamina.",
                                        "victor@run.com",
                                        "https://img.freepik.com/free-photo/man-running-nature_23-2148301826.jpg",
                                        "Boston", "Weekend");
                        createTrainer("Carmen Dance", "Zumba", 5, "Fun and energetic dance workouts.",
                                        "carmen@dance.com",
                                        "https://img.freepik.com/free-photo/zumba-class_1098-14457.jpg",
                                        "Houston", "Evening");
                        createTrainer("Felix Strong", "Strongman", 10, "Heavy lifting and functional power.",
                                        "felix@strong.com",
                                        "https://img.freepik.com/free-photo/strong-man-training-gym_23-2148560370.jpg",
                                        "Atlanta", "Flexible");
                        createTrainer("Zoe Box", "Kickboxing", 7, "Striking and cardiovascular conditioning.",
                                        "zoe@box.com",
                                        "https://img.freepik.com/free-photo/boxer-female-training_23-2148001614.jpg",
                                        "Las Vegas", "Evening");
                        createTrainer("Oliver Swim", "Triathlon Prep", 9, "Swim, bike, run technique.",
                                        "oliver@swim.com",
                                        "https://img.freepik.com/free-photo/swimmer-pool_23-2148001602.jpg",
                                        "Orlando", "Morning");
                        createTrainer("Penelope Stretch", "Mobility", 5, "Flexibility and joint health.",
                                        "penelope@stretch.com",
                                        "https://img.freepik.com/free-photo/woman-stretching_23-2148001610.jpg",
                                        "Seattle", "Flexible");
                        createTrainer("Carter Iron", "Bodybuilding", 11, "Hypertrophy and posing coach.",
                                        "carter@iron.com",
                                        "https://img.freepik.com/free-photo/muscular-man_23-2148001605.jpg",
                                        "Chicago", "Weekend");
                        createTrainer("Lillian Calm", "Restorative Yoga", 15, "Deep relaxation and recovery.",
                                        "lillian@calm.com",
                                        "https://img.freepik.com/free-photo/woman-meditating_23-2148001608.jpg",
                                        "San Francisco", "Morning");
                        createTrainer("Julian Speed", "Track and Field", 6, "Sprinting and jump technique.",
                                        "julian@speed.com",
                                        "https://img.freepik.com/free-photo/man-running_23-2148001601.jpg",
                                        "Philadelphia", "Evening");
                }
                syncTrainersToUsers();
                seedSessions();
        }

        private void seedSessions() {
                if (sessionRepository.count() == 0) {
                        List<Trainer> trainers = trainerRepository.findAll();
                        for (Trainer t : trainers) {
                                createSession(t, t.getSpecialization() + " Workshop",
                                                java.time.LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
                                createSession(t, "Q&A with " + t.getName(),
                                                java.time.LocalDateTime.now().plusDays(2).withHour(16).withMinute(30));
                        }
                }
        }

        private void createSession(Trainer t, String title, java.time.LocalDateTime dt) {
                com.wellnest.wellnest.model.Session s = new com.wellnest.wellnest.model.Session();
                s.setTrainer(t);
                s.setTitle(title);
                s.setSessionDateTime(dt);
                s.setStatus("UPCOMING");
                sessionRepository.save(s);
        }

        // Ensure all trainers have a corresponding User account
        private void syncTrainersToUsers() {
                List<Trainer> trainers = trainerRepository.findAll();
                for (Trainer t : trainers) {
                        Optional<User> userOpt = userRepository.findByEmail(t.getContactEmail());
                        if (userOpt.isEmpty()) {
                                User u = new User();
                                u.setFullName(t.getName());
                                u.setEmail(t.getContactEmail());
                                u.setPassword(passwordEncoder.encode("Trainer@123"));
                                u.setRole(com.wellnest.wellnest.model.Role.TRAINER);
                                userRepository.save(u);
                                System.out.println("Created User account for Trainer: " + t.getName());
                        } else {
                                User u = userOpt.get();
                                u.setPassword(passwordEncoder.encode("Trainer@123"));
                                userRepository.save(u);
                                System.out.println("Restored Password for Trainer: " + t.getName());
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
                                                if (t.getName() == null || !t.getName().toLowerCase()
                                                                .contains(name.toLowerCase())) {
                                                        match = false;
                                                }
                                        }

                                        // 1. Goal Match (Skip if explicit Type filter or Name filter is on)
                                        if (match && type != null && !type.isEmpty() && !type.equals("All")) {
                                                if (t.getSpecialization() == null
                                                                || !t.getSpecialization().toLowerCase()
                                                                                .contains(type.toLowerCase())) {
                                                        match = false;
                                                }
                                        } else if (match && !isFiltering && goal != null && !goal.isEmpty()) {
                                                String spec = t.getSpecialization().toLowerCase();
                                                String g = goal.toLowerCase();

                                                if (g.contains("weight") || g.contains("fat")) {
                                                        if (!(spec.contains("weight") || spec.contains("fat")
                                                                        || spec.contains("cardio")
                                                                        || spec.contains("hiit")
                                                                        || spec.contains("zumba")
                                                                        || spec.contains("pilates")
                                                                        || spec.contains("crossfit")
                                                                        || spec.contains("calisthenics")))
                                                                match = false;
                                                } else if (g.contains("muscle") || g.contains("strength")
                                                                || g.contains("gain")) {
                                                        if (!(spec.contains("muscle") || spec.contains("strength")
                                                                        || spec.contains("power")
                                                                        || spec.contains("lift")))
                                                                match = false;
                                                } else if (g.contains("yoga") || g.contains("flexibility")) {
                                                        if (!(spec.contains("yoga") || spec.contains("flexibility")))
                                                                match = false;
                                                } else if (g.contains("run") || g.contains("cardio")
                                                                || g.contains("endurance")) {
                                                        if (!(spec.contains("run") || spec.contains("cardio")
                                                                        || spec.contains("endurance")))
                                                                match = false;
                                                }
                                        }

                                        // 2. Location
                                        if (match && location != null && !location.isEmpty()
                                                        && !location.equals("All")) {
                                                String trLocation = t.getLocation() != null ? t.getLocation()
                                                                : "Online";
                                                if (!trLocation.toLowerCase().contains(location.toLowerCase())) {
                                                        match = false;
                                                }
                                        }

                                        // 3. Availability
                                        if (match && availability != null && !availability.isEmpty()
                                                        && !availability.equals("All")) {
                                                String trAvailability = t.getAvailability() != null
                                                                ? t.getAvailability()
                                                                : "Flexible";
                                                if (!trAvailability.toLowerCase()
                                                                .contains(availability.toLowerCase())) {
                                                        match = false;
                                                }
                                        }

                                        return match;
                                })
                                .toList();

                // Maintain a minimum of 6 recommendations if not explicitly filtering
                if (!isFiltering && matches.size() < 6) {
                        java.util.List<Trainer> padded = new java.util.ArrayList<>(matches);
                        for (Trainer t : allTrainers) {
                                if (!padded.contains(t)) {
                                        padded.add(t);
                                }
                                if (padded.size() >= 6)
                                        break;
                        }
                        matches = padded;
                }

                // Fallback: if still completely empty (edge case), return all ONLY IF NOT
                // FILTERING
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
                                String uploadDir = System.getProperty("user.dir")
                                                + "/src/main/resources/static/uploads/";
                                java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                                if (!java.nio.file.Files.exists(uploadPath)) {
                                        java.nio.file.Files.createDirectories(uploadPath);
                                }
                                String fileName = java.util.UUID.randomUUID().toString() + "_"
                                                + image.getOriginalFilename();
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

        @GetMapping("/{id}/sessions")
        public List<com.wellnest.wellnest.model.Session> getTrainerSessions(@PathVariable Long id) {
                Trainer t = new Trainer();
                t.setId(id);
                return sessionRepository.findByTrainerAndStatusOrderBySessionDateTimeAsc(t, "UPCOMING");
        }
}
