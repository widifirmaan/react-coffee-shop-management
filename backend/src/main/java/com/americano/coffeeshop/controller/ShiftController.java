package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.model.ShiftSchedule;
import com.americano.coffeeshop.repository.ShiftScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    @Autowired
    private ShiftScheduleRepository shiftRepository;

    @GetMapping
    public ResponseEntity<List<ShiftSchedule>> getAllShifts() {
        return ResponseEntity.ok(shiftRepository.findAll());
    }
}
