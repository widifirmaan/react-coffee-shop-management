package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    Optional<Attendance> findByEmployeeIdAndDate(String employeeId, LocalDate date);

    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByEmployeeIdAndStatus(String employeeId, String status);
}
