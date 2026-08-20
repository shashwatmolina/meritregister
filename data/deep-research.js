// Latest evidence refresh and source notes.
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
