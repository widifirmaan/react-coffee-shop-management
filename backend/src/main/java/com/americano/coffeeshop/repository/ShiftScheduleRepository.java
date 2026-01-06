package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.ShiftSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

import java.time.DayOfWeek;
import java.util.Optional;

public interface ShiftScheduleRepository extends MongoRepository<ShiftSchedule, String> {
    List<ShiftSchedule> findByEmployeeId(String employeeId);

    Optional<ShiftSchedule> findByEmployeeIdAndDayOfWeek(String employeeId, DayOfWeek dayOfWeek);
}
