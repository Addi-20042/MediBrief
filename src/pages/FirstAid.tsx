import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Layout from "@/components/layout/Layout";
import {
  Search,
  Heart,
  Flame,
  Droplets,
  Skull,
  Zap,
  AlertTriangle,
  Baby,
  Bone,
  ThermometerSun,
  Bug,
  Wind,
  Eye,
  Pill,
  Activity,
  HeartPulse,
  Scissors,
  Brain,
} from "lucide-react";

interface FirstAidGuide {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: string;
  severity: "critical" | "high" | "medium";
  overview: string;
  steps: { title: string; description: string }[];
  doNot: string[];
  seekHelp: string;
}

const firstAidGuides: FirstAidGuide[] = [
  {
    id: "cpr",
    title: "CPR (Cardiopulmonary Resuscitation)",
    icon: <HeartPulse className="h-6 w-6" />,
    category: "Life-Saving",
    severity: "critical",
    overview: "CPR is performed when someone's heart stops beating. It keeps blood flowing to vital organs until emergency help arrives.",
    steps: [
      { title: "Check Responsiveness", description: "Tap the person's shoulder and shout 'Are you okay?' Look for normal breathing for no more than 10 seconds." },
      { title: "Call for Help", description: "If unresponsive, call 112 or have someone else call. Get an AED if available." },
      { title: "Position Hands", description: "Place the heel of one hand on the center of the chest (lower half of breastbone). Place other hand on top, interlocking fingers." },
      { title: "Perform Compressions", description: "Push hard and fast - at least 2 inches deep, at a rate of 100-120 compressions per minute. Allow full chest recoil between compressions." },
      { title: "Give Rescue Breaths (If Trained)", description: "After 30 compressions, tilt head back, lift chin, pinch nose, and give 2 breaths. Each breath should take 1 second and make chest rise." },
      { title: "Continue CPR", description: "Continue cycles of 30 compressions and 2 breaths until help arrives or person starts breathing." },
    ],
    doNot: [
      "Don't stop CPR unless the person shows signs of life or emergency personnel take over",
      "Don't compress too slowly or too shallowly",
      "Don't lean on chest between compressions",
    ],
    seekHelp: "Always call emergency services immediately when someone is unresponsive and not breathing normally.",
  },
  {
    id: "choking",
    title: "Choking",
    icon: <Wind className="h-6 w-6" />,
    category: "Life-Saving",
    severity: "critical",
    overview: "Choking occurs when an object blocks the airway. Quick action can save a life.",
    steps: [
      { title: "Assess the Situation", description: "Ask 'Are you choking?' If they can cough or speak, encourage them to keep coughing. If they cannot breathe, cough, or speak, proceed with the following steps." },
      { title: "Call for Help", description: "Have someone call 112 while you help, or call yourself if alone." },
      { title: "Perform Back Blows", description: "Stand behind the person, lean them forward. Give 5 firm back blows between shoulder blades with the heel of your hand." },
      { title: "Perform Abdominal Thrusts (Heimlich)", description: "Stand behind, wrap arms around waist. Make a fist with one hand, place it above navel. Grasp fist with other hand, give 5 quick upward thrusts." },
      { title: "Repeat", description: "Continue alternating 5 back blows and 5 abdominal thrusts until object is expelled or person becomes unconscious." },
      { title: "If Unconscious", description: "Lower person to ground, call 112, begin CPR. Before each breath, look in mouth for object - remove only if clearly visible." },
    ],
    doNot: [
      "Don't perform abdominal thrusts on pregnant women or obese individuals (use chest thrusts instead)",
      "Don't try to retrieve the object with your fingers unless clearly visible",
      "Don't give water or food to someone who is choking",
    ],
    seekHelp: "Call emergency services if choking persists, person loses consciousness, or after any severe choking episode.",
  },
  {
    id: "severe-bleeding",
    title: "Severe Bleeding",
    icon: <Droplets className="h-6 w-6" />,
    category: "Trauma",
    severity: "critical",
    overview: "Severe bleeding can be life-threatening within minutes. Quick action to stop blood loss is crucial.",
    steps: [
      { title: "Ensure Safety", description: "Make sure the scene is safe. Wear gloves if available to protect yourself from bloodborne diseases." },
      { title: "Call Emergency Services", description: "Call 112 or have someone call while you provide first aid." },
      { title: "Apply Direct Pressure", description: "Press firmly on the wound with a clean cloth, bandage, or clothing. If blood soaks through, add more layers without removing the first one." },
      { title: "Apply Pressure Continuously", description: "Keep pressing firmly for at least 10-15 minutes without checking. Don't release pressure to look at the wound." },
      { title: "Elevate if Possible", description: "If no broken bones suspected, raise the injured area above heart level to slow bleeding." },
      { title: "Apply Tourniquet (Limbs Only)", description: "For life-threatening limb bleeding uncontrolled by pressure, apply tourniquet 2-3 inches above wound. Note the time applied." },
    ],
    doNot: [
      "Don't remove objects embedded in the wound",
      "Don't apply a tourniquet to the head, neck, or torso",
      "Don't give the person anything to eat or drink",
    ],
    seekHelp: "All severe bleeding requires immediate medical attention. Call 112 immediately.",
  },
  {
    id: "burns",
    title: "Burns",
    icon: <Flame className="h-6 w-6" />,
    category: "Trauma",
    severity: "high",
    overview: "Burns require immediate cooling and protection. The severity depends on depth and area affected.",
    steps: [
      { title: "Stop the Burning", description: "Remove the person from the heat source. Remove clothing and jewelry near the burned area (unless stuck to the skin)." },
      { title: "Cool the Burn", description: "Hold the burned area under cool (not cold) running water for at least 10-20 minutes. Do this as soon as possible after the burn." },
      { title: "Assess the Burn", description: "Check size and depth. Seek immediate help for: burns larger than palm size, burns on face/hands/feet/genitals/joints, electrical or chemical burns, or deep burns." },
      { title: "Cover the Burn", description: "After cooling, cover with a clean, non-stick bandage or clean cloth. Wrap loosely to avoid pressure on burned skin." },
      { title: "Manage Pain", description: "Over-the-counter pain medication like ibuprofen or acetaminophen can help with pain. Keep the person warm to prevent shock." },
      { title: "Monitor", description: "Watch for signs of infection: increased pain, redness, swelling, fever, or oozing. Seek medical help if these occur." },
    ],
    doNot: [
      "Don't use ice, icy water, or very cold water",
      "Don't apply butter, oil, toothpaste, or other home remedies",
      "Don't break blisters - they protect against infection",
      "Don't remove clothing stuck to the burn",
    ],
    seekHelp: "Seek emergency care for large burns, deep burns, electrical burns, chemical burns, or burns on sensitive areas.",
  },
  {
    id: "heart-attack",
    title: "Heart Attack",
    icon: <Heart className="h-6 w-6" />,
    category: "Medical Emergency",
    severity: "critical",
    overview: "A heart attack requires immediate medical attention. Quick action can save heart muscle and life.",
    steps: [
      { title: "Recognize Symptoms", description: "Look for: chest pain/pressure, pain in arm/jaw/back, shortness of breath, cold sweats, nausea, lightheadedness." },
      { title: "Call Emergency Services", description: "Call 112 immediately. Don't drive yourself to the hospital." },
      { title: "Help with Medication", description: "If not allergic, have the person chew one regular aspirin (325mg) or four baby aspirin (81mg each) to help thin blood." },
      { title: "Keep Calm and Comfortable", description: "Have the person sit or lie down in whatever position is most comfortable. Loosen tight clothing." },
      { title: "Monitor Breathing", description: "Stay with the person and monitor their breathing. Be prepared to perform CPR if they become unresponsive." },
      { title: "Use AED if Available", description: "If person becomes unconscious and an AED is available, turn it on and follow the voice prompts." },
    ],
    doNot: [
      "Don't let the person drive themselves to the hospital",
      "Don't give aspirin if allergic or if they've been told not to take it",
      "Don't ignore symptoms - women may have different symptoms than men",
    ],
    seekHelp: "Always call 112 for suspected heart attack. Time is critical - every minute counts.",
  },
  {
    id: "stroke",
    title: "Stroke",
    icon: <Brain className="h-6 w-6" />,
    category: "Medical Emergency",
    severity: "critical",
    overview: "A stroke is a brain attack. Quick treatment can minimize brain damage and potential complications.",
    steps: [
      { title: "Use FAST", description: "F-Face: Ask person to smile - is one side drooping? A-Arms: Ask to raise both arms - does one drift down? S-Speech: Ask to repeat a simple phrase - is speech slurred? T-Time: If any signs, call 112 immediately." },
      { title: "Call Emergency Services", description: "Call 112 immediately and tell them you suspect a stroke. Note the time symptoms started." },
      { title: "Keep Person Safe", description: "Help them lie down with head slightly elevated. If unconscious, place in recovery position." },
      { title: "Don't Give Food or Drink", description: "Stroke can affect swallowing. Don't give anything by mouth as it could cause choking." },
      { title: "Monitor and Reassure", description: "Stay calm and reassure the person. Monitor their breathing and consciousness level." },
      { title: "Be Ready for CPR", description: "If the person becomes unresponsive and stops breathing normally, be prepared to perform CPR." },
    ],
    doNot: [
      "Don't give any medication unless instructed by emergency services",
      "Don't give food or water",
      "Don't let the person fall asleep or convince you not to call for help",
    ],
    seekHelp: "Call 112 immediately for any stroke symptoms. Treatment within 3-4.5 hours is crucial.",
  },
  {
    id: "fractures",
    title: "Broken Bones (Fractures)",
    icon: <Bone className="h-6 w-6" />,
    category: "Trauma",
    severity: "high",
    overview: "Fractures require immobilization and medical care. Proper first aid prevents further injury.",
    steps: [
      { title: "Stop Any Bleeding", description: "If there's an open wound, apply pressure with a clean cloth. Don't try to push bone back in." },
      { title: "Immobilize the Area", description: "Don't try to straighten the bone. Keep the injured area still using a splint or by padding with soft items like pillows or clothing." },
      { title: "Apply Ice", description: "Apply ice wrapped in cloth to reduce swelling. Don't apply ice directly to skin. Apply for 20 minutes at a time." },
      { title: "Treat for Shock", description: "Keep the person lying down if possible. Cover with a blanket to keep warm. Elevate legs if no leg injury." },
      { title: "Get Medical Help", description: "Call 112 for severe fractures. For less severe injuries, take to emergency room or urgent care." },
    ],
    doNot: [
      "Don't move the person if you suspect head, neck, or spine injury",
      "Don't try to straighten a broken bone",
      "Don't move the person unnecessarily before stabilizing the fracture",
    ],
    seekHelp: "Seek immediate emergency care for: open fractures, suspected spine/head injury, numbness, severe pain, or obvious deformity.",
  },
  {
    id: "poisoning",
    title: "Poisoning",
    icon: <Skull className="h-6 w-6" />,
    category: "Medical Emergency",
    severity: "critical",
    overview: "Poisoning can occur from swallowed, inhaled, or skin-contact substances. Quick identification and action is essential.",
    steps: [
      { title: "Ensure Safety", description: "Make sure you're safe. If poison is in the air (gas, fumes), move the person to fresh air. Wear gloves if handling contaminated items." },
      { title: "Identify the Poison", description: "Try to identify what, how much, and when the poison was taken. Keep containers or samples for emergency responders." },
      { title: "Call Poison Control", description: "Call your local poison control center (1800-11-6117 in India) or emergency services. Follow their instructions exactly." },
      { title: "For Swallowed Poison", description: "Don't induce vomiting unless instructed by poison control. Give water only if conscious and instructed to do so." },
      { title: "For Skin Contact", description: "Remove contaminated clothing. Rinse skin with running water for 15-20 minutes." },
      { title: "For Eye Contact", description: "Flush eyes with clean water for 15-20 minutes. Hold eyelids open during flushing." },
    ],
    doNot: [
      "Don't induce vomiting unless directed by poison control",
      "Don't give anything by mouth to an unconscious person",
      "Don't use home remedies like salt water, mustard, or raw eggs",
    ],
    seekHelp: "Call poison control or 112 immediately. Bring the poison container to the hospital.",
  },
  {
    id: "electric-shock",
    title: "Electric Shock",
    icon: <Zap className="h-6 w-6" />,
    category: "Trauma",
    severity: "critical",
    overview: "Electric shock can cause cardiac arrest, burns, and internal injuries. Safety is paramount before helping.",
    steps: [
      { title: "Ensure Your Safety", description: "Don't touch the person if they're still in contact with electrical source. Turn off power at the source, circuit breaker, or fuse box." },
      { title: "Separate from Source", description: "If power can't be turned off, use a dry non-conducting object (dry wood, rubber, plastic) to separate person from source." },
      { title: "Call Emergency Services", description: "Call 112 immediately. Electrical injuries often have internal damage that isn't visible." },
      { title: "Check for Response", description: "Once safe, check if the person is conscious and breathing. Be prepared to perform CPR if needed." },
      { title: "Treat Burns", description: "Cover visible burns with a sterile bandage. Don't apply ice or ointments." },
      { title: "Monitor for Shock", description: "Keep person lying down and warm. Watch for signs of shock: pale skin, rapid breathing, confusion." },
    ],
    doNot: [
      "Don't touch a person who is still connected to electrical source",
      "Don't use wet or metal objects to separate from source",
      "Don't move the person unless absolutely necessary (may have spinal injury from fall)",
    ],
    seekHelp: "All electrical injuries require immediate medical evaluation, even if person seems fine.",
  },
  {
    id: "allergic-reaction",
    title: "Severe Allergic Reaction (Anaphylaxis)",
    icon: <AlertTriangle className="h-6 w-6" />,
    category: "Medical Emergency",
    severity: "critical",
    overview: "Anaphylaxis is a life-threatening allergic reaction that requires immediate treatment with epinephrine.",
    steps: [
      { title: "Recognize Signs", description: "Look for: hives, swelling (especially face/throat), difficulty breathing, wheezing, rapid pulse, dizziness, nausea, or feeling of doom." },
      { title: "Call Emergency Services", description: "Call 112 immediately. Anaphylaxis can be fatal within minutes without treatment." },
      { title: "Use Epinephrine", description: "If the person has an epinephrine auto-injector (EpiPen), help them use it. Inject into outer thigh through clothing if needed." },
      { title: "Position the Person", description: "Help them lie down with legs elevated (unless having breathing difficulty - then sit them up). If vomiting or unconscious, place in recovery position." },
      { title: "Monitor and Repeat", description: "If symptoms don't improve in 5-15 minutes, give a second dose of epinephrine if available. Be prepared to perform CPR." },
      { title: "Remove Trigger", description: "If possible, remove the allergen (take out stinger, stop medication, etc.)." },
    ],
    doNot: [
      "Don't leave the person alone",
      "Don't have them sit or stand if feeling faint",
      "Don't give oral medications if having trouble breathing",
    ],
    seekHelp: "Always get emergency medical care after anaphylaxis, even if symptoms improve with epinephrine.",
  },
  {
    id: "heat-stroke",
    title: "Heat Stroke",
    icon: <ThermometerSun className="h-6 w-6" />,
    category: "Environmental",
    severity: "critical",
    overview: "Heat stroke is a life-threatening condition where the body overheats and can't cool down. Rapid cooling is essential.",
    steps: [
      { title: "Call Emergency Services", description: "Call 112 immediately. Heat stroke can cause permanent damage or death." },
      { title: "Move to Cool Area", description: "Get the person out of the heat to an air-conditioned or shaded area." },
      { title: "Cool Rapidly", description: "Remove excess clothing. Apply ice packs to neck, armpits, and groin. Fan while misting with cool water. Immerse in cool water if possible." },
      { title: "Monitor Temperature", description: "If possible, check body temperature every few minutes. Continue cooling until temperature drops below 101°F (38.3°C)." },
      { title: "Give Fluids Cautiously", description: "Only if conscious and able to swallow, give cool water. Don't give alcohol or caffeinated drinks." },
      { title: "Watch for Seizures", description: "If person has seizures, protect them from injury but don't restrain or put anything in mouth." },
    ],
    doNot: [
      "Don't give any medication to reduce fever",
      "Don't give fluids to unconscious person",
      "Don't use rubbing alcohol to cool - it can be absorbed through skin",
    ],
    seekHelp: "Heat stroke is always a medical emergency. Call 112 even if the person seems to recover.",
  },
  {
    id: "insect-bites",
    title: "Insect Bites and Stings",
    icon: <Bug className="h-6 w-6" />,
    category: "Environmental",
    severity: "medium",
    overview: "Most insect bites are minor, but some can cause allergic reactions or transmit diseases.",
    steps: [
      { title: "Move to Safety", description: "Get away from the area to avoid more stings. Bees can release pheromones that attract other bees." },
      { title: "Remove Stinger", description: "If stinger is visible, scrape it out with a flat edge (credit card, fingernail). Don't squeeze or use tweezers as this can inject more venom." },
      { title: "Clean the Area", description: "Wash with soap and water. Apply antiseptic if available." },
      { title: "Reduce Swelling", description: "Apply ice wrapped in cloth for 10-15 minutes. Keep the area elevated if possible." },
      { title: "Manage Pain and Itch", description: "Take antihistamine for itching. Apply hydrocortisone cream or calamine lotion. Pain relievers can help with discomfort." },
      { title: "Watch for Allergic Reaction", description: "Monitor for signs of anaphylaxis: hives beyond sting site, swelling of face/throat, difficulty breathing, dizziness." },
    ],
    doNot: [
      "Don't scratch the bite - this increases infection risk",
      "Don't apply mud or saliva to stings",
      "Don't ignore signs of allergic reaction",
    ],
    seekHelp: "Seek emergency care for: difficulty breathing, swelling of face/throat, multiple stings, stings in mouth/throat, or known severe allergies.",
  },
  {
    id: "cuts-wounds",
    title: "Cuts and Wounds",
    icon: <Scissors className="h-6 w-6" />,
    category: "Trauma",
    severity: "medium",
    overview: "Minor cuts and wounds can be treated at home, but proper cleaning prevents infection.",
    steps: [
      { title: "Stop Bleeding", description: "Apply firm pressure with a clean cloth for 10-15 minutes. Elevate the wound above heart level if possible." },
      { title: "Clean the Wound", description: "Once bleeding stops, rinse under clean running water for 5-10 minutes. Gently clean around the wound with soap." },
      { title: "Remove Debris", description: "Use clean tweezers to remove any visible dirt or debris. Don't dig for deeply embedded objects." },
      { title: "Apply Antibiotic", description: "Apply thin layer of antibiotic ointment to help prevent infection and keep wound moist." },
      { title: "Cover the Wound", description: "Apply a sterile bandage. Change dressing daily or when dirty/wet." },
      { title: "Watch for Infection", description: "Monitor for redness, swelling, warmth, pus, or fever. These are signs of infection requiring medical care." },
    ],
    doNot: [
      "Don't use hydrogen peroxide or iodine directly on wound (can damage tissue)",
      "Don't remove large or deeply embedded objects",
      "Don't close a wound that may be infected",
    ],
    seekHelp: "Get medical care for: deep wounds, wounds that won't stop bleeding, wounds from animal or human bites, signs of infection, or tetanus concerns.",
  },
  {
    id: "drowning",
    title: "Drowning",
    icon: <Droplets className="h-6 w-6" />,
    category: "Life-Saving",
    severity: "critical",
    overview: "Drowning can cause death within minutes. Quick rescue and CPR can save lives.",
    steps: [
      { title: "Ensure Your Safety", description: "Don't become a victim yourself. Reach or throw something to the person if possible. Only enter water as last resort if trained." },
      { title: "Call for Help", description: "Call 112 or have someone call while you help. Summon lifeguards if present." },
      { title: "Get Person Out of Water", description: "Remove from water as quickly as possible. Support head and neck if diving injury suspected." },
      { title: "Check for Breathing", description: "Once on dry ground, check if person is breathing normally. Open airway by tilting head back and lifting chin." },
      { title: "Begin CPR if Needed", description: "If not breathing, start with 5 rescue breaths, then continue CPR (30 compressions, 2 breaths). Don't try to drain water from lungs." },
      { title: "Keep Warm", description: "Remove wet clothing and cover with blankets or dry clothing to prevent hypothermia." },
    ],
    doNot: [
      "Don't attempt a swimming rescue unless you're trained",
      "Don't give abdominal thrusts to remove water",
      "Don't assume person is fine even if they seem recovered - secondary drowning can occur hours later",
    ],
    seekHelp: "All near-drowning victims should be evaluated at a hospital, even if they seem fine.",
  },
  {
    id: "eye-injury",
    title: "Eye Injuries",
    icon: <Eye className="h-6 w-6" />,
    category: "Trauma",
    severity: "high",
    overview: "Eye injuries require careful handling to prevent permanent vision damage.",
    steps: [
      { title: "For Chemical Exposure", description: "Immediately flush eye with clean water for at least 15-20 minutes. Hold eyelids open. Remove contact lenses if present." },
      { title: "For Foreign Object", description: "Don't rub the eye. Try to flush out with clean water. If object doesn't wash out, don't try to remove it." },
      { title: "For Cuts or Punctures", description: "Don't wash out eye. Don't try to remove embedded objects. Cover eye with a rigid shield (paper cup) without pressure." },
      { title: "For Blows to Eye", description: "Apply cold compress gently without pressure for 15 minutes to reduce swelling. Watch for signs of serious injury." },
      { title: "Protect the Eye", description: "Cover both eyes (to prevent movement) if injury is serious. Keep person calm and still." },
      { title: "Get Medical Help", description: "Seek immediate medical attention for any significant eye injury." },
    ],
    doNot: [
      "Don't rub the eye",
      "Don't try to remove embedded objects",
      "Don't apply pressure to the eye",
      "Don't apply ointments without medical advice",
    ],
    seekHelp: "Seek immediate care for: chemical exposure, embedded objects, cuts to eye, sudden vision loss, or severe pain.",
  },
  {
    id: "seizures",
    title: "Seizures",
    icon: <Activity className="h-6 w-6" />,
    category: "Medical Emergency",
    severity: "high",
    overview: "Most seizures end on their own. Your role is to keep the person safe until it's over.",
    steps: [
      { title: "Keep Calm", description: "Most seizures end within a few minutes. Note the time when the seizure starts." },
      { title: "Protect from Injury", description: "Clear area of hard or sharp objects. Cushion their head with something soft. Remove glasses." },
      { title: "Position Safely", description: "Ease the person to the floor if standing. Turn them on their side (recovery position) to keep airway clear." },
      { title: "Time the Seizure", description: "A seizure lasting more than 5 minutes is a medical emergency requiring 112." },
      { title: "Stay Until Recovered", description: "After seizure, person may be confused. Stay with them, speak calmly, and help reorient them." },
      { title: "Check for Injuries", description: "After recovery, check for any injuries that occurred during the seizure." },
    ],
    doNot: [
      "Don't restrain the person",
      "Don't put anything in their mouth (they cannot swallow their tongue)",
      "Don't give food or water until fully alert",
      "Don't leave them alone",
    ],
    seekHelp: "Call 112 if: seizure lasts more than 5 minutes, person doesn't regain consciousness, another seizure begins, person is injured, or it's their first seizure.",
  },
  {
    id: "fainting",
    title: "Fainting",
    icon: <Activity className="h-6 w-6" />,
    category: "Medical Emergency",
    severity: "medium",
    overview: "Fainting occurs when the brain temporarily doesn't get enough blood. Most people recover quickly.",
    steps: [
      { title: "Catch if Possible", description: "If you see someone about to faint, try to catch them to prevent injury from falling." },
      { title: "Position Correctly", description: "Lay person flat on their back. Raise their legs about 12 inches to improve blood flow to brain." },
      { title: "Loosen Tight Clothing", description: "Loosen belts, collars, and any tight clothing that might restrict breathing or blood flow." },
      { title: "Check for Consciousness", description: "If person doesn't regain consciousness within one minute, check for breathing and call 112." },
      { title: "After Recovery", description: "Have them sit up slowly. Give them water to drink. Have them rest for 15-20 minutes before standing." },
      { title: "Monitor", description: "Watch for repeat episodes or other concerning symptoms." },
    ],
    doNot: [
      "Don't splash water on their face",
      "Don't try to give food or water while unconscious",
      "Don't let them get up too quickly",
    ],
    seekHelp: "Seek medical care if: person doesn't regain consciousness quickly, fainting occurs repeatedly, person is pregnant or has heart problems, or injury occurred during fall.",
  },
  {
    id: "drug-overdose",
    title: "Drug Overdose",
    icon: <Pill className="h-6 w-6" />,
    category: "Medical Emergency",
    severity: "critical",
    overview: "Drug overdose is a medical emergency. Quick action and emergency care can save lives.",
    steps: [
      { title: "Call Emergency Services", description: "Call 112 immediately. Give as much information as you can about what was taken." },
      { title: "Check Responsiveness", description: "Try to wake the person by calling their name and tapping firmly. Rub your knuckles on their breastbone." },
      { title: "Position for Safety", description: "If unconscious but breathing, place in recovery position. If not breathing, begin CPR." },
      { title: "Use Naloxone if Available", description: "If opioid overdose is suspected and naloxone (Narcan) is available, administer according to instructions." },
      { title: "Gather Information", description: "Try to find out what, how much, and when it was taken. Keep any containers, pills, or evidence for emergency responders." },
      { title: "Stay Until Help Arrives", description: "Monitor breathing and be prepared to perform CPR if needed." },
    ],
    doNot: [
      "Don't try to make the person vomit",
      "Don't give them anything to eat or drink",
      "Don't leave them alone",
      "Don't put them in cold shower",
    ],
    seekHelp: "All suspected overdoses require immediate emergency care. Call 112 right away.",
  },
  {
    id: "infant-choking",
    title: "Infant Choking (Under 1 Year)",
    icon: <Baby className="h-6 w-6" />,
    category: "Life-Saving",
    severity: "critical",
    overview: "Infant choking requires different techniques than adult choking. Knowing the proper method is essential.",
    steps: [
      { title: "Confirm Choking", description: "If infant is coughing, crying, or making sounds, encourage coughing. If silent, not breathing, or turning blue, proceed with first aid." },
      { title: "Position for Back Blows", description: "Lay infant face-down on your forearm, supporting jaw with your hand. Keep head lower than chest. Support forearm on your thigh." },
      { title: "Give 5 Back Blows", description: "Using heel of your hand, give 5 firm back blows between shoulder blades." },
      { title: "Position for Chest Thrusts", description: "Turn infant face-up on your forearm. Support head and neck. Keep head lower than chest." },
      { title: "Give 5 Chest Thrusts", description: "Place 2 fingers on center of breastbone, just below nipple line. Give 5 quick chest thrusts." },
      { title: "Repeat", description: "Alternate 5 back blows and 5 chest thrusts until object is expelled or infant becomes unconscious. If unconscious, call 112 and begin infant CPR." },
    ],
    doNot: [
      "Don't perform abdominal thrusts (Heimlich) on infants",
      "Don't do blind finger sweeps in mouth",
      "Don't hold baby upside down",
    ],
    seekHelp: "Call 112 if infant becomes unconscious or the object doesn't come out after repeated attempts.",
  },
];

const categories = ["All", "Life-Saving", "Trauma", "Medical Emergency", "Environmental"];

const FirstAid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredGuides = firstAidGuides.filter((guide) => {
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-info text-info-foreground";
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success mb-4">
            <HeartPulse className="h-4 w-4" />
            First Aid Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Emergency First Aid Procedures
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Step-by-step guides for handling medical emergencies. Learn these procedures - they could save a life.
          </p>
        </div>

        {/* Alert Banner */}
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-destructive">Important Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  These guides are for educational purposes only and don't replace professional medical training. 
                  In any emergency, always call 112 first. Consider taking a certified first aid course.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search first aid procedures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Guides */}
        <Accordion type="single" collapsible className="space-y-4">
          {filteredGuides.map((guide) => (
            <AccordionItem key={guide.id} value={guide.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <div className={`p-2 rounded-lg ${guide.severity === 'critical' ? 'bg-destructive/20 text-destructive' : guide.severity === 'high' ? 'bg-warning/20 text-warning' : 'bg-info/20 text-info'}`}>
                    {guide.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{guide.title}</h3>
                      <Badge className={getSeverityColor(guide.severity)}>
                        {guide.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{guide.category}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-6 pt-2">
                  {/* Overview */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-foreground">{guide.overview}</p>
                  </div>

                  {/* Steps */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Steps to Follow
                    </h4>
                    <div className="space-y-3">
                      {guide.steps.map((step, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h5 className="font-medium text-foreground">{step.title}</h5>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What NOT to do */}
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      What NOT to Do
                    </h4>
                    <ul className="space-y-1">
                      {guide.doNot.map((item, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive">✗</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* When to Seek Help */}
                  <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-warning flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      When to Seek Professional Help
                    </h4>
                    <p className="text-sm text-muted-foreground">{guide.seekHelp}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No first aid guides found matching your search.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FirstAid;
