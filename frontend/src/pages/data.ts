import { supabase } from "../supabase";
import { convertData } from "../utils/ReformatToOption";

// export async function getUpdateImageUrl(path = "/nigeria.png") {
//   if (path === "/nigeria.png") {
//     return path;
//   }

//   const { data } = await supabase.storage
//     .from("profile_pictures")
//     .download(path);

//     console.log(data);
//     if (error) {
//       throw error;
//     }
//     const url = URL.createObjectURL(dat);
//     setAvatarUrl(url);
// }

export async function getElectionConcerns(setValue: any) {
  const { data } = await supabase.from("election_concerns").select("id, name");

  if (data) {
    const socialMedia = data.map((item: any) => {
      return { id: item.id, label: item.name, value: item.name };
    });
    setValue(socialMedia);
  } else {
    setValue([]);
  }
}
export async function getVotingHistory(setValue: any) {
  const { data } = await supabase.from("voting_history").select("id, name");

  if (data) {
    const socialMedia = data.map((item: any) => {
      return { id: item.id, label: item.name, value: item.name };
    });
    setValue(socialMedia);
  } else {
    setValue([]);
  }
}
export async function getPreferredSocialMedia(setValue: any) {
  const { data } = await supabase
    .from("preferred_social_media")
    .select("id, name");

  if (data) {
    const socialMedia = data.map((item: any) => {
      return { id: item.id, label: item.name, value: item.name };
    });
    setValue(socialMedia);
  } else {
    setValue([]);
  }
}

export async function getPoliticalParties(setValue: any) {
  const { data } = await supabase.from("political_parties").select("id, name");
  
  if (data) {
    setValue(convertData(data));
  } else {
    setValue([]);
  }
}

export async function getPoliticalIssue(setValue: any) {
  const { data } = await supabase.from("political_issues").select("id, name");
  
  if (data) {
    const politicalIssues = data.map((item: any) => {
      return { id: item.id, label: item.name, value: item.name };
    });
    setValue(politicalIssues);
  } else {
    setValue([]);
  }
}
export async function getRegistrationStatus(setValue: any) {
  const { data } = await supabase
    .from("registration_status")
    .select("id, name");

  if (data) {
    setValue(data);
  } else {
    setValue([]);
  }
}

export async function getEthnicity(setValue: any) {
  const { data } = await supabase.from("ethnic_groups").select("id, name");

  if (data) {
    setValue(convertData(data));
  } else {
    setValue([]);
  }
}
export async function getReligion(setValue: any) {
  const { data } = await supabase.from("religion").select("id, name");

  if (data) {
    setValue(convertData(data));
  } else {
    setValue([]);
  }
}
export async function getOccupation(setValue: any) {
  const { data } = await supabase
    .from("occupation_categories")
    .select("id, name");

  if (data) {
    setValue(convertData(data));
  } else {
    setValue([]);
  }
}
export async function getLevelOfEducation(setValue: any) {
  const { data } = await supabase.from("level_of_education").select("id, name");

  if (data) {
    setValue(convertData(data));
  } else {
    setValue([]);
  }
}

export async function getMaritalStatus(setValue: any) {
  const { data } = await supabase.from("marital_status").select("id, name");

  if (data) {
    setValue(convertData(data));
  } else {
    setValue([]);
  }
}

export async function getHouseholdSize(setValue: any) {
  const { data } = await supabase.from("household_size").select("id, name");

  if (data) {
    setValue(convertData(data));
  } else {
    setValue([]);
  }
}

export async function getIncomeBracket(setValue: any) {
  const { data } = await supabase.from("income_bracket").select("id, name");

  if (data) {
    setValue(convertData(data));
  } else {
    setValue([]);
  }
}
