package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.NoteDTO;
import com.americano.coffeeshop.model.Note;
import com.americano.coffeeshop.repository.NoteRepository;
import com.americano.coffeeshop.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;

    @Override
    public NoteDTO getDashboardNote() {
        return noteRepository.findById("dashboard_note")
                .map(NoteDTO::fromEntity)
                .orElseGet(() -> {
                    Note note = new Note();
                    note.setId("dashboard_note");
                    note.setContent("Welcome Team! Please check the inventory today.");
                    note.setUpdatedAt(LocalDateTime.now());
                    noteRepository.save(note);
                    return NoteDTO.fromEntity(note);
                });
    }

    @Override
    public NoteDTO updateDashboardNote(Map<String, String> payload) {
        Note note = noteRepository.findById("dashboard_note").orElse(new Note());
        note.setId("dashboard_note");
        note.setContent(payload.get("content"));

        if (payload.containsKey("updatedBy")) {
            note.setLastUpdatedBy(payload.get("updatedBy"));
        }

        note.setUpdatedAt(LocalDateTime.now());
        return NoteDTO.fromEntity(noteRepository.save(note));
    }
}
