package com.englearn.backend.service;

import com.englearn.backend.dto.AIResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Generate synonyms and antonyms for a word
     */
    public AIResponse generateSynonymsAntonyms(String word) {
        String prompt = String.format("""
            Cho từ tiếng Anh: "%s"
            
            Hãy liệt kê:
            1. 5 từ đồng nghĩa (synonyms) phổ biến
            2. 5 từ trái nghĩa (antonyms) phổ biến
            
            Trả lời theo định dạng JSON:
            {
                "synonyms": ["word1", "word2", "word3", "word4", "word5"],
                "antonyms": ["word1", "word2", "word3", "word4", "word5"]
            }
            
            Chỉ trả về JSON, không thêm text khác.
            """, word);

        return callGeminiAndParse(prompt, "synonyms-antonyms");
    }

    /**
     * Check spelling with semantic matching - accepts equivalent Vietnamese meanings
     */
    public AIResponse checkSpelling(String input, String expected, String context) {
        String prompt = String.format("""
            Kiểm tra câu trả lời của người học tiếng Anh.
            
            Từ/cụm từ đúng: "%s"
            Người dùng nhập: "%s"
            Ngữ cảnh (nếu có): %s
            
            Quy tắc:
            1. Nếu nhập ĐÚNG hoặc gần đúng về nghĩa → chấp nhận
            2. Nếu nhập tiếng Việt với nghĩa tương đương → chấp nhận
            3. Nếu có lỗi chính tả nhỏ (1-2 ký tự) → gợi ý chỉnh sửa nhưng vẫn chấp nhận
            4. Nếu hoàn toàn sai → không chấp nhận, giải thích
            
            Trả lời theo định dạng JSON:
            {
                "isCorrect": true/false,
                "suggestion": "từ đúng nếu có lỗi",
                "explanation": "giải thích ngắn gọn bằng tiếng Việt"
            }
            
            Chỉ trả về JSON, không thêm text khác.
            """, expected, input, context != null ? context : "không có");

        return callGeminiAndParse(prompt, "spell-check");
    }

    /**
     * Explain a word in detail
     */
    public AIResponse explainWord(String word, String context) {
        String prompt = String.format("""
            Giải thích từ tiếng Anh: "%s"
            Ngữ cảnh: %s
            
            Hãy cung cấp:
            1. Giải thích nghĩa chi tiết (bằng tiếng Việt)
            2. Ghi chú ngữ pháp (loại từ, cách dùng)
            3. 3 ví dụ câu sử dụng
            
            Trả lời theo định dạng JSON:
            {
                "wordExplanation": "giải thích nghĩa",
                "grammarNote": "ghi chú ngữ pháp",
                "usageExamples": ["câu 1", "câu 2", "câu 3"]
            }
            
            Chỉ trả về JSON, không thêm text khác.
            """, word, context != null ? context : "TOEIC vocabulary");

        return callGeminiAndParse(prompt, "explain");
    }

    /**
     * Generate example sentences
     */
    public AIResponse generateSentences(String word, String level) {
        String difficulty = switch (level != null ? level.toLowerCase() : "medium") {
            case "easy" -> "đơn giản, dễ hiểu cho người mới học";
            case "hard" -> "phức tạp, dùng trong ngữ cảnh business/professional";
            default -> "trung bình, phù hợp với trình độ TOEIC";
        };

        String prompt = String.format("""
            Tạo 5 câu ví dụ sử dụng từ: "%s"
            Mức độ: %s
            
            Yêu cầu:
            - Câu phải tự nhiên, thường gặp trong giao tiếp hoặc bài thi TOEIC
            - Mỗi câu có nghĩa tiếng Việt đi kèm
            
            Trả lời theo định dạng JSON:
            {
                "sentences": [
                    "English sentence 1. (Nghĩa tiếng Việt)",
                    "English sentence 2. (Nghĩa tiếng Việt)",
                    "English sentence 3. (Nghĩa tiếng Việt)",
                    "English sentence 4. (Nghĩa tiếng Việt)",
                    "English sentence 5. (Nghĩa tiếng Việt)"
                ]
            }
            
            Chỉ trả về JSON, không thêm text khác.
            """, word, difficulty);

        return callGeminiAndParse(prompt, "sentences");
    }

    /**
     * Get quiz hint without revealing the answer
     */
    public AIResponse getQuizHint(String question, String wrongAnswer, String correctAnswer) {
        String prompt = String.format("""
            Người học trả lời sai câu hỏi từ vựng.
            
            Câu hỏi: %s
            Đáp án sai của người học: "%s"
            Đáp án đúng (KHÔNG tiết lộ trực tiếp): "%s"
            
            Hãy:
            1. Đưa ra gợi ý giúp người học tìm ra đáp án đúng (KHÔNG nói thẳng đáp án)
            2. Cung cấp mẹo ghi nhớ từ này
            
            Trả lời theo định dạng JSON:
            {
                "hint": "gợi ý không tiết lộ đáp án",
                "memoryTip": "mẹo ghi nhớ"
            }
            
            Chỉ trả về JSON, không thêm text khác.
            """, question, wrongAnswer, correctAnswer);

        return callGeminiAndParse(prompt, "quiz-hint");
    }

    /**
     * Smart search - find words similar to input
     */
    public AIResponse smartSearch(String input, List<String> wordList) {
        String wordsJson = String.join(", ", wordList.stream().limit(50).toList());
        
        String prompt = String.format("""
            Người dùng tìm kiếm: "%s"
            
            Danh sách từ có sẵn: [%s]
            
            Hãy tìm các từ:
            1. Khớp chính xác hoặc gần đúng về chính tả
            2. Có nghĩa tương tự
            3. Nếu input là tiếng Việt, tìm từ tiếng Anh tương ứng
            
            Trả lời theo định dạng JSON:
            {
                "suggestions": ["word1", "word2", "word3"],
                "explanation": "giải thích kết quả tìm kiếm"
            }
            
            Chỉ trả về JSON, không thêm text khác.
            """, input, wordsJson);

        return callGeminiAndParse(prompt, "smart-search");
    }

    private AIResponse callGeminiAndParse(String prompt, String type) {
        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt)
                    ))
                ),
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "maxOutputTokens", 1024
                )
            );

            String response = webClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            return parseGeminiResponse(response, type);
        } catch (Exception e) {
            return AIResponse.builder()
                .success(false)
                .message("Lỗi khi gọi AI: " + e.getMessage())
                .build();
        }
    }

    private AIResponse parseGeminiResponse(String response, String type) {
        try {
            JsonNode root = objectMapper.readTree(response);
            String text = root.path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();
            
            // Clean up response - remove markdown code blocks if present
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            
            JsonNode jsonResponse = objectMapper.readTree(text);
            
            AIResponse.AIResponseBuilder builder = AIResponse.builder().success(true);
            
            switch (type) {
                case "synonyms-antonyms" -> {
                    builder.synonyms(parseStringList(jsonResponse.path("synonyms")));
                    builder.antonyms(parseStringList(jsonResponse.path("antonyms")));
                }
                case "spell-check" -> {
                    builder.isCorrect(jsonResponse.path("isCorrect").asBoolean());
                    builder.suggestion(jsonResponse.path("suggestion").asText());
                    builder.explanation(jsonResponse.path("explanation").asText());
                }
                case "explain" -> {
                    builder.wordExplanation(jsonResponse.path("wordExplanation").asText());
                    builder.grammarNote(jsonResponse.path("grammarNote").asText());
                    builder.usageExamples(parseStringList(jsonResponse.path("usageExamples")));
                }
                case "sentences" -> {
                    builder.sentences(parseStringList(jsonResponse.path("sentences")));
                }
                case "quiz-hint" -> {
                    builder.hint(jsonResponse.path("hint").asText());
                    builder.memoryTip(jsonResponse.path("memoryTip").asText());
                }
                case "smart-search" -> {
                    builder.synonyms(parseStringList(jsonResponse.path("suggestions")));
                    builder.explanation(jsonResponse.path("explanation").asText());
                }
            }
            
            return builder.build();
        } catch (Exception e) {
            return AIResponse.builder()
                .success(false)
                .message("Lỗi parse response: " + e.getMessage())
                .build();
        }
    }

    private List<String> parseStringList(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node.isArray()) {
            for (JsonNode item : node) {
                result.add(item.asText());
            }
        }
        return result;
    }
}
