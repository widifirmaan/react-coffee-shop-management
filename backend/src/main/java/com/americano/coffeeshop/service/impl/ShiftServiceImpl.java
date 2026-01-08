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
}
