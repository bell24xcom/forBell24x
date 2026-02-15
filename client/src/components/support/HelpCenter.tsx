'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Help,
  Support,
  WhatsApp,
  Phone,
  Email,
  VideoLibrary,
  Book,
  CheckCircle,
  Info,
  Schedule,
  Language
} from '@mui/icons-material';

interface FAQItem {
  question: string;
  questionHindi: string;
  answer: string;
  answerHindi: string;
  category: 'general' | 'gst' | 'payment' | 'msme' | 'export';
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'How do I register my business on Bell24h?',
    questionHindi: 'Bell24h पर अपना व्यवसाय कैसे पंजीकृत करें?',
    answer: 'Click on "Register" and provide your business details including GST number, company information, and contact details. Our team will verify your details within 24 hours.',
    answerHindi: '"रजिस्टर" पर क्लिक करें और अपने व्यवसाय का विवरण जिसमें GST नंबर, कंपनी की जानकारी और संपर्क विवरण शामिल हैं। हमारी टीम 24 घंटों के भीतर आपके विवरण की जांच करेगी।',
    category: 'general'
  },
  {
    question: 'What documents are required for GST verification?',
    questionHindi: 'GST सत्यापन के लिए कौन से दस्तावेज आवश्यक हैं?',
    answer: 'You need your GST registration certificate, PAN card, and business address proof. For MSMEs, also include your MSME certificate for additional benefits.',
    answerHindi: 'आपको अपना GST पंजीकरण प्रमाणपत्र, PAN कार्ड और व्यवसाय का पता प्रमाण चाहिए। MSME के लिए, अतिरिक्त लाभों के लिए अपना MSME प्रमाणपत्र भी शामिल करें।',
    category: 'gst'
  },
  {
    question: 'What payment methods are supported?',
    questionHindi: 'कौन से भुगतान तरीके समर्थित हैं?',
    answer: 'Bell24h supports UPI, NEFT/RTGS, credit/debit cards, and digital wallets. UPI is recommended for instant payments and better tracking.',
    answerHindi: 'Bell24h UPI, NEFT/RTGS, क्रेडिट/डेबिट कार्ड और डिजिटल वॉलेट का समर्थन करता है। तत्काल भुगतान और बेहतर ट्रैकिंग के लिए UPI की सिफारिश की जाती है।',
    category: 'payment'
  },
  {
    question: 'How do MSME benefits work on Bell24h?',
    questionHindi: 'Bell24h पर MSME लाभ कैसे काम करते हैं?',
    answer: 'MSME businesses get reduced GST rates, priority support, subsidized pricing, and access to government tenders. Upload your MSME certificate to activate these benefits.',
    answerHindi: 'MSME व्यवसायों को कम GST दरें, प्राथमिकता सहायता, सब्सिडी वाली कीमतें और सरकारी निविदाओं तक पहुंच मिलती है। इन लाभों को सक्रिय करने के लिए अपना MSME प्रमाणपत्र अपलोड करें।',
    category: 'msme'
  },
  {
    question: 'Can I export products through Bell24h?',
    questionHindi: 'क्या मैं Bell24h के माध्यम से उत्पाद निर्यात कर सकता हूं?',
    answer: 'Yes! Bell24h provides export support including documentation, shipping logistics, and export incentives. Contact our export team for assistance.',
    answerHindi: 'हाँ! Bell24h दस्तावेज़ीकरण, शिपिंग लॉजिस्टिक्स और निर्यात प्रोत्साहन सहित निर्यात सहायता प्रदान करता है। सहायता के लिए हमारी निर्यात टीम से संपर्क करें।',
    category: 'export'
  }
];

const SUPPORT_CHANNELS = [
  {
    name: 'WhatsApp Business Support',
    nameHindi: 'व्हाट्सऐप बिजनेस सहायता',
    description: 'Get instant support via WhatsApp',
    descriptionHindi: 'व्हाट्सऐप के माध्यम से तत्काल सहायता प्राप्त करें',
    icon: WhatsApp,
    contact: '+91-98765-43210',
    responseTime: '<5 minutes',
    available: '24/7'
  },
  {
    name: 'Phone Support',
    nameHindi: 'फोन सहायता',
    description: 'Speak directly with our support team',
    descriptionHindi: 'हमारी सहायता टीम से सीधे बात करें',
    icon: Phone,
    contact: '+91-98765-43211',
    responseTime: '<2 minutes',
    available: '9 AM - 6 PM IST'
  },
  {
    name: 'Email Support',
    nameHindi: 'ईमेल सहायता',
    description: 'Send detailed queries via email',
    descriptionHindi: 'ईमेल के माध्यम से विस्तृत प्रश्न भेजें',
    icon: Email,
    contact: 'support@bell24h.com',
    responseTime: '<4 hours',
    available: '24/7'
  }
];

const VIDEO_TUTORIALS = [
  {
    title: 'How to Register Your Business',
    titleHindi: 'अपना व्यवसाय कैसे पंजीकृत करें',
    duration: '5:30',
    language: 'Hindi',
    url: '/tutorials/business-registration'
  },
  {
    title: 'GST Integration Guide',
    titleHindi: 'GST एकीकरण गाइड',
    duration: '8:15',
    language: 'English',
    url: '/tutorials/gst-integration'
  },
  {
    title: 'UPI Payment Setup',
    titleHindi: 'UPI भुगतान सेटअप',
    duration: '4:45',
    language: 'Hindi',
    url: '/tutorials/upi-setup'
  },
  {
    title: 'MSME Benefits Activation',
    titleHindi: 'MSME लाभ सक्रियण',
    duration: '6:20',
    language: 'English',
    url: '/tutorials/msme-benefits'
  }
];

export default function HelpCenter() {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQ = FAQ_DATA.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent('Hello! I need help with Bell24h platform.');
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        🆘 Help & Support Center
      </Typography>

      {/* Language Toggle */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Language />
        <FormControl size="small">
          <Select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'hi')}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Support Channels */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Support /> Support Channels
          </Typography>
          <Grid container spacing={3}>
            {SUPPORT_CHANNELS.map((channel, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <channel.icon color="primary" />
                      <Typography variant="h6">
                        {selectedLanguage === 'hi' ? channel.nameHindi : channel.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedLanguage === 'hi' ? channel.descriptionHindi : channel.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Contact:</strong> {channel.contact}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Response Time:</strong> {channel.responseTime}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Available:</strong> {channel.available}
                    </Typography>
                    {channel.name.includes('WhatsApp') && (
                      <Button 
                        variant="contained" 
                        color="success" 
                        fullWidth
                        startIcon={<WhatsApp />}
                        onClick={handleWhatsAppSupport}
                      >
                        Start Chat
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Video Tutorials */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoLibrary /> Video Tutorials
          </Typography>
          <Grid container spacing={2}>
            {VIDEO_TUTORIALS.map((tutorial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {selectedLanguage === 'hi' ? tutorial.titleHindi : tutorial.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip label={tutorial.duration} size="small" />
                      <Chip label={tutorial.language} size="small" color="primary" />
                    </Box>
                    <Button variant="outlined" fullWidth>
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Help /> Frequently Asked Questions
          </Typography>
          
          {/* Search and Filter */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search FAQ"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type your question..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="gst">GST & Compliance</MenuItem>
                    <MenuItem value="payment">Payments</MenuItem>
                    <MenuItem value="msme">MSME Benefits</MenuItem>
                    <MenuItem value="export">Export & Import</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* FAQ Items */}
          {filteredFAQ.map((item, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  {selectedLanguage === 'hi' ? item.questionHindi : item.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  {selectedLanguage === 'hi' ? item.answerHindi : item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Indian Business Support */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info /> Indian Business Support
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Indian Timezone Support:</strong> Our support team is available during Indian business hours (IST) for local assistance.
            </Typography>
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                🏛️ GST & Compliance Support
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="GST registration assistance" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Compliance documentation" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Tax filing guidance" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                🏭 MSME Support
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="MSME registration help" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Government scheme guidance" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Credit facility information" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
} 
