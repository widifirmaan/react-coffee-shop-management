package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.NoteDTO;
import com.americano.coffeeshop.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping("/dashboard")
    public ResponseEntity<NoteDTO> getDashboardNote() {
        return ResponseEntity.ok(noteService.getDashboardNote());
    }

    @PostMapping("/dashboard")
    public ResponseEntity<NoteDTO> updateDashboardNote(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(noteService.updateDashboardNote(payload));
    }
}
