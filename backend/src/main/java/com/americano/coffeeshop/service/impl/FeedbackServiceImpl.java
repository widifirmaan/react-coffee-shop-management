package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.model.Feedback;
import com.americano.coffeeshop.repository.FeedbackRepository;
import com.americano.coffeeshop.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final com.americano.coffeeshop.service.AttendanceService attendanceService;

    @Override
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
    }

    @Override
    public Feedback createFeedback(Feedback feedback) {
        // Automatically populate shift employees
        List<String> activeStaff = attendanceService.getCheckedInEmployees().stream()
                .map(com.americano.coffeeshop.dto.AttendanceDTO::getEmployeeName)
                .collect(java.util.stream.Collectors.toList());
        feedback.setShiftEmployees(activeStaff);

        return feedbackRepository.save(feedback);
    }

    @Override
    public void deleteFeedback(String id) {
        feedbackRepository.deleteById(id);
    }
}
