package com.wellnest.wellnest.repository;

import com.wellnest.wellnest.model.Session;
import com.wellnest.wellnest.model.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByTrainerAndStatusOrderBySessionDateTimeAsc(Trainer trainer, String status);
}
