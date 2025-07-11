const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function generateMemberId(profileData: { [key: string]: any }, count = 5): Promise<string> {
  const states = {
    Abia: { zone_abbreviation: "SE", state_abbreviation: "AB" },
    Adamawa: { zone_abbreviation: "NE", state_abbreviation: "AD" },
    "Akwa Ibom": { zone_abbreviation: "SS", state_abbreviation: "AK" },
    Anambra: { zone_abbreviation: "SE", state_abbreviation: "AN" },
    Bauchi: { zone_abbreviation: "NE", state_abbreviation: "BA" },
    Bayelsa: { zone_abbreviation: "SS", state_abbreviation: "BY" },
    Benue: { zone_abbreviation: "NC", state_abbreviation: "BE" },
    Borno: { zone_abbreviation: "NE", state_abbreviation: "BO" },
    "Cross River": { zone_abbreviation: "SS", state_abbreviation: "CR" },
    Delta: { zone_abbreviation: "SS", state_abbreviation: "DE" },
    Ebonyi: { zone_abbreviation: "SE", state_abbreviation: "EB" },
    Edo: { zone_abbreviation: "SS", state_abbreviation: "ED" },
    Ekiti: { zone_abbreviation: "SW", state_abbreviation: "EK" },
    Enugu: { zone_abbreviation: "SE", state_abbreviation: "EN" },
    Gombe: { zone_abbreviation: "NE", state_abbreviation: "GO" },
    Imo: { zone_abbreviation: "SE", state_abbreviation: "IM" },
    Jigawa: { zone_abbreviation: "NW", state_abbreviation: "JI" },
    Kaduna: { zone_abbreviation: "NW", state_abbreviation: "KD" },
    Kano: { zone_abbreviation: "NW", state_abbreviation: "KN" },
    Katsina: { zone_abbreviation: "NW", state_abbreviation: "KT" },
    Kebbi: { zone_abbreviation: "NW", state_abbreviation: "KE" },
    Kogi: { zone_abbreviation: "NC", state_abbreviation: "KO" },
    Kwara: { zone_abbreviation: "NC", state_abbreviation: "KW" },
    Lagos: { zone_abbreviation: "SW", state_abbreviation: "LA" },
    Nasarawa: { zone_abbreviation: "NC", state_abbreviation: "NA" },
    Niger: { zone_abbreviation: "NC", state_abbreviation: "NI" },
    Ogun: { zone_abbreviation: "SW", state_abbreviation: "OG" },
    Ondo: { zone_abbreviation: "SW", state_abbreviation: "ON" },
    Osun: { zone_abbreviation: "SW", state_abbreviation: "OS" },
    Oyo: { zone_abbreviation: "SW", state_abbreviation: "OY" },
    Plateau: { zone_abbreviation: "NC", state_abbreviation: "PL" },
    Rivers: { zone_abbreviation: "SS", state_abbreviation: "RI" },
    Sokoto: { zone_abbreviation: "NW", state_abbreviation: "SO" },
    Taraba: { zone_abbreviation: "NE", state_abbreviation: "TA" },
    Yobe: { zone_abbreviation: "NE", state_abbreviation: "YO" },
    Zamfara: { zone_abbreviation: "NW", state_abbreviation: "ZA" },
    "Federal Capital Territory": { zone_abbreviation: "NC", state_abbreviation: "FCT" },
  };

  const state = `${profileData?.voting_engagement_state}`;
  const lga = `${profileData?.lga}`.slice(0, 3).toUpperCase();
  const digits = generateRandomDigits();

  const stateInfo = states[state as keyof typeof states];
  if (!stateInfo) throw new Error(`Invalid state: ${state}`);

  const baseId = `${stateInfo.zone_abbreviation}-${stateInfo.state_abbreviation}-${lga}`;
  const prevVal = profileData?.member_id?.split('-')?.slice(0, 3)?.join('-');

  if (baseId === prevVal) {
    return profileData.member_id;
  }

  let member_id = `${baseId}-${digits}`;
  const exists = await checkMemberId(member_id);

  if (exists && count > 0) {
    return generateMemberId(profileData, count - 1);
  }

  return member_id;
}

function generateRandomDigits() {
  let digits = "";
  for (let i = 0; i < 12; i++) {
    digits += Math.floor(Math.random() * 10);
  }
  return digits;
}

async function checkMemberId(member_id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/check-member-id?member_id=${member_id}`);
    const body = await res.json();
    return body.exists;
  } catch (error) {
    console.error("Error checking member ID:", error);
    return false;
  }
}
