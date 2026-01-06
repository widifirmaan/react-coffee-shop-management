package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Note;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NoteRepository extends MongoRepository<Note, String> {
}
