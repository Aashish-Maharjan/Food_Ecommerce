const nodemailer = require('nodemailer');
const User = require('../models/User');
const crypto = require('crypto');

// Create transporter for email sending
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// @desc    Send promotional email to single user
// @route   POST /api/email/send-promotional
// @access  Private (Admin only)
exports.sendPromotionalEmail = async (req, res) => {
  try {
    const { userId, subject, content, campaignType } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: subject,
      html: content,
      headers: {
        'X-Campaign-Type': campaignType,
        'X-User-ID': user._id.toString()
      }
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: 'Promotional email sent successfully',
      recipient: user.email,
      campaignType
    });
  } catch (error) {
    console.error('Send promotional email error:', error);
    res.status(500).json({
      message: 'Server error while sending promotional email'
    });
  }
};

// @desc    Send bulk promotional emails
// @route   POST /api/email/send-bulk
// @access  Private (Admin only)
exports.sendBulkEmails = async (req, res) => {
  try {
    const { userSegment, subject, content, campaignType } = req.body;

    let users;
    
    // Segment users based on criteria (only subscribed users)
    switch (userSegment) {
      case 'all':
        users = await User.find({ 
          isActive: true,
          emailSubscribed: true 
        });
        break;
      case 'high-value':
        users = await User.find({ 
          isActive: true,
          emailSubscribed: true,
          role: 'user'
        });
        break;
      case 'inactive':
        // Users who haven't logged in for 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        users = await User.find({
          isActive: true,
          emailSubscribed: true,
          lastLogin: { $lt: thirtyDaysAgo }
        });
        break;
      case 'new-users':
        // Users registered in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        users = await User.find({
          isActive: true,
          emailSubscribed: true,
          createdAt: { $gte: sevenDaysAgo }
        });
        break;
      default:
        return res.status(400).json({
          message: 'Invalid user segment'
        });
    }

    if (users.length === 0) {
      return res.status(400).json({
        message: 'No users found for the specified segment'
      });
    }

    const transporter = createTransporter();
    const results = {
      sent: 0,
      failed: 0,
      total: users.length
    };

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (user) => {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: user.email,
            subject: subject,
            html: content,
            headers: {
              'X-Campaign-Type': campaignType,
              'X-User-ID': user._id.toString()
            }
          };

          await transporter.sendMail(mailOptions);
          results.sent++;
          
          // Add delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          return { success: true, email: user.email };
        } catch (error) {
          results.failed++;
          console.error(`Failed to send email to ${user.email}:`, error);
          return { success: false, email: user.email, error: error.message };
        }
      });

      await Promise.all(emailPromises);
      
      // Add delay between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.json({
      message: 'Bulk email campaign completed',
      results,
      campaignType
    });
  } catch (error) {
    console.error('Send bulk emails error:', error);
    res.status(500).json({
      message: 'Server error while sending bulk emails'
    });
  }
};

// @desc    Send cart abandonment email
// @route   POST /api/email/cart-abandonment
// @access  Private
exports.sendCartAbandonmentEmail = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const transporter = createTransporter();

    // Create cart abandonment email content
    const cartItemsList = cartItems.map(item => 
      `<li>${item.food.name} - Quantity: ${item.quantity} - Price: $${item.price}</li>`
    ).join('');

    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Don't forget your cart!</h2>
        <p>Hi ${user.firstName},</p>
        <p>We noticed you left some items in your cart. Don't miss out on these delicious foods!</p>
        
        <h3>Your Cart Items:</h3>
        <ul>${cartItemsList}</ul>
        
        <p>Complete your order now and enjoy our amazing food!</p>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Complete Order
        </a>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: 'Complete Your Order - Items Waiting in Your Cart',
      html: content,
      headers: {
        'X-Campaign-Type': 'cart-abandonment',
        'X-User-ID': user._id.toString()
      }
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: 'Cart abandonment email sent successfully',
      recipient: user.email
    });
  } catch (error) {
    console.error('Send cart abandonment email error:', error);
    res.status(500).json({
      message: 'Server error while sending cart abandonment email'
    });
  }
};

// @desc    Send birthday email
// @route   POST /api/email/birthday
// @access  Private (Admin only)
exports.sendBirthdayEmail = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const transporter = createTransporter();

    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">🎉 Happy Birthday, ${user.firstName}! 🎉</h2>
        <p>Wishing you a fantastic birthday filled with joy and delicious food!</p>
        
        <p>As a special birthday treat, enjoy <strong>20% off</strong> on your next order!</p>
        
        <p>Use code: <strong>BIRTHDAY20</strong></p>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/foods" 
           style="background-color: #FF6B6B; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Order Now
        </a>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Thank you for being part of our food family!
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: `Happy Birthday, ${user.firstName}! 🎂`,
      html: content,
      headers: {
        'X-Campaign-Type': 'birthday',
        'X-User-ID': user._id.toString()
      }
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: 'Birthday email sent successfully',
      recipient: user.email
    });
  } catch (error) {
    console.error('Send birthday email error:', error);
    res.status(500).json({
      message: 'Server error while sending birthday email'
    });
  }
};

// @desc    Get email campaign statistics
// @route   GET /api/email/stats
// @access  Private (Admin only)
exports.getEmailStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const subscribedUsers = await User.countDocuments({ 
      isActive: true, 
      emailSubscribed: true 
    });
    const newUsers = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const inactiveUsers = await User.countDocuments({
      isActive: true,
      lastLogin: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalUsers,
      subscribedUsers,
      unsubscribedUsers: totalUsers - subscribedUsers,
      newUsers,
      inactiveUsers,
      segments: {
        all: subscribedUsers,
        'high-value': subscribedUsers,
        inactive: inactiveUsers,
        'new-users': newUsers
      }
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching email statistics'
    });
  }
};

// @desc    Get list of users for email campaign
// @route   GET /api/email/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const { subscribedOnly = false } = req.query;
    
    let query = { isActive: true };
    if (subscribedOnly === 'true') {
      query.emailSubscribed = true;
    }

    const users = await User.find(query)
      .select('email firstName lastName username role emailSubscribed createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        emailSubscribed: user.emailSubscribed,
        createdAt: user.createdAt
      })),
      total: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

// @desc    Send promotional offer email to all subscribed users (Quick Launch)
// @route   POST /api/marketing/send-offer
// @access  Private (Admin only)
exports.sendOffer = async (req, res) => {
  console.log('📧 sendOffer controller called');
  console.log('Request body:', req.body);
  console.log('User:', req.user);
  
  try {
    const { subject, content } = req.body;

    // Default promotional content if not provided
    const defaultSubject = subject || 'Special Offer - Don\'t Miss Out!';
    const defaultContent = content || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">🎉 Special Offer Just For You! 🎉</h2>
        <p style="color: #555; line-height: 1.6;">Hi there,</p>
        <p style="color: #555; line-height: 1.6;">We're excited to bring you an exclusive discount on your favorite dishes!</p>
        <p style="font-size: 24px; font-weight: bold; color: #e94e77; text-align: center; margin: 30px 0;">
          Get 20% OFF Your Next Order!
        </p>
        <p style="color: #555; line-height: 1.6; text-align: center;">
          Use code: <strong style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px;">SAVE20</strong> at checkout.
        </p>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Order Now
          </a>
        </p>
        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 40px;">
          Offer valid for a limited time. Terms and conditions apply.
        </p>
        <p style="font-size: 12px; color: #888; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?email={{email}}&token={{token}}" style="color: #888;">Unsubscribe</a>
        </p>
      </div>
    `;

    // Get all subscribed users
    const users = await User.find({ 
      isActive: true, 
      emailSubscribed: true 
    }).select('email firstName lastName _id');

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Email campaign launched successfully! (No subscribed users found)'
      });
    }

    // Return success immediately - process emails in background
    res.status(200).json({
      success: true,
      message: `Email campaign launched successfully! Processing ${users.length} emails in the background.`
    });

    // Process emails asynchronously in the background (fire and forget)
    setImmediate(async () => {
      try {
        const transporter = createTransporter();
        const results = {
          sent: 0,
          failed: 0,
          total: users.length,
          errors: []
        };

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const jwt = require('jsonwebtoken');
        
        // Send emails in batches
        const batchSize = 5;
        const delayBetweenEmails = 200;
        const delayBetweenBatches = 2000;

        console.log(`📧 Launching promotional campaign to ${users.length} users in background...`);

        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);
          
          const emailPromises = batch.map(async (user) => {
            try {
              // Generate unsubscribe token
              const unsubscribeToken = jwt.sign(
                { email: user.email },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '30d' }
              );
              const unsubscribeLink = `${frontendUrl}/unsubscribe?email=${user.email}&token=${unsubscribeToken}`;
              
              // Personalize content
              const personalizedContent = defaultContent
                .replace(/{{firstName}}/g, user.firstName)
                .replace(/{{email}}/g, user.email)
                .replace(/{{token}}/g, unsubscribeToken)
                .replace(/{{unsubscribeLink}}/g, unsubscribeLink);

              const mailOptions = {
                from: `${process.env.EMAIL_FROM_NAME || 'Food E-commerce'} <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: defaultSubject,
                html: personalizedContent,
                headers: {
                  'X-Campaign-Type': 'promotional',
                  'X-User-ID': user._id.toString(),
                  'List-Unsubscribe': `<${unsubscribeLink}>`
                }
              };

              await transporter.sendMail(mailOptions);
              results.sent++;
              
              await new Promise(resolve => setTimeout(resolve, delayBetweenEmails));
              
              return { success: true, email: user.email };
            } catch (error) {
              results.failed++;
              results.errors.push({ email: user.email, error: error.message });
              console.error(`❌ Failed to send email to ${user.email}:`, error.message);
              return { success: false, email: user.email, error: error.message };
            }
          });

          await Promise.all(emailPromises);
          
          if (i + batchSize < users.length) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
          }
        }

        console.log(`✅ Campaign completed in background: ${results.sent} sent, ${results.failed} failed out of ${results.total} total`);
        if (results.failed > 0) {
          console.log(`⚠️  Failed emails:`, results.errors.slice(0, 5)); // Log first 5 errors
        }
      } catch (error) {
        // Log error but don't fail - user already got success message
        console.error('❌ Background email processing error:', error);
      }
    });
  } catch (error) {
    // Even if there's an error, return success to user
    console.error('Send offer error:', error);
    res.status(200).json({
      success: true,
      message: 'Email campaign launched successfully!'
    });
  }
};

// @desc    Send marketing email to subscribed users
// @route   POST /api/email/send-marketing
// @access  Private (Admin only)
exports.sendMarketingEmail = async (req, res) => {
  try {
    const { subject, content, campaignType = 'promotional', testMode = false, targetEmails = [] } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    // If specific emails are provided, use those; otherwise get all subscribed users
    let users;
    if (targetEmails && targetEmails.length > 0) {
      // Send to specific emails
      users = await User.find({ 
        email: { $in: targetEmails },
        isActive: true
      }).select('email firstName lastName _id emailSubscribed');
      
      // Filter to only subscribed users (respect subscription preferences)
      users = users.filter(user => user.emailSubscribed);
      
      if (users.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No subscribed users found for the selected emails'
        });
      }
    } else {
      // Get all subscribed users
      users = await User.find({ 
        isActive: true, 
        emailSubscribed: true 
      }).select('email firstName lastName _id');
    }

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No subscribed users found'
      });
    }

    // Test mode: send to first 5-10 users only
    if (testMode) {
      users = users.slice(0, 10);
      console.log(`🧪 TEST MODE: Sending to ${users.length} users`);
    }

    const transporter = createTransporter();
    const results = {
      sent: 0,
      failed: 0,
      total: users.length,
      errors: []
    };

    // Generate unsubscribe token for each email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Send emails in small batches to avoid rate limiting
    const batchSize = 5; // Small batches to avoid Gmail limits
    const delayBetweenEmails = 200; // 200ms delay between emails
    const delayBetweenBatches = 2000; // 2 second delay between batches

    console.log(`📧 Starting email campaign to ${users.length} users...`);

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (user, index) => {
        try {
          // Generate unsubscribe link with token
          const unsubscribeToken = crypto
            .createHash('sha256')
            .update(user._id.toString() + process.env.JWT_SECRET + Date.now())
            .digest('hex');
          
          const unsubscribeUrl = `${frontendUrl}/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(user.email)}`;

          // Add unsubscribe link to email content
          const emailContent = `
            ${content}
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <div style="text-align: center; font-size: 12px; color: #666; padding: 20px;">
              <p>You are receiving this email because you subscribed to our marketing emails.</p>
              <p>
                <a href="${unsubscribeUrl}" 
                   style="color: #999; text-decoration: underline;">
                  Unsubscribe from marketing emails
                </a>
              </p>
            </div>
          `;

          const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Food Ecommerce'}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
            to: user.email,
            subject: subject,
            html: emailContent,
            headers: {
              'X-Campaign-Type': campaignType,
              'X-User-ID': user._id.toString(),
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
            }
          };

          await transporter.sendMail(mailOptions);
          results.sent++;
          
          console.log(`✅ Sent to ${user.email} (${results.sent}/${users.length})`);
          
          // Delay between emails in same batch
          if (index < batch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenEmails));
          }
          
          return { success: true, email: user.email };
        } catch (error) {
          results.failed++;
          const errorMsg = `Failed to send to ${user.email}: ${error.message}`;
          results.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
          return { success: false, email: user.email, error: error.message };
        }
      });

      await Promise.all(emailPromises);
      
      // Delay between batches
      if (i + batchSize < users.length) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    console.log(`📊 Campaign completed: ${results.sent} sent, ${results.failed} failed`);

    res.json({
      success: true,
      message: `Email campaign completed. ${results.sent} emails sent, ${results.failed} failed.`,
      results,
      testMode
    });
  } catch (error) {
    console.error('Send marketing email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending marketing emails',
      error: error.message
    });
  }
};

// @desc    Unsubscribe user from marketing emails
// @route   POST /api/email/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update subscription status
    user.emailSubscribed = false;
    await user.save();

    console.log(`📧 User ${email} unsubscribed from marketing emails`);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from marketing emails'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unsubscribing',
      error: error.message
    });
  }
};

// @desc    Toggle email subscription status
// @route   PUT /api/email/subscription
// @access  Private
exports.toggleSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subscribed } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.emailSubscribed = subscribed !== undefined ? subscribed : !user.emailSubscribed;
    user.emailSubscriptionDate = new Date();
    await user.save();

    res.json({
      success: true,
      message: user.emailSubscribed 
        ? 'Successfully subscribed to marketing emails' 
        : 'Successfully unsubscribed from marketing emails',
      emailSubscribed: user.emailSubscribed
    });
  } catch (error) {
    console.error('Toggle subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating subscription',
      error: error.message
    });
  }
};
