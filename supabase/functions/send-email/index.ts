import { serve } from "std/http/server.ts";
import { SmtpClient } from "smtp";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: { method: string; json: () => PromiseLike<{ record: any; }> | { record: any; }; }) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();

    // Environment variables
    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'mail.marqnetworks.com';
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const SMTP_USER = Deno.env.get('SMTP_USER') || 'info@marqnetworks.com';
    const SMTP_PASS = Deno.env.get('SMTP_PASS');
    const SMTP_FROM = Deno.env.get('SMTP_FROM') || 'info@marqnetworks.com';
    const ADMIN_EMAIL = Deno.env.get('ADMIN_NOTIFY_EMAIL') || 'info@marqnetworks.com';

    if (!SMTP_PASS) {
      throw new Error('SMTP_PASS is not set');
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage();
    let { width, height } = page.getSize();
    let y = height - 50;
    const margin = 50;
    const lineHeight = 20;

    const checkPageBreak = () => {
      if (y < margin) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
    };

    // Title
    page.drawText('Avatar Intake Form Submission', {
      x: margin,
      y: y,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 40;

    // Helper to draw fields
    const drawField = (label: string, value: any) => {
      checkPageBreak();
      
      // Draw label
      page.drawText(`${label}:`, {
        x: margin,
        y: y,
        size: 10,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Draw value (simple wrapping)
      const valueStr = value !== null && value !== undefined ? String(value) : 'N/A';
      const maxWidth = width - (margin * 2) - 150; // allow space
      
      // Basic wrapping logic (split by chars for simplicity in this context)
      const words = valueStr.split(' ');
      let currentLine = '';
      
      // First line of value starts at same Y but offset X
      let currentY = y;
      let firstLine = true;
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, 10);
        
        if (textWidth > maxWidth && currentLine) {
            // Draw current line
            page.drawText(currentLine, {
                x: margin + 150,
                y: currentY,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
            });
            currentLine = word;
            currentY -= 15;
            checkPageBreak(); // Note: this might break if page break happens in middle of field
        } else {
            currentLine = testLine;
        }
      }
      
      // Draw remaining
      if (currentLine) {
        page.drawText(currentLine, {
            x: margin + 150,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
        });
      }

      // Advance Y for next field
      y = currentY - 20;
    };

    // Draw all fields from record
    drawField('Submission ID', record.id);
    drawField('Date', record.submission_date);
    y -= 10; // extra spacer

    // Grouping commonly used fields
    const categories = {
        'Product Info': ['product_name', 'marq_notes'],
        'Avatar Appearance': ['avatar_type', 'avatar_gender', 'avatar_age', 'appearance_style', 'visual_constraints', 'avatar_framing', 'background_style', 'facial_expression', 'head_movement', 'eye_contact', 'lip_sync'],
        'Voice & Audio': ['voice_gender', 'accent', 'custom_accent', 'speaking_pace', 'voice_tone', 'energy_level', 'speech_quirks', 'pronunciation_notes', 'microphone_type', 'loudness', 'filler_words'],
        'Behavior & Response': ['response_style', 'response_length', 'allow_interruption', 'sensitive_topics'],
        'Technical Config': ['session_mode', 'latency_priority', 'concurrent_users', 'noise_handling', 'video_failure', 'video_retries', 'voice_failure', 'voice_retries', 'network_drop'],
        'Storage & Export': ['store_audio', 'audio_days', 'store_video', 'video_days', 'store_transcripts', 'transcript_days', 'allow_export'],
        'Links & Files': ['like_links', 'dislike_links', 'ezri_feeling']
    };

    const processedKeys = new Set(['id', 'submission_date', 'version']);

    for (const [category, fields] of Object.entries(categories)) {
        checkPageBreak();
        y -= 10;
        page.drawText(category, {
            x: margin,
            y: y,
            size: 14,
            font: boldFont,
            color: rgb(0.22, 1, 0.08), // #39FF14 approx
        });
        y -= 25;

        for (const field of fields) {
            if (record[field] !== undefined) {
                drawField(field.replace(/_/g, ' '), record[field]);
                processedKeys.add(field);
            }
        }
    }

    // Catch any remaining fields
    let hasOthers = false;
    for (const key of Object.keys(record)) {
        if (!processedKeys.has(key)) {
            if (!hasOthers) {
                checkPageBreak();
                y -= 10;
                page.drawText('Other Fields', {
                    x: margin,
                    y: y,
                    size: 14,
                    font: boldFont,
                    color: rgb(0.5, 0.5, 0.5),
                });
                y -= 25;
                hasOthers = true;
            }
            drawField(key.replace(/_/g, ' '), record[key]);
        }
    }

    const pdfBytes = await pdfDoc.save();

    // Send Email
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USER,
      password: SMTP_PASS,
    });

    const emailBody = `
      New Avatar Intake Form Submission
      ---------------------------------
      
      A new submission has been received.
      Product Name: ${record.product_name || 'N/A'}
      Submission ID: ${record.id}
      
      Please find the full details in the attached PDF.
    `;

    await client.send({
      from: SMTP_FROM,
      to: ADMIN_EMAIL,
      subject: `New Submission: ${record.product_name || 'Avatar Config'} (v${record.version})`,
      content: emailBody,
      attachments: [
        {
          filename: `submission-${record.product_name || 'config'}.pdf`,
          content: pdfBytes,
          contentType: 'application/pdf',
        },
      ],
    });

    await client.close();

    return new Response(
      JSON.stringify({ message: 'Email sent successfully with PDF' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
