package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.NoteDTO;
import java.util.Map;

public interface NoteService {
    NoteDTO getDashboardNote();

    NoteDTO updateDashboardNote(Map<String, String> payload);
}
