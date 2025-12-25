import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Checkbox } from './components/ui/checkbox';
import { Switch } from './components/ui/switch';
import { FileUpload } from './components/FileUpload';
import { LinkInput } from './components/LinkInput';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { CurvedQuestionNav } from './components/CurvedQuestionNav';
import { MarqLogo } from './components/MarqLogo';
import { InteractiveBackground } from './components/InteractiveBackground';
import { ChevronLeft, ChevronRight, Save, History, FileText, CircleCheck, Zap, Grid, Cpu, Terminal, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { supabase } from '@/lib/supabase';

interface FormData {
  // Section 0
  productName?: string;
  marqNotes?: string;
  
  // Section 1
  avatarType: string;
  avatarGender: string;
  avatarAge: string;
  appearanceStyle: string;
  visualConstraints?: string;
  referenceImages?: File[];
  
  // Section 2
  voiceGender: string;
  accent: string;
  customAccent?: string;
  speakingPace: string;
  voiceTone: string;
  energyLevel: string;
  speechQuirks: string;
  pronunciationNotes?: string;
  
  // Section 3
  responseStyle: string;
  responseLength: string;
  allowInterruption: string;
  sensitiveTopics?: string;
  
  // Section 4
  avatarFraming: string;
  backgroundStyle: string;
  sessionMode: string;
  latencyPriority: string;
  concurrentUsers: string;
  
  // Section 5
  facialExpression: string;
  headMovement: string;
  eyeContact: string;
  lipSync: string;
  
  // Section 6
  noiseHandling: string;
  microphoneType: string;
  loudness: string;
  fillerWords: string;
  
  // Section 7
  videoFailure: string;
  videoRetries?: number;
  voiceFailure: string;
  voiceRetries?: number;
  networkDrop: string;
  
  // Section 8
  storeAudio: boolean;
  audioDays?: number;
  storeVideo: boolean;
  videoDays?: number;
  storeTranscripts: boolean;
  transcriptDays?: number;
  allowExport: boolean;
  
  // Section 9
  likeLinks?: string[];
  dislikeLinks?: string[];
  inspirationUploads?: File[];
  ezriFeeling?: string;
  
  // Section 10
  confirmDefaults: boolean;
}

interface Submission extends FormData {
  id: string;
  version: number;
  submissionDate: string;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  examples?: string[];
  field: keyof FormData;
  type: 'radio' | 'select' | 'textarea' | 'file-upload' | 'link-input' | 'switch' | 'checkbox' | 'number' | 'text';
  options?: { value: string; label: string; description?: string }[];
  conditional?: {
    field: keyof FormData;
    value: any;
  };
  optional?: boolean;
}

const wizardSteps: WizardStep[] = [
  {
    id: 'product-name',
    title: 'Project or product name?',
    description: 'What should we call this configuration?',
    examples: [
      'e.g., "Enterprise Sales AI"',
      'e.g., "Customer Support Agent"',
      'e.g., "Executive Assistant"'
    ],
    field: 'productName',
    type: 'text',
    optional: false
  },
  {
    id: 'marq-notes',
    title: 'Special notes or context (optional)',
    description: 'Any specific requirements or context',
    examples: [
      'e.g., "B2B enterprise focus"',
      'e.g., "Technical support specialist"',
      'e.g., "Conversational and friendly"'
    ],
    field: 'marqNotes',
    type: 'textarea',
    optional: true
  },
  {
    id: 'avatar-type',
    title: 'Avatar visual style',
    description: 'Select the visual rendering approach',
    field: 'avatarType',
    type: 'radio',
    options: [
      { value: 'realistic', label: 'Photorealistic', description: 'High-fidelity human rendering' },
      { value: 'stylized', label: 'Stylized', description: 'Artistic representation' }
    ]
  },
  {
    id: 'avatar-gender',
    title: 'Avatar gender presentation',
    description: 'Gender characteristics',
    field: 'avatarGender',
    type: 'radio',
    options: [
      { value: 'male', label: 'Male', description: 'Masculine features' },
      { value: 'female', label: 'Female', description: 'Feminine features' },
      { value: 'neutral', label: 'Neutral', description: 'Androgynous' }
    ]
  },
  {
    id: 'avatar-age',
    title: 'Avatar age range',
    description: 'Apparent age bracket',
    field: 'avatarAge',
    type: 'radio',
    options: [
      { value: 'young', label: 'Young', description: '25-35 years' },
      { value: 'adult', label: 'Adult', description: '35-50 years' },
      { value: 'mature', label: 'Mature', description: '50+ years' }
    ]
  },
  {
    id: 'appearance-style',
    title: 'Appearance & attire',
    description: 'Overall presentation style',
    field: 'appearanceStyle',
    type: 'radio',
    options: [
      { value: 'professional', label: 'Professional', description: 'Business attire' },
      { value: 'casual', label: 'Casual', description: 'Relaxed style' },
      { value: 'modest', label: 'Modest', description: 'Conservative' }
    ]
  },
  {
    id: 'visual-constraints',
    title: 'Visual constraints (optional)',
    description: 'What to avoid visually',
    examples: [
      'e.g., "No bright colors"',
      'e.g., "Avoid casual attire"'
    ],
    field: 'visualConstraints',
    type: 'textarea',
    optional: true
  },
  {
    id: 'reference-images',
    title: 'Reference images (optional)',
    description: 'Upload visual references',
    examples: [
      'Up to 5 images (JPG, PNG, WEBP)'
    ],
    field: 'referenceImages',
    type: 'file-upload',
    optional: true
  },
  {
    id: 'voice-gender',
    title: 'Voice gender',
    description: 'Voice gender characteristics',
    field: 'voiceGender',
    type: 'radio',
    options: [
      { value: 'male', label: 'Male', description: 'Masculine voice' },
      { value: 'female', label: 'Female', description: 'Feminine voice' },
      { value: 'neutral', label: 'Neutral', description: 'Androgynous' }
    ]
  },
  {
    id: 'accent',
    title: 'Voice accent',
    description: 'Regional accent',
    field: 'accent',
    type: 'radio',
    options: [
      { value: 'us-neutral', label: 'US Neutral', description: 'Standard American' },
      { value: 'other', label: 'Other', description: 'Custom accent' }
    ]
  },
  {
    id: 'custom-accent',
    title: 'Specify accent',
    description: 'What accent?',
    examples: [
      'e.g., "British English"',
      'e.g., "Australian"'
    ],
    field: 'customAccent',
    type: 'text',
    conditional: {
      field: 'accent',
      value: 'other'
    }
  },
  {
    id: 'speaking-pace',
    title: 'Speaking pace',
    description: 'Delivery speed',
    field: 'speakingPace',
    type: 'radio',
    options: [
      { value: 'slow', label: 'Slow', description: '120-140 WPM' },
      { value: 'medium', label: 'Medium', description: '140-160 WPM' },
      { value: 'fast', label: 'Fast', description: '160-180 WPM' }
    ]
  },
  {
    id: 'voice-tone',
    title: 'Voice tone',
    description: 'Emotional quality',
    field: 'voiceTone',
    type: 'radio',
    options: [
      { value: 'calm', label: 'Calm', description: 'Even & steady' },
      { value: 'warm', label: 'Warm', description: 'Friendly' },
      { value: 'neutral', label: 'Neutral', description: 'Professional' }
    ]
  },
  {
    id: 'energy-level',
    title: 'Energy level',
    description: 'Vocal energy',
    field: 'energyLevel',
    type: 'radio',
    options: [
      { value: 'low', label: 'Low', description: 'Subdued' },
      { value: 'medium', label: 'Medium', description: 'Balanced' },
      { value: 'high', label: 'High', description: 'Energetic' }
    ]
  },
  {
    id: 'speech-quirks',
    title: 'Speech style',
    description: 'Formality level',
    field: 'speechQuirks',
    type: 'radio',
    options: [
      { value: 'no-slang', label: 'Formal', description: 'No casual language' },
      { value: 'light-slang', label: 'Semi-formal', description: 'Light informality' },
      { value: 'normal', label: 'Conversational', description: 'Natural speech' }
    ]
  },
  {
    id: 'pronunciation-notes',
    title: 'Pronunciation notes (optional)',
    description: 'Special terms or names',
    examples: [
      'e.g., "API, SaaS, ML"'
    ],
    field: 'pronunciationNotes',
    type: 'textarea',
    optional: true
  },
  {
    id: 'response-style',
    title: 'Response approach',
    description: 'Communication style',
    field: 'responseStyle',
    type: 'radio',
    options: [
      { value: 'empathetic', label: 'Empathetic', description: 'Emotional awareness' },
      { value: 'factual', label: 'Factual', description: 'Data-driven' },
      { value: 'balanced', label: 'Balanced', description: 'Both approaches' }
    ]
  },
  {
    id: 'response-length',
    title: 'Response length',
    description: 'Typical response size',
    field: 'responseLength',
    type: 'radio',
    options: [
      { value: 'short', label: 'Short', description: '1-2 sentences' },
      { value: 'medium', label: 'Medium', description: '3-4 sentences' },
      { value: 'detailed', label: 'Detailed', description: '5+ sentences' }
    ]
  },
  {
    id: 'allow-interruption',
    title: 'Allow interruptions?',
    description: 'User can interrupt mid-response',
    field: 'allowInterruption',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes', description: 'Natural flow' },
      { value: 'no', label: 'No', description: 'Complete responses' }
    ]
  },
  {
    id: 'sensitive-topics',
    title: 'Sensitive topics (optional)',
    description: 'Special handling requirements',
    examples: [
      'e.g., "Legal disclaimers for medical content"'
    ],
    field: 'sensitiveTopics',
    type: 'textarea',
    optional: true
  },
  {
    id: 'avatar-framing',
    title: 'Avatar framing',
    description: 'Video composition',
    field: 'avatarFraming',
    type: 'radio',
    options: [
      { value: 'head-only', label: 'Head only', description: 'Close-up' },
      { value: 'head-shoulders', label: 'Head + shoulders', description: 'Standard' }
    ]
  },
  {
    id: 'background-style',
    title: 'Background style',
    description: 'Video background',
    field: 'backgroundStyle',
    type: 'radio',
    options: [
      { value: 'gradient', label: 'Gradient', description: 'Smooth blend' },
      { value: 'solid', label: 'Solid', description: 'Single color' },
      { value: 'room', label: 'Environment', description: 'Room setting' }
    ]
  },
  {
    id: 'session-mode',
    title: 'Session recording',
    description: 'Record sessions?',
    field: 'sessionMode',
    type: 'radio',
    options: [
      { value: 'live-only', label: 'Live only', description: 'No recording' },
      { value: 'live-replay', label: 'Live + replay', description: 'Record sessions' }
    ]
  },
  {
    id: 'latency-priority',
    title: 'Speed vs quality',
    description: 'Performance optimization',
    field: 'latencyPriority',
    type: 'radio',
    options: [
      { value: 'fastest', label: 'Speed', description: 'Low latency' },
      { value: 'balanced', label: 'Balanced', description: 'Optimized' },
      { value: 'natural', label: 'Quality', description: 'Best quality' }
    ]
  },
  {
    id: 'concurrent-users',
    title: 'Expected concurrent users',
    description: 'Simultaneous sessions',
    field: 'concurrentUsers',
    type: 'select',
    options: [
      { value: '10', label: '10 users' },
      { value: '50', label: '50 users' },
      { value: '100+', label: '100+ users' }
    ]
  },
  {
    id: 'facial-expression',
    title: 'Facial expressions',
    description: 'Expression range',
    field: 'facialExpression',
    type: 'radio',
    options: [
      { value: 'subtle', label: 'Subtle', description: 'Minimal' },
      { value: 'natural', label: 'Natural', description: 'Realistic' },
      { value: 'expressive', label: 'Expressive', description: 'Animated' }
    ]
  },
  {
    id: 'head-movement',
    title: 'Head movement',
    description: 'Natural gestures',
    field: 'headMovement',
    type: 'radio',
    options: [
      { value: 'minimal', label: 'Minimal', description: 'Subtle nods' },
      { value: 'natural', label: 'Natural', description: 'Realistic movement' }
    ]
  },
  {
    id: 'eye-contact',
    title: 'Eye contact',
    description: 'Gaze behavior',
    field: 'eyeContact',
    type: 'radio',
    options: [
      { value: 'steady', label: 'Steady', description: 'Consistent' },
      { value: 'natural', label: 'Natural', description: 'Subtle shifts' }
    ]
  },
  {
    id: 'lip-sync',
    title: 'Lip-sync accuracy',
    description: 'Mouth movement precision',
    field: 'lipSync',
    type: 'radio',
    options: [
      { value: 'standard', label: 'Standard', description: 'Good quality' },
      { value: 'high', label: 'High', description: 'Premium quality' }
    ]
  },
  {
    id: 'noise-handling',
    title: 'Noise filtering',
    description: 'Audio cleanup',
    field: 'noiseHandling',
    type: 'radio',
    options: [
      { value: 'basic', label: 'Basic', description: 'Standard filter' },
      { value: 'enhanced', label: 'Enhanced', description: 'AI-powered' }
    ]
  },
  {
    id: 'microphone-type',
    title: 'Primary device type',
    description: 'Expected hardware',
    field: 'microphoneType',
    type: 'radio',
    options: [
      { value: 'phone', label: 'Mobile', description: 'Phone/tablet' },
      { value: 'laptop', label: 'Desktop', description: 'Laptop/PC' },
      { value: 'mixed', label: 'Mixed', description: 'Various' }
    ]
  },
  {
    id: 'loudness',
    title: 'Voice volume',
    description: 'Output level',
    field: 'loudness',
    type: 'radio',
    options: [
      { value: 'softer', label: 'Softer', description: 'Gentle' },
      { value: 'normal', label: 'Normal', description: 'Standard' },
      { value: 'louder', label: 'Louder', description: 'Projected' }
    ]
  },
  {
    id: 'filler-words',
    title: 'Filler words',
    description: 'Natural pauses ("um", "uh")',
    field: 'fillerWords',
    type: 'radio',
    options: [
      { value: 'none', label: 'None', description: 'Clean speech' },
      { value: 'minimal', label: 'Minimal', description: 'Occasional' },
      { value: 'natural', label: 'Natural', description: 'Human-like' }
    ]
  },
  {
    id: 'video-failure',
    title: 'If video fails',
    description: 'Fallback behavior',
    field: 'videoFailure',
    type: 'radio',
    options: [
      { value: 'voice-only', label: 'Voice-only', description: 'Continue audio' },
      { value: 'retry', label: 'Retry', description: 'Reconnect' }
    ]
  },
  {
    id: 'video-retries',
    title: 'Video retry attempts',
    description: 'Number of retries',
    field: 'videoRetries',
    type: 'number',
    conditional: {
      field: 'videoFailure',
      value: 'retry'
    }
  },
  {
    id: 'voice-failure',
    title: 'If voice fails',
    description: 'Fallback behavior',
    field: 'voiceFailure',
    type: 'radio',
    options: [
      { value: 'text', label: 'Text mode', description: 'Text fallback' },
      { value: 'retry', label: 'Retry', description: 'Reconnect' }
    ]
  },
  {
    id: 'voice-retries',
    title: 'Voice retry attempts',
    description: 'Number of retries',
    field: 'voiceRetries',
    type: 'number',
    conditional: {
      field: 'voiceFailure',
      value: 'retry'
    }
  },
  {
    id: 'network-drop',
    title: 'If network drops',
    description: 'Connection loss handling',
    field: 'networkDrop',
    type: 'radio',
    options: [
      { value: 'resume', label: 'Resume', description: 'Continue session' },
      { value: 'restart', label: 'Restart', description: 'Fresh start' }
    ]
  },
  {
    id: 'store-audio',
    title: 'Store audio recordings?',
    description: 'Save session audio',
    field: 'storeAudio',
    type: 'switch'
  },
  {
    id: 'audio-days',
    title: 'Audio retention (days)',
    description: 'Storage duration',
    field: 'audioDays',
    type: 'number',
    conditional: {
      field: 'storeAudio',
      value: true
    }
  },
  {
    id: 'store-video',
    title: 'Store video recordings?',
    description: 'Save session video',
    field: 'storeVideo',
    type: 'switch'
  },
  {
    id: 'video-days',
    title: 'Video retention (days)',
    description: 'Storage duration',
    field: 'videoDays',
    type: 'number',
    conditional: {
      field: 'storeVideo',
      value: true
    }
  },
  {
    id: 'store-transcripts',
    title: 'Store transcripts?',
    description: 'Save session text',
    field: 'storeTranscripts',
    type: 'switch'
  },
  {
    id: 'transcript-days',
    title: 'Transcript retention (days)',
    description: 'Storage duration',
    field: 'transcriptDays',
    type: 'number',
    conditional: {
      field: 'storeTranscripts',
      value: true
    }
  },
  {
    id: 'allow-export',
    title: 'Allow data export?',
    description: 'User can download data',
    field: 'allowExport',
    type: 'switch'
  },
  {
    id: 'like-links',
    title: 'Voice examples you LIKE (optional)',
    description: 'Reference voices to emulate',
    examples: [
      'Up to 3 links'
    ],
    field: 'likeLinks',
    type: 'link-input',
    optional: true
  },
  {
    id: 'dislike-links',
    title: 'Voice examples you DISLIKE (optional)',
    description: 'References to avoid',
    examples: [
      'Up to 3 links'
    ],
    field: 'dislikeLinks',
    type: 'link-input',
    optional: true
  },
  {
    id: 'inspiration-uploads',
    title: 'Inspiration files (optional)',
    description: 'Upload references',
    examples: [
      'Up to 3 files'
    ],
    field: 'inspirationUploads',
    type: 'file-upload',
    optional: true
  },
  {
    id: 'ezri-feeling',
    title: 'Overall character (optional)',
    description: 'Describe the personality',
    examples: [
      'e.g., "Professional expert - confident, clear, precise"'
    ],
    field: 'ezriFeeling',
    type: 'textarea',
    optional: true
  },
  {
    id: 'confirm-defaults',
    title: 'Confirm configuration',
    description: 'Review settings',
    field: 'confirmDefaults',
    type: 'checkbox'
  }
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentTab, setCurrentTab] = useState('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  
  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      avatarType: 'realistic',
      avatarGender: 'neutral',
      avatarAge: 'adult',
      appearanceStyle: 'professional',
      voiceGender: 'neutral',
      accent: 'us-neutral',
      speakingPace: 'medium',
      voiceTone: 'neutral',
      energyLevel: 'medium',
      speechQuirks: 'normal',
      responseStyle: 'balanced',
      responseLength: 'medium',
      allowInterruption: 'yes',
      avatarFraming: 'head-shoulders',
      backgroundStyle: 'gradient',
      sessionMode: 'live-only',
      latencyPriority: 'balanced',
      concurrentUsers: '50',
      facialExpression: 'natural',
      headMovement: 'natural',
      eyeContact: 'natural',
      lipSync: 'standard',
      noiseHandling: 'enhanced',
      microphoneType: 'mixed',
      loudness: 'normal',
      fillerWords: 'minimal',
      videoFailure: 'voice-only',
      voiceFailure: 'text',
      networkDrop: 'resume',
      storeAudio: false,
      storeVideo: false,
      storeTranscripts: false,
      allowExport: true,
      confirmDefaults: false,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const saved = localStorage.getItem('marq-avatar-submissions');
    if (saved) {
      setSubmissions(JSON.parse(saved));
    }
  }, []);

  const getVisibleSteps = () => {
    return wizardSteps.filter(step => {
      if (!step.conditional) return true;
      
      const conditionField = step.conditional.field;
      const conditionValue = step.conditional.value;
      const currentValue = watchedValues[conditionField];
      
      return currentValue === conditionValue;
    });
  };

  const visibleSteps = getVisibleSteps();
  const progress = currentStep >= 0 ? ((currentStep + 1) / visibleSteps.length) * 100 : 0;

  const onSubmit = async (data: FormData) => {
    if (!data.confirmDefaults) {
      toast.error('Please confirm your configuration');
      return;
    }

    // Anti-spam: Block duplicate submission within 30 seconds
    const now = Date.now();
    if (now - lastSubmissionTime < 30000) {
      const remainingSeconds = Math.ceil((30000 - (now - lastSubmissionTime)) / 1000);
      toast.error(`Please wait ${remainingSeconds} seconds before submitting again`);
      return;
    }

    setIsSubmitting(true);

    const newSubmission: Submission = {
      ...data,
      id: crypto.randomUUID(),
      version: submissions.length + 1,
      submissionDate: new Date().toISOString(),
    };

    try {
      // Log what we're about to send
      console.log('Preparing to submit form data:');
      console.log('Total fields in newSubmission:', Object.keys(newSubmission).length);
      console.log('Fields:', Object.keys(newSubmission));
      console.log('Sample values:', {
        productName: newSubmission.productName,
        avatarType: newSubmission.avatarType,
        voiceGender: newSubmission.voiceGender,
        responseStyle: newSubmission.responseStyle,
        sessionMode: newSubmission.sessionMode,
      });

      // Save to Supabase Table
      const { error } = await supabase.from('intake_submissions').insert({
        id: newSubmission.id,
        version: newSubmission.version,
        submission_date: newSubmission.submissionDate,
        product_name: newSubmission.productName,
        marq_notes: newSubmission.marqNotes,
        avatar_type: newSubmission.avatarType,
        avatar_gender: newSubmission.avatarGender,
        avatar_age: newSubmission.avatarAge,
        appearance_style: newSubmission.appearanceStyle,
        visual_constraints: newSubmission.visualConstraints,
        voice_gender: newSubmission.voiceGender,
        accent: newSubmission.accent,
        custom_accent: newSubmission.customAccent,
        speaking_pace: newSubmission.speakingPace,
        voice_tone: newSubmission.voiceTone,
        energy_level: newSubmission.energyLevel,
        speech_quirks: newSubmission.speechQuirks,
        pronunciation_notes: newSubmission.pronunciationNotes,
        response_style: newSubmission.responseStyle,
        response_length: newSubmission.responseLength,
        allow_interruption: newSubmission.allowInterruption,
        sensitive_topics: newSubmission.sensitiveTopics,
        avatar_framing: newSubmission.avatarFraming,
        background_style: newSubmission.backgroundStyle,
        session_mode: newSubmission.sessionMode,
        latency_priority: newSubmission.latencyPriority,
        concurrent_users: newSubmission.concurrentUsers,
        facial_expression: newSubmission.facialExpression,
        head_movement: newSubmission.headMovement,
        eye_contact: newSubmission.eyeContact,
        lip_sync: newSubmission.lipSync,
        noise_handling: newSubmission.noiseHandling,
        microphone_type: newSubmission.microphoneType,
        loudness: newSubmission.loudness,
        filler_words: newSubmission.fillerWords,
        video_failure: newSubmission.videoFailure,
        video_retries: newSubmission.videoRetries,
        voice_failure: newSubmission.voiceFailure,
        voice_retries: newSubmission.voiceRetries,
        network_drop: newSubmission.networkDrop,
        store_audio: newSubmission.storeAudio,
        audio_days: newSubmission.audioDays,
        store_video: newSubmission.storeVideo,
        video_days: newSubmission.videoDays,
        store_transcripts: newSubmission.storeTranscripts,
        transcript_days: newSubmission.transcriptDays,
        allow_export: newSubmission.allowExport,
        like_links: newSubmission.likeLinks,
        dislike_links: newSubmission.dislikeLinks,
        ezri_feeling: newSubmission.ezriFeeling,
      });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('Supabase submission successful');

      // Trigger Email Notification
      try {
        await supabase.functions.invoke('send-email', {
          body: { record: {
            ...newSubmission,
            submission_date: newSubmission.submissionDate,
            product_name: newSubmission.productName,
            marq_notes: newSubmission.marqNotes,
            avatar_type: newSubmission.avatarType,
            avatar_gender: newSubmission.avatarGender,
            avatar_age: newSubmission.avatarAge,
            appearance_style: newSubmission.appearanceStyle,
            visual_constraints: newSubmission.visualConstraints,
            voice_gender: newSubmission.voiceGender,
            accent: newSubmission.accent,
            custom_accent: newSubmission.customAccent,
            speaking_pace: newSubmission.speakingPace,
            voice_tone: newSubmission.voiceTone,
            energy_level: newSubmission.energyLevel,
            speech_quirks: newSubmission.speechQuirks,
            pronunciation_notes: newSubmission.pronunciationNotes,
            response_style: newSubmission.responseStyle,
            response_length: newSubmission.responseLength,
            allow_interruption: newSubmission.allowInterruption,
            sensitive_topics: newSubmission.sensitiveTopics,
            avatar_framing: newSubmission.avatarFraming,
            background_style: newSubmission.backgroundStyle,
            session_mode: newSubmission.sessionMode,
            latency_priority: newSubmission.latencyPriority,
            concurrent_users: newSubmission.concurrentUsers,
            facial_expression: newSubmission.facialExpression,
            head_movement: newSubmission.headMovement,
            eye_contact: newSubmission.eyeContact,
            lip_sync: newSubmission.lipSync,
            noise_handling: newSubmission.noiseHandling,
            microphone_type: newSubmission.microphoneType,
            loudness: newSubmission.loudness,
            filler_words: newSubmission.fillerWords,
            video_failure: newSubmission.videoFailure,
            video_retries: newSubmission.videoRetries,
            voice_failure: newSubmission.voiceFailure,
            voice_retries: newSubmission.voiceRetries,
            network_drop: newSubmission.networkDrop,
            store_audio: newSubmission.storeAudio,
            audio_days: newSubmission.audioDays,
            store_video: newSubmission.storeVideo,
            video_days: newSubmission.videoDays,
            store_transcripts: newSubmission.storeTranscripts,
            transcript_days: newSubmission.transcriptDays,
            allow_export: newSubmission.allowExport,
            like_links: newSubmission.likeLinks,
            dislike_links: newSubmission.dislikeLinks,
            ezri_feeling: newSubmission.ezriFeeling,
          } },
        });
        console.log('Email notification sent successfully');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the submission if email fails, just log it
      }

      // Update local state
      const updatedSubmissions = [...submissions, newSubmission];
      setSubmissions(updatedSubmissions);
      
      // Update localStorage as backup
      localStorage.setItem('marq-avatar-submissions', JSON.stringify(updatedSubmissions));
      
      // Clear any draft data
      localStorage.removeItem('marq-avatar-draft');
      
      // Update anti-spam tracker
      setLastSubmissionTime(now);
      
      // Show success and redirect
      toast.success(`✅ Configuration v${newSubmission.version} saved to database!`);
      setCurrentTab('history');
      setCurrentStep(-1);
      
    } catch (error) {
      console.error('Error submitting to Supabase:', error);
      
      // Fallback to localStorage
      const updatedSubmissions = [...submissions, newSubmission];
      setSubmissions(updatedSubmissions);
      localStorage.setItem('marq-avatar-submissions', JSON.stringify(updatedSubmissions));
      
      toast.error('⚠️ Saved locally only. Database connection failed.');
      setCurrentTab('history');
      setCurrentStep(-1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSubmission = (submission: Submission) => {
    reset(submission);
    setCurrentTab('form');
    setCurrentStep(0);
    toast.info(`Loaded v${submission.version}`);
  };

  const startForm = () => {
    setCurrentTab('form');
    setCurrentStep(0);
  };

  const goHome = () => {
    setCurrentTab('welcome');
    setCurrentStep(-1);
  };

  const nextStep = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (step: number) => {
    if (step >= 0 && step < visibleSteps.length) {
      setCurrentStep(step);
    }
  };

  const renderStepContent = (step: WizardStep) => {
    const fieldValue = watch(step.field);

    switch (step.type) {
      case 'text':
        return (
          <Input
            {...register(step.field as any)}
            placeholder={step.examples?.[0] || `Enter ${step.title.toLowerCase()}...`}
            className="text-lg py-6 px-5 bg-white border border-[#E5E5E5] focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/20 rounded-xl transition-all text-[#0A0A0A] placeholder:text-[#4A4A4A]/50"
          />
        );

      case 'number':
        return (
          <Input
            {...register(step.field as any)}
            type="number"
            placeholder="Enter number of days"
            min={1}
            max={365}
            className="text-lg py-6 px-5 bg-white border border-[#E5E5E5] focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/20 rounded-xl transition-all text-[#0A0A0A] placeholder:text-[#4A4A4A]/50"
          />
        );

      case 'radio':
        return (
          <RadioGroup
            value={fieldValue as string}
            onValueChange={(value) => setValue(step.field, value as any)}
            className="space-y-3"
          >
            {step.options?.map((option, idx) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <label
                  className={`flex items-start space-x-4 p-5 border rounded-2xl cursor-pointer transition-all ${
                    fieldValue === option.value
                      ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-sm'
                      : 'border-[#E5E5E5] hover:border-[#39FF14]/30 bg-white'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1 border-[#E5E5E5] text-[#39FF14]" />
                  <div className="flex-1">
                    <div className="font-medium text-[#0A0A0A]">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-[#4A4A4A] mt-1">{option.description}</div>
                    )}
                  </div>
                </label>
              </motion.div>
            ))}
          </RadioGroup>
        );

      case 'select':
        return (
          <Select
            value={fieldValue as string}
            onValueChange={(value) => setValue(step.field, value as any)}
          >
            <SelectTrigger className="w-full text-lg py-6 px-5 bg-white border border-[#E5E5E5] hover:border-[#39FF14]/30 focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/20 rounded-xl transition-all text-[#0A0A0A]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-[#E5E5E5] rounded-xl">
              {step.options?.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value} 
                  className="text-lg py-3 text-[#0A0A0A] focus:bg-[#F6F7F8] focus:text-[#39FF14] rounded-lg"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            {...register(step.field as any)}
            placeholder={step.examples?.[0] || `Enter your ${step.title.toLowerCase()}...`}
            className="min-h-[140px] text-base bg-white border border-[#E5E5E5] focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/20 rounded-xl resize-none transition-all p-4 text-[#0A0A0A] placeholder:text-[#4A4A4A]/50"
            rows={5}
          />
        );

      case 'file-upload':
        if (step.field === 'referenceImages') {
          return (
            <FileUpload
              maxFiles={5}
              acceptedFormats={['.jpg', '.jpeg', '.png', '.webp']}
              label=""
              onFilesChange={(files) => setValue(step.field, files as any)}
            />
          );
        } else if (step.field === 'inspirationUploads') {
          return (
            <FileUpload
              maxFiles={3}
              acceptedFormats={['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov']}
              label=""
              onFilesChange={(files) => setValue(step.field, files as any)}
            />
          );
        }
        return null;

      case 'link-input':
        return (
          <LinkInput
            maxLinks={3}
            label=""
            onLinksChange={(links) => setValue(step.field, links as any)}
          />
        );

      case 'switch':
        return (
          <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-[#E5E5E5]">
            <div className="flex-1">
              <div className="text-lg font-medium text-[#0A0A0A]">
                {fieldValue ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-sm text-[#4A4A4A] mt-1">
                {fieldValue ? 'Data will be stored' : 'Data will not be stored'}
              </div>
            </div>
            <Switch
              checked={fieldValue as boolean}
              onCheckedChange={(checked) => setValue(step.field, checked as any)}
              className="data-[state=checked]:bg-[#39FF14]"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-4">
            <div className="p-6 bg-[#F6F7F8] rounded-2xl border border-[#E5E5E5]">
              <p className="text-sm font-medium text-[#39FF14] mb-3">Default configuration:</p>
              <ul className="space-y-2 text-sm text-[#0A0A0A]">
                <li>• US neutral accent, professional tone</li>
                <li>• Balanced response style</li>
                <li>• Standard video framing</li>
                <li>• No storage by default</li>
                <li>• Natural expressions & movement</li>
              </ul>
            </div>
            <label className="flex items-center space-x-3 p-5 border border-[#E5E5E5] rounded-2xl hover:border-[#39FF14]/50 hover:bg-[#F6F7F8] transition-all cursor-pointer">
              <Checkbox
                id={step.field}
                checked={fieldValue as boolean}
                onCheckedChange={(checked) => setValue(step.field, checked as any)}
                className="border border-[#E5E5E5] data-[state=checked]:bg-[#39FF14] data-[state=checked]:border-[#39FF14] data-[state=checked]:text-black"
              />
              <Label htmlFor={step.field} className="cursor-pointer text-[#0A0A0A] font-medium">
                I confirm this configuration
              </Label>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Welcome Page
  if (currentTab === 'welcome') {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <Toaster richColors position="top-center" />
        
        {/* Interactive Background */}
        <InteractiveBackground />
        
        {/* Logo - Top Right */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="fixed top-6 right-6 z-50"
        >
          <MarqLogo size="sm" />
        </motion.div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl w-full"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
                <MarqLogo size="lg" />
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-[#0A0A0A] mb-3"
              >
                Avatar & Voice Configuration
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-base text-[#4A4A4A]"
              >
                {visibleSteps.length} questions • 10-15 minutes
              </motion.p>
            </div>

            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="border border-[#E5E5E5] shadow-lg rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-[#F6F7F8] pb-8 pt-8 border-b border-[#E5E5E5]">
                  <CardTitle className="text-2xl text-[#0A0A0A] mb-3">
                    Build systems. Not noise.
                  </CardTitle>
                  <CardDescription className="text-base text-[#4A4A4A] leading-relaxed">
                    Configure your AI avatar's appearance, voice, conversation style, and technical specs. 
                    This intake captures your requirements—we're not building yet, just defining the character.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-8 pb-8">
                  <div className="space-y-6">
                    {/* Feature List */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: Zap, label: 'Avatar Identity', description: 'Visual style & appearance' },
                        { icon: Terminal, label: 'Voice Config', description: 'Tone, pace & accent' },
                        { icon: Cpu, label: 'Behavior', description: 'Responses & interaction' },
                        { icon: Grid, label: 'Technical', description: 'Performance & output' },
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                          className="flex items-start gap-3 p-4 bg-[#F6F7F8] rounded-xl border border-[#E5E5E5]"
                        >
                          <div className="w-10 h-10 bg-white border border-[#39FF14]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-[#39FF14]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#0A0A0A] mb-0.5">{item.label}</p>
                            <p className="text-sm text-[#4A4A4A]">{item.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Info Box */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                      className="p-5 bg-[#39FF14]/5 rounded-2xl border border-[#39FF14]/20"
                    >
                      <div className="flex gap-3">
                        <CircleCheck className="w-5 h-5 text-[#39FF14] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-[#0A0A0A] leading-relaxed">
                            <span className="font-semibold text-[#0A0A0A]">Versioned locally.</span> Your configurations 
                            are saved to browser storage. Create multiple setups and compare them.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                      className="flex gap-4 pt-4"
                    >
                      <Button
                        onClick={startForm}
                        size="lg"
                        className="flex-1 text-lg py-6 bg-[#39FF14] hover:bg-[#2ecc11] text-black font-semibold shadow-sm hover:shadow-md transition-all rounded-xl group"
                      >
                        <span>Start with Strategy</span>
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      
                      <Button
                        onClick={() => setCurrentTab('history')}
                        variant="outline"
                        size="lg"
                        className="gap-2 text-[#0A0A0A] border border-[#E5E5E5] hover:bg-[#F6F7F8] hover:border-[#39FF14]/30 rounded-xl py-6 px-6"
                      >
                        <History className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // History Page
  if (currentTab === 'history') {
    return (
      <div className="min-h-screen bg-white p-8 relative overflow-hidden">
        <Toaster richColors position="top-center" />
        
        {/* Interactive Background */}
        <InteractiveBackground />
        
        {/* Logo - Top Right */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="fixed top-6 right-6 z-50"
        >
          <MarqLogo size="sm" />
        </motion.div>
        
        {/* Background Effects - Very Subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#39FF14] opacity-[0.02] rounded-full blur-[120px]" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto relative z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#0A0A0A] mb-2">Configuration History</h1>
              <p className="text-[#4A4A4A]">Manage your avatar configurations</p>
            </div>
            <Button
              onClick={goHome}
              className="bg-white hover:bg-[#F6F7F8] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#39FF14]/30 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>

          {submissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-[#E5E5E5] shadow-lg"
            >
              <FileText className="w-16 h-16 text-[#4A4A4A]/30 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-[#0A0A0A] mb-2">No configurations yet</h3>
              <p className="text-[#4A4A4A] mb-6">Start your first avatar configuration</p>
              <Button
                onClick={startForm}
                className="bg-[#39FF14] hover:bg-[#2ecc11] text-black font-semibold rounded-xl shadow-sm"
              >
                Create Configuration
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission, idx) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border border-[#E5E5E5] hover:border-[#39FF14]/50 transition-all hover:shadow-lg rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="bg-[#F6F7F8] border-b border-[#E5E5E5]">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl flex items-center gap-3">
                            <Badge className="bg-[#39FF14] text-black font-semibold">
                              v{submission.version}
                            </Badge>
                            <span className="text-[#0A0A0A]">{submission.productName || 'Avatar Config'}</span>
                          </CardTitle>
                          <CardDescription className="mt-2 text-[#4A4A4A]">
                            {new Date(submission.submissionDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => loadSubmission(submission)}
                          className="bg-white hover:bg-[#F6F7F8] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#39FF14] rounded-xl"
                        >
                          Load & Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#4A4A4A] mb-1">Avatar</p>
                          <p className="font-medium text-[#0A0A0A]">{submission.avatarType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4A4A4A] mb-1">Voice</p>
                          <p className="font-medium text-[#0A0A0A]">{submission.voiceTone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4A4A4A] mb-1">Style</p>
                          <p className="font-medium text-[#0A0A0A]">{submission.responseStyle}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4A4A4A] mb-1">Mode</p>
                          <p className="font-medium text-[#0A0A0A]">{submission.sessionMode}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Wizard Form
  const currentWizardStep = visibleSteps[currentStep];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Toaster richColors position="top-center" />

      {/* Logo - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed top-6 right-6 z-50"
      >
        <MarqLogo size="sm" />
      </motion.div>

      {/* Background Effects - Very Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#39FF14] opacity-[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-[#39FF14] opacity-[0.015] rounded-full blur-[80px]" />
      </div>

      {/* Curved Question Navigator */}
      <CurvedQuestionNav
        currentStep={currentStep}
        totalSteps={visibleSteps.length}
        onStepClick={jumpToStep}
        onHomeClick={goHome}
      />

      <div className="max-w-2xl mx-auto p-8 pt-12 pl-40 relative z-10">
        {/* Question Counter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-[#4A4A4A] text-sm">Question {currentStep + 1} of {visibleSteps.length}</p>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-[#E5E5E5] shadow-lg rounded-3xl overflow-hidden bg-white">
              <CardHeader className="pb-6 border-b border-[#E5E5E5] bg-[#F6F7F8]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {currentWizardStep.optional && (
                    <Badge variant="outline" className="mb-3 border-[#39FF14]/40 text-[#39FF14] bg-[#39FF14]/5 rounded-full">
                      Optional
                    </Badge>
                  )}
                  <CardTitle className="text-2xl mb-3 text-[#0A0A0A] leading-tight">
                    {currentWizardStep.title}
                  </CardTitle>
                  {currentWizardStep.description && (
                    <CardDescription className="text-base text-[#4A4A4A]">
                      {currentWizardStep.description}
                    </CardDescription>
                  )}
                </motion.div>
              </CardHeader>

              <CardContent className="pb-8 pt-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {renderStepContent(currentWizardStep)}
                </motion.div>

                {currentWizardStep.examples && currentWizardStep.examples.length > 0 && 
                 currentWizardStep.type !== 'checkbox' && currentWizardStep.type !== 'file-upload' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-4 bg-[#F6F7F8] rounded-xl border border-[#E5E5E5]"
                  >
                    <p className="text-xs text-[#4A4A4A] mb-2">Examples:</p>
                    <ul className="space-y-1">
                      {currentWizardStep.examples.slice(0, 2).map((example, idx) => (
                        <li key={idx} className="text-sm text-[#0A0A0A] flex items-start gap-2">
                          <span className="text-[#39FF14] mt-0.5">•</span>
                          <span className="flex-1">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-between"
        >
          <Button
            onClick={previousStep}
            variant="ghost"
            size="lg"
            className="gap-2 text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-[#F6F7F8] rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Zap className="w-6 h-6 text-[#39FF14]" />
            </motion.div>
            <span className="text-sm font-medium text-[#4A4A4A]">
              {Math.round(progress)}% Complete
            </span>
          </div>

          {currentStep === visibleSteps.length - 1 ? (
            <Button
              onClick={handleSubmit(onSubmit)}
              size="lg"
              className="gap-2 bg-[#39FF14] hover:bg-[#2ecc11] text-black font-semibold shadow-sm rounded-xl px-8"
            >
              Submit
              <Save className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              size="lg"
              className="gap-2 bg-[#39FF14] hover:bg-[#2ecc11] text-black font-semibold shadow-sm rounded-xl px-8"
            >
              Next Question
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}