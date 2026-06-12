import Newsletter from '../models/newsletter.model.js';
import { uploadBufferToS3 } from '../utils/s3Upload.js';
import { createEmailTransporter, sender } from '../config/email.js';
import { createNewsletterEmailTemplate } from '../utils/emailTemplates.js';
import emailBroadcastQueue from '../queues/emailBroadcastQueue.js';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379/0', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

// ── Utilities ───────────────────────────────────────────────────────────────

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

function generatePreviewText(content, maxLength = 200) {
  const text = (content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s\S*$/, '') + '...';
}

// ── Public endpoints (no auth) ──────────────────────────────────────────────

export const getSentNewsletters = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

    const data = await Newsletter.listSent({ page, limit });
    res.json(data);
  } catch (error) {
    console.error('Error fetching sent newsletters:', error);
    res.status(500).json({ message: 'Failed to fetch newsletters' });
  }
};

export const getNewsletterBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: 'Invalid slug' });
    }

    const newsletter = await Newsletter.findBySlug(slug);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    res.json({ newsletter });
  } catch (error) {
    console.error('Error fetching newsletter by slug:', error);
    res.status(500).json({ message: 'Failed to fetch newsletter' });
  }
};

// ── Unsubscribe endpoint (no auth — uses token) ────────────────────────────

export const unsubscribeByToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid unsubscribe token' });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return res.status(400).json({ message: 'Invalid unsubscribe token format' });
    }

    const result = await Newsletter.unsubscribeByToken(token);
    if (!result) {
      return res.status(404).json({ message: 'Invalid or expired unsubscribe link' });
    }

    res.json({ message: 'You have been unsubscribed from newsletters successfully.' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ message: 'Failed to process unsubscribe request' });
  }
};

// ── User subscription management (auth required) ───────────────────────────

export const getSubscriptionStatus = async (req, res) => {
  try {
    const status = await Newsletter.getSubscriptionStatus(req.user.id);
    res.json({ newsletterOptOut: status?.newsletter_opt_out || false });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ message: 'Failed to fetch subscription status' });
  }
};

export const toggleSubscription = async (req, res) => {
  try {
    const { optOut } = req.body;
    if (typeof optOut !== 'boolean') {
      return res.status(400).json({ message: 'optOut must be a boolean' });
    }

    const result = await Newsletter.toggleSubscription(req.user.id, optOut);
    res.json({ newsletterOptOut: result.newsletter_opt_out });
  } catch (error) {
    console.error('Error toggling subscription:', error);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
};

// ── Admin endpoints (auth required) ─────────────────────────────────────────

export const getAllNewsletters = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { status } = req.query;

    if (status && !['draft', 'scheduled', 'sending', 'sent', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status filter' });
    }

    const data = await Newsletter.listAll({ page, limit, status: status || null });
    res.json(data);
  } catch (error) {
    console.error('Error fetching all newsletters:', error);
    res.status(500).json({ message: 'Failed to fetch newsletters' });
  }
};

export const createNewsletter = async (req, res) => {
  try {
    const { title, subject, content, previewText, featuredImageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Generate unique slug
    let slug = generateSlug(title);
    if (await Newsletter.slugExists(slug)) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const newsletter = await Newsletter.create({
      title: title.trim(),
      slug,
      subject: (subject || title).trim(),
      content: content || '',
      previewText: previewText || generatePreviewText(content || ''),
      featuredImageUrl: featuredImageUrl || null,
      authorId: req.user.id,
    });

    res.status(201).json({ newsletter });
  } catch (error) {
    console.error('Error creating newsletter:', error);
    res.status(500).json({ message: 'Failed to create newsletter' });
  }
};

export const updateNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, content, previewText, featuredImageUrl } = req.body;

    const existing = await Newsletter.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    if (existing.status === 'sent' || existing.status === 'sending') {
      return res.status(400).json({ message: 'Cannot edit a newsletter that has been sent or is currently sending' });
    }

    const fields = {};
    if (title !== undefined) {
      fields.title = title.trim();
      if (title.trim() !== existing.title) {
        let newSlug = generateSlug(title);
        if (await Newsletter.slugExists(newSlug, id)) {
          newSlug = `${newSlug}-${Date.now().toString(36)}`;
        }
        fields.slug = newSlug;
      }
    }
    if (subject !== undefined) fields.subject = subject.trim();
    if (content !== undefined) {
      fields.content = content;
      if (previewText === undefined) {
        fields.previewText = generatePreviewText(content);
      }
    }
    if (previewText !== undefined) fields.previewText = previewText;
    if (featuredImageUrl !== undefined) fields.featuredImageUrl = featuredImageUrl;

    const newsletter = await Newsletter.update(id, fields);
    res.json({ newsletter });
  } catch (error) {
    console.error('Error updating newsletter:', error);
    res.status(500).json({ message: 'Failed to update newsletter' });
  }
};

export const deleteNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Newsletter.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    if (existing.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft newsletters can be deleted' });
    }

    await Newsletter.delete(id);
    res.json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    res.status(500).json({ message: 'Failed to delete newsletter' });
  }
};

export const getRecipientCount = async (req, res) => {
  try {
    const count = await Newsletter.getRecipientCount();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching recipient count:', error);
    res.status(500).json({ message: 'Failed to fetch recipient count' });
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Validate email if provided, otherwise fall back to admin's email
    const recipientEmail = email?.trim() || req.user.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const webUrl = `${clientUrl}/newsletter/${newsletter.slug}`;
    // Use a dummy unsubscribe token for test
    const unsubscribeUrl = `${clientUrl}/newsletter/unsubscribe?token=test-preview`;

    const html = createNewsletterEmailTemplate({
      title: newsletter.title,
      content: newsletter.content,
      previewText: newsletter.preview_text,
      featuredImageUrl: newsletter.featured_image_url,
      webUrl,
      unsubscribeUrl,
      recipientName: req.user.name || 'Admin',
    });

    const transporter = createEmailTransporter();
    await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: recipientEmail,
      subject: `[TEST] ${newsletter.subject}`,
      html,
    });
    transporter.close();

    res.json({ message: `Test email sent to ${recipientEmail}` });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Failed to send test email' });
  }
};

export const publishNewsletter = async (req, res) => {
  try {
    const { id } = req.params;

    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    if (newsletter.status !== 'draft') {
      return res.status(400).json({ message: `Cannot publish — newsletter is already "${newsletter.status}"` });
    }

    if (!newsletter.content || newsletter.content.trim() === '') {
      return res.status(400).json({ message: 'Newsletter content cannot be empty' });
    }

    const published = await Newsletter.markPublished(id);
    res.json({ message: 'Newsletter published successfully', newsletter: published });
  } catch (error) {
    console.error('Error publishing newsletter:', error);
    res.status(500).json({ message: 'Failed to publish newsletter' });
  }
};

export const sendNewsletter = async (req, res) => {
  try {
    const { id } = req.params;

    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    if (newsletter.status === 'sent' || newsletter.status === 'sending') {
      return res.status(400).json({ message: 'This newsletter has already been sent or is currently sending' });
    }

    if (!newsletter.content || newsletter.content.trim() === '') {
      return res.status(400).json({ message: 'Newsletter content cannot be empty' });
    }

    // Get recipient count
    const totalRecipients = await Newsletter.getRecipientCount();
    if (totalRecipients === 0) {
      return res.status(400).json({ message: 'No eligible recipients found' });
    }

    // Mark as sending
    await Newsletter.markSending(id, totalRecipients);

    // Queue the send job
    await emailBroadcastQueue.add('newsletter-send', {
      type: 'newsletter',
      newsletterId: id,
      adminId: req.user.id,
      adminName: req.user.name,
      title: newsletter.title,
      subject: newsletter.subject,
      content: newsletter.content,
      previewText: newsletter.preview_text,
      featuredImageUrl: newsletter.featured_image_url,
      slug: newsletter.slug,
    });

    res.json({
      message: 'Newsletter send started',
      newsletterId: id,
      totalRecipients,
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ message: 'Failed to send newsletter' });
  }
};

export const uploadNewsletterImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid image type. Allowed: jpeg, png, gif, webp' });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.buffer.length > maxSize) {
      return res.status(400).json({ message: 'Image too large. Maximum 5MB allowed' });
    }

    const url = await uploadBufferToS3(req.file.buffer, req.file.originalname, {
      folder: 'newsletters',
      contentType: req.file.mimetype,
    });

    res.json({ url });
  } catch (error) {
    console.error('Error uploading newsletter image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};

// ── SSE Progress Stream ─────────────────────────────────────────────────────

export const streamNewsletterProgress = async (req, res) => {
  try {
    const { id } = req.params;

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

    const progressKey = `newsletter:progress:${id}`;

    const sendProgress = async () => {
      try {
        const data = await redis.hgetall(progressKey);
        if (data && Object.keys(data).length > 0) {
          res.write(`data: ${JSON.stringify(data)}\n\n`);

          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(interval);
            res.write(`data: ${JSON.stringify({ status: 'stream_end' })}\n\n`);
            res.end();
          }
        } else {
          // Fall back to DB record
          const newsletter = await Newsletter.findById(id);
          if (newsletter) {
            res.write(`data: ${JSON.stringify({
              status: newsletter.status || 'pending',
              total: newsletter.total_recipients || 0,
              sent: newsletter.emails_sent || 0,
              failed: newsletter.emails_failed || 0,
              phase: newsletter.status === 'sent' ? 'Completed' : 'Waiting to start...',
            })}\n\n`);

            if (newsletter.status === 'sent' || newsletter.status === 'draft') {
              clearInterval(interval);
              res.write(`data: ${JSON.stringify({ status: 'stream_end' })}\n\n`);
              res.end();
            }
          }
        }
      } catch (err) {
        console.error('SSE newsletter progress read error:', err.message);
      }
    };

    const interval = setInterval(sendProgress, 2000);
    sendProgress();

    req.on('close', () => {
      clearInterval(interval);
    });
  } catch (error) {
    console.error('Error streaming newsletter progress:', error);
    res.status(500).json({ message: 'Failed to stream progress' });
  }
};
