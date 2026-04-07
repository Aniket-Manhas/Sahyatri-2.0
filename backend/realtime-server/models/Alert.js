const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['panic', 'medical', 'fire', 'security', 'lost'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, default: '' },
  location: {
    nodeId: { type: String, required: true },
    nodeName: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    floor: { type: Number, default: 0 }
  },
  message: { type: String, default: '' },
  status: { type: String, enum: ['active', 'acknowledged', 'resolved'], default: 'active' },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
