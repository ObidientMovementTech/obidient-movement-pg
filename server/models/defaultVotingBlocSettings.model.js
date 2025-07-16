import { query, getClient } from '../config/db.js';

class DefaultVotingBlocSettings {
  constructor(settingsData) {
    Object.assign(this, settingsData);
  }

  // Get the default voting bloc settings (singleton pattern)
  static async get() {
    const result = await query('SELECT * FROM "defaultVotingBlocSettings" ORDER BY "createdAt" DESC LIMIT 1');

    if (result.rows.length === 0) {
      // Create default settings if none exist
      return await DefaultVotingBlocSettings.createDefault();
    }

    return new DefaultVotingBlocSettings(result.rows[0]);
  }

  // Create default settings
  static async createDefault() {
    const defaultSettings = {
      descriptionTemplate: "Join me in supporting Peter Obi for a New Nigeria. Together, we can build a better future for our country through grassroots engagement and civic participation.",
      targetCandidate: "Peter Obi",
      scope: "National",
      goals: [
        "Mobilize supporters for Peter Obi",
        "Engage in peaceful political advocacy",
        "Build grassroots community networks",
        "Promote voter education and registration"
      ],
      toolkits: [
        {
          label: "Peter Obi Official Website",
          url: "https://peterobi.com.ng",
          type: "Toolkit"
        },
        {
          label: "Voter Registration Guide",
          url: "https://inecnigeria.org",
          type: "Toolkit"
        }
      ],
      bannerImageUrl: "",
      richDescriptionTemplate: "<p>Welcome to our Obidient voting bloc! We are committed to supporting Peter Obi's vision for a <strong>New Nigeria</strong>.</p><p>Our mission is to:</p><ul><li>Build a strong grassroots network</li><li>Engage in peaceful political advocacy</li><li>Promote democratic values and good governance</li><li>Create positive change in our communities</li></ul>",
      locationDefaults: {
        useUserLocation: true,
        defaultState: "",
        defaultLga: "",
        defaultWard: ""
      }
    };

    const result = await query(
      `INSERT INTO "defaultVotingBlocSettings" (
        "descriptionTemplate", "targetCandidate", scope, goals, toolkits, 
        "bannerImageUrl", "richDescriptionTemplate", "locationDefaults"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        defaultSettings.descriptionTemplate,
        defaultSettings.targetCandidate,
        defaultSettings.scope,
        JSON.stringify(defaultSettings.goals),
        JSON.stringify(defaultSettings.toolkits),
        defaultSettings.bannerImageUrl,
        defaultSettings.richDescriptionTemplate,
        JSON.stringify(defaultSettings.locationDefaults)
      ]
    );

    return new DefaultVotingBlocSettings(result.rows[0]);
  }

  // Update default settings
  static async update(updateData) {
    const {
      descriptionTemplate,
      targetCandidate,
      scope,
      goals,
      toolkits,
      bannerImageUrl,
      richDescriptionTemplate,
      locationDefaults
    } = updateData;

    const result = await query(
      `UPDATE "defaultVotingBlocSettings" SET 
        "descriptionTemplate" = $1,
        "targetCandidate" = $2,
        scope = $3,
        goals = $4,
        toolkits = $5,
        "bannerImageUrl" = $6,
        "richDescriptionTemplate" = $7,
        "locationDefaults" = $8,
        "templateVersion" = COALESCE("templateVersion", 1) + 1,
        "updatedAt" = NOW()
      WHERE id = (SELECT id FROM "defaultVotingBlocSettings" ORDER BY "createdAt" DESC LIMIT 1)
      RETURNING *`,
      [
        descriptionTemplate,
        targetCandidate,
        scope,
        JSON.stringify(goals),
        JSON.stringify(toolkits),
        bannerImageUrl,
        richDescriptionTemplate,
        JSON.stringify(locationDefaults)
      ]
    );

    return result.rows.length > 0 ? new DefaultVotingBlocSettings(result.rows[0]) : null;
  }

  // Generate voting bloc data for a specific user
  generateForUser(user) {
    // Parse JSON fields if they're strings
    const goals = typeof this.goals === 'string' ? JSON.parse(this.goals) : this.goals;
    const toolkits = typeof this.toolkits === 'string' ? JSON.parse(this.toolkits) : this.toolkits;
    const locationDefaults = typeof this.locationDefaults === 'string' ? JSON.parse(this.locationDefaults) : this.locationDefaults;

    // Generate personalized name
    const votingBlocName = `${user.name} for ${this.targetCandidate} - Join my Voting Bloc for a New Nigeria`;

    // Use user voting location if available, otherwise use personalInfo location, then defaults with fallbacks
    let location = {
      state: locationDefaults.defaultState || null,
      lga: locationDefaults.defaultLga || null,
      ward: locationDefaults.defaultWard || null
    };

    // Priority 1: Use new voting location fields from signup
    if (locationDefaults.useUserLocation && (user.votingState || user.votingLGA)) {
      location = {
        state: user.votingState || null,
        lga: user.votingLGA || null,
        ward: null // Ward not collected in signup, keep as null
      };
    }
    // Priority 2: Use legacy personalInfo location (for backward compatibility)
    else if (locationDefaults.useUserLocation && user.personalInfo?.currentLocation) {
      location = {
        state: user.personalInfo.currentLocation.state || null,
        lga: user.personalInfo.currentLocation.lga || null,
        ward: user.personalInfo.currentLocation.ward || null
      };
    }
    // Priority 3: Use fallback defaults only if useUserLocation is false or no user location data
    else if (!locationDefaults.useUserLocation) {
      location = {
        state: locationDefaults.defaultState || 'Federal Capital Territory',
        lga: locationDefaults.defaultLga || 'Abuja Municipal',
        ward: locationDefaults.defaultWard || 'Central Ward'
      };
    }

    return {
      name: votingBlocName,
      description: this.descriptionTemplate,
      richDescription: this.richDescriptionTemplate,
      targetCandidate: this.targetCandidate,
      scope: this.scope,
      goals: goals || [],
      toolkits: toolkits || [],
      locationState: location.state,
      locationLga: location.lga,
      locationWard: location.ward,
      bannerImageUrl: this.bannerImageUrl || '',
      creator: user.id,
      members: [user.id],
      isAutoGenerated: true
    };
  }
}

export default DefaultVotingBlocSettings;
