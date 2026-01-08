package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.ShiftScheduleDTO;
import java.util.List;

public interface ShiftService {
    List<ShiftScheduleDTO> getAllShifts();
}
