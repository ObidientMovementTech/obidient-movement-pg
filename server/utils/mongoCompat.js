// MongoDB compatibility utilities for PostgreSQL data transformation
// These functions ensure that PostgreSQL data is formatted to match MongoDB structure expected by frontend

/**
 * Transform PostgreSQL user data to MongoDB-compatible format
 */
export function transformUser(user) {
  if (!user) return null;

  const transformed = {
    ...user,
    _id: user.id,
    personalInfo: user.personalInfo || { user_name: user.name }
  };

  // Remove PostgreSQL id field
  delete transformed.id;

  return transformed;
}

/**
 * Transform PostgreSQL notification data to MongoDB-compatible format
 */
export function transformNotification(data) {
  if (!data) return null;

  // Handle arrays by transforming each item
  if (Array.isArray(data)) {
    return data.map(item => transformNotification(item));
  }

  const transformed = {
    ...data,
    _id: data.id
  };

  // Handle dates properly
  if (data.createdAt instanceof Date) {
    transformed.createdAt = data.createdAt.toISOString();
  }
  if (data.updatedAt instanceof Date) {
    transformed.updatedAt = data.updatedAt.toISOString();
  }

  // Remove PostgreSQL id field
  delete transformed.id;

  return transformed;
}

/**
 * Transform PostgreSQL voting bloc data to MongoDB-compatible format
 */
export function transformVotingBloc(data) {
  if (!data) return null;

  // Handle arrays by transforming each item
  if (Array.isArray(data)) {
    return data.map(item => transformVotingBloc(item));
  }

  const transformed = {
    ...data,
    _id: data.id
  };

  // Handle dates properly
  if (data.createdAt instanceof Date) {
    transformed.createdAt = data.createdAt.toISOString();
  }
  if (data.updatedAt instanceof Date) {
    transformed.updatedAt = data.updatedAt.toISOString();
  }

  // Ensure arrays are always arrays, never null/undefined
  transformed.goals = Array.isArray(data.goals) ? data.goals :
    (typeof data.goals === 'string' ? JSON.parse(data.goals || '[]') : []);

  transformed.toolkits = Array.isArray(data.toolkits) ? data.toolkits :
    (typeof data.toolkits === 'string' ? JSON.parse(data.toolkits || '[]') : []);

  // Create nested location object from flat fields
  if (data.locationState || data.locationLga || data.locationWard) {
    transformed.location = {
      state: data.locationState || '',
      lga: data.locationLga || '',
      ward: data.locationWard || ''
    };
  }

  // Use member counts from model (already calculated correctly)
  const totalMemberCount = parseInt(data.totalMembers || data.memberCount || 0);
  const platformMemberCount = parseInt(data.platformMemberCount || 0);
  const manualMemberCount = parseInt(data.manualMemberCount || 0);

  transformed.totalMembers = totalMemberCount;
  transformed.memberCount = totalMemberCount;
  transformed.platformMemberCount = platformMemberCount;
  transformed.manualMemberCount = manualMemberCount;

  // Create metrics object for frontend compatibility
  transformed.metrics = {
    totalMembers: totalMemberCount,
    platformMembers: platformMemberCount,
    manualMembers: manualMemberCount,
    weeklyGrowth: parseInt(data.weeklyGrowth || 0),
    monthlyGrowth: parseInt(data.monthlyGrowth || 0),
    engagementScore: parseInt(data.engagementScore || 0),
    lastUpdated: new Date().toISOString()
  };

  // Transform creator info if available as object, otherwise keep as ID
  if (data.creator && typeof data.creator === 'object') {
    transformed.creator = {
      _id: data.creator.id,
      name: data.creator.name,
      email: data.creator.email,
      profileImage: data.creator.profileImage,
      personalInfo: data.creator.personalInfo || { user_name: data.creator.name }
    };
  }

  // Transform members array - convert from user IDs to objects with _id property
  if (Array.isArray(data.members)) {
    transformed.members = data.members.map(memberId => {
      // If it's already an object with user info, transform it
      if (typeof memberId === 'object') {
        return {
          _id: memberId.userId || memberId.id || memberId._id,
          name: memberId.name,
          email: memberId.email,
          joinDate: memberId.joinDate
        };
      }
      // If it's just a user ID string, create object
      return { _id: memberId };
    });
  }

  // Transform memberDetails if available (this contains full user info)
  if (Array.isArray(data.memberDetails)) {
    transformed.members = data.memberDetails.map(member => ({
      _id: member.userId,
      name: member.name,
      email: member.email,
      joinDate: member.joinDate
    }));
  }

  // Transform manualMembers array
  if (Array.isArray(data.manualMembers)) {
    transformed.manualMembers = data.manualMembers.map(member => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      phoneNumber: member.phoneNumber,
      state: member.state,
      lga: member.lga,
      ward: member.ward,
      addedBy: member.addedBy,
      addedAt: member.addedAt
    }));
  } else {
    transformed.manualMembers = [];
  }

  // Remove PostgreSQL-specific fields
  delete transformed.id;
  delete transformed.locationState;
  delete transformed.locationLga;
  delete transformed.locationWard;

  return transformed;
}

/**
 * Transform PostgreSQL voting bloc message data to MongoDB-compatible format
 */
export function transformVotingBlocMessage(message) {
  if (!message) return null;

  const transformed = {
    ...message,
    _id: message.id
  };

  // Handle dates properly
  if (message.createdAt instanceof Date) {
    transformed.createdAt = message.createdAt.toISOString();
  }
  if (message.updatedAt instanceof Date) {
    transformed.updatedAt = message.updatedAt.toISOString();
  }

  // Transform sender and recipient info if they're objects
  if (message.sender && typeof message.sender === 'object') {
    transformed.sender = transformUser(message.sender);
  }
  if (message.recipient && typeof message.recipient === 'object') {
    transformed.recipient = transformUser(message.recipient);
  }

  // Remove PostgreSQL id field
  delete transformed.id;

  return transformed;
}

/**
 * Transform PostgreSQL admin broadcast data to MongoDB-compatible format
 */
export function transformBroadcast(broadcast) {
  if (!broadcast) return null;

  const transformed = {
    ...broadcast,
    _id: broadcast.id
  };

  // Handle dates properly
  if (broadcast.createdAt instanceof Date) {
    transformed.createdAt = broadcast.createdAt.toISOString();
  }
  if (broadcast.updatedAt instanceof Date) {
    transformed.updatedAt = broadcast.updatedAt.toISOString();
  }

  // Transform sentBy info if it's an object
  if (broadcast.sentBy && typeof broadcast.sentBy === 'object') {
    transformed.sentBy = transformUser(broadcast.sentBy);
  }

  // Remove PostgreSQL id field
  delete transformed.id;

  return transformed;
}

/**
 * Transform PostgreSQL voting bloc broadcast data to MongoDB-compatible format
 */
export function transformVotingBlocBroadcast(broadcast) {
  if (!broadcast) return null;

  const transformed = {
    ...broadcast,
    _id: broadcast.id
  };

  // Handle dates properly
  if (broadcast.createdAt instanceof Date) {
    transformed.createdAt = broadcast.createdAt.toISOString();
  }
  if (broadcast.updatedAt instanceof Date) {
    transformed.updatedAt = broadcast.updatedAt.toISOString();
  }

  // Ensure channels is always an array
  transformed.channels = Array.isArray(broadcast.channels) ? broadcast.channels :
    (typeof broadcast.channels === 'string' ? JSON.parse(broadcast.channels || '[]') : []);

  // Transform sentBy info if it's an object
  if (broadcast.sentBy && typeof broadcast.sentBy === 'object') {
    transformed.sentBy = transformUser(broadcast.sentBy);
  }

  // Remove PostgreSQL id field
  delete transformed.id;

  return transformed;
}

/**
 * General transformation function that handles nested objects and arrays
 */
export function toMongoFormat(data) {
  if (!data) return data;

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => toMongoFormat(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const transformed = {};

    for (const [key, value] of Object.entries(data)) {
      // Transform 'id' to '_id' for MongoDB compatibility
      if (key === 'id') {
        transformed._id = value;
      } else {
        transformed[key] = toMongoFormat(value);
      }
    }

    return transformed;
  }

  return data;
}