// Clinical exposure research profiles.
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
