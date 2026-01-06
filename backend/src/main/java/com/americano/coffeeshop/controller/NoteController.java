package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.model.Note;
import com.americano.coffeeshop.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Note> getDashboardNote() {
        return ResponseEntity.ok(
                noteRepository.findById("dashboard_note").orElseGet(() -> {
                    Note note = new Note();
                    note.setId("dashboard_note");
                    note.setContent("Welcome Team! Please check the inventory today.");
                    note.setUpdatedAt(LocalDateTime.now());
                    noteRepository.save(note);
                    return note;
                }));
    }

    @PostMapping("/dashboard")
    public ResponseEntity<Note> updateDashboardNote(@RequestBody Map<String, String> payload) {
        Note note = noteRepository.findById("dashboard_note").orElse(new Note());
        note.setId("dashboard_note");
        note.setContent(payload.get("content"));
        note.setLastUpdatedBy(payload.get("updatedBy")); // Optional
        note.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(noteRepository.save(note));
    }
}
