package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.ShiftScheduleDTO;
import com.americano.coffeeshop.service.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ShiftController {

    private final ShiftService shiftService;

    @GetMapping
    public ResponseEntity<List<ShiftScheduleDTO>> getAllShifts() {
        return ResponseEntity.ok(shiftService.getAllShifts());
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<List<ShiftScheduleDTO>> updateShifts(
            @org.springframework.web.bind.annotation.RequestBody List<ShiftScheduleDTO> shifts) {
        return ResponseEntity.ok(shiftService.updateShifts(shifts));
    }
}
