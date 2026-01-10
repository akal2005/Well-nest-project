# 🛠️ WellNest Setup & Run Guide

This guide provides accurate instructions for setting up and running the WellNest project on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1.  **Java Development Kit (JDK) 17**: Required to compile and run the Spring Boot backend. (e.g., Eclipse Temurin 17 is perfect).
2.  **MySQL Server**: Required for the database.
3.  **Maven**: You **DO NOT** need to install Maven. The project includes a "Maven Wrapper" (`mvnw.cmd`) which handles everything for you automatically.

## 🗄️ Database Setup (MySQL Workbench)

1.  **Open MySQL Workbench**: Connect to your local MySQL instance.
2.  **Create Database**: In a new SQL tab, run:
    ```sql
    CREATE DATABASE wellnestdb;
    ```
3.  **Configure Credentials**: In Eclipse (or any text editor), open `src/main/resources/application.properties` and verify your password:
    ```properties
    spring.datasource.password=YOUR_PASSWORD_HERE
    ```

## 🚀 Running with VS Code

1.  **Open Folder**: Open VS Code and go to **File** -> **Open Folder...**, then select the `wellnest-main` folder.
2.  **Run with Terminal (Recommended/Foolproof)**:
    *   Open the terminal in VS Code (Press `Ctrl + ~` or go to **Terminal -> New Terminal**).
    *   Type this exact command and press Enter:
        ```powershell
        .\mvnw spring-boot:run
        ```
    *   *This command automatically handles all dependencies (the "missing packages" you saw).*

3.  **Alternative (Using Run Button)**:
    *   Ensure you have the **Extension Pack for Java** installed.
    *   Open `src/main/java/com/wellnest/wellnest/WellnestApplication.java`.
    *   Look for the word "Run" written in small letters just above the `main` method and click it. (Do **not** use the Play button in the top right corner, as that often tries to run it without Maven).

## 🚀 Running with Eclipse

1.  **Import Project**:
    *   Open Eclipse.
    *   Go to **File** -> **Import...**
    *   Select **Maven** -> **Existing Maven Projects** and click **Next**.
    *   Browse to the `wellnest-main` folder and click **Finish**.
2.  **Wait for Build**: Eclipse will download dependencies. Check the progress bar in the bottom right.
3.  **Run Application**:
    *   In the Project Explorer, navigate to:
        `src/main/java` -> `com.wellnest.wellnest` -> `WellnestApplication.java`.
    *   **Right-click** `WellnestApplication.java`.
    *   Select **Run As** -> **Java Application**.

## 🌐 Access WellNest

Once the Console says "Started WellnestApplication...", open your browser and go to:
[http://localhost:8081/index.html](http://localhost:8081/index.html)

## 🔍 Troubleshooting

-   **Port 8081 Busy**: If you see "Port 8081 is already in use", you can change the port in `application.properties` (`server.port=8081`).
-   **Database Connection Failed**: Double-check your MySQL service is running and the password in `application.properties` is correct.
-   **Emails Not Sending**: The project uses Gmail SMTP. Ensure your internet connection is active and the credentials in `application.properties` are valid.
