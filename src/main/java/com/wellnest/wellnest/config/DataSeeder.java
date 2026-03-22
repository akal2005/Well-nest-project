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
                        com.wellnest.wellnest.repository.WorkoutLogRepository workoutLogRepo,
                        com.wellnest.wellnest.repository.MealLogRepository mealLogRepo,
                        com.wellnest.wellnest.repository.WaterSleepLogRepository waterLogRepo,
                        com.wellnest.wellnest.repository.CravingLogRepository cravingRepo,
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
                                user.setHeight(175.0);
                                user.setGoal("Lose Weight");
                                user = userRepo.save(user);
                                System.out.println("Seeded Demo User: demo@wellnest.com");
                        } else {
                                user = userRepo.findByEmail("demo@wellnest.com").get();
                                // Force reset password to ensure login works
                                user.setPassword(passwordEncoder.encode("password123"));
                                user = userRepo.save(user);
                                System.out.println("Updated Demo User password: demo@wellnest.com");
                        }

                        // 1.1. Seed Admin User
                        if (!userRepo.existsByEmail("admin@wellnest.com")) {
                                User admin = new User();
                                admin.setFullName("Platform Admin");
                                admin.setEmail("admin@wellnest.com");
                                admin.setPassword(passwordEncoder.encode("Admin@123"));
                                admin.setRole(Role.ADMIN);
                                userRepo.save(admin);
                                System.out.println("Seeded Admin User: admin@wellnest.com");
                        } else {
                                User admin = userRepo.findByEmail("admin@wellnest.com").get();
                                admin.setPassword(passwordEncoder.encode("Admin@123"));
                                userRepo.save(admin);
                                System.out.println("Restored Admin Password: admin@wellnest.com");
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

                        // =================== COUNSELLING DASHBOARD DEMO DATA ===================
                        // Seed 3 more users specifically for addiction tracking
                        String[][] recoveryUsers = {
                                        { "Sarah Sugar", "sarah@wellnest.com", "Sugar Addiction" },
                                        { "Mike Smoke", "mike@wellnest.com", "Smoking Recovery" },
                                        { "David Drink", "david@wellnest.com", "Alcohol Recovery" }
                        };

                        for (String[] ru : recoveryUsers) {
                                User rUser;
                                if (!userRepo.existsByEmail(ru[1])) {
                                        rUser = new User();
                                        rUser.setFullName(ru[0]);
                                        rUser.setEmail(ru[1]);
                                        rUser.setPassword(passwordEncoder.encode("password123"));
                                        rUser.setRole(Role.USER);
                                        rUser.setGoal(ru[2]);
                                        rUser = userRepo.save(rUser);
                                } else {
                                        rUser = userRepo.findByEmail(ru[1]).get();
                                }

                                // Link to Alex Trainer
                                if (alex != null && clientRepo.findByUserAndStatus(rUser, "ACTIVE").isEmpty()) {
                                        com.wellnest.wellnest.model.TrainerClient rel = new com.wellnest.wellnest.model.TrainerClient();
                                        rel.setUser(rUser);
                                        rel.setTrainer(alex);
                                        rel.setStatus("ACTIVE");
                                        rel.setEnrolledAt(java.time.LocalDateTime.now());
                                        clientRepo.save(rel);
                                }

                                // Generate a week of Craving Logs for charts
                                if (cravingRepo.findByUserIdOrderByTimestampDesc(rUser.getId()).isEmpty()) {
                                        for (int i = 6; i >= 0; i--) {
                                                com.wellnest.wellnest.model.CravingLog cl = new com.wellnest.wellnest.model.CravingLog();
                                                cl.setUserId(rUser.getId());
                                                // Randomize a bit: decrease intensity slightly over the week for a
                                                // "recovery" visual
                                                cl.setIntensity((int) (Math.random() * 4) + (i > 3 ? 5 : 2));
                                                cl.setStressLevel((int) (Math.random() * 5) + 3);
                                                cl.setTimestamp(java.time.LocalDateTime.now().minusDays(i));
                                                cravingRepo.save(cl);
                                        }
                                }
                        }
                        // =======================================================================

                        // 6. Seed Featured Articles
                        if (articleRepo.countByFeaturedTrue() < 15) {
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

                                com.wellnest.wellnest.model.Article a4 = new com.wellnest.wellnest.model.Article();
                                a4.setTitle("10 Superfoods for Peak Immunity");
                                a4.setDescription(
                                                "Boost your body's natural defenses by incorporating these nutrient-dense powerhouses into your daily diet.");
                                a4.setSpecialization("Nutrition");
                                a4.setTrainerName("Ava Glow");
                                a4.setTrainerEmail("ava@glow.com");
                                a4.setFeatured(true);
                                articleRepo.save(a4);

                                com.wellnest.wellnest.model.Article a5 = new com.wellnest.wellnest.model.Article();
                                a5.setTitle("The Science of Sleep and Fat Loss");
                                a5.setDescription(
                                                "Discover how a lack of rest can sabotage your hormones and prevent you from losing weight, even with exercise.");
                                a5.setSpecialization("Wellness");
                                a5.setTrainerName("Abigail Rest");
                                a5.setTrainerEmail("abigail@rest.com");
                                a5.setFeatured(true);
                                articleRepo.save(a5);

                                com.wellnest.wellnest.model.Article a6 = new com.wellnest.wellnest.model.Article();
                                a6.setTitle("HIIT for Beginners: A Complete Guide");
                                a6.setDescription(
                                                "Everything you need to know about starting high-intensity interval training without burning out or getting injured.");
                                a6.setSpecialization("Fitness");
                                a6.setTrainerName("Mike Runner");
                                a6.setTrainerEmail("mike@runner.com");
                                a6.setFeatured(true);
                                articleRepo.save(a6);

                                com.wellnest.wellnest.model.Article a7 = new com.wellnest.wellnest.model.Article();
                                a7.setTitle("The Benefits of Cold Plunges and Sauna");
                                a7.setDescription(
                                                "Explore the powerful health impacts of thermal stress on mitochondrial health and cognitive clarity.");
                                a7.setSpecialization("Recovery");
                                a7.setTrainerName("Ethan Reach");
                                a7.setTrainerEmail("ethan@reach.com");
                                a7.setFeatured(true);
                                articleRepo.save(a7);

                                com.wellnest.wellnest.model.Article a8 = new com.wellnest.wellnest.model.Article();
                                a8.setTitle("Psychology of Fitness Motivation");
                                a8.setDescription(
                                                "Mindset techniques to keep you consistent when your initial excitement starts to fade.");
                                a8.setSpecialization("Wellness");
                                a8.setTrainerName("Zen Master");
                                a8.setTrainerEmail("zen@master.com");
                                a8.setFeatured(true);
                                articleRepo.save(a8);

                                com.wellnest.wellnest.model.Article a9 = new com.wellnest.wellnest.model.Article();
                                a9.setTitle("Hydration and Cognitive Performance");
                                a9.setDescription(
                                                "Why drinking enough water is actually a brain hack for better focus and decision-making.");
                                a9.setSpecialization("Nutrition");
                                a9.setTrainerName("Sarah Strong");
                                a9.setTrainerEmail("sarah@strong.com");
                                a9.setFeatured(true);
                                articleRepo.save(a9);

                                com.wellnest.wellnest.model.Article a10 = new com.wellnest.wellnest.model.Article();
                                a10.setTitle("Strength Training for Longevity");
                                a10.setDescription(
                                                "How maintaining muscle mass as you age is the secret to living a longer, more capable life.");
                                a10.setSpecialization("Fitness");
                                a10.setTrainerName("Alex Fit");
                                a10.setTrainerEmail("alex@fit.com");
                                a10.setFeatured(true);
                                articleRepo.save(a10);

                                com.wellnest.wellnest.model.Article a11 = new com.wellnest.wellnest.model.Article();
                                a11.setTitle("Plant-Based Proteins for Athletes");
                                a11.setDescription(
                                                "Elite performance without the meat. A breakdown of the best vegan protein sources for muscle gain.");
                                a11.setSpecialization("Nutrition");
                                a11.setTrainerName("Emily Pure");
                                a11.setTrainerEmail("emily@pure.com");
                                a11.setFeatured(true);
                                articleRepo.save(a11);

                                com.wellnest.wellnest.model.Article a12 = new com.wellnest.wellnest.model.Article();
                                a12.setTitle("Mindfulness and Emotional Eating");
                                a12.setDescription(
                                                "Tackle the root cause of overeating by building a deeper awareness of your hunger cues and emotions.");
                                a12.setSpecialization("Wellness");
                                a12.setTrainerName("Sophia Zen");
                                a12.setTrainerEmail("sophia@zen.com");
                                a12.setFeatured(true);
                                articleRepo.save(a12);

                                com.wellnest.wellnest.model.Article a13 = new com.wellnest.wellnest.model.Article();
                                a13.setTitle("Breaking Through a Weight Loss Plateau");
                                a13.setDescription(
                                                "The data-driven steps to restart your metabolism when the scale stops moving.");
                                a13.setSpecialization("Nutrition");
                                a13.setTrainerName("Sarah Strong");
                                a13.setTrainerEmail("sarah@strong.com");
                                a13.setFeatured(true);
                                articleRepo.save(a13);

                                com.wellnest.wellnest.model.Article a14 = new com.wellnest.wellnest.model.Article();
                                a14.setTitle("Importance of Mobility and Flexibility");
                                a14.setDescription(
                                                "Why being strong is useless if you can't move properly. Pre-hab routines for every athlete.");
                                a14.setSpecialization("Fitness");
                                a14.setTrainerName("Olivia Flex");
                                a14.setTrainerEmail("olivia@flex.com");
                                a14.setFeatured(true);
                                articleRepo.save(a14);

                                com.wellnest.wellnest.model.Article a15 = new com.wellnest.wellnest.model.Article();
                                a15.setTitle("Keto vs Mediterranean: The Comparison");
                                a15.setDescription(
                                                "An unbiased, scientific look at the two most popular dietary lifestyles in the world today.");
                                a15.setSpecialization("Nutrition");
                                a15.setTrainerName("Ava Glow");
                                a15.setTrainerEmail("ava@glow.com");
                                a15.setFeatured(true);
                                articleRepo.save(a15);

                                System.out.println("Seeded Featured Articles");
                        }

                        // 7. Seed Logs for the last 7 days to populate Charts & Points
                        for (int i = 0; i < 7; i++) {
                                java.time.LocalDate d = java.time.LocalDate.now().minusDays(i);

                                // Workout Log (More intense for more points)
                                if (workoutLogRepo.findByUserIdAndLogDate(user.getId(), d).isEmpty()) {
                                        com.wellnest.wellnest.model.WorkoutLog wl = new com.wellnest.wellnest.model.WorkoutLog();
                                        wl.setUserId(user.getId());
                                        wl.setLogDate(d);
                                        wl.setExerciseType(i % 2 == 0 ? "Cardio" : "Strength");
                                        wl.setDurationMinutes(45 + (i * 2)); // Fixed higher duration
                                        wl.setCaloriesBurned(400 + (i * 10)); // Fixed higher calories
                                        workoutLogRepo.save(wl);
                                }

                                // Meal Log
                                if (mealLogRepo.findByUserIdAndLogDate(user.getId(), d).isEmpty()) {
                                        com.wellnest.wellnest.model.MealLog ml = new com.wellnest.wellnest.model.MealLog();
                                        ml.setUserId(user.getId());
                                        ml.setLogDate(d);
                                        ml.setMealType("Lunch");
                                        ml.setDescription("Macro-balanced High Protein Meal");
                                        ml.setCalories(650);
                                        ml.setProtein(40);
                                        ml.setCarbs(60);
                                        ml.setFats(15);
                                        mealLogRepo.save(ml);
                                }

                                // Water/Sleep Log
                                if (waterLogRepo.findByUserIdAndLogDate(user.getId(), d).isEmpty()) {
                                        com.wellnest.wellnest.model.WaterSleepLog ws = new com.wellnest.wellnest.model.WaterSleepLog();
                                        ws.setUserId(user.getId());
                                        ws.setLogDate(d);
                                        ws.setWaterIntakeLiters(2.8); // 2.8L is a good start
                                        ws.setSleepHours(8.0);
                                        ws.setSleepQuality("Excellent");
                                        ws.setNotes("Slept like a baby!");
                                        waterLogRepo.save(ws);
                                }
                        }
                        System.out.println("Seeded 7 days of historical health data for Demo User");
                };
        }
}
