package com.wellnest.wellnest.repository;

import com.wellnest.wellnest.model.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findTop100ByOrderByTimestampDesc();
}
