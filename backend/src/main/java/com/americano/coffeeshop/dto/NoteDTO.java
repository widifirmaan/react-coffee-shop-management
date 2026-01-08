package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Note;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NoteDTO {
    private String id;
    private String content;
    private String lastUpdatedBy;
    private LocalDateTime updatedAt;

    public static NoteDTO fromEntity(Note note) {
        if (note == null)
            return null;
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setContent(note.getContent());
        dto.setLastUpdatedBy(note.getLastUpdatedBy());
        dto.setUpdatedAt(note.getUpdatedAt());
        return dto;
    }
}
