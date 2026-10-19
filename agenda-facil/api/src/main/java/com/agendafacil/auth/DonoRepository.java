package com.agendafacil.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DonoRepository extends JpaRepository<Dono, Long> {

    Optional<Dono> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
