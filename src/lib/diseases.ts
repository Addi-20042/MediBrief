import { extendedDiseases, extendedDiseaseCategories } from "./diseasesData";

export interface Disease {
  id: string;
  name: string;
  category: string;
  description: string;
  symptoms: string[];
  causes: string[];
  prevention: string[];
  treatment: string[];
  riskFactors: string[];
  whenToSeeDoctor: string;
}

// Original diseases - kept for reference
const originalDiseases: Disease[] = [
  {
    id: "diabetes-type-2",
    name: "Type 2 Diabetes",
    category: "Metabolic",
    description: "A chronic condition that affects the way your body metabolizes sugar (glucose). With type 2 diabetes, your body either resists the effects of insulin or doesn't produce enough insulin to maintain normal glucose levels.",
    symptoms: ["Increased thirst", "Frequent urination", "Increased hunger", "Unintended weight loss", "Fatigue", "Blurred vision", "Slow-healing sores", "Frequent infections", "Numbness in hands or feet", "Areas of darkened skin"],
    causes: ["Insulin resistance", "Genetics and family history", "Obesity or overweight", "Physical inactivity", "Poor diet", "Age (risk increases after 45)"],
    prevention: ["Maintain a healthy weight", "Regular physical activity", "Eat a balanced diet", "Avoid sugary foods and drinks", "Regular health check-ups", "Don't smoke"],
    treatment: ["Lifestyle changes", "Blood sugar monitoring", "Oral diabetes medications", "Insulin therapy", "Weight management", "Regular exercise"],
    riskFactors: ["Being overweight", "Fat distribution in abdomen", "Inactivity", "Family history", "Race and ethnicity", "Age", "Prediabetes", "Gestational diabetes history"],
    whenToSeeDoctor: "See your doctor if you notice any symptoms of type 2 diabetes, such as frequent urination, increased thirst, or unexplained weight loss."
  },
  {
    id: "hypertension",
    name: "Hypertension (High Blood Pressure)",
    category: "Cardiovascular",
    description: "A common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.",
    symptoms: ["Often no symptoms (silent killer)", "Headaches", "Shortness of breath", "Nosebleeds", "Dizziness", "Chest pain", "Visual changes", "Blood in urine"],
    causes: ["Primary hypertension develops gradually over years", "Secondary hypertension from underlying conditions", "Kidney disease", "Thyroid problems", "Sleep apnea", "Certain medications"],
    prevention: ["Regular exercise", "Healthy diet low in salt", "Maintain healthy weight", "Limit alcohol", "Don't smoke", "Manage stress", "Regular blood pressure checks"],
    treatment: ["Lifestyle modifications", "ACE inhibitors", "Calcium channel blockers", "Diuretics", "Beta blockers", "Regular monitoring"],
    riskFactors: ["Age", "Family history", "Being overweight", "Lack of physical activity", "Tobacco use", "Too much salt", "Too little potassium", "Excessive alcohol", "Stress"],
    whenToSeeDoctor: "If your blood pressure readings are consistently 130/80 mm Hg or higher, you should talk to your doctor about treatment options."
  },
  {
    id: "coronary-artery-disease",
    name: "Coronary Artery Disease",
    category: "Cardiovascular",
    description: "The most common type of heart disease, occurring when the arteries that supply blood to heart muscle become hardened and narrowed due to the buildup of cholesterol and plaque.",
    symptoms: ["Chest pain (angina)", "Shortness of breath", "Heart attack symptoms", "Pain in neck, jaw, throat", "Pain in upper abdomen or back", "Numbness or coldness in extremities"],
    causes: ["Atherosclerosis (plaque buildup)", "High cholesterol", "High blood pressure", "Smoking", "Diabetes", "Inflammation of blood vessels"],
    prevention: ["Quit smoking", "Control blood pressure", "Check cholesterol", "Manage diabetes", "Regular exercise", "Maintain healthy weight", "Eat heart-healthy diet", "Reduce stress"],
    treatment: ["Lifestyle changes", "Medications (statins, aspirin, beta blockers)", "Angioplasty and stent placement", "Coronary artery bypass surgery"],
    riskFactors: ["Age", "Male sex", "Family history", "Smoking", "High blood pressure", "High cholesterol", "Diabetes", "Obesity", "Physical inactivity", "Unhealthy diet", "Chronic stress"],
    whenToSeeDoctor: "Seek emergency care if you have chest pain, shortness of breath, or symptoms of a heart attack. If you have risk factors, see your doctor for heart health screening."
  },
  {
    id: "asthma",
    name: "Asthma",
    category: "Respiratory",
    description: "A condition in which your airways narrow and swell and may produce extra mucus. This can make breathing difficult and trigger coughing, a whistling sound when you breathe out, and shortness of breath.",
    symptoms: ["Shortness of breath", "Chest tightness or pain", "Wheezing", "Trouble sleeping due to breathing", "Coughing attacks worsened by cold or flu", "Whistling sound when exhaling"],
    causes: ["Genetic factors", "Environmental allergens", "Respiratory infections in childhood", "Airborne substances", "Physical activity", "Cold air", "Air pollutants"],
    prevention: ["Identify and avoid triggers", "Get vaccinated for flu and pneumonia", "Monitor your breathing", "Take medications as prescribed", "Control allergies", "Maintain healthy weight"],
    treatment: ["Quick-relief inhalers", "Long-term control medications", "Allergy medications", "Bronchial thermoplasty", "Biologic therapy for severe asthma"],
    riskFactors: ["Family history of asthma", "Allergic conditions", "Being overweight", "Smoking", "Exposure to secondhand smoke", "Occupational triggers", "Air pollution"],
    whenToSeeDoctor: "See your doctor if you have frequent coughing or wheezing that lasts more than a few days, or if you have severe asthma attacks despite treatment."
  },
  {
    id: "pneumonia",
    name: "Pneumonia",
    category: "Respiratory",
    description: "An infection that inflames the air sacs in one or both lungs. The air sacs may fill with fluid or pus, causing cough with phlegm, fever, chills, and difficulty breathing.",
    symptoms: ["Chest pain when breathing or coughing", "Confusion (in adults 65 and older)", "Cough with phlegm", "Fatigue", "Fever, sweating, chills", "Lower than normal body temperature", "Nausea, vomiting, diarrhea", "Shortness of breath"],
    causes: ["Bacteria (most common)", "Viruses including COVID-19", "Fungi", "Aspiration of food or liquids"],
    prevention: ["Get vaccinated", "Practice good hygiene", "Don't smoke", "Keep immune system strong", "Cover coughs and sneezes"],
    treatment: ["Antibiotics for bacterial pneumonia", "Antiviral medications", "Fever reducers", "Cough medicine", "Rest and fluids", "Hospitalization for severe cases"],
    riskFactors: ["Being hospitalized", "Chronic disease", "Smoking", "Weakened immune system", "Age (very young or over 65)"],
    whenToSeeDoctor: "See a doctor if you have difficulty breathing, chest pain, persistent fever of 102°F or higher, or persistent cough with pus."
  },
  {
    id: "migraine",
    name: "Migraine",
    category: "Neurological",
    description: "A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound. Migraines can cause severe throbbing pain, usually on one side of the head.",
    symptoms: ["Moderate to severe pain", "Throbbing or pulsing sensation", "Sensitivity to light, sound, smell", "Nausea and vomiting", "Blurred vision", "Lightheadedness", "Aura (visual disturbances)"],
    causes: ["Genetic factors", "Hormonal changes", "Stress", "Sensory stimuli", "Sleep changes", "Weather changes", "Certain foods and drinks", "Medications"],
    prevention: ["Identify and avoid triggers", "Regular sleep schedule", "Stay hydrated", "Regular exercise", "Stress management", "Keep a migraine diary"],
    treatment: ["Pain relievers", "Triptans", "Anti-nausea medications", "Preventive medications", "CGRP antagonists", "Botox injections"],
    riskFactors: ["Family history", "Age (peak in 30s)", "Sex (women 3x more likely)", "Hormonal changes"],
    whenToSeeDoctor: "See a doctor if your headaches are severe, frequent, or accompanied by fever, stiff neck, confusion, seizures, double vision, or weakness."
  },
  {
    id: "depression",
    name: "Depression (Major Depressive Disorder)",
    category: "Mental Health",
    description: "A mood disorder that causes a persistent feeling of sadness and loss of interest. It affects how you feel, think, and behave and can lead to various emotional and physical problems.",
    symptoms: ["Persistent sad or empty mood", "Loss of interest in activities", "Changes in appetite", "Sleep disturbances", "Fatigue", "Feelings of worthlessness", "Difficulty concentrating", "Thoughts of death or suicide"],
    causes: ["Brain chemistry imbalances", "Hormonal changes", "Inherited traits", "Early childhood trauma", "Learned patterns of negative thinking"],
    prevention: ["Build strong relationships", "Get regular exercise", "Learn healthy coping skills", "Seek help early", "Long-term treatment to prevent relapse"],
    treatment: ["Psychotherapy", "Antidepressant medications", "Brain stimulation therapies", "Exercise programs", "Support groups"],
    riskFactors: ["Personal or family history", "Major life changes or trauma", "Chronic illness", "Certain medications", "Personality traits", "Substance abuse"],
    whenToSeeDoctor: "Seek help immediately if you have thoughts of suicide. See a doctor if you've felt sad or hopeless for more than two weeks and it's interfering with your daily life."
  },
  {
    id: "anxiety-disorder",
    name: "Generalized Anxiety Disorder",
    category: "Mental Health",
    description: "A mental health disorder characterized by persistent and excessive worry about various aspects of everyday life, out of proportion to the actual source of worry.",
    symptoms: ["Persistent worrying", "Overthinking plans and solutions", "Perceiving situations as threatening", "Difficulty handling uncertainty", "Indecisiveness", "Inability to relax", "Difficulty concentrating", "Fatigue", "Trouble sleeping", "Muscle tension"],
    causes: ["Brain chemistry", "Genetics", "Personality", "Life experiences"],
    prevention: ["Get help early", "Keep a journal", "Prioritize your time", "Avoid unhealthy substance use", "Stay physically active"],
    treatment: ["Psychotherapy (especially CBT)", "Medications (antidepressants, buspirone, benzodiazepines)", "Lifestyle changes", "Relaxation techniques"],
    riskFactors: ["Personality (naturally timid)", "Genetics", "Life experiences (negative or traumatic)", "Having other mental health disorders", "Chronic medical conditions"],
    whenToSeeDoctor: "See a doctor if your worrying is affecting your work, relationships, or other parts of your life, or if you're depressed, using drugs or alcohol, or having suicidal thoughts."
  },
  {
    id: "osteoarthritis",
    name: "Osteoarthritis",
    category: "Musculoskeletal",
    description: "The most common form of arthritis, occurring when the protective cartilage that cushions the ends of your bones wears down over time, most commonly affecting hands, knees, hips, and spine.",
    symptoms: ["Pain during or after movement", "Stiffness especially in the morning", "Tenderness when applying pressure", "Loss of flexibility", "Grating sensation", "Bone spurs", "Swelling"],
    causes: ["Aging", "Joint injury", "Repeated stress on joint", "Obesity", "Genetics", "Bone deformities", "Certain metabolic diseases"],
    prevention: ["Maintain healthy weight", "Control blood sugar", "Stay active", "Protect joints from injury", "Choose low-impact exercises"],
    treatment: ["Pain relievers", "NSAIDs", "Physical therapy", "Occupational therapy", "Cortisone injections", "Joint replacement surgery"],
    riskFactors: ["Older age", "Sex (women more likely)", "Obesity", "Joint injuries", "Repeated stress", "Genetics", "Bone deformities", "Certain metabolic diseases"],
    whenToSeeDoctor: "See a doctor if you have joint pain or stiffness that doesn't go away, or if your symptoms are interfering with your daily activities."
  },
  {
    id: "rheumatoid-arthritis",
    name: "Rheumatoid Arthritis",
    category: "Autoimmune",
    description: "A chronic inflammatory disorder affecting many joints, including those in the hands and feet. Unlike osteoarthritis, rheumatoid arthritis affects the lining of your joints.",
    symptoms: ["Tender, warm, swollen joints", "Joint stiffness worse in morning", "Fatigue, fever, loss of appetite", "Symmetrical joint involvement", "Rheumatoid nodules"],
    causes: ["Autoimmune response", "Genetics", "Environmental factors", "Hormonal factors"],
    prevention: ["Stop smoking", "Maintain healthy weight", "Limit red meat consumption", "Regular exercise"],
    treatment: ["NSAIDs", "Steroids", "Disease-modifying antirheumatic drugs", "Biologic agents", "Physical therapy", "Surgery"],
    riskFactors: ["Sex (women more likely)", "Age (usually begins between 30-60)", "Family history", "Smoking", "Obesity"],
    whenToSeeDoctor: "See a doctor if you have persistent discomfort and swelling in your joints, especially if it affects multiple joints symmetrically."
  },
  {
    id: "copd",
    name: "COPD (Chronic Obstructive Pulmonary Disease)",
    category: "Respiratory",
    description: "A chronic inflammatory lung disease that causes obstructed airflow from the lungs, including emphysema and chronic bronchitis.",
    symptoms: ["Shortness of breath", "Wheezing", "Chronic cough with mucus", "Frequent respiratory infections", "Lack of energy", "Unintended weight loss", "Swelling in ankles, feet, or legs"],
    causes: ["Tobacco smoke (primary cause)", "Occupational exposure", "Indoor air pollution", "Genetics (alpha-1-antitrypsin deficiency)"],
    prevention: ["Don't smoke or quit smoking", "Avoid secondhand smoke", "Avoid occupational lung irritants", "Get flu and pneumonia vaccines"],
    treatment: ["Bronchodilators", "Inhaled steroids", "Combination inhalers", "Oral steroids", "Pulmonary rehabilitation", "Oxygen therapy", "Lung surgery"],
    riskFactors: ["Exposure to tobacco smoke", "Asthma", "Occupational exposure", "Exposure to fumes from burning fuel", "Genetics", "Age"],
    whenToSeeDoctor: "See a doctor if your symptoms are not improving or getting worse, if you have a blue or gray discoloration of your lips or fingernails, or if you can't catch your breath."
  },
  {
    id: "stroke",
    name: "Stroke",
    category: "Cardiovascular",
    description: "Occurs when the blood supply to part of your brain is interrupted or reduced, preventing brain tissue from getting oxygen and nutrients. Brain cells begin to die within minutes.",
    symptoms: ["Trouble speaking and understanding", "Paralysis or numbness of face, arm, or leg", "Vision problems", "Headache (severe and sudden)", "Trouble walking, dizziness, loss of balance"],
    causes: ["Blocked artery (ischemic stroke)", "Leaking or bursting blood vessel (hemorrhagic stroke)", "Temporary disruption of blood flow (TIA)"],
    prevention: ["Control high blood pressure", "Lower cholesterol and saturated fat", "Quit smoking", "Control diabetes", "Maintain healthy weight", "Exercise regularly", "Treat sleep apnea", "Avoid illegal drugs"],
    treatment: ["Emergency IV medication (tPA)", "Emergency procedures", "Medications to reduce brain pressure", "Carotid endarterectomy", "Rehabilitation therapy"],
    riskFactors: ["High blood pressure", "Cigarette smoking", "Diabetes", "High cholesterol", "Obesity", "Physical inactivity", "Heavy drinking", "Sleep apnea", "Heart disease", "Family history"],
    whenToSeeDoctor: "Seek immediate emergency care if you notice any signs of stroke. Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services."
  },
  {
    id: "alzheimers",
    name: "Alzheimer's Disease",
    category: "Neurological",
    description: "A progressive disease that destroys memory and other important mental functions. It's the most common cause of dementia among older adults.",
    symptoms: ["Memory loss affecting daily life", "Difficulty planning or solving problems", "Confusion with time or place", "Vision problems", "Problems with words in speaking or writing", "Misplacing things", "Poor judgment", "Withdrawal from work or social activities", "Changes in mood and personality"],
    causes: ["Combination of genetic, lifestyle, and environmental factors", "Brain cell damage", "Plaques and tangles in brain"],
    prevention: ["Regular exercise", "Heart-healthy diet", "Stay socially engaged", "Keep mind active", "Quality sleep", "Manage cardiovascular risks"],
    treatment: ["Cholinesterase inhibitors", "Memantine", "Managing behavioral symptoms", "Creating a safe environment", "Regular exercise programs"],
    riskFactors: ["Age", "Family history and genetics", "Down syndrome", "Sex (women more common)", "Past head trauma", "Poor sleep patterns", "Lifestyle factors"],
    whenToSeeDoctor: "See a doctor if you or a loved one has memory problems or other dementia symptoms. Early diagnosis allows early treatment planning."
  },
  {
    id: "kidney-disease",
    name: "Chronic Kidney Disease",
    category: "Renal",
    description: "The gradual loss of kidney function over time. Your kidneys filter wastes and excess fluids from your blood, which are then removed in your urine.",
    symptoms: ["Nausea", "Vomiting", "Loss of appetite", "Fatigue and weakness", "Sleep problems", "Urination changes", "Decreased mental sharpness", "Muscle cramps", "Swelling of feet and ankles", "Persistent itching", "Chest pain", "Shortness of breath", "High blood pressure"],
    causes: ["Type 1 or type 2 diabetes", "High blood pressure", "Glomerulonephritis", "Polycystic kidney disease", "Prolonged urinary tract obstruction", "Recurrent kidney infections"],
    prevention: ["Follow medication instructions", "Maintain healthy weight", "Don't smoke", "Manage health conditions", "Regular screening if at risk"],
    treatment: ["Blood pressure medications", "Cholesterol medications", "Anemia medications", "Diuretics", "Calcium and vitamin D supplements", "Dialysis", "Kidney transplant"],
    riskFactors: ["Diabetes", "High blood pressure", "Heart disease", "Smoking", "Obesity", "Family history", "Abnormal kidney structure", "Older age"],
    whenToSeeDoctor: "See a doctor if you have symptoms of kidney disease, or if you have risk factors and haven't been screened recently."
  },
  {
    id: "hepatitis-b",
    name: "Hepatitis B",
    category: "Infectious",
    description: "A serious liver infection caused by the hepatitis B virus (HBV). For some people, hepatitis B infection becomes chronic, leading to liver failure, liver cancer, or cirrhosis.",
    symptoms: ["Abdominal pain", "Dark urine", "Fever", "Joint pain", "Loss of appetite", "Nausea and vomiting", "Weakness and fatigue", "Yellowing of skin and eyes (jaundice)"],
    causes: ["Hepatitis B virus spread through blood, semen, or other body fluids"],
    prevention: ["Hepatitis B vaccine", "Know the HBV status of any sexual partner", "Use clean needles", "Be cautious about body piercing and tattooing", "Ask about the hepatitis B vaccine before traveling"],
    treatment: ["Antiviral medications", "Interferon injections", "Liver transplant (in advanced cases)"],
    riskFactors: ["Having unprotected sex with multiple partners", "Sharing needles", "Being a healthcare worker", "Traveling to high-risk areas", "Living with someone who has HBV", "Being born to an infected mother"],
    whenToSeeDoctor: "See a doctor if you think you've been exposed to hepatitis B, experience symptoms, or if you're at high risk and haven't been vaccinated."
  },
  {
    id: "tuberculosis",
    name: "Tuberculosis (TB)",
    category: "Infectious",
    description: "A potentially serious infectious disease that mainly affects the lungs. The bacteria that cause tuberculosis are spread from person to person through tiny droplets released into the air.",
    symptoms: ["Coughing for three weeks or longer", "Coughing up blood", "Chest pain", "Pain with breathing or coughing", "Unintentional weight loss", "Fatigue", "Fever", "Night sweats", "Chills", "Loss of appetite"],
    causes: ["Mycobacterium tuberculosis bacteria spread through airborne droplets"],
    prevention: ["BCG vaccine", "Good ventilation", "Cover mouth when coughing", "Complete full course of treatment if infected", "Testing and treatment of latent TB"],
    treatment: ["Antibiotics for 6-9 months (isoniazid, rifampin, ethambutol, pyrazinamide)", "Directly observed therapy", "Treatment of latent TB"],
    riskFactors: ["Weakened immune system", "Travel to high-risk areas", "Poverty and substance abuse", "Healthcare work", "Living in residential care facilities"],
    whenToSeeDoctor: "See a doctor if you have fever, unexplained weight loss, drenching night sweats, or a persistent cough. This is especially important if you've been exposed to TB."
  },
  {
    id: "thyroid-disorders",
    name: "Thyroid Disorders",
    category: "Endocrine",
    description: "Conditions that affect the thyroid gland, including hypothyroidism (underactive thyroid), hyperthyroidism (overactive thyroid), thyroid nodules, and thyroid cancer.",
    symptoms: ["Fatigue", "Weight changes", "Temperature sensitivity", "Heart rate changes", "Mood changes", "Hair loss", "Muscle weakness", "Menstrual irregularities", "Swelling in neck (goiter)"],
    causes: ["Autoimmune diseases", "Iodine deficiency or excess", "Thyroid nodules", "Thyroiditis", "Genetic factors", "Radiation exposure"],
    prevention: ["Get adequate iodine", "Regular thyroid checks if at risk", "Protect thyroid during radiation exposure", "Manage autoimmune conditions"],
    treatment: ["Thyroid hormone replacement (for hypothyroidism)", "Anti-thyroid medications", "Radioactive iodine", "Surgery", "Beta blockers"],
    riskFactors: ["Family history", "Being female", "Age over 60", "History of autoimmune disease", "Previous thyroid surgery or radiation", "Pregnancy or recent delivery"],
    whenToSeeDoctor: "See a doctor if you notice a lump in your neck, have symptoms of thyroid problems, or have a family history of thyroid disease."
  },
  {
    id: "celiac-disease",
    name: "Celiac Disease",
    category: "Autoimmune",
    description: "An immune reaction to eating gluten, a protein found in wheat, barley, and rye. In people with celiac disease, eating gluten triggers an immune response in the small intestine.",
    symptoms: ["Diarrhea", "Bloating and gas", "Fatigue", "Weight loss", "Anemia", "Osteoporosis", "Itchy skin rash (dermatitis herpetiformis)", "Mouth ulcers", "Headaches", "Joint pain", "Numbness and tingling in hands and feet"],
    causes: ["Genetic predisposition", "Gluten consumption", "Environmental triggers"],
    prevention: ["Strict gluten-free diet (for those diagnosed)", "Early screening for family members", "Breastfeeding and timing of gluten introduction may play a role"],
    treatment: ["Strict gluten-free diet", "Vitamin and mineral supplements", "Medications for dermatitis herpetiformis", "Follow-up testing"],
    riskFactors: ["Family member with celiac disease", "Type 1 diabetes", "Down syndrome", "Autoimmune thyroid disease", "Addison's disease", "Rheumatoid arthritis"],
    whenToSeeDoctor: "See a doctor if you have persistent digestive symptoms, especially if a family member has celiac disease."
  },
  {
    id: "ibs",
    name: "Irritable Bowel Syndrome (IBS)",
    category: "Gastrointestinal",
    description: "A common disorder affecting the large intestine. Signs and symptoms include cramping, abdominal pain, bloating, gas, and diarrhea or constipation, or both.",
    symptoms: ["Abdominal pain and cramping", "Bloating", "Gas", "Diarrhea or constipation (or both)", "Mucus in stool", "Symptoms triggered by stress or certain foods"],
    causes: ["Muscle contractions in the intestine", "Nervous system abnormalities", "Severe infection", "Early life stress", "Changes in gut microbes"],
    prevention: ["Manage stress", "Learn your triggers", "Regular exercise", "Adequate sleep", "Probiotics"],
    treatment: ["Dietary changes", "Fiber supplements", "Laxatives", "Anti-diarrheal medications", "Antispasmodics", "Antidepressants", "IBS-specific medications"],
    riskFactors: ["Young age", "Being female", "Family history", "Anxiety, depression, or other mental health issues", "History of sexual, physical, or emotional abuse"],
    whenToSeeDoctor: "See a doctor if you have persistent changes in bowel habits, signs of more serious conditions like rectal bleeding, unexplained weight loss, or symptoms that wake you at night."
  },
  {
    id: "lupus",
    name: "Systemic Lupus Erythematosus (Lupus)",
    category: "Autoimmune",
    description: "A chronic autoimmune disease that can cause inflammation and pain in any part of your body. Lupus most commonly affects your skin, joints, and internal organs.",
    symptoms: ["Fatigue", "Fever", "Joint pain, stiffness, and swelling", "Butterfly-shaped rash on face", "Skin lesions worsened by sun", "Fingers turning white or blue in cold", "Shortness of breath", "Chest pain", "Dry eyes", "Headaches, confusion, memory loss"],
    causes: ["Unknown, but involves immune system attacking healthy tissue", "Genetic factors", "Environmental triggers", "Hormonal factors"],
    prevention: ["Avoid sun exposure", "Don't smoke", "Regular exercise", "Healthy diet"],
    treatment: ["NSAIDs", "Antimalarial drugs", "Corticosteroids", "Immunosuppressants", "Biologics"],
    riskFactors: ["Being female", "Age (15-45 most common)", "Race (more common in African Americans, Hispanics, and Asian Americans)"],
    whenToSeeDoctor: "See a doctor if you develop an unexplained rash, ongoing fever, persistent fatigue, or achy painful joints."
  },
  {
    id: "psoriasis",
    name: "Psoriasis",
    category: "Autoimmune",
    description: "A skin disease that causes red, itchy scaly patches, most commonly on the knees, elbows, trunk, and scalp. It's a chronic disease with no cure, often going through cycles.",
    symptoms: ["Red patches with thick silvery scales", "Dry, cracked skin that may bleed", "Itching, burning, or soreness", "Thickened or ridged nails", "Swollen and stiff joints"],
    causes: ["Immune system malfunction causing rapid skin cell turnover", "Genetic factors", "Environmental triggers"],
    prevention: ["Moisturize skin", "Avoid triggers", "Limit alcohol", "Maintain healthy weight", "Manage stress"],
    treatment: ["Topical treatments", "Light therapy", "Oral or injected medications", "Biologics"],
    riskFactors: ["Family history", "Stress", "Smoking", "Obesity", "Viral and bacterial infections"],
    whenToSeeDoctor: "See a doctor if your condition is severe, widespread, causing discomfort, doesn't respond to treatment, or if you develop joint problems."
  },
  {
    id: "gerd",
    name: "GERD (Gastroesophageal Reflux Disease)",
    category: "Gastrointestinal",
    description: "A chronic digestive disease occurring when stomach acid or bile flows back into your food pipe (esophagus). This backwash irritates the lining of your esophagus.",
    symptoms: ["Burning sensation in chest (heartburn)", "Difficulty swallowing", "Regurgitation of food or sour liquid", "Sensation of lump in throat", "Chronic cough", "Laryngitis", "Disrupted sleep"],
    causes: ["Weakening of lower esophageal sphincter", "Hiatal hernia", "Abnormal esophageal contractions"],
    prevention: ["Maintain healthy weight", "Avoid tight clothing", "Avoid trigger foods", "Eat smaller meals", "Don't lie down after eating", "Elevate head of bed", "Don't smoke"],
    treatment: ["Antacids", "H-2 receptor blockers", "Proton pump inhibitors", "Prokinetics", "Surgery (fundoplication)"],
    riskFactors: ["Obesity", "Hiatal hernia", "Pregnancy", "Connective tissue disorders", "Delayed stomach emptying", "Smoking", "Eating large meals or late at night", "Fatty or fried foods", "Alcohol or coffee"],
    whenToSeeDoctor: "See a doctor if you have chest pain, difficulty swallowing, frequent or severe heartburn, or heartburn with weight loss."
  },
  {
    id: "anemia",
    name: "Anemia",
    category: "Blood Disorders",
    description: "A condition in which you lack enough healthy red blood cells to carry adequate oxygen to your body's tissues. This can make you feel tired and weak.",
    symptoms: ["Fatigue", "Weakness", "Pale or yellowish skin", "Irregular heartbeats", "Shortness of breath", "Dizziness", "Chest pain", "Cold hands and feet", "Headaches"],
    causes: ["Iron deficiency", "Vitamin deficiency", "Chronic disease", "Bone marrow disease", "Hemolysis", "Genetic conditions"],
    prevention: ["Iron-rich diet", "Vitamin C to enhance iron absorption", "Folate-rich foods", "Vitamin B-12", "Regular health checkups"],
    treatment: ["Iron supplements", "Vitamin supplements", "Blood transfusions", "Bone marrow transplant", "Treating underlying conditions"],
    riskFactors: ["Poor diet", "Intestinal disorders", "Menstruation", "Pregnancy", "Chronic conditions", "Family history", "Age", "Alcohol use"],
    whenToSeeDoctor: "See a doctor if you're feeling fatigued for no reason, especially if you're at risk for anemia. Some anemias can be life-threatening if not diagnosed and treated."
  },
  {
    id: "epilepsy",
    name: "Epilepsy",
    category: "Neurological",
    description: "A central nervous system disorder in which brain activity becomes abnormal, causing seizures or periods of unusual behavior, sensations, and sometimes loss of awareness.",
    symptoms: ["Temporary confusion", "Staring spell", "Uncontrollable jerking movements", "Loss of consciousness", "Psychic symptoms (fear, anxiety, déjà vu)", "Stiffening of muscles"],
    causes: ["Genetic influence", "Head trauma", "Brain conditions", "Infectious diseases", "Prenatal injury", "Developmental disorders"],
    prevention: ["Wear seatbelts and helmets", "Get adequate sleep", "Exercise regularly", "Manage stress", "Avoid drugs and excessive alcohol"],
    treatment: ["Anti-seizure medications", "Surgery", "Vagus nerve stimulation", "Ketogenic diet", "Deep brain stimulation"],
    riskFactors: ["Age (more common in early childhood and after 60)", "Family history", "Head injuries", "Stroke and other vascular diseases", "Dementia", "Brain infections", "Seizures in childhood"],
    whenToSeeDoctor: "Seek immediate help if a seizure lasts more than five minutes, breathing or consciousness doesn't return, a second seizure follows immediately, you have a high fever, you're pregnant, or it's your first seizure."
  },
  {
    id: "parkinsons",
    name: "Parkinson's Disease",
    category: "Neurological",
    description: "A progressive nervous system disorder that affects movement. Symptoms start gradually, sometimes with a barely noticeable tremor in just one hand.",
    symptoms: ["Tremor", "Slowed movement (bradykinesia)", "Rigid muscles", "Impaired posture and balance", "Loss of automatic movements", "Speech changes", "Writing changes"],
    causes: ["Loss of nerve cells in substantia nigra", "Low dopamine levels", "Genetic mutations", "Environmental triggers"],
    prevention: ["Regular aerobic exercise", "Caffeine may be protective", "Green tea may be protective", "Research ongoing"],
    treatment: ["Carbidopa-levodopa", "Dopamine agonists", "MAO B inhibitors", "COMT inhibitors", "Deep brain stimulation", "Physical therapy"],
    riskFactors: ["Age", "Heredity", "Sex (men more likely)", "Exposure to toxins"],
    whenToSeeDoctor: "See a doctor if you have any of the symptoms associated with Parkinson's disease. Early diagnosis and treatment can help maintain mobility and quality of life."
  },
  {
    id: "multiple-sclerosis",
    name: "Multiple Sclerosis (MS)",
    category: "Autoimmune",
    description: "A disease in which the immune system eats away at the protective covering of nerves. MS can cause permanent damage or deterioration of nerves.",
    symptoms: ["Numbness or weakness in limbs", "Electric-shock sensations with neck movement", "Tremor, lack of coordination", "Partial or complete vision loss", "Double vision", "Slurred speech", "Fatigue", "Dizziness", "Bowel and bladder dysfunction"],
    causes: ["Autoimmune destruction of myelin", "Unknown trigger", "Genetic factors", "Environmental factors"],
    prevention: ["No known prevention", "Vitamin D may be protective", "Don't smoke", "Healthy lifestyle"],
    treatment: ["Corticosteroids", "Plasma exchange", "Disease-modifying therapies", "Physical therapy", "Muscle relaxants"],
    riskFactors: ["Age (typically 20-40)", "Sex (women more common)", "Family history", "Certain infections", "Race", "Climate", "Vitamin D", "Certain autoimmune diseases", "Smoking"],
    whenToSeeDoctor: "See a doctor if you experience any unexplained symptoms, especially numbness, weakness, vision changes, or problems with balance."
  }
];

// Combine original and extended diseases
export const diseases: Disease[] = [...originalDiseases, ...extendedDiseases];

// Use extended categories
export const diseaseCategories = extendedDiseaseCategories;
