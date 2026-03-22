package com.wellnest.wellnest.repository;

import com.wellnest.wellnest.model.CravingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CravingLogRepository extends JpaRepository<CravingLog, Long> {
    List<CravingLog> findByUserIdOrderByTimestampDesc(Long userId);
}
