'use strict';

// Shared constructor required while the hostel dataset is initialized.
function emptyHostelRecord(){
  return {
    boysAvailable:null,
    girlsAvailable:null,
    guaranteed:null,
    capacity:null,
    hostelBlocks:null,
    genderRoomAllocation:{boys:null,girls:null},
    roomAllocation:{year1:null,year2:null,year3:null,year4:null,internship:null},
    roomSize:null,
    balcony:null,
    bathroomRatio:null,
    elevators:null,
    annualFee:null,
    securityDeposit:null,
    messMonthly:null,
    messCompulsory:null,
    bathroom:null,
    studentsPerBathroom:null,
    wifi:null,
    mobileNetwork:null,
    powerBackup:null,
    drinkingWater:null,
    hotWater:null,
    laundry:null,
    washingMachine:null,
    housekeeping:null,
    waterReliability:null,
    electricityReliability:null,
    furniture:{bed:null,mattress:null,studyTable:null,chair:null,cupboard:null,bookshelf:null},
    coolerAllowed:null,
    acAllowed:null,
    refrigeratorAllowed:null,
    kettleAllowed:null,
    commonKitchen:null,
    readingRoom:null,
    libraryAfterHours:null,
    commonRoom:null,
    gym:null,
    indoorGames:null,
    sportsNearby:null,
    hospitalDistanceMeters:null,
    walkingTimeMinutes:null,
    curfew:null,
    overnightLeave:null,
    visitorRules:null,
    personalVehicles:null,
    securityGuards:null,
    cctv:null,
    controlledEntry:null,
    fireSafety:null,
    foodDelivery:null,
    parcelReception:null,
    nightFood:null,
    messDetails:null,
    campusFood:null,
    groceryNearby:null,
    pharmacyNearby:null,
    roomCondition:null,
    renovationStatus:null,
    blockVariation:null,
    hygiene:null,
    raggingSeniorCulture:null,
    officialNotes:[],
    studentNotes:[],
    ratings:{
      room:null,
      hygiene:null,
      mess:null,
      freedom:null,
      studyEnvironment:null,
      recreation:null,
      overall:null
    },
    sources:[],
    lastVerified:null,
    confidence:'Unknown',
    researchStatus:'Not researched'
  };
}

// Canonical decision-intelligence datasets — V8. Missing fields remain unknown.

const HOSTELS = {
  64: Object.assign(emptyHostelRecord(), { // AIIMS New Delhi
    boysAvailable:true,
    girlsAvailable:true,
    guaranteed:'Eligible, but allotment can be wait-listed when accommodation is short',
    hostelBlocks:'UG men: Charak, Jivak, Sushruta, Madhava, Nagarjuna, Vagbhatta and Ashwini among the listed undergraduate hostels; women include Saraswati, Laxmi and Medha among others',
    roomAllocation:{
      year1:'Shared/double-seater accommodation is reported for some freshers; allotment is block- and availability-dependent',
      year2:'Single or double-seater depending on hostel and vacancy',
      year3:'Single or double-seater depending on hostel and vacancy',
      year4:'Single rooms are common in the UG hostel estate, but exact block varies',
      internship:'Hostel tenure continues through internship subject to allotment/tenure rules'
    },
    blockVariation:'Large multi-hostel estate: some UG hostels are single-room stock, while Ashwini is listed as double-seater; attached toilets exist only in selected hostels/room types',
    annualFee:'₹2,728 total hostel charges over 5.5 years (official UG fee schedule)',
    securityDeposit:1000,
    messMonthly:'₹3,500–₹4,500 typical current fixed-menu range',
    bathroom:'Common toilets/baths for ordinary single-room accommodation; attached toilets only in selected accommodation',
    wifi:true,
    electricityReliability:'24×7 institutional supply expected; high-load appliances require permission',
    visitorRules:'Visitors permitted with register entry; residents are discouraged from taking visitors into rooms',
    personalVehicles:'Allowed if registered with AIIMS Security and displaying the AIIMS vehicle pass',
    messDetails:'Choice of cooperative student-run messes, contractor messes and cafés; payment model varies by outlet',
    housekeeping:'Institute handles general cleaning of hostels and toilets',
    furniture:{bed:true,mattress:null,studyTable:true,chair:true,cupboard:true,bookshelf:true},
    acAllowed:false,
    commonRoom:true,
    gym:true,
    indoorGames:true,
    sportsNearby:true,
    roomCondition:'Basic but functional; student reports vary by hostel block and age of building',
    hygiene:'Common-area/toilet cleaning is institutional; student experiences vary by block',
    raggingSeniorCulture:'Strict anti-ragging rules; juniors are not to be taken into seniors’ rooms until the freshers welcome period is over',
    campusFood:'Multiple hostel messes/cafés rather than one compulsory mess; residents can choose among available options',
    officialNotes:[
      'All MBBS undergraduates are eligible to apply for hostel accommodation.',
      'Standard rooms include a bed, study table, chair, bookshelf and steel almirah.',
      'Air-conditioners and similar high-load electrical appliances are prohibited under hostel rules.',
      'Boarding is extra; AIIMS quotes roughly ₹3,500–₹4,500/month depending on mess.'
    ],
    studentNotes:[
      'Recent MBBS/student reviews report hostel Wi‑Fi and multiple mess choices across campus.',
      'Freshers are commonly reported to start in shared rooms, with room type later depending on block/allotment.',
      'Room quality is block-dependent rather than uniform across the large hostel estate.'
    ],
    sources:[
      'https://www.aiims.edu/index.php/en/hostel_accomodation_faqs',
      'https://aiims.edu/index.php/en/hostel_accomodation_hos_official/fees',
      'https://aiims.edu/index.php/en/2015-01-01-10-34-16/hostel_accomodation_rules',
      'https://www.aiims.edu/index.php/en/hostel_accomodation_forms',
      'https://www.shiksha.com/college/all-india-institute-of-medical-sciences-delhi-gautam-nagar-24433/reviews-4'
,
      'https://www.aiims.edu/index.php/en/departments-and-centers/215-hostel_accomodation_details',
      'https://www.careers360.com/university/all-india-institute-of-medical-sciences-new-delhi/reviews'    ],
    lastVerified:'2026-08-20',
    confidence:'High for official fees/rules/furniture; Medium for year-wise room pattern',
    researchStatus:'Exhaustive second-pass: official + multi-source student/review evidence'
  }),
  72: Object.assign(emptyHostelRecord(), { // VMMC & Safdarjung
    boysAvailable:true,
    girlsAvailable:true,
    guaranteed:'Not guaranteed; AIQ students residing outside Delhi are given first preference, IPU/state-quota students are subject to availability',
    roomAllocation:{
      year1:'Usually double sharing',
      year2:'Usually double sharing; some boys may shift to New Boys Hostel from around 4th–5th semester',
      year3:'Usually double sharing; block depends on allotment',
      year4:'Single rooms increasingly reported for final-year students where available',
      internship:'Single rooms commonly reported for interns/final-year students where available'
    },
    bathroom:'Common washrooms; recent student reports describe condition as functional but mediocre',
    wifi:'No institutional hostel Wi‑Fi in multiple MBBS reports; students arrange private Wi‑Fi/data connections',
    powerBackup:true,
    drinkingWater:'Water cooler/purifier reported on each floor',
    refrigeratorAllowed:'Reported allowed by MBBS students',
    roomSize:'Repeatedly described as small/tiny two-seater rooms',
    bathroomRatio:'Not verified; common washrooms',
    messDetails:'Mess feedback varies by hostel; girls’ mess is repeatedly rated better than boys’ mess',
    electricityReliability:'Students report no separate electricity bill for hostel-room AC use',
    furniture:{bed:true,mattress:null,studyTable:true,chair:true,cupboard:true,bookshelf:null},
    acAllowed:true,
    sportsNearby:true,
    curfew:'No fixed curfew reported by multiple recent student reviews; official entry rules exist, but current timing was not recoverable',
    roomCondition:'Small to medium rooms; usually two-seater; New Boys Hostel is reported larger and greener than older blocks',
    hygiene:'Mixed: rooms generally livable, but washrooms receive repeated mediocre reviews',
    securityGuards:true,
    controlledEntry:true,
    officialNotes:[
      'For MBBS 2025-26, AIQ students residing outside Delhi receive hostel priority.',
      'State/IPU quota students receive rooms only subject to availability.',
      'The official Student Zone maintains separate UG boys’ hostel SOP and entry-rule documents.'
    ],
    studentNotes:[
      'Recent verified MBBS reviews consistently describe two students per room for most UG years.',
      'AC installation is repeatedly reported as allowed; some students report no separate electricity bill.',
      'Girls’ mess is repeatedly rated better than boys’ mess in student reviews.',
      'Washrooms and room size are the most common negatives; location and flexibility are major positives.'
    ],
    sources:[
      'https://vmmc-sjh.mohfw.gov.in/notice-dated-10092025-instructions-hostel-allotment-mbbs-batch-2025-26',
      'https://vmmc-sjh.mohfw.gov.in/student-zone',
      'https://www.shiksha.com/college/vardhman-mahavir-medical-college-safdarjang-enclave-delhi-52968/reviews',
      'https://www.shiksha.com/college/vardhman-mahavir-medical-college-safdarjang-enclave-delhi-52968/courses/mbbs-bc',
      'https://collegedunia.com/qna/question/30210-how-are-the-hostel-rooms-at-vmmc'
,
      'https://www.shiksha.com/college/vardhman-mahavir-medical-college-safdarjang-enclave-delhi-52968/reviews-3',
      'https://www.shiksha.com/college/vardhman-mahavir-medical-college-safdarjang-enclave-delhi-52968/infrastructure'    ],
    lastVerified:'2026-08-20',
    confidence:'High for allotment priority; Medium for room progression/amenities because these are student-reported',
    researchStatus:'Exhaustive second-pass: official + multi-source student/review evidence'
  }),
  69: Object.assign(emptyHostelRecord(), { // MAMC
    boysAvailable:true,
    girlsAvailable:true,
    guaranteed:'Limited accommodation; priority rules apply and students may have to share or may not get a room immediately',
    capacity:'7 undergraduate/intern hostel buildings in the formal hostel system; 2025 government review reported severe overall accommodation pressure',
    hostelBlocks:'UG: Girls Hostel 1, Old Girls Hostel, New Girls Hostel, Women Intern Hostel, Boys Hostel 1 plus other UG boys blocks listed by MAMC',
    roomAllocation:{
      year1:'Sharing in Boys Hostel 1 / Old Girls Hostel & Girls Hostel 1',
      year2:'Sharing; single rooms possible later by priority and availability',
      year3:'Sharing or single by priority/availability',
      year4:'Girls shift to New Girls Hostel in 8th–9th semester where rooms are single-seater; boys depend on availability',
      internship:'Boys: single/double by priority; girls: single/double in Women Intern Hostel'
    },
    blockVariation:'Very high. Formal allotment rules describe sharing that progresses toward singles, while the 2025 government review found extreme overcrowding in parts of the hostel system',
    renovationStatus:'Immediate hostel renovation, lighting, CCTV and security upgrades were ordered by Delhi government in June 2025; new hostel construction was also directed to be expedited',
    annualFee:'₹6,360–₹6,600/year under the 2018 rule schedule; official page states fees are under revision',
    securityDeposit:5000,
    messMonthly:'As applicable; current official monthly amount not published on accessible page',
    messDetails:'Multiple messes/canteens operate; mess is not uniformly compulsory according to student reports, allowing students to eat at alternate messes/canteens',
    bathroom:'Common bathroom/toilet on each floor in the formal UG hostel rules',
    laundry:true,
    housekeeping:null,
    furniture:{bed:true,mattress:null,studyTable:true,chair:true,cupboard:true,bookshelf:null},
    wifi:false,
    acAllowed:false,
    readingRoom:true,
    commonRoom:true,
    indoorGames:true,
    sportsNearby:true,
    curfew:'11:00 PM for UG residents under official rules; interns exempt',
    visitorRules:'Non-hostellers cannot stay without permission; hostel entry/guest restrictions apply',
    personalVehicles:'Car parking not available in hostels',
    roomCondition:'Uneven and currently a major weakness: formal rules describe standard rooms, while 2025 government review documented dilapidation and severe overcrowding in parts of the hostel system',
    hygiene:'Student reports are mixed-to-poor, especially for older hostels; newer girls’ accommodation is reported better',
    raggingSeniorCulture:'Ragging formally prohibited; hostel allotment and seniority rules are strict',
    officialNotes:[
      'MAMC officially operates 3 UG boys hostels and 4 UG girls hostels, including separate intern accommodation.',
      'Rooms are formally supplied with bed, study table, chair and almirah; common bathrooms are provided floor-wise.',
      'AC/heater use is prohibited and carries a ₹10,000 fine under the published rules.',
      'Mess/canteen availability differs by hostel block.'
    ],
    studentNotes:[
      'Recent students report no institutional hostel Wi‑Fi; students often arrange their own connection.',
      'Reading room/TV room and basketball/badminton access are positives.',
      'Hostel cleanliness and ageing infrastructure are recurrent complaints.',
      'A 2025 Delhi government review described serious overcrowding and ordered repairs, more lighting, CCTV and increased security.'
    ],
    sources:[
      'https://mamc.delhi.gov.in/mamc/under-graduate-hostel-rules',
      'https://mamc.delhi.gov.in/mamc/hostel',
      'https://mamc.delhi.gov.in/mamc/hostel-charge',
      'https://www.shiksha.com/college/maulana-azad-medical-college-university-of-delhi-bahadur-shah-zafar-marg-3429/reviews',
      'https://www.shiksha.com/college/maulana-azad-medical-college-university-of-delhi-bahadur-shah-zafar-marg-3429/infrastructure',
      'https://timesofindia.indiatimes.com/city/delhi/cm-orders-anti-encroachment-drive-hostel-revamp-at-mamc/articleshow/122031806.cms'
,
      'https://collegedunia.com/qna/question/35095-how-are-the-hostels-at-mamc-delhi'    ],
    lastVerified:'2026-08-20',
    confidence:'High for rules/allocation; High that infrastructure pressure exists; Medium for hostel-by-hostel lived experience',
    researchStatus:'Exhaustive second-pass: official + current news + student/review evidence'
  }),
  65: Object.assign(emptyHostelRecord(), { // ABVIMS & RML
    boysAvailable:true,
    girlsAvailable:true,
    guaranteed:'Accommodation is offered subject to priority/availability; the institute states every effort is made to accommodate ABVIMS students',
    roomAllocation:{
      year1:'Double sharing commonly reported',
      year2:'Double sharing commonly reported; single rooms may be available later',
      year3:'Double/single depending on allotment and availability',
      year4:'Double/single depending on allotment and availability',
      internship:'Not reliably verified'
    },
    annualFee:'₹12,000 double occupancy / ₹18,000 single occupancy per year reported for the current hostel fee structure',
    securityDeposit:5000,
    messMonthly:'Mess available; current monthly mess charge not reliably verified',
    hostelBlocks:'Dhanwantri Chhatrawas — 20-storey hostel with Ganga, Yamuna and Saraswati wings',
    bathroom:'Attached washrooms in the centrally air-conditioned hostel rooms according to the official RML hostel page',
    elevators:6,
    drinkingWater:'Water coolers with purifiers on every floor',
    cctv:true,
    securityGuards:true,
    acAllowed:true,
    powerBackup:true,
    electricityReliability:'24-hour electricity stated officially',
    messDetails:'Two hostel messes on the ground floor; subsidized rotating menu stated by RML',
    campusFood:'Departmental canteen near Gate 3 in addition to the two hostel messes',
    housekeeping:'Student reviews generally describe hostels as clean',
    furniture:{bed:true,mattress:null,studyTable:true,chair:true,cupboard:true,bookshelf:null},
    commonRoom:true,
    indoorGames:true,
    sportsNearby:'Badminton/table-tennis available; larger field sports generally require going outside the immediate campus',
    roomCondition:'Modern high-rise hostel by official description: furnished rooms, attached washrooms, lifts, central AC, purified water and CCTV',
    hygiene:'Recent student reviews are generally positive about cleanliness; mess food usually described as average',
    officialNotes:[
      'Dhanwantri Chhatrawas is officially described as a 20-storey centrally air-conditioned hostel with attached washrooms, six lifts, CCTV and 24-hour electricity.',
      'Rooms are furnished with beds, tables, chairs and storage; purified-water coolers are provided on every floor.',
      'Two messes operate on the ground floor and a departmental canteen is available near Gate 3.',
      'RMLH Student Corner carried separate 2026 hostel-fee notices for MBBS batches 2021–2024.',
      'The institute maintains an active hostel-fee system for MBBS students.'
    ],
    studentNotes:[
      'Recent MBBS reviews commonly describe two students sharing a room.',
      'Outstation students are reported to receive accommodation priority before Delhi residents.',
      'Mess is available and commonly rated average; badminton/table-tennis are available, but the campus has limited large-field sports space.'
    ],
    sources:[
      'https://rmlh.mohfw.gov.in/index1.aspx?langid=1&lev=3&lid=3575&lsid=2581',
      'https://collegedunia.com/college/63043-atal-bihari-vajpayee-institute-of-medical-sciences-and-dr-ram-manohar-lohia-hospital-new-delhi/hostel',
      'https://www.shiksha.com/college/atal-bihari-vajpayee-institute-of-medical-sciences-and-dr-ram-manohar-lohia-hospital-connaught-place-delhi-65923/gallery',
      'https://www.shiksha.com/college/atal-bihari-vajpayee-institute-of-medical-sciences-and-dr-ram-manohar-lohia-hospital-connaught-place-delhi-65923/fees'
,
      'https://rmlh.nic.in/index1.aspx?key=admission&langid=1&lev=4&lid=3567&lsid=2549&pid=2537'    ],
    lastVerified:'2026-08-20',
    confidence:'High for physical hostel facilities from official RML page; Medium for year-wise room-sharing/priority details',
    researchStatus:'Exhaustive second-pass: official + multi-source student/review evidence'
  }),
  71: Object.assign(emptyHostelRecord(), { // UCMS & GTB
    boysAvailable:true,
    girlsAvailable:true,
    guaranteed:'Not a right; rooms depend on availability. Highest priority is given to students residing outside Delhi/NCR, then other priority categories and distance',
    roomAllocation:{
      year1:'Boys: New Boys Hostel; single rooms are consistently reported by students. Girls: Girls Hostel subject to allotment',
      year2:'Boys shift to Old Boys Hostel from 3rd semester onward; single rooms commonly reported',
      year3:'Single rooms commonly reported',
      year4:'Single rooms commonly reported',
      internship:'Separate intern accommodation policy/JRD hostel applies'
    },
    hostelBlocks:'New Boys Hostel (first-year boys), Old Boys Hostel (from 3rd semester), Girls Hostel; separate intern/JRD accommodation policy',
    roomSize:'Student reports commonly describe ~8×8 to 10×10 ft single rooms; some rooms have balconies',
    balcony:'Available in at least some hostel rooms according to student reviews',
    bathroomRatio:'About 1 toilet/washroom per ~5 students reported; another multi-review summary reports ~25 rooms/floor sharing 4 bathrooms + 4 toilets + 4 washbasins',
    messMonthly:'₹2,500/month in the latest accessible official mess-fee order (effective Jan 2023; may have changed)',
    messCompulsory:true,
    bathroom:'Common washrooms; student reports say room occupancy is generally single even though bathrooms are shared',
    wifi:'College/library Wi‑Fi available; hostel Wi‑Fi is reported absent or inconsistent',
    drinkingWater:true,
    waterReliability:'24×7 water supply consistently reported',
    electricityReliability:'24×7 electricity supply consistently reported',
    housekeeping:'Hostel housekeeping staff collect/dispose garbage daily under official rules',
    furniture:{bed:true,mattress:false,studyTable:true,chair:true,cupboard:true,bookshelf:null},
    coolerAllowed:true,
    acAllowed:false,
    readingRoom:true,
    libraryAfterHours:true,
    commonRoom:true,
    gym:'Available in hostel/campus ecosystem, but student reports differ on whether every hostel gym is functional',
    indoorGames:true,
    sportsNearby:true,
    messDetails:'Compulsory hostel mess; current accessible official order set ₹2,500/month from Jan 2023. Student reports describe breakfast, lunch, evening tea/snacks and dinner with veg/non-veg variety depending on menu.',
    curfew:'General rule: back by 11 PM. First-year closing time: 10 PM Mar–Oct and 9:30 PM Nov–Feb',
    overnightLeave:'Prior permission/in-out register required; absence >24h must be reported in writing',
    visitorRules:'Guest stay in student rooms is not allowed; visiting hours and guest-room rules apply',
    securityGuards:true,
    controlledEntry:true,
    roomCondition:'Strong room-size/single-room advantage, but Old Boys Hostel is ageing; lift reliability, leaks and maintenance are recurring student complaints',
    hygiene:'Mixed: mess/girls hostel often reviewed positively; older boys’ washrooms/buildings receive more complaints',
    raggingSeniorCulture:'First-year boys are housed separately in New Boys Hostel; formal anti-ragging rules are strict',
    officialNotes:[
      'Hostel accommodation is availability-based and prioritized by residence/distance.',
      'First-year boys are allotted New Boys Hostel; from 3rd semester onward boys are allotted Old Boys Hostel.',
      'Mess membership is compulsory for hostel residents under the hostel rules.',
      'ACs/heaters/electric stoves and private cooking are prohibited in rooms.'
    ],
    studentNotes:[
      'Single occupancy from first year is one of UCMS’s strongest recurring hostel positives in student reports.',
      'Coolers are commonly reported as allowed; ACs are not.',
      'Mess feedback is generally average-to-good, but varies by hostel and batch.',
      'Old Boys Hostel infrastructure is the main recurring weakness; New Boys Hostel/girls’ accommodation are generally reviewed more favorably.'
    ],
    sources:[
      'https://www.ucms.ac.in/facility/hostels',
      'https://www.ucms.ac.in/assets/hostel/Hostel%20rules.pdf',
      'https://www.ucms.ac.in/assets/hostel/PROCEDURE%20FOR%20ROOM%20ALLOTTMENT%20IN%20UG%20HOSTEL.pdf',
      'https://www.ucms.ac.in/assets/hostelcirculars/Hostel_circular_01062023.pdf',
      'https://www.shiksha.com/college/university-college-of-medical-sciences-university-of-delhi-dilshad-garden-3874/reviews-3',
      'https://collegedunia.com/reviews/885556-shaubhik-acharjee-review-on-university-college-of-medical-sciences-ucms-new-delhi/'
,
      'https://www.careers360.com/colleges/university-college-of-medical-sciences-university-of-delhi-delhi/mbbs-course',
      'https://www.shiksha.com/college/university-college-of-medical-sciences-university-of-delhi-dilshad-garden-3874/reviews?bc=102',
      'https://collegedunia.com/college/11128-university-college-of-medical-sciences-ucms-new-delhi/hostel',
      'https://www.collegebatch.com/reviews/26432-university-college-of-medical-sciences-new-delhi'    ],
    lastVerified:'2026-08-20',
    confidence:'High for rules/allotment/mess order; Medium-High for single-room and condition reports',
    researchStatus:'Exhaustive second-pass: official + multi-source student/review evidence'
  }),
  262: Object.assign(emptyHostelRecord(), { // AIIMS Jodhpur
    boysAvailable:true,
    girlsAvailable:true,
    guaranteed:'Hostel is routinely provided to UG students in multiple student reports; a current official guarantee statement was not recovered',
    roomAllocation:{
      year1:'Newer UG hostel: double sharing reported',
      year2:'Double sharing commonly reported in newer UG hostel; some older blocks are single-seater',
      year3:'Block-dependent; double sharing in newer hostel / single in older stock reported',
      year4:'Block-dependent; single and double configurations both reported',
      internship:'Not reliably verified'
    },
    hostelBlocks:'Senior/new UG boys hostel plus older UG hostel stock; exact current allocation by batch is block-dependent',
    elevators:'Present in newer multi-storey hostel blocks (student-review evidence)',
    bathroom:'Common bathrooms reported in newer UG hostel; exact arrangement varies by block',
    wifi:true,
    drinkingWater:'Purified drinking water reported in hostel',
    acAllowed:false,
    messDetails:'Mess/canteen generally reviewed positively; exact current monthly price not verified',
    housekeeping:'Weekly room cleaning specifically reported; toilets described as maintained/clean in recent reviews',
    furniture:{bed:true,mattress:null,studyTable:true,chair:true,cupboard:true,bookshelf:null},
    readingRoom:true,
    commonRoom:true,
    gym:true,
    indoorGames:true,
    sportsNearby:true,
    roomCondition:'Generally modern, clean and well-furnished; newer 7-storey UG blocks receive strong reviews',
    hygiene:'Generally positive in recent student reviews',
    officialNotes:[
      'A current detailed official UG hostel rulebook was not recoverable in this pass, so hard-rule fields are intentionally conservative.'
    ],
    studentNotes:[
      'Verified MBBS reviews repeatedly report hostel Wi‑Fi and strong sports infrastructure.',
      'Recent hostel reviews report purified drinking water, weekly room cleaning, TV/common space and a small reading/library room.',
      'AC use is reported as not permitted/provided in the UG hostel despite Jodhpur heat.',
      'Newer UG hostels are described as double-seater with bed, study space, drawer and almirah.',
      'Older hostel stock is reported to include smaller single rooms, so room type is block-dependent.',
      'Mess/canteen quality is generally rated positively, although exact current monthly mess pricing was not verified.'
    ],
    sources:[
      'https://www.shiksha.com/college/aiims-jodhpur-all-india-institute-of-medical-sciences-64869/infrastructure',
      'https://www.shiksha.com/college/aiims-jodhpur-all-india-institute-of-medical-sciences-64869/reviews',
      'https://www.shiksha.com/college/aiims-jodhpur-all-india-institute-of-medical-sciences-64869/course-bachelor-of-medicine-and-bachelor-of-surgery-mbbs-380149',
      'https://www.collegebatch.com/reviews/15592-all-india-institute-of-medical-sciences-jodhpur'
,
      'https://wanderlog.com/place/details/12808082/senior-ug-boys-hostel-aiims-jodhpur'    ],
    lastVerified:'2026-08-20',
    confidence:'Medium-High for physical facilities; Medium for allocation rules because evidence is mainly student-reported',
    researchStatus:'Exhaustive second-pass student/review profile; official UG rulebook remains a gap'
  }),
  49: Object.assign(emptyHostelRecord(), { // PMCH
    boysAvailable:true,
    girlsAvailable:true,
    capacity:'Official PMCH hostel page lists boys-hostel accommodation for 346 students and girls-hostel accommodation for 197 students (legacy/current listed capacity)',
    hostelBlocks:'Mother Teresa Mahila Chhatravas; Dhanwantri (Old Boys); Jeevak (New Boys); Nagarjuna; DH-1 UG; UG Hostel OBG Emergency; DH-2; Intern Hostel No.7; Kasturba PG Girls; Chanakya/PG/Intern facilities',
    guaranteed:'Hostel available, but exact guarantee/allotment priority is not reliably documented in accessible current sources',
    roomAllocation:{
      year1:'Double sharing reported in recent MBBS student review',
      year2:'Sharing pattern varies by hostel/block; not fully verified',
      year3:'Sharing pattern varies by hostel/block; not fully verified',
      year4:'Sharing pattern varies by hostel/block; not fully verified',
      internship:'Not reliably verified'
    },
    blockVariation:'Very high because PMCH simultaneously has legacy hostels, redevelopment-related arrangements and newer/renovated stock',
    renovationStatus:'Hostel interpretation should be considered transitional while the PMCH megaredevelopment proceeds',
    bathroom:'Common hostel washrooms; current block-wise bathroom ratio not verified',
    housekeeping:'A recent MBBS review reports staff cleaning rooms weekly',
    furniture:{bed:true,mattress:null,studyTable:null,chair:null,cupboard:null,bookshelf:null},
    readingRoom:null,
    libraryAfterHours:true,
    sportsNearby:true,
    roomCondition:'Mixed and rapidly changing because PMCH is under major redevelopment; recent student reports are materially better than older reviews',
    hygiene:'Mixed. A 2025 student report describes weekly room cleaning, while older reviews describe poor sanitation in legacy hostels',
    messMonthly:'Current charge not reliably verified',
    messDetails:'Recent MBBS review reports both vegetarian and non-vegetarian options and positively rates mess food; older legacy-hostel reviews are much worse',
    raggingSeniorCulture:'Not rated numerically; use institution anti-ragging policy plus recent student reports when available',
    officialNotes:[
      'PMCH’s official hostel page lists multiple named UG/intern hostels and gives legacy/current room inventory, including single, double and triple-room stock.',
      'The official page lists boys-hostel accommodation for 346 students and girls-hostel accommodation for 197 students.',
      'PMCH is undergoing large-scale redevelopment, so hostel conditions can differ sharply between old blocks, temporary arrangements and newer facilities.',
      'No current comprehensive official UG hostel rulebook/fee schedule was recovered in this pass.'
    ],
    studentNotes:[
      'A recent MBBS review reports double-sharing rooms, weekly staff cleaning, and a mess serving both vegetarian and non-vegetarian food.',
      'The same recent review describes mess food positively and mentions an air-conditioned library with current books.',
      'Older student reviews describe legacy hostels as poor in hygiene/sanitation, so conditions appear block- and period-dependent.'
    ],
    sources:[
      'https://www.shiksha.com/college/patna-medical-college-and-hospital-63075/reviews'
,
      'https://patnamedicalcollege.edu.in/hostel'    ],
    lastVerified:'2026-08-20',
    confidence:'High for official hostel names/capacity; Medium for current lived experience because redevelopment makes block conditions highly variable',
    researchStatus:'Exhaustive second-pass student profile + official hostel inventory; current redevelopment remains a major confounder'
  }),
  45: Object.assign(emptyHostelRecord(), { // IGIMS Patna
    boysAvailable:true,
    girlsAvailable:true,
    guaranteed:'Not immediate for everyone; a detailed recent MBBS report says new students may wait roughly 5–6 months for a room',
    genderRoomAllocation:{boys:'Double sharing reported through 4th year, then larger single room during internship',girls:'Double sharing in 1st year, then single-room progression from 2nd year in detailed recent MBBS report'},
    blockVariation:'Allocation and room size differ by gender and year; recent reports particularly distinguish girls’ and boys’ progression',
    roomAllocation:{
      year1:'Girls: double sharing; Boys: double sharing',
      year2:'Girls: single room reported; Boys: double sharing',
      year3:'Girls: larger single rooms reported; Boys: double sharing',
      year4:'Boys: double sharing reported; girls remain in single-room allocation pattern',
      internship:'Boys: larger single rooms reported; girls’ internship allocation not fully verified'
    },
    annualFee:'₹20,000/year reported by a recent MBBS student; official current fee page exists but exact latest hostel component was not exposed in the accessible page',
    messMonthly:'Mess inside hostel; monthly charge not reliably verified',
    messDetails:'Recent reviews generally call mess food decent/nutritious rather than exceptional',
    bathroom:'Not reliably verified',
    wifi:true,
    electricityReliability:'Campus/hostel utilities generally reviewed as reliable; exact backup configuration not verified',
    drinkingWater:null,
    hotWater:null,
    furniture:{bed:true,mattress:null,studyTable:true,chair:true,cupboard:true,bookshelf:null},
    libraryAfterHours:true,
    sportsNearby:true,
    curfew:'Hostel described as comparatively strict in recent student reviews; exact current timing not verified',
    roomCondition:'Generally described as good, with a large modern campus; student reports are especially positive about later-year girls’ rooms',
    hygiene:'Generally positive in recent reviews',
    officialNotes:[
      'IGIMS publishes a dedicated Hostel Rules/Hostel Committee section for MBBS students and interns, separately for boys and girls.',
      'IGIMS also maintains an official UG/PG fee-structure section.'
    ],
    studentNotes:[
      'A recent MBBS report describes a 5–6 month initial wait for hostel allocation.',
      'Girls are reported to move from double sharing in first year to single rooms from second year; boys remain double-sharing through fourth year and get larger single rooms in internship.',
      'Recent reviews describe hostel facilities as good but somewhat strict, with decent mess food and strong Wi‑Fi/library access.'
    ],
    sources:[
      'https://www.igims.org/topics.aspx?mid=Rules+and+Regulations+-+Hostel++%2F+Hostel+Committee',
      'https://www.igims.org/topics.aspx?mid=Fee+Structure+and+Payment+Schedule+for+UG+%2F+PG+Courses',
      'https://collegedunia.com/reviews/796372-tanya-nayan-review-on-indira-gandhi-institute-of-medical-sciences-igims-patna',
      'https://www.shiksha.com/college/indira-gandhi-institute-of-medical-sciences-patna-62973/reviews',
      'https://www.shiksha.com/college/indira-gandhi-institute-of-medical-sciences-patna-62973/infrastructure'
    ],
    lastVerified:'2026-08-20',
    confidence:'High for official hostel administration; Medium-High for year-wise room progression because a detailed recent MBBS report is corroborated by broader reviews; Medium for fee',
    researchStatus:'Exhaustive second-pass: official administration + detailed recent student/review evidence'
  }),
  402: Object.assign(emptyHostelRecord(), { // KGMU
    boysAvailable:true,
    girlsAvailable:true,
    guaranteed:'Hostel accommodation available, but exact first-year guarantee was not recovered from a current official allocation rule',
    capacity:'KGMU operates multiple student/resident hostels; a July 2026 report refers to 18 hostel messes across the university',
    blockVariation:'Very high: KGMU has many hostel blocks of different ages, so room quality, washrooms, Wi‑Fi and sharing pattern are not uniform',
    roomAllocation:{
      year1:'Double sharing commonly reported',
      year2:'Double sharing commonly reported; some hostels/years may have single rooms',
      year3:'Double/single depending on hostel and availability',
      year4:'Double/single depending on hostel and availability',
      internship:'Not reliably verified'
    },
    annualFee:2400,
    messMonthly:'Compulsory mess reported by some MBBS students; current exact monthly charge varies by hostel and was not officially verified',
    bathroom:'Hostel-dependent; some student reports describe common washrooms with poor maintenance/water reliability',
    wifi:'Mixed reports: some newer/recent reviews report hostel Wi‑Fi, while others report no reliable student Wi‑Fi',
    balcony:'Attached balconies are reported in some student hostel rooms, not universal across blocks',
    waterReliability:'Mixed: several students report reliable utilities, while others specifically report intermittent water/washroom problems in older/women’s blocks',
    electricityReliability:'Generally reliable in student reports',
    messDetails:'Mess is compulsory in at least some UG hostels. From July 2026, hostel messes are vegetarian-only; KGMU directed addition of soy, paneer and pulses after the non-veg ban.',
    furniture:{bed:true,mattress:null,studyTable:true,chair:true,cupboard:true,bookshelf:null},
    commonRoom:true,
    sportsNearby:true,
    roomCondition:'Highly hostel-dependent because KGMU has many old and newer hostel blocks; recent student reviews range from very positive to poor',
    hygiene:'Mixed-to-poor in some women’s/older hostel reports, especially washroom cleanliness and intermittent water supply',
    messCompulsory:true,
    officialNotes:[
      'KGMU lists MBBS hostel fee at ₹2,400/year plus ₹2,500/year electricity in its current fee details.',
      'KGMU has extensive hostel infrastructure spread across the campus.',
      'As of July 2026, KGMU banned cooking/serving non-vegetarian food in all 18 hostel messes and instructed messes to increase vegetarian protein options.'
    ],
    studentNotes:[
      'Many MBBS reviews report double-sharing rooms, separate almirah/study-table space and attached balconies in some hostels.',
      'Experience is inconsistent across hostel blocks: some recent students call the hostels excellent, while others report dirty washrooms and water shortages.',
      'Mess quality is similarly mixed; compulsory mess is reported by some students.'
    ],
    sources:[
      'https://www.kgmu.org/feedetails.php',
      'https://www.kgmu.org/about_campus.php',
      'https://www.shiksha.com/university/kgmu-king-george-s-medical-university-lucknow-2102/reviews',
      'https://www.shiksha.com/university/kgmu-king-george-s-medical-university-lucknow-2102/infrastructure',
      'https://timesofindia.indiatimes.com/city/lucknow/no-non-veg-in-hostel-messes-says-kgmu-after-inspection-by-governors-team/articleshow/132375997.cms'
,
      'https://timesofindia.indiatimes.com/city/lucknow/after-non-veg-ban-kgmu-adds-soy-paneer-pulses-to-prevent-nutrition-gaps/articleshow/132447850.cms'    ],
    lastVerified:'2026-08-20',
    confidence:'High for official hostel/electricity fees and July 2026 mess policy; Medium for room configuration; Low-Medium for hostel-wide quality because blocks differ substantially',
    researchStatus:'Exhaustive second-pass: official + current news + multi-source student/review evidence'
  }),
  220: Object.assign(emptyHostelRecord(), { // Grant Medical College
    boysAvailable:true,
    girlsAvailable:true,
    guaranteed:'Outstation students are given preference in the published ladies-hostel SOP; exact guarantee for all UG students is not established',
    capacity:'Student reports describe 5 hostel buildings within the JJ Hospital campus',
    hostelBlocks:'Student reports: Old Boys Hostel for 1st MBBS; Apna Boys Hostel and R.M. Bhatt Boys Hostel from later years; Ladies Hostel; separate 300 Doctors Hostel for PG/residents',
    blockVariation:'High: facilities differ substantially between Old Boys, Apna, R.M. Bhatt and ladies’ accommodation',
    roomAllocation:{
      year1:'Old Boys Hostel is reported for first-year MBBS boys; first-year girls allotted subject to availability',
      year2:'Boys commonly move to Apna Boys Hostel / R.M. Bhatt hostel; girls distributed by availability/merit under hostel SOP',
      year3:'Hostel/block depends on allotment; sharing is common',
      year4:'Hostel/block depends on allotment; sharing is common',
      internship:'Ladies-hostel SOP covers room distribution through internship; exact sharing pattern not fully verified'
    },
    annualFee:'Very low government-hostel fee reported; exact current UG hostel amount not reliably extracted',
    messMonthly:'No uniform mess across all blocks; R.M. Bhatt has a large canteen. Student reports cite inexpensive campus food but exact current prices vary',
    messDetails:'Mess/canteen arrangement is block-dependent. Recent students rate boys’ mess food poorly; the campus has several canteens as alternatives.',
    wifi:'No campus/hostel Wi‑Fi in older student reports; current block-specific connectivity not verified',
    bathroom:'Common bathrooms/toilets; repeated recent complaints of too few facilities in boys’ hostels',
    readingRoom:true,
    commonRoom:true,
    gym:true,
    sportsNearby:true,
    renovationStatus:'Boys’ hostel repair/renovation was reported as work-in-progress in 2025; students expected improvement after completion',
    roomCondition:'Major current weakness: 2025 MBBS review describes boys’ hostels as badly deteriorated but under renovation/work-in-progress',
    hygiene:'Mixed-to-poor in older boys’ hostels; bathroom/toilet availability is a repeated complaint',
    officialNotes:[
      'Grant Government Medical College & Sir J.J. Group of Hospitals has a large 40+ acre campus and active UG hostel system.',
      'A published ladies-hostel SOP gives outstation students preference over local students and allocates rooms from second year through internship partly by academic merit.',
      'First-year ladies-hostel rooms are allotted according to admission and room availability.'
    ],
    studentNotes:[
      'A verified 2025 MBBS review reports 5 hostels on the JJ campus and describes Old Boys Hostel for first year, with Apna Boys and R.M. Bhatt used subsequently.',
      'The same review calls the boys’ hostel infrastructure badly deteriorated but under active repair/renovation.',
      'Students report a hostel gym, reading room and canteen access, but mess quality and bathroom infrastructure are common negatives.'
    ],
    sources:[
      'https://gmcjjh.edu.in/',
      'https://gmcjjh.edu.in/student-corner-details/',
      'https://www.scribd.com/document/782403735/SOP-forms-of-ladies-of-2024',
      'https://www.shiksha.com/college/grant-medical-college-mumbai-central-mumbai-29767/reviews?bc=102',
      'https://www.shiksha.com/college/grant-medical-college-mumbai-central-mumbai-29767/infrastructure'
,
      'https://collegedunia.com/reviews/922116-siddhesh-review-on-grant-medical-college-and-sir-j-j-group-of-hospitals-mumbai',
      'https://www.hindustantimes.com/cities/mumbai-news/jj-resident-docs-sound-alarm-over-hostel-crisis-101756751217190.html'    ],
    lastVerified:'2026-08-20',
    confidence:'Medium overall; strong recent student detail and useful ladies-hostel SOP, but exact current UG fees/room counts remain incomplete',
    researchStatus:'Exhaustive second-pass: SOP + current news + recent student/review evidence'
  })
};

const CLINICAL_EXPOSURE = {
  64: {
    hospitals:'AIIMS Main Hospital + JPN Apex Trauma Centre + major specialty centres',
    beds:'Current aggregate across the AIIMS New Delhi network not reliably extracted',
    opd:'National tertiary/quaternary referral centre; current aggregate OPD total not inserted without a clean official figure',
    emergency:'24×7 main emergency plus dedicated JPN Apex Trauma Centre',
    ipd:null,
    surgery:'Surgical Block alone lists 209 beds including ICU, HDU and trauma ICU',
    trauma:'Dedicated JPN Apex Trauma Centre (JPNATC)',
    superspecialty:'Very broad superspecialty ecosystem including cardio-neuro, ophthalmology, oncology and dedicated trauma services',
    patientMix:'National referral case mix with high-complexity tertiary and quaternary disease',
    teaching:'MBBS clinical postings occur within a multi-centre tertiary referral ecosystem; exact UG procedure autonomy is not quantified here',
    confidence:'High for hospital/specialty structure; Medium for aggregate current volume because a clean current network total was not extracted',
    sources:[
      {label:'AIIMS Annual Reports',url:'https://www.aiims.edu/index.php/en/about-us/annual-reports'},
      {label:'AIIMS Surgical Block beds',url:'https://aiims.edu/index.php/en/departments-and-centers/122-surgical-disciplines'},
      {label:'AIIMS/JPNATC current hospital infrastructure',url:'https://www.aiims.edu/index.php/en/2014-11-05-10-00-53/outpatient-services/133-tender/global-open-tender/24326-advanced-hospital-beds-with-side-cabinet-overbed-table-94-qty-at-jpnatc-aiims-new-delhi'}
    ]
  },
  262: {
    hospitals:'AIIMS Jodhpur Hospital + dedicated Trauma & Emergency Block',
    beds:'Current aggregate bed strength not reliably extracted from the live portal',
    opd:'Live official portal snapshots repeatedly show roughly 5,000–5,700 OPD registrations/day',
    emergency:'Live portal snapshots show roughly 67–200 emergency registrations/day',
    ipd:null,
    surgery:'Dedicated trauma/emergency facilities plus advanced surgical services across neurosurgery, surgical gastroenterology, urology and other departments',
    trauma:'Dedicated Trauma & Emergency Block with active 24×7 service',
    superspecialty:'Tertiary PMSSY institute; Centre of Excellence for Rare Diseases and broad superspecialty services',
    patientMix:'Large Rajasthan/western India tertiary-referral catchment',
    teaching:'Strong tertiary clinical environment; live patient-load figures are snapshots rather than annual averages',
    confidence:'High for live OPD/emergency snapshots and tertiary-service structure; Medium for aggregate bed count',
    sources:[
      {label:'AIIMS Jodhpur live portal',url:'https://www.aiimsjodhpur.edu.in/index.php/result/con_contact.php'},
      {label:'AIIMS Jodhpur OPD services',url:'https://www.aiimsjodhpur.edu.in/research/opdservices/OPD.pdf'},
      {label:'AIIMS Jodhpur Trauma/Emergency infrastructure',url:'https://aiimsjodhpur.edu.in/tendernew.php/tender/tender/2024/tender/2025/02/Extension-2-ENT%20Neuro-130225.pdf'}
    ]
  },
  72: {
    hospitals:'Safdarjung Hospital, including its Super Speciality Block',
    beds:'Current aggregate bed figure not inserted without a clean current official total',
    opd:'3,928,776 OPD visits in 2025',
    emergency:'642,883 emergency visits in 2025',
    ipd:'192,107 inpatient admissions in 2025',
    surgery:'High procedural load across general and superspecialty services; cancer surgery alone reports ~325–350 operations/year',
    trauma:'Extremely high emergency volume; multiple specialty emergency services including 24-hour cardiac emergency',
    superspecialty:'Large central-government tertiary hospital with dedicated super-speciality services, cardiology, oncology and multiple surgical disciplines',
    patientMix:'Very large Delhi/NCR and national referral catchment',
    teaching:'High-volume teaching hospital; 2025 activity also includes 14.7M laboratory tests and 609k radiological tests',
    confidence:'High — current official 2025 hospital activity statistics',
    sources:[
      {label:'VMMC/Safdarjung 2025 annual situation',url:'https://www.vmmc-sjh.mohfw.gov.in/hi'},
      {label:'VMMC/Safdarjung annual reports',url:'https://vmmc-sjh.mohfw.gov.in/annual-reports'},
      {label:'Safdarjung cardiology services',url:'https://vmmc-sjh.mohfw.gov.in/cardiology'}
    ]
  },
  69: {
    hospitals:'Lok Nayak Hospital + G.B. Pant GIPMER + Guru Nanak Eye Centre + MAIDS',
    beds:'~2,800 beds across the associated teaching ecosystem',
    opd:'~7,200 daily outpatient attendance',
    emergency:'Major acute/emergency exposure through the associated government-hospital network',
    ipd:null,
    surgery:'47 operation theatres reported running daily',
    trauma:'Large public-hospital emergency case mix; exact annual emergency total not extracted',
    superspecialty:'Unusually broad linked ecosystem, including G.B. Pant cardio-neuro superspecialty services and Guru Nanak Eye Centre',
    patientMix:'High-volume central Delhi public-sector catchment with broad socioeconomic and disease diversity',
    teaching:'Large bedside teaching ecosystem spread across four associated institutions',
    confidence:'High — official MAMC institutional figures for beds, OPD and OTs',
    sources:[
      {label:'MAMC official homepage',url:'https://mamc.delhi.gov.in/'}
    ]
  },
  65: {
    hospitals:'Dr. Ram Manohar Lohia Hospital (ABVIMS teaching hospital)',
    beds:'Current aggregate bed strength not inserted without a clean current official total',
    opd:'~1.8 million OPD visits/year',
    emergency:'~275,000 emergency attendances/year; 24×7 Medicine, Surgery, Orthopaedics and Paediatrics emergency',
    ipd:'~67,000 inpatient admissions/year',
    surgery:'~11,000 major + ~49,000 minor operations/year',
    trauma:'Emergency Medicine includes a 16-bed red-zone ECR and 9-bed disaster ward; multidisciplinary resuscitation and trauma procedures',
    superspecialty:'Cath lab, CTVS, neurosurgery, CCU/ICU and multiple tertiary specialties',
    patientMix:'Large central Delhi / national-government referral catchment',
    teaching:'Emergency Medicine explicitly trains MBBS students and interns through rounds, case discussions and multidisciplinary care',
    confidence:'High — official RML hospital service and Emergency Medicine pages',
    sources:[
      {label:'RML Hospital overview/statistics',url:'https://rmlh.nic.in/Contents.aspx?langid=1&lev=2&lid=142&lsid=137&pid=8'},
      {label:'RML Emergency Medicine scope',url:'https://rmlh.nic.in/departments.aspx?dept_id=1046&dept_links_id=5&langid=1&lev=1&lid=3324&lsid=136&office_id=1'},
      {label:'RML Emergency Medicine teaching',url:'https://www.rmlh.nic.in/departments.aspx?dept_id=1046&dept_links_id=1&langid=1&lev=1&lid=3324&lsid=136&office_id=1'}
    ]
  },
  71: {
    hospitals:'Guru Teg Bahadur (GTB) Hospital',
    beds:'1,526 beds on the current UCMS institutional page',
    opd:'UCMS publishes 2023–24 GTB OPD/IPD medical-record datasets; exact total is not inserted here until cleanly extracted',
    emergency:'Large East Delhi government teaching-hospital emergency service; exact annual count not inserted',
    ipd:'Official NAAC records include 2023–24 IPD data; exact total not inserted here until cleanly extracted',
    surgery:'Broad tertiary teaching services with dedicated hospital teaching facilities',
    trauma:null,
    superspecialty:'Large multispecialty government teaching hospital with strong laboratory and referral services',
    patientMix:'East Delhi plus surrounding border-area catchment',
    teaching:'UCMS explicitly describes GTB as its associated teaching hospital; strong clinical-research infrastructure including a DHR/ICMR Multidisciplinary Research Unit',
    confidence:'High for 1,526-bed figure and teaching-hospital role; Medium for volume because the current NAAC totals were not extracted into this build',
    sources:[
      {label:'UCMS current institutional profile',url:'https://www.ucms.ac.in/aboutucms/ucms'},
      {label:'UCMS NAAC hospital datasets',url:'https://www.ucms.ac.in/misc/naac'},
      {label:'UCMS Multidisciplinary Research Unit',url:'https://www.ucms.ac.in/facility/multidiscunit'}
    ]
  },
  49: {
    hospitals:'Patna Medical College Hospital (PMCH)',
    beds:'Current aggregate operational bed figure is redevelopment-dependent and not inserted without a clean current official figure',
    opd:'Exact current official OPD volume not extracted',
    emergency:'Major Bihar tertiary emergency referral centre; exact annual volume not extracted',
    ipd:null,
    surgery:'Clinical departments span medicine, surgery, cardiology, CTVS, gastroenterology, nephrology, neurology/neurosurgery, paediatric surgery, plastic surgery, transplant surgery and urology',
    trauma:'Emergency services are active; redevelopment makes current unit-by-unit capacity fluid',
    superspecialty:'36 listed departments with substantial medical and surgical superspecialty breadth',
    patientMix:'Very broad Bihar referral population, including high-acuity tertiary cases',
    teaching:'Long-established state tertiary teaching environment; this record deliberately avoids using planned redevelopment capacity as if it were already operational',
    confidence:'High for department breadth; Medium for current scale because redevelopment is changing operational capacity',
    sources:[
      {label:'PMCH official departments',url:'https://patnamedicalcollege.edu.in/departments/37'},
      {label:'PMCH official homepage',url:'https://patnamedicalcollege.edu.in/'}
    ]
  },
  45: {
    hospitals:'IGIMS teaching hospital / institute hospital complex',
    beds:'At least a 500-bed hospital core is documented; additional 500-bed and 1,200-bed expansion projects are referenced by IGIMS',
    opd:'Institute publishes annual patient-care statistics; exact 2024–25 total not inserted until cleanly extracted',
    emergency:'85-bed fully equipped Trauma & Emergency area with triage zones, HDU, ICU, isolation, trauma/transition zones and OTs',
    ipd:null,
    surgery:'4 modular OTs + 12 semi-modular OTs, 14-bed recovery unit and 15-bed surgical ICU documented by Anaesthesiology',
    trauma:'Dedicated 24×7 Trauma & Emergency Department established in 2017',
    superspecialty:'State Cancer Institute, Regional Institute of Ophthalmology, transplant-oriented services and multiple tertiary specialties',
    patientMix:'Major Bihar tertiary/superspecialty referral population',
    teaching:'Dense tertiary and superspecialty exposure within a compact institute campus',
    confidence:'High for emergency/OT infrastructure and expansion plans; Medium for current aggregate patient volume',
    sources:[
      {label:'IGIMS Trauma & Emergency',url:'https://igims.org/Topics.aspx?mid=Trauma+and+Emergency'},
      {label:'IGIMS Anaesthesiology/Critical Care',url:'https://www.igims.org/Topics.aspx?mid=Anaesthesiology'},
      {label:'IGIMS achievements/expansion',url:'https://www.igims.org/topics.aspx?mid=Achievement'},
      {label:'IGIMS patient-care statistics hub',url:'https://igims.org/topics.aspx?mid=Patient+Care'}
    ]
  },
  402: {
    hospitals:'Gandhi Memorial & Associated Hospitals + KGMU Trauma Centre',
    beds:'Over 4,000 functional beds',
    opd:'~10,000 new OPD patients/day',
    emergency:'Trauma Centre lists 491 emergency beds',
    ipd:'Over 4,000 patients admitted at any given time according to KGMU institutional profile',
    surgery:'Very high procedural volume across broad surgical and superspecialty departments; General Surgery alone reported 2,815 major + 3,756 minor operations in 2021–22',
    trauma:'Level-1 trauma facility; 491 emergency beds, 149 ventilators, 7+ OTs, dedicated neurotrauma services',
    superspecialty:'Extensive DM/MCh ecosystem across many medical and surgical superspecialties',
    patientMix:'Massive Uttar Pradesh tertiary-referral catchment with high trauma and complex disease volume',
    teaching:'Extremely high-volume bedside and emergency ecosystem; exact UG hands-on autonomy is not scored',
    confidence:'High — current KGMU institutional and Trauma Centre pages',
    sources:[
      {label:'KGMU institutional profile',url:'https://www.kgmu.org/about-us.php'},
      {label:'KGMU Trauma Centre',url:'https://www.kgmu.org/hospital_trauma1.php'},
      {label:'KGMU General Surgery statistics',url:'https://kgmu.org/department_details.php?dept_id=31&dept_type=2&page_type=in_patient_services'}
    ]
  },
  220: {
    hospitals:'Sir J.J. Group of Hospitals',
    beds:'1,885 beds',
    opd:'~1.2 million outpatients/year',
    emergency:'Large tertiary public-hospital emergency network; exact annual emergency total not published on the summary page',
    ipd:'~80,000 inpatients/year',
    surgery:'Broad surgical ecosystem with modern general-surgery OT/endoscopy facilities; multiple departments publish large operative volumes',
    trauma:'Major metropolitan tertiary emergency exposure; exact dedicated trauma volume not extracted',
    superspecialty:'Wide medical/surgical specialty mix across the J.J. Group; paediatrics includes PICU, NICU and subspecialty clinics',
    patientMix:'Mumbai, Maharashtra and central-India tertiary referral population',
    teaching:'Long-established high-volume public teaching-hospital ecosystem',
    confidence:'High — current official Grant/J.J. institutional summary and department pages',
    sources:[
      {label:'Grant/J.J. official institutional summary',url:'https://gmcjjh.edu.in/'},
      {label:'Grant/J.J. department & PGMSR data',url:'https://gmcjjh.edu.in/pgmsr/'},
      {label:'J.J. Hospital OPD information',url:'https://gmcjjh.edu.in/jj-hospital-opd-information/'}
    ]
  },
  168: {"hospitals":"AIIMS Bhopal Hospital","beds":"Current official aggregate bed count not cleanly reconstructed in this pass","opd":"Large tertiary referral hospital for central Madhya Pradesh; current official daily OPD figure not inserted without a clean source","emergency":"24×7 emergency services","ipd":null,"surgery":"Broad surgical and specialty services across an AIIMS tertiary-care setup","trauma":"Emergency/trauma exposure present; exact dedicated trauma-bed figure not reconstructed","superspecialty":"Broad and expanding AIIMS superspecialty ecosystem","patientMix":"Regional tertiary referral mix from Bhopal and central Madhya Pradesh","teaching":"Strong tertiary-care clinical environment; exact UG hands-on autonomy varies by unit","confidence":"Medium: current hospital service profile is clear, but a clean official aggregate volume figure was not recovered","sources":[{"label":"Source 1","url":"https://bhopaldivisionmp.nic.in/en/public-utility/all-india-institute-of-medical-sciences-bhopal/"},{"label":"Source 2","url":"https://www.shiksha.com/university/aiims-bhopal-all-india-institute-of-medical-sciences-65401/reviews"}]},
  239: {"hospitals":"AIIMS Bhubaneswar Hospital","beds":"Large multi-department IPD; official live IPD page publishes department-wise bed strength","opd":"High-volume tertiary referral centre for Odisha and eastern India; current aggregate OPD total not inserted","emergency":"24×7 Emergency Medicine/Casualty","ipd":"Department-wise inpatient capacity published on official IPD page","surgery":"Broad surgical, burn/plastic, CTVS, gastro, neuro and other procedural services","trauma":"Emergency Medicine plus tertiary surgical services","superspecialty":"Very broad AIIMS superspecialty ecosystem with burn, cardiac, endocrine, gastro and advanced surgical services","patientMix":"Eastern-India tertiary referral mix with substantial underserved-patient exposure","teaching":"High-complexity bedside exposure in an established AIIMS hospital","confidence":"High for hospital breadth/bed structure; Medium for aggregate current volume","sources":[{"label":"Source 1","url":"https://aiimsbhubaneswar.nic.in/ipd/"},{"label":"Source 2","url":"https://aiimsbhubaneswar.nic.in/research-home/"},{"label":"Source 3","url":"https://aiimsbhubaneswar.nic.in/student-portal/"}]},
  372: {"hospitals":"AIIMS Rishikesh Hospital","beds":"1,060 inpatient beds on current official About page","opd":"Growing high-volume OPD with 85+ specialty clinics; clean current aggregate daily total not inserted","emergency":"24×7×365 emergency with separate Trauma Surgery and Emergency Medicine services","ipd":"1,060 beds across specialties","surgery":"Advanced surgical and interventional services including CTVS, neurosurgery, GI, urology and more","trauma":"Separate Trauma Surgery service; air-ambulance capability documented","superspecialty":"Very broad tertiary/superspecialty portfolio including Nuclear Medicine","patientMix":"Large referral catchment across Uttarakhand and difficult Himalayan terrain","teaching":"High-acuity emergency/trauma and superspecialty exposure in a large teaching hospital","confidence":"High","sources":[{"label":"Source 1","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=205"},{"label":"Source 2","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=657"}]},
  189: {"hospitals":"AIIMS Nagpur Hospital","beds":"940 functional beds; 110 ICU beds","opd":"3,500–4,000 outpatient visits/day","emergency":"100–120 emergency patients/day","ipd":"100–120 admissions/day","surgery":"40–45 major surgeries/day; 19 modular operation theatres","trauma":"Dedicated emergency block; expanding advanced emergency capability","superspecialty":"Broad tertiary portfolio including transplant, CTVS, oncology and advanced ICUs","patientMix":"Vidarbha and adjoining-state tertiary referral population","teaching":"Strong and rapidly maturing tertiary-care exposure with modern infrastructure","confidence":"High; current official 2026 figures","sources":[{"label":"Source 1","url":"https://aiimsnagpur.edu.in/about-us"},{"label":"Source 2","url":"https://aiimsnagpur.edu.in/campus"}]},
  38: {"hospitals":"AIIMS Patna Hospital","beds":"~960 beds reported in 2025; expansion planned","opd":"High-demand tertiary referral centre with documented capacity pressure","emergency":"Emergency and critical-care expansion specifically identified as a priority","ipd":"High occupancy/capacity pressure reported","surgery":"Broad AIIMS surgical and specialty services","trauma":"Emergency/critical-care exposure; current dedicated trauma metrics not reconstructed","superspecialty":"Growing tertiary/superspecialty referral ecosystem for Bihar","patientMix":"Large Bihar referral catchment with substantial complex and underserved cases","teaching":"Strong patient volume; infrastructure continues to expand with demand","confidence":"Medium-High for bed/capacity context; exact current daily volumes not inserted","sources":[{"label":"Source 1","url":"https://aiimspatna.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/patna/aiims-to-increase-bed-capacity/articleshow/123548928.cms"}]},
  255: {"hospitals":"JIPMER Main Hospital + Super Specialty Block + EMS + Women & Children Hospital + Regional Cancer Centre","beds":"2,059 beds on JIPMER general information page","opd":"More than 5,000 OPD visits/day","emergency":"More than 700 Emergency Medical Services attendances/day","ipd":"More than 60,000 admissions/year","surgery":"Broad tertiary and superspecialty procedural ecosystem","trauma":"Emergency Medical Services; advanced trauma/rehabilitation expansion planned","superspecialty":"Very broad INI-level tertiary/superspecialty services across 40+ departments","patientMix":"Puducherry plus large Tamil Nadu and multi-state referral catchment; many low-income patients","teaching":"Exceptionally dense clinical exposure in a long-established teaching-referral institute","confidence":"High, though some general-info counts are from an older official profile","sources":[{"label":"Source 1","url":"https://jipmer.ac.in/about-us/about-jipmer"},{"label":"Source 2","url":"https://jipmer.ac.in/about-us/general-information/jipmer-info"},{"label":"Source 3","url":"https://jipmer.edu.in/announcement/mbbs-admissions-jipmer-2025-26"}]},
  288: {"hospitals":"SMS Hospital and multiple attached specialty hospitals, Jaipur","beds":"Large multi-hospital teaching ecosystem; clean current aggregate bed total not reconstructed","opd":"Official/state profile describes one of India’s largest OPD systems","emergency":"Major Rajasthan tertiary emergency/trauma referral centre","ipd":"High-volume statewide referral system","surgery":"Broad surgical and superspecialty exposure","trauma":"Major trauma workload; 2025 ICU fire temporarily affected part of trauma critical care","superspecialty":"Extensive tertiary/superspecialty network","patientMix":"Statewide Rajasthan referral population with very high public-sector volume","teaching":"Very high patient load and broad clinical case mix","confidence":"Medium-High; aggregate current numeric totals need a cleaner official extract","sources":[{"label":"Source 1","url":"https://medicaleducation.rajasthan.gov.in/smsjaipur/"},{"label":"Source 2","url":"https://rmj.rajasthan.gov.in/smscollege.html"}]},
  75: {"hospitals":"Civil Hospital Ahmedabad teaching complex","beds":"One of India’s largest public teaching-hospital complexes; current exact aggregate not reconstructed here","opd":"Very high-volume tertiary referral environment","emergency":"Major Gujarat public emergency/trauma referral centre","ipd":"Large statewide referral load","surgery":"Broad surgical, transplant and superspecialty exposure across Civil Hospital campus","trauma":"High-volume emergency/trauma context","superspecialty":"Broad tertiary/superspecialty ecosystem","patientMix":"Large Gujarat and western-India public referral catchment","teaching":"Excellent clinical volume; hostel/campus operations were disrupted by the 2025 AI171 crash","confidence":"Medium for clinical summary; current official numeric volume not cleanly extracted","sources":[{"label":"Source 1","url":"https://www.bjmcabd.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/ahmedabad/new-hostel-to-come-up-at-ai-171-crash-site-gujarat-govt/articleshow/129664098.cms"}]},
  360: {"hospitals":"Osmania General Hospital + associated teaching hospitals","beds":"Current OGH serves a very large inpatient load; new 2,000-bed Goshamahal complex under construction","opd":"Current OGH reported at >3,000 outpatients/day","emergency":"High-volume Hyderabad public emergency care","ipd":"~1,200 inpatients/day reported for current OGH","surgery":"Broad surgical/superspecialty services; future complex plans 41 OTs","trauma":"Major urban emergency/trauma exposure","superspecialty":"Broad legacy tertiary-care network; major modernization underway","patientMix":"Dense Hyderabad/Telangana public-sector referral catchment","teaching":"Very high clinical volume, but infrastructure is in a major transition/redevelopment phase","confidence":"Medium-High; current load from government-reported redevelopment coverage","sources":[{"label":"Source 1","url":"https://osmaniamedicalcollege.org/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/hyderabad/osmania-hospital-revamp-model-unveiled-at-summit/articleshow/125844087.cms"}]},
  440: {"hospitals":"SSKM Hospital + Bangur Institute of Neurosciences + multiple annex hospitals","beds":"Large multi-annex tertiary network; new 131-bed Ananya block opened in 2025 and >350-bed cancer hub added in 2026","opd":"Very high-demand tertiary referral system; aggregate current daily total not inserted","emergency":"Major Kolkata tertiary emergency service","ipd":"Large multispecialty inpatient referral network","surgery":"Robotic surgery and advanced surgical services expanding","trauma":"Urban tertiary emergency exposure","superspecialty":"Extremely broad; neuro, cardiac, transplant, oncology, rare diseases and multiple centres of excellence","patientMix":"West Bengal and eastern-India referral population","teaching":"High-complexity government tertiary-care exposure with rapid superspecialty expansion","confidence":"High for service breadth/recent expansion; Medium for aggregate volume","sources":[{"label":"Source 1","url":"https://www.ipgmer.gov.in/"},{"label":"Source 2","url":"https://www.ipgmer.gov.in/mbbs_admission_2026_all_india"}]},
  226: {"hospitals":"KEM Hospital, Mumbai","beds":"1,800 beds","opd":"~1.8 million outpatients/year","emergency":"Major 24×7 municipal tertiary emergency service","ipd":"~85,000 inpatients/year","surgery":"Extensive basic-to-advanced surgical and superspecialty workload","trauma":"Major urban emergency and surgical referral exposure","superspecialty":"Very broad; major tertiary and advanced specialty services","patientMix":"Extremely diverse Mumbai municipal referral population","teaching":"Classic high-volume bedside training environment with heavy public-sector case load","confidence":"High; official KEM profile","sources":[{"label":"Source 1","url":"https://www.kem.edu/"},{"label":"Source 2","url":"https://www.kem.edu/gsmckemh/about/about-kem-hospital/"},{"label":"Source 3","url":"https://www.kem.edu/college"}]},
  230: {"hospitals":"BYL Nair Charitable Hospital, Mumbai","beds":"Large municipal tertiary teaching hospital; clean current bed total not reconstructed","opd":"High-volume South/Central Mumbai public hospital","emergency":"24×7 municipal emergency exposure","ipd":"High public-sector inpatient load","surgery":"Broad surgical/superspecialty exposure","trauma":"Urban emergency/trauma exposure","superspecialty":"Broad tertiary specialties and teaching departments","patientMix":"Dense Mumbai municipal catchment","teaching":"High clinical volume in a compact urban teaching-hospital environment","confidence":"Medium; current numeric workload not cleanly extracted","sources":[{"label":"Source 1","url":"https://tnmcnair.edu.in/"},{"label":"Source 2","url":"https://tnmcnair.edu.in/courses-and-fees/"}]},
  51: {"hospitals":"GMCH Sector 32, Chandigarh","beds":"~1,198 beds cited in the 2026 MBBS seat-expansion proposal","opd":"High patient load from Chandigarh and neighbouring states","emergency":"Major regional emergency service","ipd":"Large tertiary inpatient base","surgery":"Broad tertiary surgical services","trauma":"Regional emergency/trauma exposure","superspecialty":"Broad government tertiary-care portfolio","patientMix":"Chandigarh plus Punjab, Haryana and Himachal referral catchment","teaching":"Strong regional clinical exposure with comparatively organized infrastructure","confidence":"Medium-High; bed count from 2026 administration proposal","sources":[{"label":"Source 1","url":"https://gmch.gov.in/"},{"label":"Source 2","url":"https://gmch.gov.in/educational/hostels"},{"label":"Source 3","url":"https://gmch.gov.in/academic-fee"}]},
  66: {"hospitals":"Dr Baba Saheb Ambedkar Hospital, Rohini","beds":"500–550 functional beds","opd":"Large North/North-West Delhi public-hospital OPD; current daily total not inserted","emergency":"Round-the-clock emergency and maternity services","ipd":">150 admissions/day; 500 indoor beds plus ICU/CCU capacity","surgery":"Major core specialties with selected superspecialties","trauma":"Urban public emergency exposure","superspecialty":"Selected superspecialties including Neurosurgery, Nephrology, Pulmonology and Urology","patientMix":"North and North-West Delhi urban public catchment","teaching":"Good generalist clinical volume; less superspecialty breadth than the largest Delhi teaching hospitals","confidence":"High for current official hospital capacity","sources":[{"label":"Source 1","url":"https://bsamch.ac.in/"},{"label":"Source 2","url":"https://bsah.delhi.gov.in/bsah/about-us"},{"label":"Source 3","url":"https://bsamch.ac.in/fee-structure/"}]},
  129: {"hospitals":"RIMS Ranchi Hospital","beds":"Large Jharkhand tertiary referral hospital; exact current aggregate bed total not inserted","opd":"2,501 OPD visits on 04 Aug 2026 live dashboard","emergency":"277 emergency visits on 04 Aug 2026 live dashboard","ipd":"298 admissions on 04 Aug 2026 live dashboard","surgery":"Broad state tertiary-care surgical services","trauma":"Emergency/critical care ~130 beds reported in 2025 coverage","superspecialty":"Broad tertiary portfolio; major RIMS-2 superspecialty expansion planned","patientMix":"Statewide Jharkhand referral population, including rural/tribal catchment","teaching":"High public-sector volume and broad disease diversity","confidence":"High for live 2026 daily dashboard; Medium for aggregate bed picture","sources":[{"label":"Source 1","url":"https://rimsranchi.ac.in/"}]},
  181: {"hospitals":"M.Y. Hospital + Super Specialty Hospital + Cancer Hospital + MTH + Chacha Nehru Hospital + Mental Hospital","beds":"M.Y. Hospital 930 beds; additional attached hospitals expand the ecosystem","opd":"Very high Indore/Malwa referral load; clean current aggregate daily figure not inserted","emergency":"24×7 M.Y. Hospital services","ipd":"Large multi-hospital inpatient network","surgery":"Broad tertiary and superspecialty surgical exposure","trauma":"Major regional casualty/emergency exposure","superspecialty":"Strong multi-hospital ecosystem including dedicated super-specialty and cancer services","patientMix":"Indore, Malwa and western Madhya Pradesh referral catchment","teaching":"Very strong breadth because students rotate through several major attached hospitals","confidence":"High for hospital network/930-bed MYH figure","sources":[{"label":"Source 1","url":"https://www.mgmmcindore.in/"},{"label":"Source 2","url":"https://www.mgmmcindore.in/hostel-committee.aspx"},{"label":"Source 3","url":"https://www.mgmmcindore.in/dean-message.aspx"}]},
  211: {"hospitals":"Government Medical College & Hospital, Nagpur","beds":"Large Vidarbha tertiary teaching hospital; current official aggregate not cleanly indexed","opd":"High regional referral load","emergency":"Major Nagpur/Vidarbha emergency service","ipd":"Large public tertiary inpatient workload","surgery":"Robotic surgery, cath lab, nuclear medicine and major surgical upgrades inaugurated in 2025","trauma":"Major trauma building linked to OPD by new skywalk","superspecialty":"Strong and modernizing tertiary/superspecialty services","patientMix":"Vidarbha and central-India referral population","teaching":"High-volume traditional GMC exposure with significant recent infrastructure modernization","confidence":"Medium-High; current modernization is well documented, exact total bed/OPD figure pending","sources":[{"label":"Source 1","url":"http://www.gmcnagpur.gov.in/"},{"label":"Source 2","url":"https://nagpur.gov.in/public-utility/government-medical-college-and-hospital/"},{"label":"Source 3","url":"https://timesofindia.indiatimes.com/city/nagpur/cm-rs-1000cr-given-for-gmch-mayo-finish-all-works-in-a-year/articleshow/121253945.cms"}]},
  248: {"hospitals":"SCB Medical College Hospital + SVPPGIP and other advanced centres","beds":"2,132 current beds; redevelopment targets 3,000 in Phase 1 and 5,000 ultimately","opd":"Very high Odisha referral load; clean current daily total not inserted","emergency":"Major state tertiary emergency service","ipd":"2,132-bed current tertiary system","surgery":"Extensive surgery, transplant and superspecialty exposure","trauma":"High-acuity statewide emergency/trauma referral context","superspecialty":"Very broad: cardiac, neuro, renal, endocrine, gastro, hematology, hepatology and more","patientMix":"Statewide Odisha tertiary referral population","teaching":"Exceptional breadth and high public-sector volume; redevelopment may create temporary operational variability","confidence":"High for bed count/superspecialty breadth","sources":[{"label":"Source 1","url":"https://scbmch.odisha.gov.in/en/light/subpage/infrastructure-facilities"},{"label":"Source 2","url":"https://www.scbmch.com/admissions/index.html"}]},
  327: {"hospitals":"Government Stanley Hospital + RSRM and specialty institutes","beds":"1,661 beds on official NMC pro-forma","opd":"1,622,789 outpatients in 2021; historical pre-pandemic total 2.56 million in 2019","emergency":"30 emergency beds on official pro-forma","ipd":"77,483 admissions in 2021","surgery":"Large 8-storey surgical complex; up to ~40 simultaneous surgeries historically described","trauma":"High-volume North Chennai public emergency/surgical exposure","superspecialty":"Strong transplant, hand/plastic surgery, surgical GI and other specialty heritage","patientMix":"Dense North Chennai public catchment with high socioeconomic diversity","teaching":"Very high traditional government-hospital case exposure","confidence":"High for official bed/2021 activity data; newer aggregate activity not inserted","sources":[{"label":"Source 1","url":"https://stanleymedicalcollege.ac.in/"},{"label":"Source 2","url":"https://stanleymedicalcollege.ac.in/page/pro-forma"},{"label":"Source 3","url":"https://stanleymedicalcollege.ac.in/page/ladies-hostel"}]},
  323: {"hospitals":"RGGGH + Institute of Child Health + IOG + Ophthalmic + Mental Health + Thoracic + Rehabilitation and other allied institutions","beds":"RGGGH is described by current institutional social profile as ~3,772 beds; wider MMC network is much larger","opd":"Extremely high-volume Chennai tertiary referral ecosystem","emergency":"Major government emergency and critical-care services; 46 ICUs highlighted by institutional site","ipd":"Very large multi-institution inpatient network","surgery":"Advanced transplant, interventional radiology, cardiac, neuro and oncologic procedures","trauma":"High-acuity urban referral exposure","superspecialty":"Exceptionally broad across multiple dedicated attached institutes","patientMix":"Tamil Nadu-wide and South-India public referral population","teaching":"One of the broadest public clinical ecosystems in India, spread across several attached institutions","confidence":"High for hospital-network breadth; Medium for current aggregate numeric activity","sources":[{"label":"Source 1","url":"https://www.mmcrgggh.tn.gov.in/ords/r/wsmmc/mmc12055555/home"},{"label":"Source 2","url":"https://www.tnhealth.org/tngovin/dme/dme.php"}]}

};

const ACADEMICS_TEACHING = {
  64: {
    teachingModel:'AIIMS-designed MBBS curriculum with lectures, practicals, clinical postings and institute-run internal assessment; teaching pattern has been under active reform toward more practical/clinical and simulation-oriented learning.',
    attendance:'Attendance is tracked; AIIMS has published notices awarding marks for attendance during clinical postings. The institute also publicly acknowledged poor lecture attendance in final-year MBBS and initiated teaching reforms.',
    internalAssessment:'Institute-administered internal assessment is part of the UG programme; recent reforms have included more frequent practical evaluation in some phases.',
    clinicalTeaching:'High-complexity bedside learning across the AIIMS hospital network; administration has explicitly pushed for more practical and clinical learning.',
    library:'Dr B.B. Dikshit Library; 24×7 reading/consultation access for AIIMS students, plus e-reading hall, high-speed internet, Wi-Fi and remote e-resource access.',
    readingHours:'24×7',
    learningEnvironment:'Very self-driven at senior levels; official reform discussions note that many students supplement college teaching with PG-entrance preparation.',
    studentReported:'Student reporting around the 2023 teaching-reform exercise described stronger interest in practical clinical learning and frequent practical tests, but also significant coaching-driven absenteeism.',
    confidence:'High for curriculum/internal-assessment/library structure; Medium for lived teaching culture because it varies by phase and department.',
    sources:[
      {label:'AIIMS Teaching / UG education',url:'https://www.aiims.edu/index.php/en/about-us/teaching'},
      {label:'AIIMS academic notices',url:'https://aiims.edu/index.php/en/notices_academic'},
      {label:'AIIMS B.B. Dikshit Library services',url:'https://www.aiims.edu/index.php?Itemid=3509&id=6667&lang=en&option=com_content&view=article'},
      {label:'AIIMS teaching-reform reporting',url:'https://news.careers360.com/aiims-delhi-teaching-reforms-medical-college-final-year-mbbs-practical-neet-coaching-next-exam-specialisation'}
    ]
  },
  72: {
    teachingModel:'Structured CBME-style MBBS programme with published phase-wise attendance/internal-assessment records and clinical teaching through Safdarjung Hospital.',
    attendance:'Attendance is formally monitored and published alongside internal assessment for current MBBS batches; exact exam-eligibility threshold is not inserted in this build.',
    internalAssessment:'Current MBBS notice board publishes subject-wise internal-assessment and attendance records, indicating active continuous assessment.',
    clinicalTeaching:'High-volume Safdarjung bedside/ward teaching with exposure across major specialties and superspecialties.',
    library:'Three-storey library; ground-floor reading room open round the clock, with roughly 26,000 books listed on the current English page.',
    readingHours:'Reading room 24×7',
    learningEnvironment:'Structured and attendance-tracked, with substantial hospital-based teaching; exact student-perceived faculty accessibility is not scored yet.',
    studentReported:null,
    confidence:'High for attendance/IA monitoring and library hours; Medium for teaching-culture interpretation.',
    sources:[
      {label:'VMMC MBBS notice board',url:'https://www.vmmc-sjh.mohfw.gov.in/mbbs-notice-board'},
      {label:'VMMC Library',url:'https://vmmc-sjh.mohfw.gov.in/library'},
      {label:'VMMC Students hub',url:'https://vmmc-sjh.mohfw.gov.in/students'}
    ]
  },
  69: {
    teachingModel:'DU/NMC competency-based MBBS programme with published timetables, electives, internal assessments and hospital-based clinical teaching across the MAMC-associated hospital network.',
    attendance:'Attendance is actively enforced: MAMC publishes attendance records and detainee lists for MBBS professional examinations.',
    internalAssessment:'Frequent internal-assessment notices, terminal examinations, remedial classes and re-assessment notices are published across professional years.',
    clinicalTeaching:'Large bedside teaching ecosystem across Lok Nayak, G.B. Pant GIPMER, Guru Nanak Eye Centre and MAIDS.',
    library:'College library/reading facilities are available, but a clean current official hours/capacity figure was not extracted in this pass.',
    readingHours:null,
    learningEnvironment:'Exam- and attendance-conscious academic system with substantial clinical exposure; exact faculty accessibility/lecture quality varies by department and is not scored.',
    studentReported:null,
    confidence:'High for attendance/internal-assessment enforcement and curriculum scheduling; Medium for library specifics and lived teaching culture.',
    sources:[
      {label:'MAMC current notices',url:'https://mamc.delhi.gov.in/circular-notices/476'},
      {label:'MAMC notifications / electives',url:'https://mamc.delhi.gov.in/notifications'},
      {label:'MAMC official homepage',url:'https://mamc.delhi.gov.in/'}
    ]
  },
  65: {
    teachingModel:'100-seat MBBS programme with dedicated UG Cell, modern academic building, conference/tutorial rooms, simulation/skills facilities and structured induction programmes.',
    attendance:'Attendance is tightly tracked with monthly batch-wise records; admitted MBBS students also complete AEBAS formalities through the UG Cell.',
    internalAssessment:'ABVIMS maintains a dedicated internal-assessment portal with monthly attendance records across multiple MBBS phases.',
    clinicalTeaching:'RML Hospital departments train MBBS students and interns through rounds, case discussions, clinical postings and multidisciplinary care.',
    library:'Central library with extensive journal/e-resource subscriptions; main library 9am–9pm weekdays and 9am–4pm Saturday, plus 24×7 reading room and internet/e-journal access.',
    readingHours:'Reading room 24×7',
    learningEnvironment:'Highly structured for a relatively small batch, with dedicated academic/tutorial spaces and formal induction/skills training.',
    studentReported:null,
    confidence:'High — current ABVIMS/RML official academic, attendance, campus and library pages.',
    sources:[
      {label:'ABVIMS Internal Assessment',url:'https://rmlh.nic.in/Index1.aspx?langid=1&lev=2&lid=3422&lsid=2377&pid=147'},
      {label:'ABVIMS Campus',url:'https://www.rmlh.nic.in/index1.aspx?langid=1&lev=2&lid=3572&lsid=2533'},
      {label:'ABVIMS Central Library',url:'https://rmlh.nic.in/printmain.aspx?langid=1&lev=3&lid=3568&lsid=2577'},
      {label:'ABVIMS Principal message / skills facilities',url:'https://www.rmlh.nic.in/index1.aspx?langid=2&lev=2&lid=5217&lsid=4242'}
    ]
  },
  71: {
    teachingModel:'Detailed phase-wise lecture schedules, clinical postings, early clinical exposure, family-adoption activities and small-group teaching are published through the UCMS academic portal.',
    attendance:'Formal attendance threshold was not cleanly extracted in this pass; academic schedules and posting assessments are actively administered.',
    internalAssessment:'Posting assessments, family-posting assessment and phase-wise academic activities are explicitly scheduled; exact overall IA weighting not inserted.',
    clinicalTeaching:'GTB Hospital-based clinical postings with early clinical exposure and structured small-group teaching in multiple departments.',
    library:'Central Library + 21 departmental libraries; three reading halls, computer rooms, large print/e-resource collection, and second-floor reading rooms open 24×7 on all days.',
    readingHours:'24×7 reading rooms',
    learningEnvironment:'Strong scheduled teaching infrastructure with notable access to reading spaces and e-resources; exact student-perceived strictness is not scored.',
    studentReported:null,
    confidence:'High for teaching schedules, library infrastructure and 24×7 reading rooms; Medium for attendance strictness.',
    sources:[
      {label:'UCMS Academic Activities',url:'https://www.ucms.ac.in/students/viewacademicactivities'},
      {label:'UCMS Library',url:'https://www.ucms.ac.in/facility/library'},
      {label:'UCMS MBBS course page',url:'https://www.ucms.ac.in/courses/mbbs'}
    ]
  },
  262: {
    teachingModel:'AIIMS-style integrated MBBS programme in a modern academic environment with institute-based teaching and tertiary clinical postings.',
    attendance:'Recent MBBS student reviews repeatedly report an 80% attendance requirement for exam eligibility; this was not independently recovered from a current official rulebook, so it remains student-reported.',
    internalAssessment:'Structured institute assessments are expected within the AIIMS curriculum, but a clean current official UG assessment schedule was not extracted in this pass.',
    clinicalTeaching:'Tertiary hospital postings with modern specialty exposure; institute leadership explicitly describes an engaging educational environment and continuous-learning model.',
    library:'Central Library is an active institute facility with substantial current e-resource procurement, including major journal/database packages; exact student reading-room hours were not extracted.',
    readingHours:null,
    learningEnvironment:'Modern, academically demanding and structured; recent student reviews consistently praise academics/faculty while describing attendance as strict.',
    studentReported:'Multiple 2024–25 MBBS reviews describe academics/classrooms/faculty positively and cite 80% attendance as a disliked but enforced requirement.',
    confidence:'Medium-High: strong institute evidence for academic/library environment; attendance strictness relies on consistent student reporting.',
    sources:[
      {label:'AIIMS Jodhpur institute / academic environment',url:'https://www.aiimsjodhpur.edu.in/'},
      {label:'AIIMS Jodhpur Central Library e-resources',url:'https://aiimsjodhpur.edu.in/tendernew.php/tender/tender/2024/tender/2025/02/Extension-2-ENT%20Neuro-130225.pdf'},
      {label:'Recent MBBS student reviews',url:'https://collegedunia.com/university/25796-all-india-institute-of-medical-sciences-aiims-jodhpur/reviews/page-1'}
    ]
  },
  49: {
    teachingModel:'Traditional high-volume government medical-college teaching with lecture theatres, laboratories and extensive hospital-based clinical learning; current campus systems are evolving during redevelopment.',
    attendance:'PMCH now exposes a live student-attendance overview/dashboard on its official site, indicating active attendance tracking; exact exam threshold was not extracted.',
    internalAssessment:'Exact current internal-assessment pattern was not reliably extracted in this pass.',
    clinicalTeaching:'Very high-volume bedside exposure across a broad tertiary referral hospital and 36 listed departments.',
    library:'Official site lists a college library and E-Library facility; exact current opening hours and collection statistics were not extracted.',
    readingHours:null,
    learningEnvironment:'Strongly patient-load driven and traditionally self-directed; redevelopment may affect day-to-day teaching spaces and logistics.',
    studentReported:null,
    confidence:'High for attendance dashboard/facility presence and clinical breadth; Medium-Low for current detailed teaching/IA logistics.',
    sources:[
      {label:'PMCH official homepage / attendance & facilities',url:'https://patnamedicalcollege.edu.in/'},
      {label:'PMCH departments',url:'https://patnamedicalcollege.edu.in/departments/37'}
    ]
  },
  45: {
    teachingModel:'Structured competency-based MBBS programme with published foundation courses, phase-wise timetables, family-adoption programme and clinical-posting schedules.',
    attendance:'Exact current attendance threshold was not extracted; academic calendars and posting/end-posting assessments are formally scheduled.',
    internalAssessment:'Official pages document semester exams, university exams and end-posting assessment rosters across MBBS phases.',
    clinicalTeaching:'Compact institute-based tertiary/superspecialty teaching with structured clinical postings.',
    library:'Institute/departmental library facilities and Wi-Fi-supported academic access are documented, but a clean current central-library hours/collection profile was not extracted.',
    readingHours:null,
    learningEnvironment:'More centrally organised and timetable-driven than many older state colleges; exact student-perceived teaching quality is not scored yet.',
    studentReported:null,
    confidence:'High for timetable/foundation-course/exam structure; Medium for library specifics and lived academic culture.',
    sources:[
      {label:'IGIMS MBBS timetable & foundation course',url:'https://igims.org/topics.aspx?mid=Academic+Time+Table+and+Foundation+Course+of+MBBS'},
      {label:'IGIMS academic calendar',url:'https://www.igims.org/topics.aspx?mid=Acdemic+Calendar'},
      {label:'IGIMS Paediatrics library/Wi-Fi example',url:'https://igims.org/Topics.aspx?mid=Paediatrics'}
    ]
  },
  402: {
    teachingModel:'Large university-run MBBS programme with published phase-wise teaching schedules, lectures, tutorials, demonstrations, problem-based learning, case discussions, ward teaching and simulated-patient/skills activities across departments.',
    attendance:'Exact institution-wide MBBS attendance threshold was not extracted in this pass; examination and teaching schedules are centrally administered.',
    internalAssessment:'Departments describe regular formative assessment, class tests, practical-notebook review and terminal examinations; assessment intensity is clearly structured.',
    clinicalTeaching:'Extensive ward clinics, bedside teaching, long clinics and early specialty exposure across a very large tertiary ecosystem.',
    library:'Large air-conditioned Central Library complex (~2,945 sq m) with e-library, personal reading rooms, computer lab and online resources; department libraries are also common.',
    readingHours:'Current exact central-library opening hours not inserted; personal reading rooms documented.',
    learningEnvironment:'Highly academic and examination-oriented with a very broad faculty/department base; exact student-perceived strictness is not reduced to a score.',
    studentReported:null,
    confidence:'High — current KGMU teaching schedules, department academic pages and Central Library pages.',
    sources:[
      {label:'KGMU UG teaching schedule',url:'https://www.kgmu.org/ugteachingschedule.php'},
      {label:'KGMU Academic Program',url:'https://www.kgmu.org/academic_program.php'},
      {label:'KGMU Central Library',url:'https://kgmu.org/campus_library.php'},
      {label:'KGMU example UG teaching/assessment methods',url:'https://kgmu.org/department_details.php?dept_id=17&dept_type=2&page_type=academic'}
    ]
  },
  220: {
    teachingModel:'MUHS/NMC competency-based MBBS programme with current academic calendar and master timetables published by Grant Government Medical College.',
    attendance:'Exact current MBBS attendance threshold was not extracted in this pass.',
    internalAssessment:'Structured timetable/calendar is published; exact institution-wide internal-assessment weighting/frequency was not cleanly extracted.',
    clinicalTeaching:'Hospital-based learning across the Sir J.J. Group, supported by department seminar rooms, skills/mannequin facilities and high-volume clinical services.',
    library:'Departmental libraries and seminar/educational facilities are documented; a clean current central-library hours/collection profile was not extracted.',
    readingHours:null,
    learningEnvironment:'Classic large public teaching-college model with substantial bedside exposure; formal academic scheduling is current, but lived teaching culture remains under-researched.',
    studentReported:null,
    confidence:'High for current academic calendar/timetables and department educational infrastructure; Medium-Low for attendance and central-library detail.',
    sources:[
      {label:'Grant/J.J. official downloads / academic calendar',url:'https://gmcjjh.edu.in/'},
      {label:'Grant/J.J. PGMSR educational infrastructure',url:'https://gmcjjh.edu.in/pgmsr/'},
      {label:'Grant/J.J. department pages',url:'https://gmcjjh.edu.in/departments-detail/?department=microbiology'}
    ]
  },
  168: {"teachingModel":"Student reports describe a comparatively strict, study-oriented curriculum with regular semester examinations.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Modern central library; students report easy hostel-to-library access and strong digital connectivity.","readingHours":"Not uniformly verified","learningEnvironment":"Structured and academically demanding, with strict checking reported.","studentReported":"Recent verified MBBS reviews repeatedly describe strict academics and consistent study expectations.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://bhopaldivisionmp.nic.in/en/public-utility/all-india-institute-of-medical-sciences-bhopal/"},{"label":"Source 2","url":"https://www.shiksha.com/university/aiims-bhopal-all-india-institute-of-medical-sciences-65401/reviews"}]},
  239: {"teachingModel":"Official student portal publishes teaching schedules and MBBS student notices; competency-based teaching is actively scheduled.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central Library integrated into the AIIMS academic system.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"High for schedule/academic administration; Medium for lived teaching culture","sources":[{"label":"Source 1","url":"https://aiimsbhubaneswar.nic.in/ipd/"},{"label":"Source 2","url":"https://aiimsbhubaneswar.nic.in/research-home/"},{"label":"Source 3","url":"https://aiimsbhubaneswar.nic.in/student-portal/"}]},
  372: {"teachingModel":"AIIMS competency-based curriculum with large faculty base and specialty-clinic exposure.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central Library plus hostel reading rooms; institute-wide academic resources.","readingHours":"Not uniformly verified","learningEnvironment":"Strong clinical and academic environment within a fully residential institute.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"High for infrastructure; Medium for student-experience interpretation","sources":[{"label":"Source 1","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=205"},{"label":"Source 2","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=657"}]},
  189: {"teachingModel":"Modern academic wing with lecture halls, seminar rooms, practical labs, simulation-oriented facilities and regularly published MBBS timetables.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Computerized central library with e-library facilities.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"High","sources":[{"label":"Source 1","url":"https://aiimsnagpur.edu.in/about-us"},{"label":"Source 2","url":"https://aiimsnagpur.edu.in/campus"}]},
  38: {"teachingModel":"Competency-based MBBS curriculum with lectures, practicals, small-group learning and clinical postings; institution-specific schedules and internal assessment apply.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central/college library and digital learning resources are available; exact 24×7 access is only stated where verified below.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://aiimspatna.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/patna/aiims-to-increase-bed-capacity/articleshow/123548928.cms"}]},
  255: {"teachingModel":"Long-established INI MBBS programme with strong medical-education infrastructure; JIPMER also runs a nationally recognized medical-education faculty-development ecosystem.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central Library with >75,000 books/journals and computer laboratory on official profile.","readingHours":"Not uniformly verified","learningEnvironment":"Academically strong and research-oriented, with very high clinical exposure.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"High","sources":[{"label":"Source 1","url":"https://jipmer.ac.in/about-us/about-jipmer"},{"label":"Source 2","url":"https://jipmer.ac.in/about-us/general-information/jipmer-info"},{"label":"Source 3","url":"https://jipmer.edu.in/announcement/mbbs-admissions-jipmer-2025-26"}]},
  288: {"teachingModel":"Competency-based MBBS curriculum with lectures, practicals, small-group learning and clinical postings; institution-specific schedules and internal assessment apply.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central/college library and digital learning resources are available; exact 24×7 access is only stated where verified below.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://medicaleducation.rajasthan.gov.in/smsjaipur/"},{"label":"Source 2","url":"https://rmj.rajasthan.gov.in/smscollege.html"}]},
  75: {"teachingModel":"Competency-based MBBS curriculum with lectures, practicals, small-group learning and clinical postings; institution-specific schedules and internal assessment apply.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central/college library and digital learning resources are available; exact 24×7 access is only stated where verified below.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://www.bjmcabd.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/ahmedabad/new-hostel-to-come-up-at-ai-171-crash-site-gujarat-govt/articleshow/129664098.cms"}]},
  360: {"teachingModel":"Competency-based MBBS curriculum with lectures, practicals, small-group learning and clinical postings; institution-specific schedules and internal assessment apply.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central/college library and digital learning resources are available; exact 24×7 access is only stated where verified below.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://osmaniamedicalcollege.org/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/hyderabad/osmania-hospital-revamp-model-unveiled-at-summit/articleshow/125844087.cms"}]},
  440: {"teachingModel":"Formal MBBS professional-course structure plus an active online medical-education portal with video lectures and integrated seminars.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Institutional library and online medical education resources.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"High for formal/online academic structure","sources":[{"label":"Source 1","url":"https://www.ipgmer.gov.in/"},{"label":"Source 2","url":"https://www.ipgmer.gov.in/mbbs_admission_2026_all_india"}]},
  226: {"teachingModel":"Traditional high-intensity municipal teaching model with broad UG/PG/superspecialty teaching and extensive bedside training.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Established medical-college library resources; exact current reading hours not reconstructed.","readingHours":"Not uniformly verified","learningEnvironment":"Highly clinical, self-driven environment with strong academic legacy.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium-High","sources":[{"label":"Source 1","url":"https://www.kem.edu/"},{"label":"Source 2","url":"https://www.kem.edu/gsmckemh/about/about-kem-hospital/"},{"label":"Source 3","url":"https://www.kem.edu/college"}]},
  230: {"teachingModel":"Competency-based MBBS curriculum with lectures, practicals, small-group learning and clinical postings; institution-specific schedules and internal assessment apply.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central/college library and digital learning resources are available; exact 24×7 access is only stated where verified below.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://tnmcnair.edu.in/"},{"label":"Source 2","url":"https://tnmcnair.edu.in/courses-and-fees/"}]},
  51: {"teachingModel":"Organized government medical-college teaching environment with current digital fee/student systems and structured academic administration.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central library and college learning infrastructure; exact 24×7 hours not verified.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium-High","sources":[{"label":"Source 1","url":"https://gmch.gov.in/"},{"label":"Source 2","url":"https://gmch.gov.in/educational/hostels"},{"label":"Source 3","url":"https://gmch.gov.in/academic-fee"}]},
  66: {"teachingModel":"Newer Delhi government medical college with dedicated academic facilities, labs, library, demonstration rooms and MEU activity.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Dedicated library facilities listed by BSAMCH.","readingHours":"Not uniformly verified","learningEnvironment":"Smaller/younger academic ecosystem than legacy Delhi colleges, with direct access to a busy attached hospital.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"High for infrastructure; Medium for teaching culture","sources":[{"label":"Source 1","url":"https://bsamch.ac.in/"},{"label":"Source 2","url":"https://bsah.delhi.gov.in/bsah/about-us"},{"label":"Source 3","url":"https://bsamch.ac.in/fee-structure/"}]},
  129: {"teachingModel":"Competency-based MBBS curriculum with lectures, practicals, small-group learning and clinical postings; institution-specific schedules and internal assessment apply.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central/college library and digital learning resources are available; exact 24×7 access is only stated where verified below.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://rimsranchi.ac.in/"}]},
  181: {"teachingModel":"Department pages explicitly describe CBME lectures, demonstrations, tutorials, small-group discussions, clinical problems and vertical/horizontal integration.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"College library and academic facilities within a self-contained central Indore campus.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"High for teaching-method evidence","sources":[{"label":"Source 1","url":"https://www.mgmmcindore.in/"},{"label":"Source 2","url":"https://www.mgmmcindore.in/hostel-committee.aspx"},{"label":"Source 3","url":"https://www.mgmmcindore.in/dean-message.aspx"}]},
  211: {"teachingModel":"Competency-based MBBS curriculum with lectures, practicals, small-group learning and clinical postings; institution-specific schedules and internal assessment apply.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central/college library and digital learning resources are available; exact 24×7 access is only stated where verified below.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium","sources":[{"label":"Source 1","url":"http://www.gmcnagpur.gov.in/"},{"label":"Source 2","url":"https://nagpur.gov.in/public-utility/government-medical-college-and-hospital/"},{"label":"Source 3","url":"https://timesofindia.indiatimes.com/city/nagpur/cm-rs-1000cr-given-for-gmch-mayo-finish-all-works-in-a-year/articleshow/121253945.cms"}]},
  248: {"teachingModel":"Competency-based MBBS curriculum with lectures, practicals, small-group learning and clinical postings; institution-specific schedules and internal assessment apply.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central Library has >500 seats and separate UG/PG/faculty sections; recognized as an eastern-region resource library.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"High","sources":[{"label":"Source 1","url":"https://scbmch.odisha.gov.in/en/light/subpage/infrastructure-facilities"},{"label":"Source 2","url":"https://www.scbmch.com/admissions/index.html"}]},
  327: {"teachingModel":"Competency-based MBBS curriculum with lectures, practicals, small-group learning and clinical postings; institution-specific schedules and internal assessment apply.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Central/college library and digital learning resources are available; exact 24×7 access is only stated where verified below.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://stanleymedicalcollege.ac.in/"},{"label":"Source 2","url":"https://stanleymedicalcollege.ac.in/page/pro-forma"},{"label":"Source 3","url":"https://stanleymedicalcollege.ac.in/page/ladies-hostel"}]},
  323: {"teachingModel":"NMC competency-based curriculum supplemented by twice-monthly Clinical Society meetings involving faculty and students; institutional site describes additional skills initiatives.","attendance":"Formal NMC-linked attendance requirements apply; enforcement intensity is institution/batch dependent unless separately documented.","internalAssessment":"Regular internal/formative assessment is part of the MBBS programme.","clinicalTeaching":"Clinical teaching benefits from the attached hospital system described in the clinical-exposure section.","library":"Major legacy medical-college library ecosystem; exact current hours not reconstructed.","readingHours":"Not uniformly verified","learningEnvironment":"Generally self-driven medical-school learning with institutional teaching support; intensity varies by department and phase.","studentReported":"No single student-report claim is treated as universal; details remain source-confidence dependent.","confidence":"High for institutional teaching initiatives","sources":[{"label":"Source 1","url":"https://www.mmcrgggh.tn.gov.in/ords/r/wsmmc/mmc12055555/home"},{"label":"Source 2","url":"https://www.tnhealth.org/tngovin/dme/dme.php"}]}

};

const RESEARCH_USMLE = {
  64: {
    researchStrength:'Very strong institutional research ecosystem with active basic, translational and clinical research across many departments.',
    undergradAccess:'Explicit undergraduate mentorship is documented in departments such as Biochemistry, including ICMR-STS, an AIIMS undergraduate mentorship programme and summer fellowships.',
    funding:'Large institute-wide extramural/intramural research ecosystem; undergraduate-specific funding varies by programme and mentor.',
    infrastructure:'Extensive institute research laboratories, specialty centres and faculty-led research groups; exact UG access is department-dependent.',
    studentOpportunities:'ICMR-STS, faculty mentorship, summer fellowship routes and exposure to conferences/workshops within AIIMS.',
    internationalPathway:'AIIMS hosts observership/training frameworks and elective training for foreign undergraduate medical students. This demonstrates international academic traffic, but is not the same as a formal outbound USMLE pathway for AIIMS MBBS students.',
    cityNetworking:'New Delhi location creates unusually dense access to AIIMS research units, ICMR, national institutes, conferences and visiting faculty. This is a contextual advantage rather than a guaranteed student opportunity.',
    alumniInternational:'Large international alumni footprint is widely known, but a current verified MBBS-to-US residency rate was not identified in this pass.',
    confidence:'High for research infrastructure and undergraduate mentorship; Medium for international-pathway interpretation.',
    sources:[
      {label:'AIIMS Biochemistry — undergraduate mentorship',url:'https://aiims.edu/index.php?Itemid=883&id=619&lang=en&option=com_content&view=article'},
      {label:'AIIMS observership / training',url:'https://www.aiims.edu/index.php/en/academic-section-training'},
      {label:'AIIMS undergraduate elective training',url:'https://www.aiims.edu/index.php/en/component/content/article/230-academic-section/2005-elective-training-for-undergraduate-medical-students-at-aiims'}
    ]
  },
  72: {
    researchStrength:'Strong and expanding central-government research ecosystem with DHR-funded projects, active departmental trials and a multidisciplinary research unit.',
    undergradAccess:'UG teaching is closely embedded in research-active departments, but a dedicated institution-wide undergraduate research programme was not clearly documented in this pass.',
    funding:'DHR funding, ICMR-linked projects and department-level clinical research; the Principal reports multiple DHR-approved projects and ICMR-linked PhD activity.',
    infrastructure:'MRU plus multiple research-active clinical departments; Safdarjung also hosts major clinical evaluation and diagnostic research programmes.',
    studentOpportunities:'Research-active faculty, conferences/CME activity and exposure to high-volume clinical studies; actual undergraduate project access is mentor-dependent.',
    internationalPathway:'No formal outbound USMLE/elective pipeline was verified. International pathway should be treated as student-driven.',
    cityNetworking:'Central Delhi/NCR location gives access to nearby national institutes, conferences and cross-institution academic events. This is contextual, not guaranteed.',
    alumniInternational:'Current systematic alumni-match data were not verified.',
    confidence:'High for institutional research activity; Medium-Low for undergraduate-access and international-pathway specifics.',
    sources:[
      {label:'VMMC research page',url:'https://www.vmmc-sjh.mohfw.gov.in/research'},
      {label:'VMMC Principal — DHR/ICMR research expansion',url:'https://www.vmmc-sjh.mohfw.gov.in/principals-message'},
      {label:'VMMC Pulmonary Medicine research cell',url:'https://vmmc-sjh.mohfw.gov.in/pulmonary-medicine'}
    ]
  },
  69: {
    researchStrength:'Strong research ecosystem across MAMC and its associated hospitals, with an active multidisciplinary research unit and multiple funded projects.',
    undergradAccess:'Official department information documents regular ICMR-STS participation by undergraduate students; one department reports more than five UG STS students each year.',
    funding:'ICMR, WHO, government and other funded projects are documented across departments; MRU supports intramural research activity.',
    infrastructure:'Multidisciplinary Research Unit plus research-active departments across the MAMC/LNJP/GIPMER ecosystem.',
    studentOpportunities:'ICMR-STS, faculty-led projects, workshops, conferences and access to a large multi-hospital academic network.',
    internationalPathway:'No formal college-run USMLE/elective pipeline was verified. International preparation appears student/alumni driven rather than institutionally packaged.',
    cityNetworking:'Central Delhi location offers high conference density and proximity to major academic/research institutes; this is a practical networking advantage.',
    alumniInternational:'Large alumni network exists, but a current verified MBBS-to-US match rate was not identified.',
    confidence:'High for undergraduate research access and research infrastructure; Medium for international-pathway context.',
    sources:[
      {label:'MAMC Research Publication / UG STS',url:'https://mamc.delhi.gov.in/hi/node/9830'},
      {label:'MAMC Multidisciplinary Research Unit',url:'https://mamc.delhi.gov.in/mamc/multidisciplinary-research-unit'},
      {label:'MAMC research notices',url:'https://mamc.delhi.gov.in/circular-notices/505'}
    ]
  },
  65: {
    researchStrength:'Growing research ecosystem. ABVIMS states that it receives DHR and ICMR research grants and monitors projects through an Institute Research Cell.',
    undergradAccess:'Senior faculty mentorship explicitly includes advice on research; a mentor-mentee programme covers MBBS batches. A dedicated UG research grant scheme was not verified.',
    funding:'DHR and ICMR grants are explicitly documented at institute level; multiple departments list active research projects.',
    infrastructure:'Institute Research Cell, simulation/skills facilities and research-active clinical departments within Dr RML Hospital.',
    studentOpportunities:'Faculty mentorship, research guidance, UG council activity, BLS/GCP/GLP workshops and exposure to institute projects.',
    internationalPathway:'No formal outbound USMLE or international-elective programme was verified. The pathway should be considered student-driven.',
    cityNetworking:'Central New Delhi location provides proximity to national institutes, conferences and cross-institution academic activity.',
    alumniInternational:'College is relatively young in its current MBBS form, so long-term international alumni evidence is necessarily thinner.',
    confidence:'High for institute research infrastructure and mentorship; Medium-Low for international-pathway evidence.',
    sources:[
      {label:'ABVIMS Principal — research grants / IRC',url:'https://www.rmlh.nic.in/index1.aspx?langid=2&lev=2&lid=5217&lsid=4242'},
      {label:'ABVIMS Student Corner — mentorship/career guidance',url:'https://www.rmlh.nic.in/printmain.aspx?langid=1&lev=3&lid=3575&lsid=2581'},
      {label:'ABVIMS Pathology research activity',url:'https://rmlh.nic.in/departments.aspx?dept_id=33&dept_links_id=8&langid=1&lev=1&lid=3641&lsid=136&office_id=1'}
    ]
  },
  71: {
    researchStrength:'Strong public-college research infrastructure with a DHR/ICMR-supported Multi-Disciplinary Research Unit and active intramural/collaborative projects.',
    undergradAccess:'MRU explicitly aims to encourage young scientists/clinicians and runs research-orientation, methodology, manuscript-writing and grant-writing activities; exact MBBS participation counts were not found.',
    funding:'DHR/ICMR-linked MRU projects plus departmental research projects and collaborations.',
    infrastructure:'MRU includes instrumentation, genomic, cell-culture and common facilities, with a formal Local Research Advisory Committee.',
    studentOpportunities:'Research orientation, methodology and manuscript/grant-writing workshops; project access is likely mentor/facility dependent.',
    internationalPathway:'No formal UCMS-run outbound USMLE/elective pipeline was verified in this pass.',
    cityNetworking:'Delhi location provides access to DU medical institutions, ICMR/NCDC/AIIMS-area events and a dense medical conference ecosystem.',
    alumniInternational:'Current systematic alumni-match data were not verified.',
    confidence:'High for research infrastructure; Medium for UG accessibility; Low-Medium for international-pathway specifics.',
    sources:[
      {label:'UCMS Multi-Disciplinary Research Unit',url:'https://www.ucms.ac.in/facility/multidiscunit'},
      {label:'UCMS research committees',url:'https://www.ucms.ac.in/administration/committees'},
      {label:'UCMS research project activity',url:'https://www.ucms.ac.in/administration/showcareers'}
    ]
  },
  262: {
    researchStrength:'Research-active AIIMS environment with dedicated research recruitment and tertiary clinical departments; a clean current UG-specific research programme page was not recovered.',
    undergradAccess:'ICMR-STS is available nationally to eligible MBBS students, but AIIMS Jodhpur-specific UG participation or mentorship counts were not verified in this pass.',
    funding:'Institute hosts funded research posts/projects; exact undergraduate-accessible intramural funding was not documented here.',
    infrastructure:'AIIMS tertiary-care research environment with active research recruitment and specialty departments.',
    studentOpportunities:'Potential access through faculty projects and national ICMR-STS; exact ease of entry is not publicly quantified.',
    internationalPathway:'No formal outbound USMLE/elective pipeline was verified. Public student-review evidence on USMLE resources is mixed and too weak for a strong label.',
    cityNetworking:'Jodhpur has a smaller medical-institution network than Delhi/Mumbai/Lucknow, so external conference density is likely lower; institute-internal opportunities may matter more.',
    alumniInternational:'Current systematic international-match data were not verified.',
    confidence:'Medium for institutional research environment; Low-Medium for UG access and USMLE pathway.',
    sources:[
      {label:'AIIMS Jodhpur research recruitment portal',url:'https://aiimsjodhpur.edu.in/pgadmission.php/opdservices/opdservices/pgadmission.php'},
      {label:'ICMR Short-Term Studentship',url:'https://www.icmr.gov.in/short-term-studentship-sts'}
    ]
  },
  49: {
    researchStrength:'Research activity exists within a major tertiary teaching college, but the current public website did not expose a strong structured institute-wide research portal in this pass.',
    undergradAccess:'ICMR-STS is nationally available to eligible MBBS students; PMCH-specific UG research participation, grants or mentorship counts were not verified.',
    funding:'Specific current PMCH undergraduate-accessible funding mechanisms were not verified.',
    infrastructure:'Clinical research potential is substantial because of the teaching-hospital case load, but dedicated research-lab infrastructure was not reliably documented here.',
    studentOpportunities:'Likely mentor/project dependent; no formal UG research programme was identified in the current source pass.',
    internationalPathway:'No formal outbound USMLE/elective programme or current systematic match data were verified.',
    cityNetworking:'Patna offers regional academic opportunities, but external research-network density is lower than Delhi/Mumbai. This is contextual rather than a hard institutional metric.',
    alumniInternational:'Not systematically verified.',
    confidence:'Low-Medium — intentionally conservative pending stronger PMCH-specific research documentation.',
    sources:[
      {label:'PMCH official site',url:'https://patnamedicalcollege.edu.in/'},
      {label:'ICMR Short-Term Studentship',url:'https://www.icmr.gov.in/short-term-studentship-sts'}
    ]
  },
  45: {
    researchStrength:'Structured institute research ecosystem with a Dean (Research), Research Cell, Research Advisory Committee and multidisciplinary research activity.',
    undergradAccess:'The Research Cell provides project-approval structures and research training infrastructure, but a dedicated MBBS student research programme or participation count was not identified.',
    funding:'IGIMS documents intramural, extramural and collaborative project approval pathways and multiple ICMR/SERB-funded projects.',
    infrastructure:'Research Cell plus multidisciplinary research structures in an autonomous statutory university and superspecialty institute.',
    studentOpportunities:'Potential access through faculty projects and formal research-governance structures; actual undergraduate uptake is not quantified.',
    internationalPathway:'No formal outbound USMLE/elective pathway was verified.',
    cityNetworking:'Patna regional tertiary-care ecosystem; fewer external national-institute networking options than Delhi, but strong institute-internal superspecialty exposure.',
    alumniInternational:'Current systematic match data were not verified.',
    confidence:'High for institutional research governance; Medium-Low for UG access and international pathway.',
    sources:[
      {label:'IGIMS Research Cell',url:'https://www.igims.org/Topics.aspx?mid=Research+Cell.'},
      {label:'IGIMS Research Advisory Committee',url:'https://igims.org/topics.aspx?mid=Minutes+of+Research+Advisory+Committee'},
      {label:'IGIMS research opportunities',url:'https://www.igims.org/Opportunitieslist.aspx?type=pt'}
    ]
  },
  402: {
    researchStrength:'Very strong structured university research ecosystem with dedicated R&D governance, intramural seed grants and extensive externally funded projects.',
    undergradAccess:'Explicitly strong: registered MBBS/BDS undergraduates are eligible for KGMU intramural research grants, and the university also runs a student research bulletin and MBBS Student Researcher Award.',
    funding:'Competitive intramural seed grants for undergraduate students plus substantial ICMR/DBT/DST/DHR and international funded work.',
    infrastructure:'Research Cell/R&D system, ethics infrastructure, advanced research facilities and broad department-level project activity.',
    studentOpportunities:'Intramural grants, ICMR-STS guidance, independent faculty mentorship, student-led research publication and research awards.',
    internationalPathway:'No formal KGMU-run USMLE pipeline was verified, but the student research ecosystem explicitly discusses overseas higher study and academic medicine as motivations for research training.',
    cityNetworking:'Large academic-medical ecosystem in Lucknow, though less concentrated than Delhi; strong institute-internal research network.',
    alumniInternational:'International alumni exist, but current verified residency-match rates were not identified.',
    confidence:'Very High for undergraduate research accessibility; Medium for international pathway.',
    sources:[
      {label:'KGMU intramural research grants',url:'https://kgmu.org/intramural_research_grants.php'},
      {label:'KGMU student research bulletin',url:'https://www.kgmu.org/student_research_bulletin.php'},
      {label:'KGMU research promotion policy',url:'https://kgmu.org/research_promotion_policy.php'},
      {label:'KGMU student research opportunities',url:'https://placement.kgmu.org/research_local.php'}
    ]
  },
  220: {
    researchStrength:'Long-established academic institution with active clinical and postgraduate research, but a current formal undergraduate research programme was not identified in this pass.',
    undergradAccess:'ICMR-STS is nationally available; Grant-specific current UG research funding/mentorship structures were not clearly documented online.',
    funding:'Departmental and institutional research is active, but current UG-accessible grant structure was not verified.',
    infrastructure:'Large multi-hospital tertiary ecosystem with 1,885 beds and broad postgraduate/superspecialty activity, creating substantial clinical-research potential.',
    studentOpportunities:'Likely mentor/department dependent; stronger evidence exists for the clinical environment than for a formal undergraduate research pathway.',
    internationalPathway:'Historical cohort research demonstrates a substantial international alumni footprint, but those data are decades old and should not be treated as a current USMLE match rate.',
    cityNetworking:'Mumbai location provides a large medical, academic and conference ecosystem with access to multiple tertiary institutions.',
    alumniInternational:'Historical study of Grant cohorts found substantial proportions living abroad; useful as legacy context only, not a current pathway metric.',
    confidence:'Medium for institutional/clinical research environment; Low-Medium for current UG research access; Medium for historical international alumni context.',
    sources:[
      {label:'Grant Medical College official site',url:'https://gmcjjh.edu.in/'},
      {label:'DMER Maharashtra dashboard',url:'https://dmer.maharashtra.gov.in/english/dmer-dashboard/'},
      {label:'Historical Grant alumni career study',url:'https://pubmed.ncbi.nlm.nih.gov/19764686/'},
      {label:'ICMR Short-Term Studentship',url:'https://www.icmr.gov.in/short-term-studentship-sts'}
    ]
  },
  168: {"researchStrength":"Active institutional clinical and academic research ecosystem; depth varies by department.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Student research is available via faculty mentorship/ICMR routes; public evidence of a formal UG research office is limited.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Bhopal provides a solid central-India institutional network; less dense than Delhi/Mumbai.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://bhopaldivisionmp.nic.in/en/public-utility/all-india-institute-of-medical-sciences-bhopal/"},{"label":"Source 2","url":"https://www.shiksha.com/university/aiims-bhopal-all-india-institute-of-medical-sciences-65401/reviews"}]},
  239: {"researchStrength":"Very strong and formalized research ecosystem with Research Section, Advanced Research Center, collaborations, projects, patents/innovation and annual research reporting.","undergradAccess":"Official Institutional Ethics Committee for Student Research provides a specific student-research governance pathway.","funding":"Active intramural/extramural and ICMR-funded projects.","infrastructure":"Advanced Research Center plus formal research portal and project ecosystem.","studentOpportunities":"Student research ethics pathway, research projects, conferences/workshops and active project recruitment.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"City/institutional context varies; this is contextual opportunity, not guaranteed access.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"High","sources":[{"label":"Source 1","url":"https://aiimsbhubaneswar.nic.in/ipd/"},{"label":"Source 2","url":"https://aiimsbhubaneswar.nic.in/research-home/"},{"label":"Source 3","url":"https://aiimsbhubaneswar.nic.in/student-portal/"}]},
  372: {"researchStrength":"Strong institutional research ecosystem; AIIMS Rishikesh is among institutions cited with DHR/MRU Centre of Research Excellence recognition.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research Cell plus broad specialty research environment.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Rishikesh/Dehradun offers less dense medical-institution networking than Delhi/Mumbai, but the institute itself hosts national/international visitors.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"High for institutional research; Medium for UG access","sources":[{"label":"Source 1","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=205"},{"label":"Source 2","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=657"}]},
  189: {"researchStrength":"Rapidly expanding research ecosystem with active intramural/extramural projects and multiple ICMR-funded/multicentric studies.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Modern campus research facilities; 2026 NCDC MoU for BSL-III lab adds infectious-disease research capacity.","studentOpportunities":"Growing project ecosystem and academic departments with active publication/clinical-trial work.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"City/institutional context varies; this is contextual opportunity, not guaranteed access.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"High","sources":[{"label":"Source 1","url":"https://aiimsnagpur.edu.in/about-us"},{"label":"Source 2","url":"https://aiimsnagpur.edu.in/campus"}]},
  38: {"researchStrength":"Active institutional clinical and academic research ecosystem; depth varies by department.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"City/institutional context varies; this is contextual opportunity, not guaranteed access.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://aiimspatna.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/patna/aiims-to-increase-bed-capacity/articleshow/123548928.cms"}]},
  255: {"researchStrength":"Very strong longstanding institutional research culture; undergraduate research projects are explicitly described by JIPMER.","undergradAccess":"Official JIPMER profile explicitly includes undergraduate research projects.","funding":"Large institute research ecosystem across clinical/basic sciences.","infrastructure":"Extensive laboratories, 40+ clinical departments and specialized research/education infrastructure.","studentOpportunities":"UG projects, faculty mentorship, conferences and a strong medical-education/research culture.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Strong institutional network; Puducherry itself is smaller than Delhi/Mumbai but JIPMER has national/international academic reach.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"High","sources":[{"label":"Source 1","url":"https://jipmer.ac.in/about-us/about-jipmer"},{"label":"Source 2","url":"https://jipmer.ac.in/about-us/general-information/jipmer-info"},{"label":"Source 3","url":"https://jipmer.edu.in/announcement/mbbs-admissions-jipmer-2025-26"}]},
  288: {"researchStrength":"Active institutional clinical and academic research ecosystem; depth varies by department.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"City/institutional context varies; this is contextual opportunity, not guaranteed access.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://medicaleducation.rajasthan.gov.in/smsjaipur/"},{"label":"Source 2","url":"https://rmj.rajasthan.gov.in/smscollege.html"}]},
  75: {"researchStrength":"Active institutional clinical and academic research ecosystem; depth varies by department.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"City/institutional context varies; this is contextual opportunity, not guaranteed access.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://www.bjmcabd.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/ahmedabad/new-hostel-to-come-up-at-ai-171-crash-site-gujarat-govt/articleshow/129664098.cms"}]},
  360: {"researchStrength":"Active institutional clinical and academic research ecosystem; depth varies by department.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"City/institutional context varies; this is contextual opportunity, not guaranteed access.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://osmaniamedicalcollege.org/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/hyderabad/osmania-hospital-revamp-model-unveiled-at-summit/articleshow/125844087.cms"}]},
  440: {"researchStrength":"Very strong; IPGMER-SSKM MRU received Centre of Research Excellence recognition in 2026.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"CoRE recognition brings dedicated research-infrastructure funding and supports major projects.","infrastructure":"MRU plus centres of excellence, rare-disease and expanding oncology research infrastructure.","studentOpportunities":"Strong project ecosystem; exact UG-specific structured programme not reconstructed.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Kolkata offers a large academic/medical ecosystem with multiple government institutes.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"High for institutional research; Medium for UG accessibility","sources":[{"label":"Source 1","url":"https://www.ipgmer.gov.in/"},{"label":"Source 2","url":"https://www.ipgmer.gov.in/mbbs_admission_2026_all_india"}]},
  226: {"researchStrength":"Very strong legacy research ecosystem with active 2026 research-project recruitment and a long-running Journal of Postgraduate Medicine.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Large municipal academic centre with many active clinical research units.","studentOpportunities":"Research projects, departmental studies, journal exposure and FAIMER-linked academic ecosystem.","internationalPathway":"Official site provides an ECFMG verification SOP and observership information; this supports international administrative readiness but is not a match pipeline.","cityNetworking":"Mumbai provides dense academic, conference, alumni and international networking context.","alumniInternational":"Large longstanding international alumni network; current match-rate not quantified.","confidence":"High for institutional/international administrative infrastructure","sources":[{"label":"Source 1","url":"https://www.kem.edu/"},{"label":"Source 2","url":"https://www.kem.edu/gsmckemh/about/about-kem-hospital/"},{"label":"Source 3","url":"https://www.kem.edu/college"}]},
  230: {"researchStrength":"Active municipal academic research environment; exact current UG research programme not reconstructed.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Excellent Mumbai medical/university/networking context.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://tnmcnair.edu.in/"},{"label":"Source 2","url":"https://tnmcnair.edu.in/courses-and-fees/"}]},
  51: {"researchStrength":"Active government academic research environment in Chandigarh; exact UG-specific research programme not reconstructed.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Strong Chandigarh tri-city academic ecosystem with proximity to PGIMER and Panjab University.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://gmch.gov.in/"},{"label":"Source 2","url":"https://gmch.gov.in/educational/hostels"},{"label":"Source 3","url":"https://gmch.gov.in/academic-fee"}]},
  66: {"researchStrength":"Developing research ecosystem in a newer college; official site emphasizes teaching, research and Medical Education Unit activity.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Delhi location provides strong external conference/research networking context despite a smaller in-house research ecosystem.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://bsamch.ac.in/"},{"label":"Source 2","url":"https://bsah.delhi.gov.in/bsah/about-us"},{"label":"Source 3","url":"https://bsamch.ac.in/fee-structure/"}]},
  129: {"researchStrength":"Large state tertiary institute with active clinical research; major RIMS-2 plans include a dedicated research centre.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Ranchi offers a smaller external medical-academic network than metros; institutional statewide referral role is strong.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://rimsranchi.ac.in/"}]},
  181: {"researchStrength":"Active department-level research with ongoing projects, theses, publications and workshops documented across the college.","undergradAccess":"UG access is mentor/department dependent; community-medicine and pharmacology pages show active research-oriented teaching.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Indore provides a strong regional academic/healthcare ecosystem.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"High for department-level activity; Medium for formal UG programme","sources":[{"label":"Source 1","url":"https://www.mgmmcindore.in/"},{"label":"Source 2","url":"https://www.mgmmcindore.in/hostel-committee.aspx"},{"label":"Source 3","url":"https://www.mgmmcindore.in/dean-message.aspx"}]},
  211: {"researchStrength":"Active institutional clinical and academic research ecosystem; depth varies by department.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"City/institutional context varies; this is contextual opportunity, not guaranteed access.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium","sources":[{"label":"Source 1","url":"http://www.gmcnagpur.gov.in/"},{"label":"Source 2","url":"https://nagpur.gov.in/public-utility/government-medical-college-and-hospital/"},{"label":"Source 3","url":"https://timesofindia.indiatimes.com/city/nagpur/cm-rs-1000cr-given-for-gmch-mayo-finish-all-works-in-a-year/articleshow/121253945.cms"}]},
  248: {"researchStrength":"Strong tertiary/superspecialty research environment with multiple advanced centres and transplant programmes.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Research laboratories, ethics oversight and department-based project infrastructure are available.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Cuttack-Bhubaneswar corridor offers meaningful regional academic/research connectivity.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"Medium-High","sources":[{"label":"Source 1","url":"https://scbmch.odisha.gov.in/en/light/subpage/infrastructure-facilities"},{"label":"Source 2","url":"https://www.scbmch.com/admissions/index.html"}]},
  327: {"researchStrength":"Strong legacy clinical research, including historic transplant, hand/plastic surgery and stem-cell research programmes.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"Institute for Research and Rehabilitation of Hand plus specialty research laboratories.","studentOpportunities":"Faculty projects, conferences, audits, case reports and national undergraduate research schemes are potential routes.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Chennai has a dense government/academic medical ecosystem.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"High for legacy/institutional specialty research; Medium for current UG access","sources":[{"label":"Source 1","url":"https://stanleymedicalcollege.ac.in/"},{"label":"Source 2","url":"https://stanleymedicalcollege.ac.in/page/pro-forma"},{"label":"Source 3","url":"https://stanleymedicalcollege.ac.in/page/ladies-hostel"}]},
  323: {"researchStrength":"Very strong; institutional site highlights MRU/VRDL and MMC has been cited among DHR Centre of Research Excellence institutions.","undergradAccess":"Undergraduate research is possible through faculty mentorship and national programmes such as ICMR-STS; a college-specific guaranteed pathway is not assumed.","funding":"Institutional/extramural project activity present; UG-specific funding not always separately documented.","infrastructure":"MRU, VRDL, multiple tertiary institutes and advanced specialty diagnostics.","studentOpportunities":"Clinical Society meetings and a large research-active tertiary ecosystem create substantial project exposure; formal UG pathway varies by department.","internationalPathway":"No formal USMLE pipeline is assumed. International pathway remains student-driven unless a specific programme is documented.","cityNetworking":"Excellent Chennai academic/medical network across government institutes and universities.","alumniInternational":"A current verified MBBS-to-US residency rate was not identified.","confidence":"High","sources":[{"label":"Source 1","url":"https://www.mmcrgggh.tn.gov.in/ords/r/wsmmc/mmc12055555/home"},{"label":"Source 2","url":"https://www.tnhealth.org/tngovin/dme/dme.php"}]}

};

const CAMPUS_STUDENT_LIFE = {
  64: {
    campus:'Dense urban medical campus in Ansari Nagar; hospital, hostels and student facilities are tightly integrated rather than spread across a large residential university campus.',
    sports:'Official hostel/gymkhana facilities include basketball, floodlit volleyball, tennis, gymnasium, playground and an eight-lane swimming pool.',
    clubs:'Student bodies are formally represented in hostel/student welfare structures; club-by-club current UG roster was not reliably extracted in this pass.',
    fest:'PULSE is the long-running student festival associated with AIIMS Delhi; current official festival documentation was not used as a hard fact here.',
    food:'Official hostel facilities list multiple mess models plus cafés/canteens, coffee/juice outlets and a general store.',
    city:'Excellent South/Central Delhi access; the campus sits in the AIIMS–Ansari Nagar medical/academic cluster.',
    social:'Very strong city/networking context with substantial on-campus recreation. The campus itself feels more like a major medical complex than a secluded university.',
    safety:'Formal hostel administration, visitor registers and vehicle registration are documented; student-perceived safety was not separately scored.',
    tradeoff:'Exceptional facilities and city access; less of a self-contained, spacious residential-campus feel than newer AIIMS campuses.',
    confidence:'High for sports/hostel facilities; Medium for current clubs/festival culture.',
    sources:[
      {label:'AIIMS Hostel & Gymkhana facilities',url:'https://www.aiims.edu/index.php?Itemid=2399&id=1733&lang=en&option=com_content&view=article'},
      {label:'AIIMS Hostel FAQ',url:'https://www.aiims.edu/index.php/en/hostel_accomodation_faqs'}
    ]
  },
  262: {
    campus:'Modern, spacious purpose-built campus with substantial greenery and dedicated academic, hospital, hostel and recreation zones.',
    sports:'Student reports consistently describe a large sports complex with basketball, volleyball, badminton, tennis, cricket/football grounds, gym and swimming pool.',
    clubs:'Dance, drama, music, quiz, band, literary, sports and other activity-based groups are repeatedly reported.',
    fest:'AURA is the major cultural/inter-college fest; TEJAS is the major sports fest. Both are repeatedly reported by current/recent students.',
    food:'Mess and canteen options are on campus; recent student reports also mention a Nescafé outlet.',
    city:'Campus life is strong internally, but students report the main market/city activity is several kilometres away. Jodhpur summers are an important lifestyle factor.',
    social:'One of the strongest all-round residential-campus experiences in the pilot: organised sports, large fests, clubs and substantial hostel independence.',
    safety:'Structured central-institute campus with student wellness/anti-ragging systems; no independent student safety score assigned.',
    tradeoff:'Outstanding on-campus life and sports; weaker spontaneous big-city access than the Delhi/Mumbai colleges and very hot climate.',
    confidence:'Medium-High; sports/fests are supported by multiple recent MBBS/student reports, while some facility details vary by year.',
    sources:[
      {label:'Recent AIIMS Jodhpur MBBS reviews',url:'https://collegedunia.com/university/25796-all-india-institute-of-medical-sciences-aiims-jodhpur/reviews/page-1'},
      {label:'AIIMS Jodhpur student reviews',url:'https://www.shiksha.com/college/aiims-jodhpur-all-india-institute-of-medical-sciences-64869/reviews'}
    ]
  },
  72: {
    campus:'Compact urban medical-college campus embedded in the Safdarjung Hospital complex rather than a large standalone residential campus.',
    sports:'Student reports say sports infrastructure has historically been a weak point, though annual sports events and newer/improving facilities are reported.',
    clubs:'Extracurricular activities and events are organised, but a current official club-by-club roster was not found.',
    fest:'NIRVANA is consistently reported as the annual college fest; student reports also describe an annual sports fest.',
    food:'Hostel/mess and hospital-campus food options are available; detailed campus-food diversity was not reconstructed here.',
    city:'Exceptional location and connectivity in South Delhi, immediately adjacent to AIIMS and near major Delhi activity/transport corridors.',
    social:'The main advantage is Delhi access and the dense medical ecosystem rather than a huge campus. Student reports generally describe organised extracurriculars.',
    safety:'Formal hostel entry rules and anti-ragging systems are published by VMMC/Safdarjung.',
    tradeoff:'Elite city/location advantage and strong fest culture, but comparatively limited physical campus/sports space.',
    confidence:'Medium-High for fest/location; Medium for current sports quality because student reports indicate ongoing change.',
    sources:[
      {label:'VMMC Student Zone',url:'https://vmmc-sjh.mohfw.gov.in/student-zone'},
      {label:'VMMC student reviews',url:'https://www.careers360.com/colleges/vardhman-mahavir-medical-college-and-safdarjung-hospital-new-delhi/reviews'},
      {label:'Recent VMMC reviews',url:'https://www.shiksha.com/college/vardhman-mahavir-medical-college-safdarjang-enclave-delhi-52968/reviews-3'}
    ]
  },
  69: {
    campus:'Historic central-Delhi medical campus shared with a very large associated-hospital ecosystem. Space and older infrastructure are recurring constraints.',
    sports:'Student reports are mixed: active teams/courts and sports events exist, but some recent students report limited outdoor space and no proper cricket ground.',
    clubs:'Recent students report active student-run fashion, drama, dance, music, fine-arts, literary and cultural societies.',
    fest:'SYNAPSE is the annual inter-college festival; MAMC officially authorised the 2025 edition for February 2026.',
    food:'Multiple messes/canteens are reported across the campus/hostel system.',
    city:'Excellent central-Delhi access from Bahadur Shah Zafar Marg, with major transport, cultural and commercial areas nearby.',
    social:'Very strong student-run culture despite old infrastructure. Synapse and societies are major strengths.',
    safety:'Campus security/lighting and hostel crowding were serious enough to trigger government intervention in 2025; renovation, CCTV and lighting improvements were ordered.',
    tradeoff:'Rich legacy, societies and central-city life; physical campus/hostel crowding and infrastructure remain real drawbacks.',
    confidence:'High for Synapse and 2025 security/infrastructure concerns; Medium-High for current societies/sports from recent student reports.',
    sources:[
      {label:'MAMC Synapse 2025 order',url:'https://mamc.delhi.gov.in/mamc/order-account-conduct-annual-inter-college-festival-synapse-2025-during-11th-15th-february'},
      {label:'Recent MAMC student-life reports',url:'https://collegedunia.com/qna/question/35094-how-is-the-campus-life-at-mamc-delhi'},
      {label:'MAMC hostel/security revamp report',url:'https://timesofindia.indiatimes.com/city/delhi/cm-orders-anti-encroachment-drive-hostel-revamp-at-mamc/articleshow/122031806.cms'}
    ]
  },
  65: {
    campus:'Compact central-New-Delhi campus integrated with RML Hospital. The institute is young, and its long-planned dedicated medical-college building remained delayed as of early 2026.',
    sports:'Official RML material lists football/cricket/athletics grounds plus badminton, table tennis, indoor games and a hostel gym; older student reports describe sports as a relative weakness, suggesting access/quality has evolved.',
    clubs:'Recent student reports describe student council activity and sports/dance/drama/singing societies, but official society-level documentation is limited.',
    fest:'REVELS is repeatedly reported as the student fest, with sports events and star-night programming.',
    food:'Hostel mess/canteen options are reported; detailed variety is not quantified.',
    city:'Exceptional central-Delhi location near Connaught Place and the wider Delhi medical/research ecosystem.',
    social:'Small campus but unusually strong city access. Extracurricular identity is newer and less institutionally entrenched than MAMC/UCMS.',
    safety:'Formal hospital/hostel systems exist; no separate current student safety metric reconstructed.',
    tradeoff:'Prime location and improving facilities, but limited campus footprint and a still-developing standalone college infrastructure.',
    confidence:'High for official sports facilities and current campus-building delay; Medium for societies/fest from student reports.',
    sources:[
      {label:'ABVIMS Sports Facility',url:'https://rmlh.nic.in/Index1.aspx?langid=1&lev=3&lid=3565&lsid=2574&pid=2572'},
      {label:'ABVIMS student reviews',url:'https://collegedunia.com/college/63043-atal-bihari-vajpayee-institute-of-medical-sciences-and-dr-ram-manohar-lohia-hospital-new-delhi/gallery/'},
      {label:'ABVIMS campus-building delay',url:'https://timesofindia.indiatimes.com/city/delhi/7-years-after-launch-medical-college-project-yet-to-take-off/articleshow/127868325.cms'}
    ]
  },
  71: {
    campus:'Large, relatively green East-Delhi campus attached to GTB Hospital, with substantial student and sports/cultural infrastructure.',
    sports:'Official NAAC material documents sports/cultural facilities and a formal Sports & Cultural Committee; students report ARENA sports meets and broad sports participation.',
    clubs:'Recent MBBS students report active drama, dance, literary, fashion, music, poetry and other societies.',
    fest:'RIPPLE is the major annual cultural fest; ARENA is the major sports event. The official UCMS site recorded RIPPLE 2026.',
    food:'Doctors’/campus canteen and emergency canteens are reported; hostel mess is separate.',
    city:'Good East-Delhi public-transport access. Students report nearby Metro access by short e-rickshaw rides.',
    social:'Strong traditional college-life feel with active societies, sports and student-led events. Less central than MAMC/VMMC/ABVIMS but more self-contained.',
    safety:'Institution maintains anti-ragging/wellness structures; no independent current student safety score assigned.',
    tradeoff:'Excellent balance of real campus life and Delhi connectivity; location is farther from central/south Delhi networking hubs.',
    confidence:'High for formal sports/cultural structures and RIPPLE; Medium-High for club/social details from recent MBBS reports.',
    sources:[
      {label:'UCMS official events — RIPPLE 2026',url:'https://www.ucms.ac.in/common/viewallevents'},
      {label:'UCMS Sports & Cultural Committee',url:'https://www.ucms.ac.in/administration/committees'},
      {label:'Recent UCMS MBBS reviews',url:'https://www.shiksha.com/college/university-college-of-medical-sciences-university-of-delhi-dilshad-garden-3874/reviews'}
    ]
  },
  49: {
    campus:'Historic riverfront/central-Patna campus undergoing massive redevelopment. Current student life is unusually construction-dependent and should not be treated as the finished future campus.',
    sports:'Current reports are inconsistent because redevelopment has removed/limited open ground in phases. Badminton and cricket are repeatedly reported; some students describe newer tennis/outdoor options.',
    clubs:'Formal current club structure is poorly documented publicly. Cultural/sports events are more visible than permanent society infrastructure.',
    fest:'College Function Day (CFD) is repeatedly described as a long multi-event annual celebration; Saraswati Puja is another major campus tradition.',
    food:'Canteen and hostel mess options exist; redevelopment has made the physical environment variable by block/year.',
    city:'Excellent central-Patna access on Ashok Rajpath and the Ganga riverfront, with easy access to the wider city.',
    social:'Tradition-heavy rather than club-heavy. Current campus experience is compromised by construction, while student events remain active.',
    safety:'No separate current student-safety metric reconstructed; construction and traffic/road disruption are practical campus issues.',
    tradeoff:'Prime city location, legacy and lively traditional events, but present-day campus/sports quality is distorted by redevelopment.',
    confidence:'Medium-High for CFD/city; Medium for sports/current campus because construction changes conditions quickly.',
    sources:[
      {label:'PMCH official campus/hostel site',url:'https://patnamedicalcollege.edu.in/hostel'},
      {label:'Recent PMCH MBBS reviews',url:'https://www.shiksha.com/college/patna-medical-college-and-hospital-63075/reviews'},
      {label:'PMCH student campus reviews',url:'https://collegedunia.com/college/10832-patna-medical-college-and-hospital-pmch-patna/reviews'}
    ]
  },
  45: {
    campus:'Integrated tertiary-hospital and teaching campus in Sheikhpura, Patna; busy hospital activity makes the campus feel more clinical/urban than secluded.',
    sports:'IGIMS has a designated Dean (Sports); a sports complex and student recreation centre have appeared in the institute development plan. Current completed-facility detail is limited.',
    clubs:'Current formal club roster was not recovered. Student reports suggest extracurricular life exists but is less developed than the strongest campus-culture colleges.',
    fest:'CEREBREXIA is consistently reported as the major annual fest, including large cultural/star events.',
    food:'Hostel/mess and campus food exist; detailed campus-food ecosystem not reconstructed.',
    city:'Good Patna connectivity from Sheikhpura and strong access to the city compared with isolated residential campuses.',
    social:'Fest and hostel life are reported positively by MBBS students, but broader clubs/extracurricular infrastructure is less well documented.',
    safety:'Formal student-welfare administration exists; no separate current student-safety score assigned.',
    tradeoff:'Strong hospital-centred urban experience and a substantial annual fest; comparatively weaker documented club/sports ecosystem.',
    confidence:'High for institutional sports/student-welfare roles and Cerebrexia reporting; Medium for broader social-life claims.',
    sources:[
      {label:'IGIMS administration / Dean Sports',url:'https://www.igims.org/topics.aspx?mid=Contact+Us'},
      {label:'IGIMS development plans',url:'https://www.igims.org/topics.aspx?mid=Future+Plans'},
      {label:'Recent IGIMS MBBS reviews',url:'https://www.shiksha.com/college/indira-gandhi-institute-of-medical-sciences-patna-62973/reviews'}
    ]
  },
  402: {
    campus:'Large historic medical-university campus in central Lucknow with extensive university, hospital, hostel and recreation infrastructure.',
    sports:'Official KGMU material lists illuminated grounds for cricket, football, hockey, basketball and volleyball, running track, tennis, indoor badminton/table tennis and a hostel gymnasium.',
    clubs:'Long-standing dramatic, anatomical, athletics and other student associations operate alongside Dean of Student Welfare activities.',
    fest:'The Dramatic Society runs a Medifest/week-long cultural festival; KGMU also has annual sports meets, inter-semester competitions and university events.',
    food:'Hostel messes and campus food are available; food-policy details are handled separately in the hostel dataset.',
    city:'Central Lucknow location with good urban access while retaining a substantial self-contained university environment.',
    social:'Deep institutional tradition in sports, theatre, debate and student associations. More old-university than modern-residential-campus in feel.',
    safety:'Dean of Student Welfare formally oversees student welfare, hostels, supervision and discipline; no independent student safety score assigned.',
    tradeoff:'Excellent breadth of clubs/sports and historic university culture; older infrastructure varies substantially by block.',
    confidence:'High for formal sports and student-association infrastructure from current KGMU pages.',
    sources:[
      {label:'KGMU Student Activities',url:'https://kgmu.org/student_activities.php'},
      {label:'KGMU Athletic Association',url:'https://kgmu.org/athletic_association.php'},
      {label:'KGMU Dean Student Welfare',url:'https://kgmu.org/aboutDSW.php'}
    ]
  },
  220: {
    campus:'Large historic medical/hospital campus in central Mumbai with a separate student gymkhana near Marine Drive; urban location is a major lifestyle advantage.',
    sports:'Recent MBBS reports describe basketball/badminton, two gyms and the KURUKSHETRA sports fest with cricket, football, volleyball, basketball, kho-kho, kabaddi and indoor games.',
    clubs:'Student association (GMCSA) and multiple activity groups support cultural and extracurricular life.',
    fest:'SANGHARSH and ANTARANG are major cultural events; KURUKSHETRA is the major sports event. Recent students describe concerts, dance/music and multiple club events.',
    food:'Recent students report several canteens plus common-room/hangout spaces across the campus.',
    city:'Exceptional Mumbai access. The Marine Drive gymkhana is a distinctive recreational/social asset, although its control became disputed in late 2025.',
    social:'Among the strongest urban social-life profiles in the pilot: major fests, Mumbai access, student association and dedicated gymkhana culture.',
    safety:'General campus security is reported as adequate, but no independent current student safety score assigned.',
    tradeoff:'Outstanding city and extracurricular life; hostel infrastructure is far weaker than the campus/social experience.',
    confidence:'Medium-High; recent verified MBBS reviews strongly support the campus-life picture, while some facilities are undergoing renovation/governance change.',
    sources:[
      {label:'Recent Grant MBBS reviews',url:'https://www.shiksha.com/college/grant-medical-college-mumbai-central-mumbai-29767/reviews'},
      {label:'Grant student campus review',url:'https://www.collegebatch.com/reviews/25782-grant-medical-college-mumbai'},
      {label:'2025 Gymkhana control dispute',url:'https://medicaldialogues.in/news/education/medical-colleges/grant-medical-college-mbbs-students-protest-over-gympkhana-control-change-160606'}
    ]
  },
  168: {"campus":"Modern AIIMS campus within Bhopal city.","sports":"Student reports consistently describe gym, badminton, basketball and football facilities.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"RETINA annual fest; Pravah sports fest and Tarang cultural fest reported by current MBBS students.","food":"Mess plus canteen/vending and easy online food access.","city":"Good Bhopal urban connectivity while retaining a residential campus.","social":"Strong residential AIIMS campus life with active sports/fest culture.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"More self-contained than legacy city colleges, but less metro-level external networking than Delhi/Mumbai.","confidence":"Medium-High; student-reported","sources":[{"label":"Source 1","url":"https://bhopaldivisionmp.nic.in/en/public-utility/all-india-institute-of-medical-sciences-bhopal/"},{"label":"Source 2","url":"https://www.shiksha.com/university/aiims-bhopal-all-india-institute-of-medical-sciences-65401/reviews"}]},
  239: {"campus":"Government medical/teaching-hospital campus; layout and residential feel vary by institution.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Urban/regional access described by the college location.","social":"Student-life intensity depends on residential campus size, societies and city access.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"No single universal lifestyle trade-off is asserted without stronger evidence.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://aiimsbhubaneswar.nic.in/ipd/"},{"label":"Source 2","url":"https://aiimsbhubaneswar.nic.in/research-home/"},{"label":"Source 3","url":"https://aiimsbhubaneswar.nic.in/student-portal/"}]},
  372: {"campus":"Green, scenic residential campus beside Rishikesh with a strong self-contained identity.","sports":"Official page describes expanding sports courts and frequent sports/cultural/literary events.","clubs":"Student-led photography, hiking and other clubs are explicitly described.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Student mess plus 24×7 hostel-area canteen and milk parlour.","city":"Rishikesh offers outdoor/recreation advantages but less big-city medical networking.","social":"Strong residential community and outdoor lifestyle.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Excellent campus environment; smaller city/networking ecosystem.","confidence":"High","sources":[{"label":"Source 1","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=205"},{"label":"Source 2","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=657"}]},
  189: {"campus":"Modern purpose-built MIHAN campus with academic, hospital and residential zones.","sports":"Official campus lists outdoor sports area, multipurpose indoor complex and gym.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Hostel mess and campus facilities; external city access less immediate than central Nagpur colleges.","city":"MIHAN location is more peripheral than central Nagpur.","social":"Modern residential AIIMS environment with substantial facilities.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Excellent new infrastructure, but less central-city immediacy.","confidence":"High","sources":[{"label":"Source 1","url":"https://aiimsnagpur.edu.in/about-us"},{"label":"Source 2","url":"https://aiimsnagpur.edu.in/campus"}]},
  38: {"campus":"Government medical/teaching-hospital campus; layout and residential feel vary by institution.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Urban/regional access described by the college location.","social":"Student-life intensity depends on residential campus size, societies and city access.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"No single universal lifestyle trade-off is asserted without stronger evidence.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://aiimspatna.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/patna/aiims-to-increase-bed-capacity/articleshow/123548928.cms"}]},
  255: {"campus":"Large 192-acre established INI campus with four residential complexes and extensive hospital/academic infrastructure.","sports":"Large residential campus supports broad recreation; exact current sport-by-sport inventory not reconstructed.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Large hostel complex, mess/canteen ecosystem.","city":"Puducherry offers compact coastal city life; Chennai access is possible but not local.","social":"Strong residential institute identity and large student community.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Excellent self-contained institute; less metro-level networking density than Delhi/Mumbai/Chennai.","confidence":"High for campus scale; Medium for current club/sports inventory","sources":[{"label":"Source 1","url":"https://jipmer.ac.in/about-us/about-jipmer"},{"label":"Source 2","url":"https://jipmer.ac.in/about-us/general-information/jipmer-info"},{"label":"Source 3","url":"https://jipmer.edu.in/announcement/mbbs-admissions-jipmer-2025-26"}]},
  288: {"campus":"Legacy 28-acre medical-college campus integrated with a very large hospital ecosystem in central Jaipur.","sports":"Sports complex and hostel facilities are listed in state profile.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Excellent Jaipur city access.","social":"Large legacy student body with strong traditional college culture.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Outstanding clinical/city access; older infrastructure and very high hospital density can reduce residential-campus feel.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://medicaleducation.rajasthan.gov.in/smsjaipur/"},{"label":"Source 2","url":"https://rmj.rajasthan.gov.in/smscollege.html"}]},
  75: {"campus":"Large Civil Hospital medical campus in Ahmedabad.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Strong Ahmedabad urban access.","social":"Large legacy state-GMC student community.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Hostel life is in active reconstruction after the 2025 AI171 crash; temporary accommodation arrangements may affect student experience.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://www.bjmcabd.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/ahmedabad/new-hostel-to-come-up-at-ai-171-crash-site-gujarat-govt/articleshow/129664098.cms"}]},
  360: {"campus":"Historic Hyderabad medical-college ecosystem integrated with multiple old teaching hospitals; major new OGH campus under construction.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Excellent central Hyderabad urban access and broad medical ecosystem.","social":"Large legacy college identity in a major metro.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Exceptional city/clinical setting, but hospital infrastructure is currently in a major transition.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://osmaniamedicalcollege.org/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/hyderabad/osmania-hospital-revamp-model-unveiled-at-summit/articleshow/125844087.cms"}]},
  440: {"campus":"Dense central Kolkata tertiary medical campus with multiple annex hospitals rather than a spacious residential university.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Excellent central Kolkata connectivity near Rabindra Sadan.","social":"Strong metro medical/academic environment.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Outstanding city/clinical network; less spacious residential-campus feel.","confidence":"High for location/context","sources":[{"label":"Source 1","url":"https://www.ipgmer.gov.in/"},{"label":"Source 2","url":"https://www.ipgmer.gov.in/mbbs_admission_2026_all_india"}]},
  226: {"campus":"Dense Parel medical campus in central Mumbai.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Longstanding GSMC gymkhana/student organizations; active 2026 gymkhana/canteen notices.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Hostel canteen/mess plus extensive Parel food access.","city":"Exceptional Mumbai medical, research and social connectivity.","social":"Very strong legacy student/alumni culture in a dense urban setting.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Elite clinical/networking environment, but limited open-campus space and older hostel infrastructure compared with new AIIMS campuses.","confidence":"High","sources":[{"label":"Source 1","url":"https://www.kem.edu/"},{"label":"Source 2","url":"https://www.kem.edu/gsmckemh/about/about-kem-hospital/"},{"label":"Source 3","url":"https://www.kem.edu/college"}]},
  230: {"campus":"Compact central Mumbai municipal medical campus.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Excellent Mumbai access and transport connectivity.","social":"Strong legacy municipal-college culture with city life immediately outside campus.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Very strong city/clinical access; hostel availability—especially for first-year girls in 2026–27—is constrained by renovation.","confidence":"High for current hostel disruption; Medium for society inventory","sources":[{"label":"Source 1","url":"https://tnmcnair.edu.in/"},{"label":"Source 2","url":"https://tnmcnair.edu.in/courses-and-fees/"}]},
  51: {"campus":"Organized Sector-32 Chandigarh campus in a planned city.","sports":"Hostel system supports AC opt-in/late-night passes and structured residential administration; detailed sports inventory not reconstructed.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Excellent planned-city connectivity and tri-city access.","social":"Balanced campus/city lifestyle; proximity to major academic institutions.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Smaller city than Delhi/Mumbai but unusually strong academic neighbourhood.","confidence":"High for hostel administration; Medium for recreation specifics","sources":[{"label":"Source 1","url":"https://gmch.gov.in/"},{"label":"Source 2","url":"https://gmch.gov.in/educational/hostels"},{"label":"Source 3","url":"https://gmch.gov.in/academic-fee"}]},
  66: {"campus":"29.4-acre integrated college-hospital campus in Rohini with dedicated residential complex.","sports":"Official infrastructure lists recreation facilities; specific sport inventory not reconstructed.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Good North Delhi/Metro connectivity; less central than MAMC/UCMS/ABVIMS.","social":"Newer college community in a substantial integrated campus.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Good Delhi access and campus space; younger society/alumni ecosystem.","confidence":"High for campus infrastructure","sources":[{"label":"Source 1","url":"https://bsamch.ac.in/"},{"label":"Source 2","url":"https://bsah.delhi.gov.in/bsah/about-us"},{"label":"Source 3","url":"https://bsamch.ac.in/fee-structure/"}]},
  129: {"campus":"Large state medical campus in Ranchi with major expansion plans.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Good Ranchi urban access; smaller metro/networking ecosystem than Delhi/Mumbai/Kolkata.","social":"Large statewide institute with substantial residential/clinical community.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Strong patient exposure; infrastructure modernization remains uneven and RIMS-2 is still future-facing.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://rimsranchi.ac.in/"}]},
  181: {"campus":"Self-sufficient green campus in the heart of Indore with multiple attached hospitals nearby.","sports":"Hostels have sports/recreation facilities; campus gardens and recreational infrastructure documented.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Excellent central Indore access; shopping/amenities within walking distance.","social":"Large legacy state-GMC community with strong city integration.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Older large-campus infrastructure varies by block despite ongoing upgrades.","confidence":"High","sources":[{"label":"Source 1","url":"https://www.mgmmcindore.in/"},{"label":"Source 2","url":"https://www.mgmmcindore.in/hostel-committee.aspx"},{"label":"Source 3","url":"https://www.mgmmcindore.in/dean-message.aspx"}]},
  211: {"campus":"Large traditional GMCH campus in Nagpur undergoing major modernization.","sports":"Student amenities and new infrastructure are being upgraded; full sport inventory not reconstructed.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Strong central Nagpur access.","social":"Large legacy GMC community with broad clinical campus life.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Excellent volume and modernization, but older campus sections remain in transition.","confidence":"Medium-High","sources":[{"label":"Source 1","url":"http://www.gmcnagpur.gov.in/"},{"label":"Source 2","url":"https://nagpur.gov.in/public-utility/government-medical-college-and-hospital/"},{"label":"Source 3","url":"https://timesofindia.indiatimes.com/city/nagpur/cm-rs-1000cr-given-for-gmch-mayo-finish-all-works-in-a-year/articleshow/121253945.cms"}]},
  248: {"campus":"Large historic medical-hospital campus in Cuttack undergoing massive world-class redevelopment.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Student societies and academic/cultural activities occur; current club roster not always formally published.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Cuttack city access with Bhubaneswar academic/airport connectivity nearby.","social":"Large legacy student body and statewide institutional identity.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Huge clinical ecosystem; construction/redevelopment and crowding can affect daily campus experience.","confidence":"High for redevelopment/scale","sources":[{"label":"Source 1","url":"https://scbmch.odisha.gov.in/en/light/subpage/infrastructure-facilities"},{"label":"Source 2","url":"https://www.scbmch.com/admissions/index.html"}]},
  327: {"campus":"Dense heritage campus in North Chennai with strong hostel/student traditions.","sports":"Historic college account describes strong sports culture and a well-equipped gym.","clubs":"Longstanding student magazine, NCC, cultural and service traditions.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Hostel canteen culture is a notable part of Stanley student identity.","city":"Excellent Chennai urban access, especially North Chennai.","social":"Strong “Stanley Spirit” legacy and close-knit hostel culture.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Older dense urban campus rather than a spacious modern residential institute.","confidence":"High for institutional history; Medium for current day-to-day society activity","sources":[{"label":"Source 1","url":"https://stanleymedicalcollege.ac.in/"},{"label":"Source 2","url":"https://stanleymedicalcollege.ac.in/page/pro-forma"},{"label":"Source 3","url":"https://stanleymedicalcollege.ac.in/page/ladies-hostel"}]},
  323: {"campus":"Dense heritage medical ecosystem in central Chennai with multiple major attached institutions across the city.","sports":"Sports/recreation facilities present; exact breadth is only detailed where verified.","clubs":"Clinical Society meetings and a very large legacy student/alumni ecosystem; detailed current club roster not reconstructed.","fest":"Annual/cultural student events are present or historically established; current branding varies.","food":"Campus mess/canteen options available; external food access depends on city/location.","city":"Exceptional Chennai connectivity and medical-networking density.","social":"Strong legacy, very large patient-facing academic community.","safety":"Anti-ragging/security systems are institutionally maintained; student-perceived safety is not numerically scored.","tradeoff":"Unmatched clinical/city breadth, but not a single self-contained residential campus.","confidence":"High for institutional/city context","sources":[{"label":"Source 1","url":"https://www.mmcrgggh.tn.gov.in/ords/r/wsmmc/mmc12055555/home"},{"label":"Source 2","url":"https://www.tnhealth.org/tngovin/dme/dme.php"}]}

};

const FEES_BOND_STIPEND = {
  64:{academicFee:'Very low; current official UG fee components are nominal, but a single consolidated 2026 MBBS total was not reconstructed.',hostelFee:'₹2,728 total hostel charges over 5.5 years',mess:'₹3,500–₹4,500/month typical current range',internStipend:'Not reconstructed from a current official MBBS-intern notice',bond:'No current official MBBS service-bond obligation reconstructed',penalty:'—',currentness:'Hostel/mess current; academic total needs 2026 admission-source verification',confidence:'High for hostel/mess; Medium for academic-fee summary; Low/Unknown for stipend and bond',sources:[{label:'AIIMS hostel fees FAQ',url:'https://www.aiims.edu/index.php/en/hostel_accomodation_faqs'},{label:'AIIMS hostel fees',url:'https://www.aiims.edu/index.php?Itemid=3601&id=1737&lang=en&option=com_content&view=article'}]},
  72:{academicFee:'Latest directly indexed UG fee schedule on the official site is for 2023-24; current 2026 amount should be verified from admission documents.',hostelFee:'See hostel profile; 2025-26 allotment instructions are current',mess:'Not fixed in the fee notice reconstructed here',internStipend:'₹30,070/month (official notice dated 04 Aug 2025)',bond:'Delhi introduced a 1-year mandatory service-bond policy for medical students in Delhi; exact VMMC 2026 applicability/penalty should be verified from current admission documents.',penalty:'Not inserted without a current VMMC-specific official document',currentness:'Intern stipend current to Aug 2025; UG fee schedule stale',confidence:'High for stipend; Medium for fee currentness; Medium-Low for bond applicability',sources:[{label:'VMMC MBBS admissions',url:'https://www.vmmc-sjh.mohfw.gov.in/mbbs-bds-admissions'},{label:'VMMC students notice board',url:'https://vmmc-sjh.mohfw.gov.in/students-notice-board'}]},
  69:{academicFee:'₹240 annual tuition + ₹100 library + ₹10 lab + other university/student charges; ₹2,000 refundable security',hostelFee:'Separate hostel charges; see hostel profile',mess:'Varies by hostel/mess',internStipend:'MAMC publishes current intern-stipend notices, but exact 2026 amount was not extracted in this pass',bond:'1-year mandatory service bond introduced for UG/PG medical students in Delhi under AIQ and State Quota',penalty:'Exact current penalty not inserted without the underlying 2026 admission/bond document',currentness:'Fee page updated Aug 2026; bond policy published 2025 and still surfaced by MAMC',confidence:'High for published fees and existence of bond; Medium for stipend amount/penalty',sources:[{label:'MAMC UG admissions / fees',url:'https://mamc.delhi.gov.in/mamc/undergraduate-admission'},{label:'MAMC service-bond circular',url:'https://mamc.delhi.gov.in/mamc/circular-regarding-decision-competent-authority-introduce-one-year-mandatory-service-bond-ug'},{label:'MAMC 2026 notices',url:'https://mamc.delhi.gov.in/circular-notices/473'}]},
  65:{academicFee:'Current 2025-26 MBBS admission/fee notices are published by ABVIMS/RMLH; exact amount was not cleanly extracted from the indexed page in this pass.',hostelFee:'See hostel profile; current hostel-fee notices exist',mess:'Two hostel messes reported; exact monthly charge varies',internStipend:'ABVIMS publishes UG-intern stipend-payment notices; exact current monthly rate not extracted here',bond:'Delhi 1-year service-bond policy is relevant to Delhi medical institutes; exact 2026 ABVIMS undertaking/penalty should be verified from the current admission notice.',penalty:'Not inserted without current ABVIMS-specific official wording',currentness:'Current notices exist for 2025-26/2026, but several figures still require PDF extraction',confidence:'High that current notices exist; Medium for summarized monetary fields',sources:[{label:'RMLH student corner',url:'https://rmlh.mohfw.gov.in/index1.aspx?langid=2&lev=3&lid=5991&lsid=5001'}]},
  71:{academicFee:'UCMS issued a revised MBBS fee structure on 14 May 2026; exact amount should be read from that current notice rather than older figures.',hostelFee:'Separate boys/girls hostel fee schedules are published',mess:'Hostel mess charged separately',internStipend:'Not reconstructed from a current official UG-intern notice in this pass',bond:'UCMS 2025-26 MBBS page links a Service Bond Notice and Service Bond Undertaking',penalty:'Exact penalty not inserted without the current bond document',currentness:'2026 revised fee notice is current',confidence:'High for existence/currentness of fee and bond notices; Low/Unknown for exact stipend',sources:[{label:'UCMS MBBS course/admission page',url:'https://www.ucms.ac.in/courses/mbbs'},{label:'UCMS fee structure',url:'https://www.ucms.ac.in/students/feestructure'},{label:'UCMS notifications',url:'https://www.ucms.ac.in/common/viewallnotifications'}]},
  262:{academicFee:'Current official 2026 MBBS fee schedule was not recovered in this pass.',hostelFee:'See hostel profile',mess:'Varies by mess',internStipend:'Not verified from a current official AIIMS Jodhpur UG-intern notice',bond:'No current institute-specific MBBS service bond reconstructed',penalty:'—',currentness:'Needs official 2026 prospectus/fee notice',confidence:'Low until current official fee/stipend documents are recovered',sources:[]},
  49:{academicFee:'Current official 2026 MBBS fee schedule not cleanly reconstructed from PMCH public pages in this pass.',hostelFee:'Government hostel; exact current fee not reconstructed',mess:'Varies by hostel',internStipend:'Not verified from a current PMCH/Bihar official notice',bond:'No current PMCH-specific MBBS service-bond document reconstructed',penalty:'—',currentness:'Needs current Bihar/PMCH admission order',confidence:'Low for monetary fields; hostel inventory itself is official',sources:[{label:'PMCH official hostel page',url:'https://patnamedicalcollege.edu.in/hostel'}]},
  45:{academicFee:'IGIMS still publishes an MBBS fee-structure page, but the visible schedule is based on older 2020-21 revisions and is explicitly subject to change.',hostelFee:'Separate hostel rules/charges apply',mess:'Varies by hostel',internStipend:'IGIMS publishes trainee-stipend declarations, but exact current MBBS-intern figure was not extracted here',bond:'No current MBBS service-bond obligation reconstructed from the official pages reviewed',penalty:'—',currentness:'Fee schedule is stale; do not treat as 2026 pricing',confidence:'High that the visible fee schedule is outdated; Low for current monetary figures',sources:[{label:'IGIMS fee structure',url:'https://igims.org/topics.aspx?mid=Fee+Structure+and+Payment+Schedule+for+UG+%2F+PG+Courses'},{label:'IGIMS office orders',url:'https://igims.org/topics.aspx?mid=Office+Order+%2F+Circular'}]},
  402:{academicFee:'General: ₹18,000 tuition/year + ₹4,000 other + ₹2,000 development + ₹2,000 library; additional one-time charges apply',hostelFee:'₹2,400/year + ₹2,500/year electricity (double-seated MBBS hostel)',mess:'Separate',internStipend:'Current resident-salary/stipend structure is published, but exact MBBS-intern monthly amount was not extracted here',bond:'No current KGMU-specific MBBS service-bond obligation reconstructed in this pass',penalty:'—',currentness:'Current fee page indexed Aug 2026',confidence:'High for fees/hostel; Low/Unknown for intern stipend and bond',sources:[{label:'KGMU MBBS/BDS fee details',url:'https://www.kgmu.org/feedetails.php'}]},
  220:{academicFee:'Current 2025-26 MBBS admission brochure is published by Grant/JJ; exact UG fee figure was not extracted in this pass.',hostelFee:'Government hostel; exact current UG hostel fee not reconstructed',mess:'Varies by hostel/canteen',internStipend:'Grant/JJ publishes monthly stipend details through 2026; exact MBBS-intern rate not isolated in this pass',bond:'UG MBBS bond application is actively published on the official student-corner page',penalty:'Exact service duration/penalty should be read from the current UG bond form',currentness:'Current 2026 stipend and bond pages exist',confidence:'High for existence/currentness of stipend/bond documents; Medium-Low for exact monetary figures',sources:[{label:'Grant/JJ student corner',url:'https://gmcjjh.edu.in/student-corner-details/'},{label:'Grant/JJ stipend page',url:'https://gmcjjh.edu.in/stipend/'},{label:'Grant/JJ official site',url:'https://gmcjjh.edu.in/'}]},
  168: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"Student reports describe very low / effectively rent-free AIIMS hostel accommodation; official current fee table not recovered.","mess":"Variable / not cleanly verified.","internStipend":"Student reports around ₹25,000/month; not treated as official current figure.","bond":"No AIIMS-specific service bond inserted without a current official notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Medium-Low for money figures; hostel quality evidence stronger than fee evidence","sources":[{"label":"Source 1","url":"https://bhopaldivisionmp.nic.in/en/public-utility/all-india-institute-of-medical-sciences-bhopal/"},{"label":"Source 2","url":"https://www.shiksha.com/university/aiims-bhopal-all-india-institute-of-medical-sciences-65401/reviews"}]},
  239: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://aiimsbhubaneswar.nic.in/ipd/"},{"label":"Source 2","url":"https://aiimsbhubaneswar.nic.in/research-home/"},{"label":"Source 3","url":"https://aiimsbhubaneswar.nic.in/student-portal/"}]},
  372: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=205"},{"label":"Source 2","url":"https://aiimsrishikesh.edu.in/a1_1/?page_id=657"}]},
  189: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://aiimsnagpur.edu.in/about-us"},{"label":"Source 2","url":"https://aiimsnagpur.edu.in/campus"}]},
  38: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://aiimspatna.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/patna/aiims-to-increase-bed-capacity/articleshow/123548928.cms"}]},
  255: {"academicFee":"JIPMER 2025–26 MBBS prospectus/admission brochures are available; exact current 2026 total should be taken from the latest brochure rather than old web summaries.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"No state-style service bond assumed for JIPMER without current institute terms.","penalty":"Not inserted without a current official source.","currentness":"2025–26 official admission documents available; 2026 brochure should replace them when parsed.","confidence":"Medium","sources":[{"label":"Source 1","url":"https://jipmer.ac.in/about-us/about-jipmer"},{"label":"Source 2","url":"https://jipmer.ac.in/about-us/general-information/jipmer-info"},{"label":"Source 3","url":"https://jipmer.edu.in/announcement/mbbs-admissions-jipmer-2025-26"}]},
  288: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://medicaleducation.rajasthan.gov.in/smsjaipur/"},{"label":"Source 2","url":"https://rmj.rajasthan.gov.in/smscollege.html"}]},
  75: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://www.bjmcabd.edu.in/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/ahmedabad/new-hostel-to-come-up-at-ai-171-crash-site-gujarat-govt/articleshow/129664098.cms"}]},
  360: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://osmaniamedicalcollege.org/"},{"label":"Source 2","url":"https://timesofindia.indiatimes.com/city/hyderabad/osmania-hospital-revamp-model-unveiled-at-summit/articleshow/125844087.cms"}]},
  440: {"academicFee":"₹6,500 payable at physical MBBS admission for 2026 AIQ candidates","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Current official 2026 admission page","confidence":"High for admission fee; other recurring/hostel/stipend fields not reconstructed","sources":[{"label":"Source 1","url":"https://www.ipgmer.gov.in/"},{"label":"Source 2","url":"https://www.ipgmer.gov.in/mbbs_admission_2026_all_india"}]},
  226: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://www.kem.edu/"},{"label":"Source 2","url":"https://www.kem.edu/gsmckemh/about/about-kem-hospital/"},{"label":"Source 3","url":"https://www.kem.edu/college"}]},
  230: {"academicFee":"Official site still displays 2021–22 MBBS fee schedule (~₹1.18 lakh/year in that schedule); do not treat as current 2026 fee.","hostelFee":"₹3,000 hostel deposit appears in the older displayed schedule; current rent not reconstructed.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Academic fee schedule is stale; current 2026 hostel notice is current.","confidence":"High that displayed schedule is old; Low for current amount","sources":[{"label":"Source 1","url":"https://tnmcnair.edu.in/"},{"label":"Source 2","url":"https://tnmcnair.edu.in/courses-and-fees/"}]},
  51: {"academicFee":"GMCH maintains a live 2026 academic-fee portal; exact MBBS total not reconstructed from the page text.","hostelFee":"Live hostel fee/electricity portals and rules available; exact room-specific annual total varies.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Current official 2026 portals","confidence":"High for currentness; Medium for exact amount because payment tables were not extracted","sources":[{"label":"Source 1","url":"https://gmch.gov.in/"},{"label":"Source 2","url":"https://gmch.gov.in/educational/hostels"},{"label":"Source 3","url":"https://gmch.gov.in/academic-fee"}]},
  66: {"academicFee":"Official BSAMCH page publishes Fee Structure Session 2025–26; exact components should be read from the linked schedule before quoting a total.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Official BSAMCH page publishes stipend-to-interns information including FMGs; exact current amount not inserted here without extracting the linked schedule.","bond":"Delhi service-bond policy may apply; verify against 2026 BSAMCH admission document.","penalty":"Not inserted without a current official source.","currentness":"2025–26 official fee/stipend page current enough for structure; exact values not extracted.","confidence":"Medium-High","sources":[{"label":"Source 1","url":"https://bsamch.ac.in/"},{"label":"Source 2","url":"https://bsah.delhi.gov.in/bsah/about-us"},{"label":"Source 3","url":"https://bsamch.ac.in/fee-structure/"}]},
  129: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://rimsranchi.ac.in/"}]},
  181: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://www.mgmmcindore.in/"},{"label":"Source 2","url":"https://www.mgmmcindore.in/hostel-committee.aspx"},{"label":"Source 3","url":"https://www.mgmmcindore.in/dean-message.aspx"}]},
  211: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"http://www.gmcnagpur.gov.in/"},{"label":"Source 2","url":"https://nagpur.gov.in/public-utility/government-medical-college-and-hospital/"},{"label":"Source 3","url":"https://timesofindia.indiatimes.com/city/nagpur/cm-rs-1000cr-given-for-gmch-mayo-finish-all-works-in-a-year/articleshow/121253945.cms"}]},
  248: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://scbmch.odisha.gov.in/en/light/subpage/infrastructure-facilities"},{"label":"Source 2","url":"https://www.scbmch.com/admissions/index.html"}]},
  327: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://stanleymedicalcollege.ac.in/"},{"label":"Source 2","url":"https://stanleymedicalcollege.ac.in/page/pro-forma"},{"label":"Source 3","url":"https://stanleymedicalcollege.ac.in/page/ladies-hostel"}]},
  323: {"academicFee":"Current 2026 MBBS academic fee not cleanly reconstructed in this pass.","hostelFee":"See hostel profile; current amount not inserted unless directly verified.","mess":"Variable / not cleanly verified.","internStipend":"Current official MBBS-intern stipend not cleanly reconstructed in this pass.","bond":"Current service-bond applicability should be verified from the latest state/institute admission notice.","penalty":"Not inserted without a current official source.","currentness":"Partial; requires institute/state 2026 admission-document verification for exact money figures.","confidence":"Low-Medium for money fields unless overridden below.","sources":[{"label":"Source 1","url":"https://www.mmcrgggh.tn.gov.in/ords/r/wsmmc/mmc12055555/home"},{"label":"Source 2","url":"https://www.tnhealth.org/tngovin/dme/dme.php"}]}

};

const DEEP_RESEARCH_REFRESH = {
  64:{freshness:'High',findings:[
    'AIIMS New Delhi now exposes its 69th Annual Report (2024–25) in the current annual-report archive, giving a recent institutional source for patient care, teaching and research context.',
    'The hostel FAQ was updated in late 2025: all undergraduate students are eligible for hostel accommodation; ordinary student rooms generally use common bathrooms, while some hostel types differ.',
    'Official hostel charges for MBBS remain exceptionally low: ₹2,728 across 5½ years, plus ₹1,000 refundable hostel security; boarding is extra.'
  ],sources:[['AIIMS Annual Reports','https://www.aiims.edu/index.php/en/about-us/annual-reports'],['AIIMS Hostel FAQ','https://www.aiims.edu/index.php/en/hostel_accomodation_faqs'],['AIIMS Hostel Fees','https://aiims.edu/index.php/en/hostel_accomodation_hos_official/fees']]},
  262:{freshness:'Medium-High',findings:[
    'The profile retains live-portal patient-load snapshots rather than treating a one-day count as a yearly average; this is deliberate.',
    'Student-level hostel and campus claims remain labelled separately because a current detailed official UG hostel rulebook was not cleanly recoverable in this pass.'
  ],sources:[]},
  72:{freshness:'High',findings:[
    'The VMMC student notice board is actively publishing 2026 MBBS attendance/internal-assessment records, so academic strictness is supported by current administrative evidence rather than old reviews.',
    'The 2025–26 hostel-allotment notice explicitly prioritises AIQ students residing outside Delhi; hostel eligibility and actual room allotment should therefore not be treated as the same thing.',
    'The institute published a specific MBBS-intern pay-structure notice on 4 Aug 2025; the finance layer uses the official notice rather than a generic Delhi stipend estimate.'
  ],sources:[['VMMC MBBS admissions','https://www.vmmc-sjh.mohfw.gov.in/mbbs-bds-admissions'],['VMMC student notice board','https://www.vmmc-sjh.mohfw.gov.in/students-notice-board'],['VMMC student zone','https://vmmc-sjh.mohfw.gov.in/student-zone']]},
  69:{freshness:'High',findings:[
    'MAMC currently lists seven undergraduate/intern hostel units across boys and girls accommodation; the hostel system is larger and more fragmented than a single “boys hostel / girls hostel” label suggests.',
    'The published UG hostel fee/rule schedule explicitly says fees are under revision and bans AC use with a ₹10,000 penalty, so old nominal charges are not presented as a guaranteed 2026 total.',
    'A 2025 Delhi government review documented severe overcrowding and ordered hostel renovation; this is kept beside the formal rulebook so users see both policy and lived infrastructure reality.'
  ],sources:[['MAMC hostel','https://mamc.delhi.gov.in/mamc/hostel'],['MAMC UG hostel rules','https://mamc.delhi.gov.in/mamc/under-graduate-hostel-rules'],['MAMC hostel charges','https://mamc.delhi.gov.in/mamc/hostel-charge']]},
  65:{freshness:'High',findings:[
    'ABVIMS/RML’s Student Corner has current 2026 MBBS hostel-fee notices and month-by-month stipend compliance notices, so finance/hostel currentness can be audited directly.',
    'The MBBS scholarship scheme announced in 2025 was withdrawn in January 2026 after no student had actually received a disbursement; it should not be counted as an available student benefit.',
    'The profile keeps RML hospital scale and the newer ABVIMS academic infrastructure separate: a strong hospital does not automatically mean a large traditional college campus.'
  ],sources:[['RML Student Corner','https://rmlh.nic.in/Index1.aspx?langid=1&lev=3&lid=3575&lsid=2581&pid=2571'],['RML Annual Reports','https://rmlh.nic.in/Index1.aspx?langid=1&lev=2&lid=3284&lsid=2262&pid=1233']]},
  71:{freshness:'Medium-High',findings:[
    'UCMS remains one of the pilot profiles with unusually good granular evidence on teaching schedules, 24×7 reading-room access and hostel administration.',
    'Room-sharing, cooler/AC reality and bathroom-density claims are retained as student-reported where the official material does not specify room-level configuration.'
  ],sources:[]},
  49:{freshness:'High',findings:[
    'PMCH’s own hostel page provides an unusually specific inventory: six boys’ hostels and one girls’ hostel, with listed capacities of 346 boys and 197 girls plus named single/double-room blocks and intern accommodation.',
    'Redevelopment must be time-stamped: the new G+9 block was bringing a 100-bed emergency ward and 272-bed medicine indoor capacity online while the wider 5,462-bed redevelopment remained phased.',
    'Current hostel/clinical experience is therefore explicitly marked block- and construction-phase dependent instead of being treated as a stable campus snapshot.'
  ],sources:[['PMCH hostel inventory','https://patnamedicalcollege.edu.in/hostel']]},
  45:{freshness:'Medium',findings:[
    'IGIMS keeps separate MBBS boys/girls hostel administration; year-wise sharing patterns remain student-reported because current official room-by-room allotment tables were not exposed.',
    'Older fee schedules are flagged as stale rather than silently relabelled “2026 fees”.'
  ],sources:[]},
  402:{freshness:'Medium-High',findings:[
    'KGMU continues to publish active 2026 MBBS examination notices, supporting the description of a tightly structured exam/assessment environment.',
    'Hostel quality remains block-dependent; the comparison does not collapse KGMU’s large hostel estate into one numerical room-quality score.'
  ],sources:[['KGMU exam notices','https://www.kgmu.org/exam_notice.php']]},
  220:{freshness:'High',findings:[
    'Grant/J.J.’s current official homepage reports 1,885+ beds, about 1.2 million outpatients and 80,000 inpatients annually across the J.J. hospital group.',
    'The 2026 Student Corner actively publishes UG MBBS bond applications, so bond administration is current rather than inferred from an old Maharashtra rule summary.',
    'Recent MBBS reviews still describe the boys’ hostel stock as severely worn and under repair, including Old Boys, Apna Boys and R.M. Bhatt blocks; this is kept as student-reported evidence.'
  ],sources:[['Grant/JJ official','https://gmcjjh.edu.in/'],['Grant Student Corner','https://gmcjjh.edu.in/student-corner-details/'],['Grant student reviews','https://www.shiksha.com/college/grant-medical-college-mumbai-central-mumbai-29767/infrastructure']]},
  168:{freshness:'Medium',findings:[
    'AIIMS Bhopal’s 2023–24 annual report is catalogued as a 2025 institute publication; current granular hospital-volume numbers were still not cleanly exposed in searchable official pages.',
    'Single-room/attached-washroom hostel claims therefore remain student-reported rather than upgraded to official fact.'
  ],sources:[['AIIMS Bhopal annual report catalogue','https://library.aiimsbhopal.edu.in/cgi-bin/koha/opac-detail.pl?biblionumber=12312']]},
  239:{freshness:'High',findings:[
    'AIIMS Bhubaneswar has a current 13th Annual Report for 2024–25, strengthening the institutional evidence base for clinical/research comparisons.',
    'The hostel/academic fee layer now has a current 2026 secondary cross-check, but official institute documents remain preferred where available.'
  ],sources:[['AIIMS Bhubaneswar Annual Report','https://aiimsbhubaneswar.nic.in/annualreport/annual-report-2024-25-english-version/']]},
  372:{freshness:'High',findings:[
    'Current AIIMS Rishikesh hostel administration identifies MBBS boys’ hostels as Buildings 77 and 78 and the MBBS girls’ hostel as Building 83.',
    'The institute separately assigns faculty in-charges to MBBS student Mess 1 and Mess 3, confirming that the undergraduate mess ecosystem is not a single generic canteen.',
    'The institute also exposes a 2024–25 annual report and a dedicated trauma-surgery contact/service structure.'
  ],sources:[['AIIMS Rishikesh Deaneries/hostel administration','https://aiimsrishikesh.edu.in/a1_1/?page_id=1890'],['AIIMS Rishikesh annual reports','https://aiimsrishikesh.edu.in/a1_1/?page_id=3301']]},
  189:{freshness:'High',findings:[
    'AIIMS Nagpur’s current campus page specifies a 13-floor UG male hostel and a 6-floor UG female hostel, plus round-the-clock hostel security/CCTV.',
    'The same official campus page documents an emergency block, day-care infusion/chemotherapy bays, CT/MRI, modern academic labs, e-library, outdoor and indoor sports areas and a gym.',
    'The MBBS notice board shows active 2025 hostel allotment notices and weekly/semester timetables, giving current evidence for both residential and academic administration.'
  ],sources:[['AIIMS Nagpur campus','https://aiimsnagpur.edu.in/campus'],['AIIMS Nagpur MBBS notices','https://dell.aiimsnagpur.edu.in/pages/student_notices_and_circulars_for_mbbs']]},
  38:{freshness:'Medium',findings:[
    'AIIMS Patna’s current student-management system confirms the breadth of medical training (MBBS through superspecialty, doctoral and fellowship levels).',
    'A current official room-by-room UG hostel profile still was not recoverable, so hostel confidence remains intentionally lower than for AIIMS Nagpur/Rishikesh.'
  ],sources:[['AIIMS Patna student system','https://sms.aiimspatna.edu.in/opd-roster/']]},
  255:{freshness:'High',findings:[
    'JIPMER published its 2024–25 Annual Report on 16 Feb 2026 and continues to surface active ICMR/project recruitment and research activity through the live portal.',
    'The comparison keeps JIPMER’s hospital/research strength separate from uncertain hostel room-level claims; room sharing is not guessed from old blogs.'
  ],sources:[['JIPMER Annual Reports','https://jipmer.edu.in/periodicals/jipmer-annual-report'],['JIPMER current portal','https://jipmer.ac.in/']]},
  288:{freshness:'Medium',findings:[
    'Recent MBBS reviewers describe strong campus facilities and Wi‑Fi but mixed teaching delivery, including PPT-heavy teaching in some departments.',
    'A 2025 student review specifically says the girls’ hostel is not inside the main campus; this is treated as student-reported location context, not as “no girls hostel”.'
  ],sources:[['SMS student reviews','https://www.careers360.com/colleges/sawai-man-singh-medical-college-jaipur/reviews']]},
  75:{freshness:'High',findings:[
    'BJMC hostel data has an unusual 2025 discontinuity: the newly constructed hostel/mess buildings hit by the AI 171 crash were evacuated and subjected to structural-stability assessment.',
    'Current room quality therefore cannot be safely inferred from pre-crash reviews; temporary/reallocated arrangements are explicitly treated as transitional.'
  ],sources:[]},
  360:{freshness:'Medium',findings:[
    'Osmania’s large legacy hospital ecosystem remains clinically important, but the current public pages did not yield enough reliable room-level hostel or 2026 fee detail to justify stronger claims.',
    'The dossier therefore preserves “unknown” rather than filling gaps with generic Telangana GMC assumptions.'
  ],sources:[]},
  440:{freshness:'High',findings:[
    'IPGMER’s official 2026 AIQ admission page sets the physical-admission fee at ₹6,500 for all categories, with ₹1,000 identified as the admission-fee component in refund rules.',
    'Its multidisciplinary research unit received the Centre of Research Excellence (CoRE) designation in 2026, strengthening the research profile beyond reputation alone.',
    'The SSKM ecosystem added the 131-bed “Ananya” Woodburn extension with modern monitoring, OPD/OT capacity and was simultaneously adding robotic surgery and a bone bank.'
  ],sources:[['IPGMER MBBS Admission 2026','https://www.ipgmer.gov.in/mbbs_admission_2026_all_india']]},
  226:{freshness:'Medium-High',findings:[
    'Recent student feedback continues to rate KEM/Seth GS very highly for clinical learning and teaching, while infrastructure quality varies sharply by department/building.',
    'The dossier therefore separates clinical/academic strength from hostel or general-infrastructure polish.'
  ],sources:[['Seth GS/KEM student reviews','https://www.careers360.com/colleges/seth-gs-medical-college-mumbai/reviews']]},
  230:{freshness:'High',findings:[
    'TNMC/Nair issued a current 4 Aug 2026 notice that first-MBBS girl students will not receive hostel accommodation in 2026–27 because the girls’ hostel is undergoing structural repair/renovation.',
    'The college’s public fee page still prominently shows a 2021–22 MBBS schedule, so it is deliberately treated as stale rather than relabelled as the 2026 fee.'
  ],sources:[['TNMC/Nair current notices','https://tnmcnair.edu.in/news-events/'],['TNMC/Nair fees','https://tnmcnair.edu.in/courses-and-fees/']]},
  51:{freshness:'High',findings:[
    'GMCH Chandigarh’s MBBS intake rises to 200 from 2026–27; a 2026 government proposal described 1,198 hospital beds and sufficient infrastructure/faculty for the expansion.',
    'The official hospital site confirms 24×7 emergency staffing in major specialties and a round-the-clock licensed blood bank.',
    'The college maintains live academic-fee and hostel administration pages, but an exact all-in MBBS fee is not inferred where the live tables are not exposed.'
  ],sources:[['GMCH academic fee','https://gmch.gov.in/academic-fee'],['GMCH citizen charter','https://gmch.gov.in/public-forum/citizen-charter']]},
  66:{freshness:'Medium',findings:[
    'BSA’s newer integrated campus/residential infrastructure remains a relative advantage, but detailed 2026 room-sharing and mess-cost evidence is still thinner than for the pilot Delhi colleges.',
    'That evidence gap is shown explicitly instead of awarding a neutral hostel score.'
  ],sources:[]},
  129:{freshness:'Medium-High',findings:[
    'RIMS has a large active emergency/critical-care burden; 2025 reporting described roughly 130 emergency and critical-care beds and efforts to decompress them using other wards.',
    'Recent student reviews still describe a large, affordable campus with good academics but more basic infrastructure than purpose-built newer institutes.'
  ],sources:[['RIMS official citizen charter','https://rimsranchi.ac.in/citizen_charter.php'],['RIMS facilities/reviews','https://www.careers360.com/colleges/rajendra-institute-of-medical-sciences-ranchi/facilities']]},
  181:{freshness:'Medium-High',findings:[
    'Recent 2026 MBBS reviews describe improving AC classrooms, library/reading rooms and sports/gym facilities, while hostel Wi‑Fi and washroom cleanliness remain recurring weaknesses.',
    'The comparison keeps those lived-experience claims separate from the official hostel block inventory.'
  ],sources:[['MGMMC Indore student reviews','https://www.careers360.com/colleges/mahatma-gandhi-memorial-medical-college-indore/fees']]},
  211:{freshness:'High',findings:[
    'GMCH Nagpur is in an active modernization cycle: recent projects include robotic surgery, cardiac cath lab, nuclear medicine/nuclear scan systems, smart classrooms and a new 250-bed resident-doctor hostel.',
    'This matters for comparisons because older reviews understate the current equipment/infrastructure trajectory.'
  ],sources:[]},
  248:{freshness:'Medium-High',findings:[
    'Recent 2026 student reviews repeatedly describe very high patient inflow and practical exposure, a large campus and a strong library/reading setup, while also noting that parts of the campus remain crowded/under modernization.',
    'The fee layer remains conservative because third-party 2026 totals are not treated as equivalent to an official Odisha admission notice.'
  ],sources:[['SCB student reviews/fees','https://www.careers360.com/colleges/scb-medical-college-cuttack/fees']]},
  327:{freshness:'High',findings:[
    'Stanley’s official women-hostel page publishes actual capacities: one 150-room UG block at 2 students/room, a 22-room J block at 3/room, a 97-room new UG block at 3/room and a separate intern block.',
    'Recent MBBS reports add a practical progression signal: first-year rooms commonly reported as 3-sharing, with 2-sharing in later years; common bathrooms, student-run mess, gym/study/recreation areas and Wi‑Fi are repeatedly reported.',
    'A statewide 2025 renovation programme includes Stanley hostel repairs, so block condition should be treated as changing rather than static.'
  ],sources:[['Stanley ladies hostel','https://stanleymedicalcollege.ac.in/page/ladies-hostel'],['Stanley student reviews','https://www.shiksha.com/college/stanley-medical-college-george-town-chennai-63161/reviews']]},
  323:{freshness:'Medium-High',findings:[
    'Madras Medical College hostel buildings were included in Tamil Nadu’s 2025 medical-college hostel renovation programme, including room/common-area repairs, CCTV improvements and accessibility work.',
    'Older student reviews praise clinical case diversity but should not be used as a current hostel-condition snapshot after the renovation cycle.'
  ],sources:[['MMC current fee/review cross-check','https://www.careers360.com/colleges/madras-medical-college-chennai/fees']]}
};
