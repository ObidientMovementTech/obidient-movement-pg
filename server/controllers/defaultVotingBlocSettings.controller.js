import DefaultVotingBlocSettings from '../models/defaultVotingBlocSettings.model.js';
import { uploadToS3 } from '../utils/s3Upload.js';
import { TemplateSyncService } from '../services/templateSyncService.js';

// Get default voting bloc settings (Admin only)
export const getDefaultSettings = async (req, res) => {
  try {
    const settings = await DefaultVotingBlocSettings.get();

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching default voting bloc settings:', error);
    res.status(500).json({ message: 'Failed to fetch default settings' });
  }
};

// Update default voting bloc settings (Admin only)
export const updateDefaultSettings = async (req, res) => {
  try {
    const {
      descriptionTemplate,
      targetCandidate,
      scope,
      goals,
      toolkits,
      bannerImageUrl,
      richDescriptionTemplate,
      locationDefaults,
      autoSync = false
    } = req.body;

    // Validate required fields
    if (!descriptionTemplate || !targetCandidate) {
      return res.status(400).json({
        message: 'Description template and target candidate are required'
      });
    }

    const updatedSettings = await DefaultVotingBlocSettings.update({
      descriptionTemplate,
      targetCandidate,
      scope: scope || 'National',
      goals: goals || [],
      toolkits: toolkits || [],
      bannerImageUrl: bannerImageUrl || '',
      richDescriptionTemplate: richDescriptionTemplate || '',
      locationDefaults: locationDefaults || { useUserLocation: true }
    });

    if (!updatedSettings) {
      return res.status(404).json({ message: 'Failed to update settings' });
    }

    // Trigger automatic sync if requested
    let syncResult = null;
    if (autoSync) {
      try {
        console.log('🔄 Auto-syncing voting blocs after template update...');
        syncResult = await TemplateSyncService.syncAllOutdatedBlocs(['toolkits', 'location', 'scope']);
        console.log(`✅ Auto-sync completed: ${syncResult.syncedCount} blocs synced`);
      } catch (syncError) {
        console.error('❌ Auto-sync failed:', syncError);
        // Don't fail the settings update if sync fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Default voting bloc settings updated successfully',
      settings: updatedSettings,
      syncResult
    });
  } catch (error) {
    console.error('Error updating default voting bloc settings:', error);
    res.status(500).json({ message: 'Failed to update default settings' });
  }
};

// Upload banner image (Admin only)
export const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'File must be an image' });
    }

    // Validate file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image must be less than 5MB' });
    }

    // Upload to S3
    const imageUrl = await uploadToS3(req.file, { folder: 'voting-bloc-banners' });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading banner image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};
