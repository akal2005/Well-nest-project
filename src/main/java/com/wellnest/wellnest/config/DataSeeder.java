package com.wellnest.wellnest.config;

import com.wellnest.wellnest.model.Role;
import com.wellnest.wellnest.model.User;
import com.wellnest.wellnest.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner demoData(UserRepository userRepo,
            com.wellnest.wellnest.repository.TrainerRepository trainerRepo,
            com.wellnest.wellnest.repository.TrainerClientRepository clientRepo,
            com.wellnest.wellnest.repository.WorkoutPlanRepository workoutRepo,
            com.wellnest.wellnest.repository.MealPlanRepository mealRepo,
            com.wellnest.wellnest.repository.ArticleRepository articleRepo,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Seed Demo User
            User user;
            if (!userRepo.existsByEmail("demo@wellnest.com")) {
                user = new User();
                user.setFullName("Demo User");
                user.setEmail("demo@wellnest.com");
                user.setPassword(passwordEncoder.encode("password123"));
                user.setRole(Role.USER);
                user.setAge(25);
                user.setWeight(70.0);
                user.setGoal("Lose Weight");
                user = userRepo.save(user);
                System.out.println("Seeded Demo User: demo@wellnest.com");
            } else {
                user = userRepo.findByEmail("demo@wellnest.com").get();
            }

            // 2. Ensure Trainer exists (Alex Fit)
            com.wellnest.wellnest.model.Trainer alex = trainerRepo.findAll().stream()
                    .filter(t -> t.getName().contains("Alex"))
                    .findFirst().orElse(null);

            if (alex != null) {
                // 3. Link Demo User to Alex
                com.wellnest.wellnest.model.TrainerClient relationship;
                java.util.Optional<com.wellnest.wellnest.model.TrainerClient> tcOpt = clientRepo
                        .findByUserAndStatus(user, "ACTIVE");

                if (tcOpt.isEmpty()) {
                    relationship = new com.wellnest.wellnest.model.TrainerClient();
                    relationship.setUser(user);
                    relationship.setTrainer(alex);
                    relationship.setStatus("ACTIVE");
                    relationship.setEnrolledAt(java.time.LocalDateTime.now());
                    relationship = clientRepo.save(relationship);
                    System.out.println("Linked Demo User to Trainer Alex Fit");
                } else {
                    relationship = tcOpt.get();
                }

                // 4. Seed Workout Plan if none
                if (workoutRepo.findByClientOrderByAssignedAtDesc(relationship).isEmpty()) {
                    com.wellnest.wellnest.model.WorkoutPlan wp = new com.wellnest.wellnest.model.WorkoutPlan();
                    wp.setClient(relationship);
                    wp.setTitle("Weight Loss Spark 1.0");
                    wp.setOverview("A high-intensity plan focusing on fat burn and muscle tone.");
                    wp.setExercises(
                            "1. Burpees: 3 sets x 15 reps\n2. Mountain Climbers: 4 sets x 30 sec\n3. Jump Squats: 3 sets x 20 reps\n4. Plank: 3 sets x 1 min");
                    workoutRepo.save(wp);
                    System.out.println("Seeded Workout Plan for Demo User");
                }

                // 5. Seed Meal Plan if none
                if (mealRepo.findByClientOrderByAssignedAtDesc(relationship).isEmpty()) {
                    com.wellnest.wellnest.model.MealPlan mp = new com.wellnest.wellnest.model.MealPlan();
                    mp.setClient(relationship);
                    mp.setTitle("Fat Burn Fuel Plan");
                    mp.setDailyCalorieTarget("1,800 kcal");
                    mp.setMeals(
                            "Breakfast: Scrambled eggs with spinach (350 kcal)\nLunch: Grilled chicken salad (450 kcal)\nSnack: Greek yogurt with berries (200 kcal)\nDinner: Baked Salmon with Broccoli (500 kcal)");
                    mealRepo.save(mp);
                    System.out.println("Seeded Meal Plan for Demo User");
                }
            }

            // 6. Seed Featured Articles
            if (articleRepo.findByFeaturedTrueOrderByCreatedAtDesc().isEmpty()) {
                com.wellnest.wellnest.model.Article a1 = new com.wellnest.wellnest.model.Article();
                a1.setTitle("The Mind-Muscle Connection");
                a1.setDescription(
                        "Learn how focusing on the muscle you're working can increase hypertrophy and mind-body awareness during your workouts.");
                a1.setSpecialization("Fitness");
                a1.setTrainerName("Alex Fit");
                a1.setTrainerEmail("alex@wellnest.com");
                a1.setFeatured(true);
                articleRepo.save(a1);

                com.wellnest.wellnest.model.Article a2 = new com.wellnest.wellnest.model.Article();
                a2.setTitle("Optimal Post-Workout Nutrition");
                a2.setDescription(
                        "What you eat after your workout is crucial for recovery. Discover the best protein-to-carb ratios for maximum results.");
                a2.setSpecialization("Nutrition");
                a2.setTrainerName("Sarah Strong");
                a2.setTrainerEmail("sarah@wellnest.com");
                a2.setFeatured(true);
                articleRepo.save(a2);

                com.wellnest.wellnest.model.Article a3 = new com.wellnest.wellnest.model.Article();
                a3.setTitle("Mastering Morning Routines");
                a3.setDescription(
                        "Transform your day by starting it right. These simple morning habits will boost your productivity and mood.");
                a3.setSpecialization("Wellness");
                a3.setTrainerName("Zen Master");
                a3.setTrainerEmail("zen@wellnest.com");
                a3.setFeatured(true);
                articleRepo.save(a3);

                System.out.println("Seeded Featured Articles");
            }
        };
    }
}
