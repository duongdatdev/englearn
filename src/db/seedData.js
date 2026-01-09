import { db, isDatabaseEmpty } from './database.js'

// Sample data for "600 Essential Words for the TOEIC" with extended fields
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
    { 
      id: 1, topicId: 1, 
      english: 'agreement', 
      vietnamese: 'thỏa thuận, hợp đồng', 
      meaning: 'A formal decision about future plans that is made by two or more people',
      pronunciation: '/əˈɡriːmənt/',
      synonyms: 'contract, deal, arrangement, understanding',
      antonyms: 'disagreement, dispute, conflict',
      example: 'Both parties signed the agreement after weeks of negotiation.',
      grammar: 'Common collocations: reach an agreement, sign an agreement, agreement between A and B, in agreement with.',
      wordForms: 'agree (v), agreeable (adj)'
    },
    { 
      id: 2, topicId: 1, 
      english: 'assurance', 
      vietnamese: 'sự đảm bảo', 
      meaning: 'A promise or guarantee',
      pronunciation: '/əˈʃʊərəns/',
      synonyms: 'guarantee, promise, pledge, commitment',
      antonyms: 'doubt, uncertainty, distrust',
      example: 'The manager gave us assurance that the project would be completed on time.',
      grammar: 'Often followed by "that" clause (assurance that...).',
      wordForms: 'assure (v), assured (adj), assuredly (adv)'
    },
    { 
      id: 3, topicId: 1, 
      english: 'cancellation', 
      vietnamese: 'sự hủy bỏ', 
      meaning: 'The act of canceling something that was planned',
      pronunciation: '/ˌkænsəˈleɪʃn/',
      synonyms: 'annulment, termination, withdrawal',
      antonyms: 'confirmation, approval, continuation',
      example: 'The cancellation of the contract resulted in financial losses.',
      grammar: 'Noun form of "cancel". Preposition: cancellation of something.',
      wordForms: 'cancel (v), canceled (adj)'
    },
    { 
      id: 4, topicId: 1, 
      english: 'determine', 
      vietnamese: 'xác định', 
      meaning: 'To find out something by examination or investigation',
      pronunciation: '/dɪˈtɜːrmɪn/',
      synonyms: 'decide, establish, ascertain, identify',
      antonyms: 'ignore, overlook, disregard',
      example: 'We need to determine the cause of the problem before proceeding.',
      grammar: 'Can be followed by "wh-" clause (determine what/how...).',
      wordForms: 'determination (n), determined (adj)'
    },
    { 
      id: 5, topicId: 1, 
      english: 'engage', 
      vietnamese: 'tham gia, cam kết', 
      meaning: 'To hire or employ someone; to participate',
      pronunciation: '/ɪnˈɡeɪdʒ/',
      synonyms: 'hire, employ, involve, participate',
      antonyms: 'dismiss, fire, disengage',
      example: 'The company decided to engage a new marketing consultant.',
      grammar: 'engage in something (tham gia vào), engage someone to do something.',
      wordForms: 'engagement (n), engaging (adj)'
    },
    { 
      id: 6, topicId: 1, 
      english: 'establish', 
      vietnamese: 'thành lập, thiết lập', 
      meaning: 'To start or create an organization or system',
      pronunciation: '/ɪˈstæblɪʃ/',
      synonyms: 'create, found, set up, institute',
      antonyms: 'abolish, destroy, dissolve',
      example: 'They established the company in 1995.',
      grammar: 'Often used in passive voice (was established in...).',
      wordForms: 'establishment (n), established (adj)'
    },
    { 
      id: 7, topicId: 1, 
      english: 'obligation', 
      vietnamese: 'nghĩa vụ', 
      meaning: 'Something that you must do because of a law, rule, or promise',
      pronunciation: '/ˌɒblɪˈɡeɪʃn/',
      synonyms: 'duty, responsibility, commitment, requirement',
      antonyms: 'choice, option, freedom',
      example: 'Employees have an obligation to follow company policies.',
      grammar: 'moral/legal obligation to do something. be under obligation.',
      wordForms: 'obligate (v), obligatory (adj)'
    },
    { 
      id: 8, topicId: 1, 
      english: 'party', 
      vietnamese: 'bên (trong hợp đồng)', 
      meaning: 'A person or group involved in an agreement or contract',
      pronunciation: '/ˈpɑːrti/',
      synonyms: 'side, participant, stakeholder',
      antonyms: '',
      example: 'Both parties must agree to the terms before signing.',
      grammar: 'Legal term: third party (bên thứ 3).',
      wordForms: ''
    },
    { 
      id: 9, topicId: 1, 
      english: 'provision', 
      vietnamese: 'điều khoản', 
      meaning: 'A part of an agreement or law that deals with a particular subject',
      pronunciation: '/prəˈvɪʒn/',
      synonyms: 'clause, condition, stipulation, term',
      antonyms: '',
      example: 'The contract includes a provision for early termination.',
      grammar: 'make provision for (chuẩn bị/dự phòng cho).',
      wordForms: 'provide (v), provisional (adj)'
    },
    { 
      id: 10, topicId: 1, 
      english: 'resolve', 
      vietnamese: 'giải quyết', 
      meaning: 'To find a solution to a problem or difficulty',
      pronunciation: '/rɪˈzɒlv/',
      synonyms: 'solve, settle, fix, work out',
      antonyms: 'complicate, worsen, aggravate',
      example: 'The dispute was resolved through mediation.',
      grammar: 'resolve to do something (quyết tâm làm gì).',
      wordForms: 'resolution (n), resolved (adj)'
    },
    
    // Topic 2: Marketing
    { 
      id: 11, topicId: 2, 
      english: 'attract', 
      vietnamese: 'thu hút', 
      meaning: 'To make someone interested in something',
      pronunciation: '/əˈtrækt/',
      synonyms: 'draw, appeal, lure, entice',
      antonyms: 'repel, deter, discourage',
      example: 'The new advertisement attracted many customers.'
    },
    { 
      id: 12, topicId: 2, 
      english: 'compare', 
      vietnamese: 'so sánh', 
      meaning: 'To examine differences and similarities',
      pronunciation: '/kəmˈpeər/',
      synonyms: 'contrast, evaluate, analyze',
      antonyms: '',
      example: 'Customers often compare prices before making a purchase.'
    },
    { 
      id: 13, topicId: 2, 
      english: 'competition', 
      vietnamese: 'sự cạnh tranh', 
      meaning: 'A situation in which people or companies try to be more successful',
      pronunciation: '/ˌkɒmpəˈtɪʃn/',
      synonyms: 'rivalry, contest, race',
      antonyms: 'cooperation, collaboration',
      example: 'The competition in the smartphone market is intense.'
    },
    { 
      id: 14, topicId: 2, 
      english: 'consume', 
      vietnamese: 'tiêu thụ', 
      meaning: 'To use fuel, energy, or time',
      pronunciation: '/kənˈsjuːm/',
      synonyms: 'use, spend, utilize, exhaust',
      antonyms: 'save, conserve, preserve',
      example: 'Modern appliances consume less energy than older models.'
    },
    { 
      id: 15, topicId: 2, 
      english: 'convince', 
      vietnamese: 'thuyết phục', 
      meaning: 'To make someone believe that something is true',
      pronunciation: '/kənˈvɪns/',
      synonyms: 'persuade, assure, satisfy',
      antonyms: 'discourage, dissuade',
      example: 'The salesperson convinced me to buy the premium version.'
    },
    { 
      id: 16, topicId: 2, 
      english: 'currently', 
      vietnamese: 'hiện tại', 
      meaning: 'At the present time',
      pronunciation: '/ˈkʌrəntli/',
      synonyms: 'now, presently, at present',
      antonyms: 'formerly, previously',
      example: 'We are currently working on a new product line.'
    },
    { 
      id: 17, topicId: 2, 
      english: 'fad', 
      vietnamese: 'mốt nhất thời', 
      meaning: 'Something that is popular for a short time',
      pronunciation: '/fæd/',
      synonyms: 'trend, craze, fashion',
      antonyms: 'classic, tradition',
      example: 'Many products that seem revolutionary turn out to be just a fad.'
    },
    { 
      id: 18, topicId: 2, 
      english: 'inspire', 
      vietnamese: 'truyền cảm hứng', 
      meaning: 'To make someone want to do something creative',
      pronunciation: '/ɪnˈspaɪər/',
      synonyms: 'motivate, encourage, stimulate',
      antonyms: 'discourage, dishearten',
      example: 'The CEO\'s speech inspired the entire team.'
    },
    { 
      id: 19, topicId: 2, 
      english: 'market', 
      vietnamese: 'thị trường', 
      meaning: 'A place where goods are bought and sold',
      pronunciation: '/ˈmɑːrkɪt/',
      synonyms: 'marketplace, trade, commerce',
      antonyms: '',
      example: 'The Asian market has huge potential for growth.'
    },
    { 
      id: 20, topicId: 2, 
      english: 'persuade', 
      vietnamese: 'thuyết phục', 
      meaning: 'To make someone agree to do something',
      pronunciation: '/pərˈsweɪd/',
      synonyms: 'convince, influence, sway',
      antonyms: 'discourage, dissuade, deter',
      example: 'She persuaded the board to approve the budget increase.'
    },
    
    // Topic 3: Warranties
    { 
      id: 21, topicId: 3, 
      english: 'characteristic', 
      vietnamese: 'đặc điểm', 
      meaning: 'A typical quality that makes something recognizable',
      pronunciation: '/ˌkærəktəˈrɪstɪk/',
      synonyms: 'feature, quality, trait, attribute',
      antonyms: '',
      example: 'Durability is a key characteristic of this product.'
    },
    { 
      id: 22, topicId: 3, 
      english: 'consequence', 
      vietnamese: 'hậu quả', 
      meaning: 'A result of an action or situation',
      pronunciation: '/ˈkɒnsɪkwəns/',
      synonyms: 'result, outcome, effect',
      antonyms: 'cause, origin',
      example: 'One consequence of the delay was increased costs.'
    },
    { 
      id: 23, topicId: 3, 
      english: 'consider', 
      vietnamese: 'xem xét', 
      meaning: 'To think carefully about something',
      pronunciation: '/kənˈsɪdər/',
      synonyms: 'think about, contemplate, ponder',
      antonyms: 'ignore, disregard, overlook',
      example: 'Please consider all options before making a decision.'
    },
    { 
      id: 24, topicId: 3, 
      english: 'cover', 
      vietnamese: 'bao gồm', 
      meaning: 'To include or deal with something',
      pronunciation: '/ˈkʌvər/',
      synonyms: 'include, encompass, comprise',
      antonyms: 'exclude, omit',
      example: 'The warranty covers parts and labor for one year.'
    },
    { 
      id: 25, topicId: 3, 
      english: 'expire', 
      vietnamese: 'hết hạn', 
      meaning: 'To come to an end or no longer be valid',
      pronunciation: '/ɪkˈspaɪər/',
      synonyms: 'end, terminate, lapse',
      antonyms: 'renew, extend, continue',
      example: 'Your subscription will expire next month.'
    },
    { 
      id: 26, topicId: 3, 
      english: 'frequently', 
      vietnamese: 'thường xuyên', 
      meaning: 'Often; many times',
      pronunciation: '/ˈfriːkwəntli/',
      synonyms: 'often, regularly, repeatedly',
      antonyms: 'rarely, seldom, occasionally',
      example: 'We frequently receive positive feedback from customers.'
    },
    { 
      id: 27, topicId: 3, 
      english: 'imply', 
      vietnamese: 'ngụ ý', 
      meaning: 'To suggest something without saying it directly',
      pronunciation: '/ɪmˈplaɪ/',
      synonyms: 'suggest, indicate, hint',
      antonyms: 'state, declare, express',
      example: 'His silence seemed to imply agreement.'
    },
    { 
      id: 28, topicId: 3, 
      english: 'promise', 
      vietnamese: 'hứa', 
      meaning: 'A statement that you will definitely do something',
      pronunciation: '/ˈprɒmɪs/',
      synonyms: 'pledge, vow, guarantee, commitment',
      antonyms: '',
      example: 'The company made a promise to improve customer service.'
    },
    { 
      id: 29, topicId: 3, 
      english: 'protect', 
      vietnamese: 'bảo vệ', 
      meaning: 'To keep someone or something safe from harm',
      pronunciation: '/prəˈtekt/',
      synonyms: 'safeguard, shield, defend',
      antonyms: 'endanger, expose, harm',
      example: 'The warranty protects consumers against defects.'
    },
    { 
      id: 30, topicId: 3, 
      english: 'reputation', 
      vietnamese: 'danh tiếng', 
      meaning: 'The opinion that people have about someone or something',
      pronunciation: '/ˌrepjuˈteɪʃn/',
      synonyms: 'name, standing, image, prestige',
      antonyms: 'infamy, disgrace',
      example: 'The company has built a strong reputation for quality.'
    },
    
    // Topic 4: Business Planning
    { 
      id: 31, topicId: 4, 
      english: 'address', 
      vietnamese: 'giải quyết', 
      meaning: 'To deal with a problem or issue',
      pronunciation: '/əˈdres/',
      synonyms: 'tackle, handle, deal with',
      antonyms: 'ignore, avoid, neglect',
      example: 'We need to address these issues before the launch.'
    },
    { 
      id: 32, topicId: 4, 
      english: 'avoid', 
      vietnamese: 'tránh', 
      meaning: 'To stay away from something',
      pronunciation: '/əˈvɔɪd/',
      synonyms: 'evade, escape, prevent',
      antonyms: 'face, confront, seek',
      example: 'We should avoid making the same mistakes again.'
    },
    { 
      id: 33, topicId: 4, 
      english: 'demonstrate', 
      vietnamese: 'chứng minh', 
      meaning: 'To show or prove something clearly',
      pronunciation: '/ˈdemənstreɪt/',
      synonyms: 'show, prove, illustrate, display',
      antonyms: 'hide, conceal',
      example: 'The results demonstrate the effectiveness of our strategy.'
    },
    { 
      id: 34, topicId: 4, 
      english: 'develop', 
      vietnamese: 'phát triển', 
      meaning: 'To grow or cause something to grow',
      pronunciation: '/dɪˈveləp/',
      synonyms: 'grow, expand, advance, evolve',
      antonyms: 'decline, decrease, regress',
      example: 'We plan to develop new products next year.'
    },
    { 
      id: 35, topicId: 4, 
      english: 'evaluate', 
      vietnamese: 'đánh giá', 
      meaning: 'To judge the value or quality of something',
      pronunciation: '/ɪˈvæljueɪt/',
      synonyms: 'assess, appraise, analyze, judge',
      antonyms: '',
      example: 'We need to evaluate the performance of each department.'
    },
    { 
      id: 36, topicId: 4, 
      english: 'gather', 
      vietnamese: 'thu thập', 
      meaning: 'To collect information or things',
      pronunciation: '/ˈɡæðər/',
      synonyms: 'collect, assemble, accumulate',
      antonyms: 'scatter, disperse, distribute',
      example: 'The team gathered data from multiple sources.'
    },
    { 
      id: 37, topicId: 4, 
      english: 'implement', 
      vietnamese: 'thực hiện', 
      meaning: 'To put a plan or system into action',
      pronunciation: '/ˈɪmplɪment/',
      synonyms: 'execute, carry out, apply, enforce',
      antonyms: 'cancel, abandon',
      example: 'We will implement the new policy starting next month.'
    },
    { 
      id: 38, topicId: 4, 
      english: 'offer', 
      vietnamese: 'đề nghị', 
      meaning: 'To present something for acceptance',
      pronunciation: '/ˈɒfər/',
      synonyms: 'provide, present, propose',
      antonyms: 'refuse, decline, withdraw',
      example: 'The company offers competitive salaries to employees.'
    },
    { 
      id: 39, topicId: 4, 
      english: 'prepare', 
      vietnamese: 'chuẩn bị', 
      meaning: 'To make something ready for use',
      pronunciation: '/prɪˈpeər/',
      synonyms: 'ready, arrange, organize, set up',
      antonyms: 'neglect, ignore',
      example: 'Please prepare the presentation for tomorrow\'s meeting.'
    },
    { 
      id: 40, topicId: 4, 
      english: 'strategy', 
      vietnamese: 'chiến lược', 
      meaning: 'A plan to achieve a goal',
      pronunciation: '/ˈstrætədʒi/',
      synonyms: 'plan, approach, method, tactic',
      antonyms: '',
      example: 'Our marketing strategy focuses on digital channels.'
    },
    
    // Topic 5: Conferences
    { 
      id: 41, topicId: 5, 
      english: 'accommodate', 
      vietnamese: 'cung cấp chỗ ở', 
      meaning: 'To provide a place to stay or work',
      pronunciation: '/əˈkɒmədeɪt/',
      synonyms: 'house, lodge, host, provide for',
      antonyms: 'evict, reject',
      example: 'The hotel can accommodate up to 500 guests.'
    },
    { 
      id: 42, topicId: 5, 
      english: 'arrangement', 
      vietnamese: 'sự sắp xếp', 
      meaning: 'Plans or preparations for a future event',
      pronunciation: '/əˈreɪndʒmənt/',
      synonyms: 'plan, preparation, organization, setup',
      antonyms: 'disorder, chaos',
      example: 'All arrangements for the conference have been finalized.'
    },
    { 
      id: 43, topicId: 5, 
      english: 'association', 
      vietnamese: 'hiệp hội', 
      meaning: 'A group of people organized for a common purpose',
      pronunciation: '/əˌsəʊsiˈeɪʃn/',
      synonyms: 'organization, society, group, union',
      antonyms: '',
      example: 'She is a member of the Marketing Association.'
    },
    { 
      id: 44, topicId: 5, 
      english: 'attend', 
      vietnamese: 'tham dự', 
      meaning: 'To be present at an event',
      pronunciation: '/əˈtend/',
      synonyms: 'join, participate, be present at',
      antonyms: 'miss, skip, absent',
      example: 'Over 300 people will attend the annual conference.'
    },
    { 
      id: 45, topicId: 5, 
      english: 'get in touch', 
      vietnamese: 'liên lạc', 
      meaning: 'To communicate with someone',
      pronunciation: '/ɡet ɪn tʌtʃ/',
      synonyms: 'contact, reach, connect with',
      antonyms: 'ignore, avoid',
      example: 'Please get in touch with me if you have any questions.'
    },
    { 
      id: 46, topicId: 5, 
      english: 'hold', 
      vietnamese: 'tổ chức', 
      meaning: 'To organize an event',
      pronunciation: '/həʊld/',
      synonyms: 'organize, host, conduct, arrange',
      antonyms: 'cancel, postpone',
      example: 'The company will hold its annual meeting next week.'
    },
    { 
      id: 47, topicId: 5, 
      english: 'location', 
      vietnamese: 'địa điểm', 
      meaning: 'A place where something happens',
      pronunciation: '/ləʊˈkeɪʃn/',
      synonyms: 'place, site, venue, position',
      antonyms: '',
      example: 'The location of the conference is in the city center.'
    },
    { 
      id: 48, topicId: 5, 
      english: 'register', 
      vietnamese: 'đăng ký', 
      meaning: 'To put your name on an official list',
      pronunciation: '/ˈredʒɪstər/',
      synonyms: 'enroll, sign up, record',
      antonyms: 'cancel, withdraw',
      example: 'You can register for the event online.'
    },
    { 
      id: 49, topicId: 5, 
      english: 'sincerely', 
      vietnamese: 'chân thành', 
      meaning: 'In a genuine and honest way',
      pronunciation: '/sɪnˈsɪəli/',
      synonyms: 'genuinely, honestly, truly',
      antonyms: 'insincerely, falsely',
      example: 'I sincerely appreciate your help with this project.'
    },
    { 
      id: 50, topicId: 5, 
      english: 'schedule', 
      vietnamese: 'lịch trình', 
      meaning: 'A plan showing when events or activities will happen',
      pronunciation: '/ˈʃedjuːl/',
      synonyms: 'timetable, agenda, plan, calendar',
      antonyms: '',
      example: 'The conference schedule includes three keynote speeches.'
    }
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
