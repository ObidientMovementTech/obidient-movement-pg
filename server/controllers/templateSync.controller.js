import { TemplateSyncService } from '../services/templateSyncService.js';

export const getSyncStatus = async (req, res) => {
  try {
    const status = await TemplateSyncService.getSyncStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message
    });
  }
};

export const checkOutdatedBlocs = async (req, res) => {
  try {
    const result = await TemplateSyncService.checkForOutdatedBlocs();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error checking outdated blocs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check outdated blocs',
      error: error.message
    });
  }
};

export const syncVotingBloc = async (req, res) => {
  try {
    const { votingBlocId } = req.params;
    const { syncFields } = req.body; // Optional array of fields to sync

    const result = await TemplateSyncService.syncVotingBloc(votingBlocId, syncFields);

    res.json({
      success: true,
      data: result,
      message: result.updated ? 'Voting bloc synced successfully' : 'No sync needed'
    });
  } catch (error) {
    console.error('Error syncing voting bloc:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync voting bloc',
      error: error.message
    });
  }
};

export const syncAllOutdatedBlocs = async (req, res) => {
  try {
    const { syncFields } = req.body; // Optional array of fields to sync

    const result = await TemplateSyncService.syncAllOutdatedBlocs(syncFields);

    res.json({
      success: true,
      data: result,
      message: result.message
    });
  } catch (error) {
    console.error('Error syncing all blocs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync voting blocs',
      error: error.message
    });
  }
};

export const updateSyncPreferences = async (req, res) => {
  try {
    const { votingBlocId } = req.params;
    const { preferences } = req.body;

    const result = await TemplateSyncService.updateSyncPreferences(votingBlocId, preferences);

    res.json({
      success: true,
      data: result,
      message: 'Sync preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating sync preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sync preferences',
      error: error.message
    });
  }
};
