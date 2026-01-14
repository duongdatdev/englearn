# BÁO CÁO PHÂN TÍCH THUỘC TÍNH CHẤT LƯỢNG PHẦN MỀM (SOFTWARE QUALITY ATTRIBUTES)
## DỰ ÁN: ENGLEARN

Báo cáo này phân tích chi tiết 15 thuộc tính chất lượng phần mềm được áp dụng trong dự án EngLearn, phục vụ cho mục đích Đảm bảo Chất lượng (QA) và Kiểm thử Phần mềm.

---

### 1. Safety (Tính An Toàn)
*   **Định nghĩa:** Khả năng hệ thống đảm bảo không gây ra hậu quả thảm khốc cho người dùng hoặc môi trường dữ liệu khi vận hành.
*   **Hiện thực trong EngLearn:**
    *   **An toàn dữ liệu:** Dữ liệu tiến độ học tập của người dùng được cô lập hoàn toàn. Một lỗi ở tài khoản người dùng A không thể làm hỏng hoặc xóa dữ liệu của người dùng B do các giao dịch cơ sở dữ liệu (`@Transactional`) trong `AuthService` và các service khác đảm bảo tính nguyên vẹn (ACID).
    *   **Ngăn chặn mất mát dữ liệu:** Các thao tác xóa (như xóa chủ đề, xóa từ) được ràng buộc chặt chẽ bởi khóa ngoại (Foreign Key) trong Database, đảm bảo không xảy ra tình trạng dữ liệu 'mồ côi' (orphan data).

### 2. Security (Tính Bảo Mật)
*   **Định nghĩa:** Khả năng bảo vệ thông tin và hệ thống khỏi sự truy cập hoặc sửa đổi trái phép.
*   **Hiện thực trong EngLearn:**
    *   **Authentication:** Sử dụng **JWT (JSON Web Token)** trong `JwtAuthFilter.java` để xác thực người dùng. Token được ký và có thời hạn, giảm thiểu rủi ro bị đánh cắp session.
    *   **Authorization:** Phân quyền chặt chẽ bằng **Spring Security**. API `/api/admin/**` chỉ cho phép role `ADMIN` truy cập (được cấu hình trong `SecurityConfig.java`).
    *   **Mã hóa:** Mật khẩu người dùng được băm (hash) bằng thuật toán **BCrypt** trước khi lưu trữ, đảm bảo an toàn ngay cả khi DB bị lộ.

### 3. Reliability (Tính Tin Cậy)
*   **Định nghĩa:** Khả năng hệ thống hoạt động đúng chức năng đã định trong điều kiện xác định và thời gian xác định.
*   **Hiện thực trong EngLearn:**
    *   **Backend Stability:** Logic nghiệp vụ trong các Service (như `GeminiService`) được bao bọc kỹ lưỡng bởi các khối `try-catch`, ngăn chặn các lỗi runtime (như lỗi kết nối API bên thứ 3) lan truyền làm sập toàn bộ request của người dùng.
    *   **Frontend Stability:** Sử dụng Vue Router Guards (`router.beforeEach` trong `router/index.js`) để đảm bảo tính nhất quán của trạng thái ứng dụng, ví dụ ngăn người dùng chưa đăng nhập truy cập vào các trang yêu cầu xác thực, tránh lỗi màn hình trắng.

### 4. Resilience (Tính Đàn Hồi)
*   **Định nghĩa:** Khả năng hệ thống duy trì hoạt động hoặc phục hồi nhanh chóng khi gặp sự cố biến động.
*   **Hiện thực trong EngLearn:**
    *   **Xử lý lỗi AI:** Khi gọi API Google Gemini, nếu kết quả trả về bị lỗi định dạng JSON (vấn đề thường gặp của LLM), hàm `fixTruncatedJson` trong `GeminiService.java` sẽ tự động phát hiện và sửa chữa cú pháp JSON, giúp hệ thống tiếp tục hoạt động thay vì báo lỗi fatal.
    *   **UI Fallback:** Nếu hình ảnh hoặc tài nguyên không tải được (ví dụ trong `BookCard.vue`), giao diện có cơ chế hiển thị hình ảnh mặc định (placeholder) để không làm vỡ trải nghiệm người dùng.

### 5. Robustness (Tính Vững Chắc)
*   **Định nghĩa:** Khả năng xử lý các đầu vào không hợp lệ hoặc các điều kiện bất thường.
*   **Hiện thực trong EngLearn:**
    *   **Input Validation:** Dữ liệu gửi lên từ client được kiểm soát chặt chẽ thông qua các DTO như `AuthRequest` (sử dụng annotation validation). Các trường hợp thiếu thông tin bắt buộc sẽ bị từ chối ngay lập tức.
    *   **Xử lý Network Error:** Dịch vụ `api.js` ở frontend chủ động bắt các lỗi kết nối (network error) hoặc lỗi HTTP (404, 500) và ném ra các Error object cụ thể. UI sẽ hiển thị thông báo lỗi dễ hiểu cho người dùng thay vì treo ứng dụng.

### 6. Understandability (Tính Dễ Hiểu)
*   **Định nghĩa:** Mức độ dễ dàng để người phát triển hiểu được cấu trúc, logic và mục đích của mã nguồn.
*   **Hiện thực trong EngLearn:**
    *   **Kiến trúc chuẩn:** Backend tuân theo mô hình phân lớp tiêu chuẩn (Controller - Service - Repository - Model), giúp bất kỳ lập trình viên Java/Spring nào cũng có thể nắm bắt luồng dữ liệu nhanh chóng.
    *   **Frontend Naming:** Tên các file và component trong Vue.js được đặt theo chức năng rõ ràng (`QuizCard`, `ReviewView`, `useSoundEffects`), giúp dễ dàng định vị mã nguồn cần sửa đổi.

### 7. Testability (Tính Khả Kiểm)
*   **Định nghĩa:** Mức độ dễ dàng để thiết lập các kịch bản kiểm thử cho hệ thống.
*   **Hiện thực trong EngLearn:**
    *   **Tách biệt logic (Separation of Logic):** Logic tính toán SRS trong `srs.js` được viết dưới dạng các hàm thuần túy (pure functions) như `calculateNextReview`, không phụ thuộc vào giao diện hay trạng thái DOM, giúp dễ dàng viết Unit Test tự động.
    *   **Dependency Injection:** Spring Boot sử dụng DI container, cho phép dễ dàng thay thế các component thực bằng các Mock Object trong quá trình Integration Test (ví dụ mock `GeminiService` khi test `AIController`).

### 8. Adaptability (Tính Thích Ứng)
*   **Định nghĩa:** Khả năng hệ thống thích nghi với các môi trường phần cứng, phần mềm hoặc nhu cầu người dùng khác nhau.
*   **Hiện thực trong EngLearn:**
    *   **Nội dung động (Content Adaptability):** Hệ thống sử dụng AI (`GeminiService`) để tự động tạo bài tập, ví dụ và giải thích dựa trên bất kỳ từ vựng nào người dùng nhập vào, thay vì phụ thuộc vào cơ sở dữ liệu tĩnh được soạn sẵn.
    *   **Giao diện thích ứng (UI Adaptability):** Component `ThemeToggle.vue` cho phép ứng dụng chuyển đổi mượt mà giữa chế độ Sáng (Light Mode) và Tối (Dark Mode) dựa trên sở thích người dùng hoặc thiết lập hệ thống.

### 9. Modularity (Tính Mô-đun)
*   **Định nghĩa:** Việc chia hệ thống thành các khối riêng biệt, có thể thay đổi độc lập.
*   **Hiện thực trong EngLearn:**
    *   **Vue Components:** Giao diện được xây dựng từ các component nhỏ, độc lập (`FeatherIcon`, `BaseCard`). Việc thay đổi thiết kế của một component không ảnh hưởng đến logic của các component khác.
    *   **Service Separation:** Các services backend như `AuthService`, `GeminiService` được tách biệt hoàn toàn. Có thể nâng cấp logic AI mà không lo ngại ảnh hưởng đến logic xác thực người dùng.

### 10. Complexity (Độ Phức Tạp)
*   **Định nghĩa:** Mức độ phức tạp của hệ thống, cần được kiểm soát để tránh gây khó khăn cho bảo trì.
*   **Hiện thực trong EngLearn:**
    *   **Encapsulation (Đóng gói):** Thuật toán SM-2 (SuperMemo 2) để tính lịch ôn tập là một thuật toán toán học phức tạp. Tuy nhiên, nó được đóng gói hoàn toàn trong `srs.js`. Các phần còn lại của ứng dụng chỉ cần tương tác qua giao diện hàm đơn giản, giúp giảm độ phức tạp nhận thức (cognitive load) cho lập trình viên.

### 11. Portability (Tính Khả Chuyển)
*   **Định nghĩa:** Khả năng chạy trên nhiều môi trường khác nhau.
*   **Hiện thực trong EngLearn:**
    *   **Web Platform:** Frontend là ứng dụng Single Page Application (SPA), chạy được trên mọi trình duyệt hiện đại (Chrome, Firefox, Safari, Edge) mà không cần cài đặt.
    *   **Java Backend:** Mã nguồn Backend viết bằng Java (Spring Boot), có thể triển khai trên bất kỳ hệ điều hành nào hỗ trợ JVM (Windows, Linux, macOS) hoặc đóng gói thành Docker container.

### 12. Usability (Tính Khả Dụng)
*   **Định nghĩa:** Mức độ dễ sử dụng, dễ học và tính hấp dẫn của giao diện đối với người dùng.
*   **Hiện thực trong EngLearn:**
    *   **Phản hồi tức thì:** Hệ thống tích hợp `useSoundEffects.js` để cung cấp phản hồi âm thanh (đúng/sai, hoàn thành) ngay lập tức, kết hợp với hiệu ứng hình ảnh giúp tăng tính tương tác.
    *   **User Flow rõ ràng:** Quy trình "Learn Mode" dẫn dắt người dùng đi theo luồng tuyến tính 4 bước, loại bỏ sự bối rối về việc "bắt đầu từ đâu" cho người dùng mới.

### 13. Reusability (Tính Tái Sử Dụng)
*   **Định nghĩa:** Khả năng các thành phần của hệ thống có thể được sử dụng lại trong các ứng dụng hoặc chức năng khác.
*   **Hiện thực trong EngLearn:**
    *   **Component tái sử dụng:** `FeatherIcon.vue` được thiết kế để sử dụng chung cho toàn bộ icon trong ứng dụng.
    *   **Generic Services:** `GeminiService` được thiết kế tổng quát hóa với hàm `callGeminiAndParse`, có thể được tái sử dụng để phát triển thêm nhiều tính năng AI khác (như Chatbot, Writing correction) mà không cần viết lại mã kết nối API.

### 14. Efficiency (Tính Hiệu Quả)
*   **Định nghĩa:** Khả năng thực hiện chức năng với lượng tài nguyên và thời gian tối ưu.
*   **Hiện thực trong EngLearn:**
    *   **Lazy Loading:** Entity `Word.java` sử dụng cấu hình `@ManyToOne(fetch = FetchType.LAZY)` cho quan hệ Topic. Điều này đảm bảo Hibernate không tải dữ liệu Topic thừa thãi khi chỉ đang truy vấn danh sách từ vựng, giúp tối ưu hóa bộ nhớ và tốc độ truy vấn.
    *   **Client-side Optimization:** `srs.js` lưu trữ và tính toán trạng thái học tập ngay tại trình duyệt (localStorage), giảm tải đáng kể số lượng request gửi lên server.

### 15. Learnability (Tính Dễ Học)
*   **Định nghĩa:** Mức độ dễ dàng để người dùng mới làm quen và sử dụng hệ thống.
*   **Hiện thực trong EngLearn:**
    *   **Thiết kế quen thuộc:** Sử dụng các icon và bố cục UI tiêu chuẩn (Standard Design Patterns), giúp người dùng dễ dàng đoán biết chức năng của các nút bấm.
    *   **Guided Experience:** Tính năng học từ vựng được chia nhỏ thành các bước (Step-by-step), giúp người dùng mới tiếp cận dần dần thay vì bị choáng ngợp bởi quá nhiều thông tin cùng lúc.
