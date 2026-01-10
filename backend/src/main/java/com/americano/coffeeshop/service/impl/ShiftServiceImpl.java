package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.ShiftScheduleDTO;
import com.americano.coffeeshop.repository.ShiftScheduleRepository;
import com.americano.coffeeshop.service.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {

    private final ShiftScheduleRepository shiftRepository;

    @Override
    public List<ShiftScheduleDTO> getAllShifts() {
        return shiftRepository.findAll().stream()
                .map(ShiftScheduleDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShiftScheduleDTO> updateShifts(List<ShiftScheduleDTO> shifts) {
        shiftRepository.deleteAll();
        List<com.americano.coffeeshop.model.ShiftSchedule> entities = shifts.stream().map(dto -> {
            com.americano.coffeeshop.model.ShiftSchedule s = new com.americano.coffeeshop.model.ShiftSchedule();
            s.setEmployeeId(dto.getEmployeeId());
            s.setEmployeeName(dto.getEmployeeName());
            s.setPosition(dto.getPosition());
            s.setDayOfWeek(dto.getDayOfWeek()); // Direct assignment
            s.setShiftType(dto.getShiftType()); // Direct assignment
            return s;
        }).collect(Collectors.toList());

        return shiftRepository.saveAll(entities).stream()
                .map(ShiftScheduleDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
