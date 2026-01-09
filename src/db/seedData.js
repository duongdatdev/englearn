import { db, isDatabaseEmpty } from './database.js'

// Sample data for "600 Essential Words for the TOEIC"
const sampleData = {
  books: [
    {
      id: 1,
      name: '600 Essential Words for the TOEIC',
      description: 'Sách từ vựng chuẩn bị cho kỳ thi TOEIC với 600 từ thiết yếu',
      coverImage: '📚'
    }
  ],
  topics: [
    { id: 1, bookId: 1, name: 'Contracts - Hợp đồng' },
    { id: 2, bookId: 1, name: 'Marketing - Tiếp thị' },
    { id: 3, bookId: 1, name: 'Warranties - Bảo hành' },
    { id: 4, bookId: 1, name: 'Business Planning - Kế hoạch kinh doanh' },
    { id: 5, bookId: 1, name: 'Conferences - Hội nghị' }
  ],
  words: [
    // Topic 1: Contracts
    { id: 1, topicId: 1, english: 'agreement', vietnamese: 'thỏa thuận, hợp đồng', meaning: 'A formal decision about future plans that is made by two or more people' },
    { id: 2, topicId: 1, english: 'assurance', vietnamese: 'sự đảm bảo', meaning: 'A promise or guarantee' },
    { id: 3, topicId: 1, english: 'cancellation', vietnamese: 'sự hủy bỏ', meaning: 'The act of canceling something that was planned' },
    { id: 4, topicId: 1, english: 'determine', vietnamese: 'xác định', meaning: 'To find out something by examination or investigation' },
    { id: 5, topicId: 1, english: 'engage', vietnamese: 'tham gia, cam kết', meaning: 'To hire or employ someone; to participate' },
    { id: 6, topicId: 1, english: 'establish', vietnamese: 'thành lập, thiết lập', meaning: 'To start or create an organization or system' },
    { id: 7, topicId: 1, english: 'obligation', vietnamese: 'nghĩa vụ', meaning: 'Something that you must do because of a law, rule, or promise' },
    { id: 8, topicId: 1, english: 'party', vietnamese: 'bên (trong hợp đồng)', meaning: 'A person or group involved in an agreement or contract' },
    { id: 9, topicId: 1, english: 'provision', vietnamese: 'điều khoản', meaning: 'A part of an agreement or law that deals with a particular subject' },
    { id: 10, topicId: 1, english: 'resolve', vietnamese: 'giải quyết', meaning: 'To find a solution to a problem or difficulty' },
    
    // Topic 2: Marketing
    { id: 11, topicId: 2, english: 'attract', vietnamese: 'thu hút', meaning: 'To make someone interested in something' },
    { id: 12, topicId: 2, english: 'compare', vietnamese: 'so sánh', meaning: 'To examine differences and similarities' },
    { id: 13, topicId: 2, english: 'competition', vietnamese: 'sự cạnh tranh', meaning: 'A situation in which people or companies try to be more successful' },
    { id: 14, topicId: 2, english: 'consume', vietnamese: 'tiêu thụ', meaning: 'To use fuel, energy, or time' },
    { id: 15, topicId: 2, english: 'convince', vietnamese: 'thuyết phục', meaning: 'To make someone believe that something is true' },
    { id: 16, topicId: 2, english: 'currently', vietnamese: 'hiện tại', meaning: 'At the present time' },
    { id: 17, topicId: 2, english: 'fad', vietnamese: 'mốt nhất thời', meaning: 'Something that is popular for a short time' },
    { id: 18, topicId: 2, english: 'inspire', vietnamese: 'truyền cảm hứng', meaning: 'To make someone want to do something creative' },
    { id: 19, topicId: 2, english: 'market', vietnamese: 'thị trường', meaning: 'A place where goods are bought and sold' },
    { id: 20, topicId: 2, english: 'persuade', vietnamese: 'thuyết phục', meaning: 'To make someone agree to do something' },
    
    // Topic 3: Warranties
    { id: 21, topicId: 3, english: 'characteristic', vietnamese: 'đặc điểm', meaning: 'A typical quality that makes something recognizable' },
    { id: 22, topicId: 3, english: 'consequence', vietnamese: 'hậu quả', meaning: 'A result of an action or situation' },
    { id: 23, topicId: 3, english: 'consider', vietnamese: 'xem xét', meaning: 'To think carefully about something' },
    { id: 24, topicId: 3, english: 'cover', vietnamese: 'bao gồm', meaning: 'To include or deal with something' },
    { id: 25, topicId: 3, english: 'expire', vietnamese: 'hết hạn', meaning: 'To come to an end or no longer be valid' },
    { id: 26, topicId: 3, english: 'frequently', vietnamese: 'thường xuyên', meaning: 'Often; many times' },
    { id: 27, topicId: 3, english: 'imply', vietnamese: 'ngụ ý', meaning: 'To suggest something without saying it directly' },
    { id: 28, topicId: 3, english: 'promise', vietnamese: 'hứa', meaning: 'A statement that you will definitely do something' },
    { id: 29, topicId: 3, english: 'protect', vietnamese: 'bảo vệ', meaning: 'To keep someone or something safe from harm' },
    { id: 30, topicId: 3, english: 'reputation', vietnamese: 'danh tiếng', meaning: 'The opinion that people have about someone or something' },
    
    // Topic 4: Business Planning
    { id: 31, topicId: 4, english: 'address', vietnamese: 'giải quyết', meaning: 'To deal with a problem or issue' },
    { id: 32, topicId: 4, english: 'avoid', vietnamese: 'tránh', meaning: 'To stay away from something' },
    { id: 33, topicId: 4, english: 'demonstrate', vietnamese: 'chứng minh', meaning: 'To show or prove something clearly' },
    { id: 34, topicId: 4, english: 'develop', vietnamese: 'phát triển', meaning: 'To grow or cause something to grow' },
    { id: 35, topicId: 4, english: 'evaluate', vietnamese: 'đánh giá', meaning: 'To judge the value or quality of something' },
    { id: 36, topicId: 4, english: 'gather', vietnamese: 'thu thập', meaning: 'To collect information or things' },
    { id: 37, topicId: 4, english: 'implement', vietnamese: 'thực hiện', meaning: 'To put a plan or system into action' },
    { id: 38, topicId: 4, english: 'offer', vietnamese: 'đề nghị', meaning: 'To present something for acceptance' },
    { id: 39, topicId: 4, english: 'prepare', vietnamese: 'chuẩn bị', meaning: 'To make something ready for use' },
    { id: 40, topicId: 4, english: 'strategy', vietnamese: 'chiến lược', meaning: 'A plan to achieve a goal' },
    
    // Topic 5: Conferences
    { id: 41, topicId: 5, english: 'accommodate', vietnamese: 'cung cấp chỗ ở', meaning: 'To provide a place to stay or work' },
    { id: 42, topicId: 5, english: 'arrangement', vietnamese: 'sự sắp xếp', meaning: 'Plans or preparations for a future event' },
    { id: 43, topicId: 5, english: 'association', vietnamese: 'hiệp hội', meaning: 'A group of people organized for a common purpose' },
    { id: 44, topicId: 5, english: 'attend', vietnamese: 'tham dự', meaning: 'To be present at an event' },
    { id: 45, topicId: 5, english: 'get in touch', vietnamese: 'liên lạc', meaning: 'To communicate with someone' },
    { id: 46, topicId: 5, english: 'hold', vietnamese: 'tổ chức', meaning: 'To organize an event' },
    { id: 47, topicId: 5, english: 'location', vietnamese: 'địa điểm', meaning: 'A place where something happens' },
    { id: 48, topicId: 5, english: 'register', vietnamese: 'đăng ký', meaning: 'To put your name on an official list' },
    { id: 49, topicId: 5, english: 'sincerely', vietnamese: 'chân thành', meaning: 'In a genuine and honest way' },
    { id: 50, topicId: 5, english: 'sincerely', vietnamese: 'lịch trình', meaning: 'A schedule of events or activities' }
  ]
}

export async function seedDatabase() {
  const empty = await isDatabaseEmpty()
  if (!empty) {
    console.log('Database already has data, skipping seed.')
    return
  }
  
  console.log('Seeding database with sample data...')
  
  await db.transaction('rw', [db.books, db.topics, db.words], async () => {
    await db.books.bulkAdd(sampleData.books)
    await db.topics.bulkAdd(sampleData.topics)
    await db.words.bulkAdd(sampleData.words)
  })
  
  console.log('Database seeded successfully!')
}
