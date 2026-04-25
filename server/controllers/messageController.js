const Message = require('../models/Message');

// @desc    Send a message
const sendMessage = async (req, res) => {
  try {
    const { content, recipientId } = req.body;
    
    let targetRecipientId = recipientId;
    
    if (req.user.role === 'viewer' && !targetRecipientId) {
      targetRecipientId = req.user.linkedUserId;
    }

    if (!targetRecipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    const message = await Message.create({
      senderId: req.user._id,
      senderName: req.user.name,
      recipientId: targetRecipientId,
      content,
      type: 'custom'
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get chat history with a partner
const getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: partnerId },
        { senderId: partnerId, recipientId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const User = require('../models/User');
const Viewer = require('../models/Viewer');

// @desc    Get all conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    }).sort({ createdAt: -1 });

    const partnersMap = new Map();
    messages.forEach(msg => {
      const partnerId = msg.senderId.toString() === userId.toString() ? msg.recipientId : msg.senderId;
      if (!partnersMap.has(partnerId.toString())) {
        partnersMap.set(partnerId.toString(), {
          id: partnerId,
          lastMessage: msg.content,
          updatedAt: msg.createdAt,
          name: msg.senderId.toString() === userId.toString() ? null : msg.senderName // Only trust senderName if it's the partner
        });
      }
    });

    const partners = Array.from(partnersMap.values());
    
    // Enrich with names and relationships
    const enrichedPartners = await Promise.all(partners.map(async p => {
      // Check if partner is a Viewer
      const viewer = await Viewer.findById(p.id);
      if (viewer) {
        return { 
          ...p, 
          name: viewer.name, 
          relationship: viewer.relationship || 'friend' 
        };
      }
      // Check if partner is a User (case where Viewer is looking at User)
      const user = await User.findById(p.id);
      if (user) {
        return { ...p, name: user.name, relationship: 'me' };
      }
      return p;
    }));

    res.json(enrichedPartners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Mark message as read
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findOne({ _id: req.params.id, recipientId: req.user._id });
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.read = true;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get unread incoming messages (for dashboard notifications)
const getIncomingMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user._id, read: false })
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getConversations,
  getIncomingMessages,
  markAsRead
};
