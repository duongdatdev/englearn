package com.englearn.backend.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private Long interactionId;
    private Integer score;
    private String comment;
}
