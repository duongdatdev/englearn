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
import java.time.Duration;
import reactor.util.retry.Retry;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        reactor.netty.http.client.HttpClient httpClient = reactor.netty.http.client.HttpClient.create()
            .responseTimeout(Duration.ofSeconds(60));

        this.webClient = webClientBuilder
            .clientConnector(new org.springframework.http.client.reactive.ReactorClientHttpConnector(httpClient))
            .build();
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

    /**
     * Grade a user's sentence using a vocabulary word
     */
    public AIResponse gradeSentence(String word, String vietnamese, String userSentence) {
        String prompt = String.format("""
            Bạn là giáo viên tiếng Anh chuyên nghiệp. Hãy chấm điểm câu tiếng Anh mà học viên đã viết.
            
            Từ vựng cần sử dụng: "%s" (nghĩa: %s)
            Câu của học viên: "%s"
            
            Tiêu chí đánh giá:
            1. Từ vựng có được sử dụng đúng nghĩa và ngữ cảnh không?
            2. Câu có đúng ngữ pháp không?
            3. Câu có tự nhiên và thường được sử dụng không?
            
            Trả lời theo định dạng JSON:
            {
                "score": (điểm từ 0-100),
                "feedback": "nhận xét ngắn gọn bằng tiếng Việt về câu của học viên",
                "correctedSentence": "câu đã chỉnh sửa nếu có lỗi, hoặc chuỗi rỗng nếu câu đúng",
                "tips": "mẹo để cải thiện hoặc ghi nhớ cách dùng từ này"
            }
            
            Quy tắc chấm điểm:
            - 90-100: Câu hoàn hảo, tự nhiên, đúng ngữ pháp
            - 70-89: Câu đúng nhưng có thể cải thiện
            - 50-69: Câu có lỗi nhỏ về ngữ pháp hoặc cách dùng
            - 30-49: Câu có lỗi đáng kể
            - 0-29: Câu sai hoàn toàn hoặc không sử dụng từ vựng
            
            Chỉ trả về JSON, không thêm text khác.
            """, word, vietnamese, userSentence);

        return callGeminiAndParse(prompt, "sentence-grade");
    }

    /**
     * Generate a paragraph with fill-in-the-blank for vocabulary practice
     */
    public AIResponse generateParagraphWithBlanks(List<Map<String, String>> words, String topic) {
        // Build word list string - use all words (up to 12)
        StringBuilder wordListBuilder = new StringBuilder();
        for (int i = 0; i < words.size(); i++) {
            Map<String, String> word = words.get(i);
            wordListBuilder.append(String.format("%d. %s (%s)", 
                i + 1, 
                word.get("english"), 
                word.get("vietnamese")));
            if (i < words.size() - 1) {
                wordListBuilder.append("\n");
            }
        }
        
        String prompt = String.format("""
            Bạn là giáo viên tiếng Anh. Hãy tạo một đoạn văn ngắn (4-6 câu) về chủ đề "%s" sử dụng các từ vựng sau:
            
            %s
            
            Yêu cầu:
            1. Đoạn văn phải tự nhiên, mạch lạc và phù hợp với ngữ cảnh TOEIC/business
            2. Sử dụng TẤT CẢ các từ trong danh sách
            3. Thay thế mỗi từ được sử dụng bằng chỗ trống đánh số: (1), (2), (3)...
            4. Đánh số theo thứ tự xuất hiện trong đoạn văn
            
            Trả lời CHÍNH XÁC theo định dạng JSON sau:
            {
                "paragraph": "Đoạn văn với các chỗ trống (1), (2)...",
                "blanks": [
                    {"position": 1, "answer": "từ tiếng Anh", "vietnamese": "nghĩa tiếng Việt"},
                    {"position": 2, "answer": "từ tiếng Anh", "vietnamese": "nghĩa tiếng Việt"}
                ]
            }
            
            Chỉ trả về JSON, không thêm text khác.
            """, topic, wordListBuilder.toString());

        return callGeminiAndParse(prompt, "paragraph-blanks");
    }

    /**
     * Generate word type lesson - teaching content about parts of speech with patterns
     */
    public AIResponse generateWordTypeLesson(List<String> words) {
        String wordList = String.join(", ", words.stream().limit(20).toList());
        
        String prompt = String.format("""
            Bạn là giáo viên tiếng Anh. Hãy tạo bài học CHI TIẾT về 8 loại từ (Parts of Speech) trong tiếng Anh.
            
            Danh sách từ vựng của học viên: [%s]
            
            Yêu cầu QUAN TRỌNG:
            1. Giới thiệu 8 loại từ: Noun, Verb, Adjective, Adverb, Pronoun, Preposition, Conjunction, Interjection
            2. Mỗi loại PHẢI có:
                - Tên tiếng Anh và tiếng Việt
                - Định nghĩa ngắn gọn
                - DANH SÁCH CÁC HẬU TỐ (suffixes) phổ biến để nhận biết qua mặt chữ
                - Ví dụ từ có hậu tố đó
                - Mẹo ghi nhớ/nhận biết
            
            Trả lời theo định dạng JSON:
            {
                "wordTypes": [
                    {
                        "type": "Noun",
                        "nameVi": "Danh từ",
                        "definition": "Từ chỉ người, vật, địa điểm, khái niệm",
                        "suffixes": ["-tion", "-ment", "-ness", "-ity", "-er", "-or", "-ist", "-ism"],
                        "suffixExamples": ["information", "development", "happiness", "ability", "teacher"],
                        "examples": ["book", "company", "idea"],
                        "tips": "Đa số từ kết thúc bằng -tion, -ment, -ness, -ity là danh từ",
                        "color": "#3B82F6"
                    },
                    {
                        "type": "Verb",
                        "nameVi": "Động từ",
                        "definition": "Từ chỉ hành động hoặc trạng thái",
                        "suffixes": ["-ize", "-ify", "-ate", "-en"],
                        "suffixExamples": ["organize", "simplify", "communicate", "strengthen"],
                        "examples": ["run", "think", "become"],
                        "tips": "Từ kết thúc bằng -ize, -ify, -ate thường là động từ",
                        "color": "#10B981"
                    },
                    {
                        "type": "Adjective",
                        "nameVi": "Tính từ",
                        "definition": "Từ mô tả tính chất của danh từ",
                        "suffixes": ["-ful", "-less", "-ous", "-ive", "-able", "-ible", "-al", "-ic"],
                        "suffixExamples": ["beautiful", "careless", "dangerous", "active", "comfortable"],
                        "examples": ["fast", "important"],
                        "tips": "Từ kết thúc bằng -ful, -less, -ous, -ive, -able thường là tính từ",
                        "color": "#F59E0B"
                    },
                    {
                        "type": "Adverb",
                        "nameVi": "Trạng từ",
                        "definition": "Từ bổ nghĩa cho động từ, tính từ hoặc trạng từ khác",
                        "suffixes": ["-ly"],
                        "suffixExamples": ["quickly", "carefully", "happily", "beautifully"],
                        "examples": ["very", "always", "never"],
                        "tips": "Hầu hết trạng từ kết thúc bằng -LY (thêm -ly vào tính từ)",
                        "color": "#8B5CF6"
                    }
                ]
            }
            
            Tạo đủ 8 loại từ với cùng cấu trúc như trên.
            Màu sắc: Noun=#3B82F6, Verb=#10B981, Adjective=#F59E0B, Adverb=#8B5CF6, 
            Pronoun=#EC4899, Preposition=#06B6D4, Conjunction=#F97316, Interjection=#EF4444
            
            Chỉ trả về JSON, không thêm text khác.
            """, wordList);

        return callGeminiAndParse(prompt, "word-type-lesson");
    }

    /**
     * Generate word type quiz - context-based question about parts of speech
     */
    public AIResponse generateWordTypeQuiz(List<String> words, int questionCount) {
        String wordList = String.join(", ", words.stream().limit(15).toList());
        int count = Math.min(questionCount, 10);
        
        String prompt = String.format("""
            Bạn là giáo viên tiếng Anh. Hãy tạo %d câu hỏi trắc nghiệm về loại từ (Parts of Speech).
            
            Danh sách từ vựng ưu tiên: [%s]
            
            Yêu cầu cho mỗi câu hỏi:
            1. Tạo một câu tiếng Anh tự nhiên sử dụng một từ từ danh sách (hoặc từ phổ biến)
            2. Từ mục tiêu được đánh dấu bằng **từ** trong câu
            3. Đáp án đúng là loại từ của từ đó TRONG NGỮ CẢNH CỦA CÂU
            4. Giải thích ngắn gọn tại sao đó là đáp án đúng
            
            Lưu ý: Một từ có thể là nhiều loại từ khác nhau tùy ngữ cảnh!
            Ví dụ: "book" có thể là Noun (I read a book) hoặc Verb (I will book a flight)
            
            Trả lời theo định dạng JSON:
            {
                "questions": [
                    {
                        "sentence": "I need to **book** a flight for tomorrow.",
                        "targetWord": "book",
                        "options": ["Noun", "Verb", "Adjective", "Adverb"],
                        "correctAnswer": "Verb",
                        "explanation": "Trong câu này, 'book' là động từ với nghĩa 'đặt chỗ'. Nó đi sau 'to' (to book) và diễn tả hành động."
                    }
                ]
            }
            
            Chỉ trả về JSON, không thêm text khác.
            """, count, wordList);

        return callGeminiAndParse(prompt, "word-type-quiz");
    }

    /**
     * Analyze pronunciation feedback (Text-based)
     */
    public AIResponse analyzePronunciation(String word, String userSentence) {
        String prompt = String.format("""
            Bạn là chuyên gia phát âm tiếng Anh.
            
            Từ mục tiêu: "%s"
            Học viên phát âm nghe giống: "%s"
            
            Hãy so sánh và đánh giá:
            1. Phát âm này có chấp nhận được không? (Chính xác hoặc gần đúng)
            2. Hướng dẫn cách sửa khẩu hình miệng.
            
            Trả lời theo định dạng JSON:
            {
                "isCorrect": true/false (true nếu giống > 80%%),
                "score": (0-100),
                "feedback": "nhận xét ngắn gọn",
                "tips": "hướng dẫn sửa lỗi chi tiết (ví dụ: cong lưỡi hơn, mở rộng miệng...)"
            }
            
            Chỉ trả về JSON, không thêm text khác.
            """, word, userSentence);

        return callGeminiAndParse(prompt, "pronunciation");
    }

    /**
     * Analyze pronunciation from audio file (Multimodal)
     */
    public AIResponse analyzePronunciationFromAudio(String word, byte[] audioBytes, String mimeType) {
        // Encode audio to Base64
        String base64Audio = java.util.Base64.getEncoder().encodeToString(audioBytes);

        String prompt = String.format("""
            Bạn là chuyên gia phát âm tiếng Anh.
            
            Từ mục tiêu người dùng cần đọc: "%s"
            
            Hãy nghe audio đính kèm và đánh giá:
            1. Người dùng đọc từ gì? (Transcript lại những gì bạn nghe thấy)
            2. Phát âm có chính xác so với từ mục tiêu không?
            3. Hướng dẫn sửa lỗi chi tiết (khẩu hình, âm tiết nào sai).
            
            Trả lời theo định dạng JSON:
            {
                "transcript": "từ/câu bạn nghe được",
                "isCorrect": true/false (true nếu giống > 80%%),
                "score": (0-100),
                "feedback": "nhận xét ngắn gọn",
                "tips": "hướng dẫn sửa lỗi chi tiết"
            }
            
            Chỉ trả về JSON.
            """, word);

        return callGeminiMultimodal(prompt, base64Audio, mimeType, "pronunciation-audio");
    }

    private AIResponse callGeminiMultimodal(String prompt, String base64Data, String mimeType, String type) {
        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt),
                        Map.of("inline_data", Map.of(
                            "mime_type", mimeType,
                            "data", base64Data
                        ))
                    ))
                ),
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "maxOutputTokens", 16384
                )
            );

            String response = webClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .retryWhen(Retry.backoff(5, Duration.ofSeconds(2))
                    .filter(throwable -> throwable instanceof WebClientResponseException &&
                        (((WebClientResponseException) throwable).getStatusCode().value() == 429 ||
                         ((WebClientResponseException) throwable).getStatusCode().is5xxServerError()))
                    .onRetryExhaustedThrow((retryBackoffSpec, retrySignal) -> retrySignal.failure()))
                .block();

            return parseGeminiResponse(response, type);
        } catch (Exception e) {
             return AIResponse.builder()
                .success(false)
                .message("Lỗi xử lý Audio AI: " + e.getMessage())
                .build();
        }
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
                    "maxOutputTokens", 16384
                )
            );

            String response = webClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .retryWhen(Retry.backoff(5, Duration.ofSeconds(2))
                    .filter(throwable -> throwable instanceof WebClientResponseException &&
                        (((WebClientResponseException) throwable).getStatusCode().value() == 429 ||
                         ((WebClientResponseException) throwable).getStatusCode().is5xxServerError()))
                    .onRetryExhaustedThrow((retryBackoffSpec, retrySignal) -> retrySignal.failure()))
                .block();

            return parseGeminiResponse(response, type);
        } catch (WebClientResponseException e) {
            String errorMessage = "Lỗi kết nối AI (" + e.getStatusCode() + "): " + e.getStatusText();
            if (e.getStatusCode().value() == 429) {
                errorMessage = "Hệ thống AI đang bận (Quá tải). Vui lòng thử lại sau.";
            }
            return AIResponse.builder()
                .success(false)
                .message(errorMessage)
                .build();
        } catch (Exception e) {
            // Unwrap if it's a runtime exception wrapper
            Throwable cause = e.getCause() != null ? e.getCause() : e;
            return AIResponse.builder()
                .success(false)
                .message("Lỗi hệ thống AI: " + cause.getMessage())
                .build();
        }
    }

    private AIResponse parseGeminiResponse(String response, String type) {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            // Check if response was truncated (finishReason != STOP)
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                String finishReason = candidates.get(0).path("finishReason").asText();
                if ("MAX_TOKENS".equals(finishReason)) {
                    return AIResponse.builder()
                        .success(false)
                        .message("Response bị cắt ngắn do quá dài. Vui lòng thử lại.")
                        .build();
                }
            }
            
            String text = root.path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();
            
            // Clean up response - remove markdown code blocks if present
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            
            // Validate JSON structure before parsing
            if (text.isEmpty() || (!text.startsWith("{") && !text.startsWith("["))) {
                return AIResponse.builder()
                    .success(false)
                    .message("Response không phải định dạng JSON hợp lệ.")
                    .build();
            }
            
            // Try to fix common JSON truncation issues
            text = fixTruncatedJson(text);
            
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
                case "paragraph-blanks" -> {
                    builder.paragraph(jsonResponse.path("paragraph").asText());
                    // Parse blanks array
                    List<Map<String, Object>> blanksList = new ArrayList<>();
                    JsonNode blanksNode = jsonResponse.path("blanks");
                    if (blanksNode.isArray()) {
                        for (JsonNode blank : blanksNode) {
                            Map<String, Object> blankMap = new java.util.HashMap<>();
                            blankMap.put("position", blank.path("position").asInt());
                            blankMap.put("answer", blank.path("answer").asText());
                            blankMap.put("vietnamese", blank.path("vietnamese").asText());
                            blanksList.add(blankMap);
                        }
                    }
                    builder.blanks(blanksList);
                }
                case "sentence-grade" -> {
                    builder.score(jsonResponse.path("score").asInt());
                    builder.feedback(jsonResponse.path("feedback").asText());
                    builder.correctedSentence(jsonResponse.path("correctedSentence").asText());
                    builder.tips(jsonResponse.path("tips").asText());
                }
                case "word-type-lesson" -> {
                    // Parse wordTypes array
                    List<Map<String, Object>> wordTypesList = new ArrayList<>();
                    JsonNode typesNode = jsonResponse.path("wordTypes");
                    if (typesNode.isArray()) {
                        for (JsonNode typeNode : typesNode) {
                            Map<String, Object> typeMap = new java.util.HashMap<>();
                            typeMap.put("type", typeNode.path("type").asText());
                            typeMap.put("nameVi", typeNode.path("nameVi").asText());
                            typeMap.put("definition", typeNode.path("definition").asText());
                            typeMap.put("suffixes", parseStringList(typeNode.path("suffixes")));
                            typeMap.put("suffixExamples", parseStringList(typeNode.path("suffixExamples")));
                            typeMap.put("examples", parseStringList(typeNode.path("examples")));
                            typeMap.put("tips", typeNode.path("tips").asText());
                            typeMap.put("color", typeNode.path("color").asText());
                            wordTypesList.add(typeMap);
                        }
                    }
                    builder.wordTypes(wordTypesList);
                }
                case "word-type-quiz" -> {
                    // Parse questions array
                    List<Map<String, Object>> questionsList = new ArrayList<>();
                    JsonNode questionsNode = jsonResponse.path("questions");
                    if (questionsNode.isArray()) {
                        for (JsonNode qNode : questionsNode) {
                            Map<String, Object> qMap = new java.util.HashMap<>();
                            qMap.put("sentence", qNode.path("sentence").asText());
                            qMap.put("targetWord", qNode.path("targetWord").asText());
                            qMap.put("options", parseStringList(qNode.path("options")));
                            qMap.put("correctAnswer", qNode.path("correctAnswer").asText());
                            qMap.put("explanation", qNode.path("explanation").asText());
                            questionsList.add(qMap);
                        }
                    }
                    builder.questions(questionsList);
                }
                case "pronunciation" -> {
                    builder.isCorrect(jsonResponse.path("isCorrect").asBoolean());
                    builder.score(jsonResponse.path("score").asInt());
                    builder.feedback(jsonResponse.path("feedback").asText());
                    builder.tips(jsonResponse.path("tips").asText());
                }
                case "pronunciation-audio" -> {
                    builder.isCorrect(jsonResponse.path("isCorrect").asBoolean());
                    builder.score(jsonResponse.path("score").asInt());
                    builder.feedback(jsonResponse.path("feedback").asText());
                    builder.tips(jsonResponse.path("tips").asText());
                    builder.transcript(jsonResponse.path("transcript").asText());
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

    /**
     * Attempt to fix common JSON truncation issues
     */
    private String fixTruncatedJson(String json) {
        if (json == null || json.isEmpty()) {
            return json;
        }
        
        // Count brackets and quotes to check if balanced
        int openBraces = 0;
        int openBrackets = 0;
        boolean inString = false;
        char prevChar = 0;
        
        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            
            if (c == '"' && prevChar != '\\') {
                inString = !inString;
            } else if (!inString) {
                if (c == '{') openBraces++;
                else if (c == '}') openBraces--;
                else if (c == '[') openBrackets++;
                else if (c == ']') openBrackets--;
            }
            
            prevChar = c;
        }
        
        // If unbalanced, try to fix
        StringBuilder fixed = new StringBuilder(json);
        
        // Close unclosed string
        if (inString) {
            fixed.append("\"");
        }
        
        // Close unclosed brackets
        while (openBrackets > 0) {
            fixed.append("]");
            openBrackets--;
        }
        
        // Close unclosed braces
        while (openBraces > 0) {
            fixed.append("}");
            openBraces--;
        }
        
        return fixed.toString();
    }
}
