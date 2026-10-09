import { GoogleGenAI, Type } from '@google/genai';

export interface Env {
  GEMINI_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  SERVICE_NAME?: string;
}

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8787',
  'https://ais-dev-lejwccqhmbvn6t53tmn3d2-151789588029.asia-southeast1.run.app',
  'https://ais-pre-lejwccqhmbvn6t53tmn3d2-151789588029.asia-southeast1.run.app'
];

function getCorsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get('Origin') || '';
  const configuredOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];
  const allowedList = [...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins];

  let allowedOrigin = '';
  if (origin) {
    if (
      allowedList.includes(origin) ||
      origin.includes('asia-southeast1.run.app') ||
      origin.includes('workers.dev') ||
      origin.includes('localhost')
    ) {
      allowedOrigin = origin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin || (origin ? origin : '*'),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

function jsonResponse(data: any, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Executes a Gemini API request for a SPECIFIC requested model.
 * Does NOT silently switch to a different Gemini model if the requested model fails.
 */
async function callGeminiForWorker(
  apiKey: string,
  requestedModel: string | undefined,
  paramsFn: (modelToUse: string) => any
): Promise<{ text: string; modelUsed: string }> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment secret is not configured on Worker');
  }

  const modelToUse = requestedModel || 'gemini-3.5-flash';
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'image-studio-api-worker',
      },
    },
  });

  const config = paramsFn(modelToUse);
  const response = await ai.models.generateContent(config);

  if (!response || !response.text) {
    throw new Error(`Gemini model ${modelToUse} returned empty response`);
  }

  return {
    text: response.text,
    modelUsed: modelToUse
  };
}

// ----------------------------------------------------
// LOCAL FALLBACK GENERATORS (TRUTHFUL FALLBACKS)
// ----------------------------------------------------

function generateFallbackConcepts(ideaData: any) {
  const idea = ideaData.idea || 'Visual Graphic';
  const subject = ideaData.subject || idea;
  const mood = ideaData.desiredMood || 'scholarly, nostalgic';

  return [
    {
      id: 'concept-f1',
      conceptName: `${idea} Archival Specimen Sheet`,
      coreVisualIdea: `A formal museum catalog entry classifying "${subject}" as a rare historical specimen.`,
      whyItWorks: `Combines academic reverence with subtle meta-humor, elevating "${subject}" into a collector's item.`,
      composition: `Centered rectangular frame with formal accession tag plaque at top and catalog entry below.`,
      keyVisualElements: [`Archival accession plaque`, `Engraved central symbol of ${subject}`, `Calligraphic ink stamp`, `Double-ruled border line`],
      typographyDirection: `Authentic 19th-century slab serif headers paired with monospaced catalog numbers.`,
      illustrationDirection: `Copperplate woodcut etching with fine cross-hatching and stippled shading.`,
      overallCharacter: `Scholarly, archival, dignified, ${mood}`,
      possibleProductSuitability: `Ideal for coffee mugs, framed art prints, and t-shirt graphic prints.`,
      potentialRisks: `Text legibility must be preserved at smaller print sizes.`
    },
    {
      id: 'concept-f2',
      conceptName: `${idea} Historical Evolution Timeline`,
      coreVisualIdea: `A horizontal or vertical visual progression showing the evolution of ${subject} through key historical eras.`,
      whyItWorks: `Taps into storytelling and temporal depth, showing ${subject} traversing human history.`,
      composition: `Linear sequential arrangement framed by subtle arched borders or parchment rays.`,
      keyVisualElements: [`Hourglass with sands of time`, `Historical epoch symbols`, `Aged parchment texture`, `Feather quill and inkpot`],
      typographyDirection: `Classic Roman serif with wide tracking paired with delicate copperplate italics.`,
      illustrationDirection: `Hand-drawn ink line art with subtle watercolor wash texture.`,
      overallCharacter: `Nostalgic, educational, atmospheric`,
      possibleProductSuitability: `Excellent for wide poster prints, tote bags, and t-shirt backs.`,
      potentialRisks: `Can become overly complex if too many eras are included.`
    },
    {
      id: 'concept-f3',
      conceptName: `Academic Crest & Emblem`,
      coreVisualIdea: `A circular collegiate coat of arms or seal celebrating the core essence of ${subject}.`,
      whyItWorks: `Bestows instant prestige, authority, and institutional honor.`,
      composition: `Symmetrical circular crest with Latin motto ribbon banner wrapped along the base.`,
      keyVisualElements: [`Greek/Roman laurel wreath`, `Classical columns or shield`, `Open book motif`, `Motto banner`],
      typographyDirection: `Bold condensed block serif set along a curved circular track.`,
      illustrationDirection: `High-contrast woodblock engraving with sharp black-and-white linework.`,
      overallCharacter: `Collegiate, honorable, authoritative`,
      possibleProductSuitability: `Perfect for left-chest apparel embroidery, hoodies, and metal drinkware.`,
      potentialRisks: `Must avoid looking like a generic corporate logo.`
    },
    {
      id: 'concept-f4',
      conceptName: `Layered Archival Collage`,
      coreVisualIdea: `A rich visual montage combining historical map fragments, manuscript scripts, and artifacts of ${subject}.`,
      whyItWorks: `Visually rewarding for close inspection; captures the vastness of human memory and research.`,
      composition: `Asymmetric collage with diagonal movement and deckled parchment edges.`,
      keyVisualElements: [`Aged nautical chart fragment`, `Chalkboard manuscript notes`, `Brass compass or magnifying glass`, `Wax seal`],
      typographyDirection: `Handwritten calligraphic ink script mixed with vintage typeset print.`,
      illustrationDirection: `Mixed media etchings with vintage paper grain texture.`,
      overallCharacter: `Intricate, nostalgic, curious`,
      possibleProductSuitability: `Great for full-bleed journal covers, wall tapestries, and posters.`,
      potentialRisks: `Requires a strong central focal anchor to prevent chaotic clutter.`
    },
    {
      id: 'concept-f5',
      conceptName: `Minimalist Technical Schematic`,
      coreVisualIdea: `An architectural or technical blueprint diagram detailing the structural components of ${subject}.`,
      whyItWorks: `Appeals to analytical minds, celebrating the science, precision, and mechanics of ${subject}.`,
      composition: `Clean grid arrangement with cross-section arrows and technical dimension markers.`,
      keyVisualElements: [`Dimension callout lines`, `Cross-section view`, `Blueprint grid background`, `Specification legend block`],
      typographyDirection: `Clean monospaced technical drafting font with uppercase labels.`,
      illustrationDirection: `Crisp vector drafting linework with technical hatch patterns.`,
      overallCharacter: `Analytical, precise, modern-vintage`,
      possibleProductSuitability: `Ideal for apparel prints, tech sleeves, and posters.`,
      potentialRisks: `Linework must remain sufficiently thick for print reproduction.`
    }
  ];
}

function generateFallbackAnalysis(refData: any) {
  const name = refData.referenceName || 'Visual Reference';
  const type = refData.referenceType || 'Product design';
  return {
    composition: 'Centered rectangular layout with formal border framing and specimen tag.',
    typography: 'Classic slab serif headers paired with condensed copperplate secondary text.',
    illustration: 'Detailed copperplate woodcut etching with fine parallel hatch lines.',
    color: 'Monochrome iron-gall black ink on warm off-white parchment background.',
    texture: 'Subtle paper grain with natural ink bleed at line intersections.',
    visualHierarchy: 'Dominant central illustration framed by top accession label and bottom plaque.',
    eraCulturalCharacter: 'Late 19th-century Victorian museum specimen catalog (c. 1885).',
    moodCharacter: 'Austerely scholarly, authentic, prestigious, nostalgic.',
    productCharacteristics: `Ideal for flat vector apparel printing and ceramic glazes for ${type.toLowerCase()}.`,
    distinctiveCharacteristics: `Crisp line density, formal catalog numbering, unboxed clean layout typical of high-end ${type.toLowerCase()}.`,
    designPrinciples: [
      `Transform ${name} into an authentic classified museum specimen.`,
      'Bestow institutional authority using formal plaques and accession tags.',
      'Maintain crisp line contrast for high-quality product reproduction.',
      'Balance central graphic focus with generous negative space.'
    ],
    creativeMechanisms: ['Classification & Definition', 'Historical Reinterpretation', 'Role Reversal'],
    applicableContexts: ['Apparel prints', 'Ceramic mugs', 'Tote bags', 'Framed art prints']
  };
}

function generateFallbackExplore(inspiration: any, topic: string) {
  const title = inspiration?.name || 'Inspiration';
  return [
    {
      id: 'exp-1',
      conceptTitle: `The ${topic} Archetype`,
      coreIdea: `Reinterpret ${topic} using the transformation & classification mechanism from "${title}".`,
      designMechanism: 'Role Reversal & Heroic Archetype',
      composition: 'Centered heroic composition inside an ornate double-ruled border plaque.',
      typography: 'Bold classical serif headers with monospaced catalog numbering.',
      imageryIllustration: 'Fine copperplate engraving combining core tools of the ' + topic + ' with heroic motifs.',
      colorDirection: 'High-contrast monochrome iron black on warm ivory canvas.',
      productSuitability: 'Perfect for t-shirt graphics, hoodies, and ceramic mugs.',
      whyConceptWorks: `Elevates ${topic} into a celebrated icon by applying proven visual principles from ${title}.`,
      potentialRisk: 'Keep fine linework thick enough for durable garment printing.'
    },
    {
      id: 'exp-2',
      conceptTitle: `${topic} Specimen Catalog`,
      coreIdea: `A formal archival specimen entry defining the essential tools and identity of the ${topic}.`,
      designMechanism: 'Classification & Definition',
      composition: 'Symmetrical specimen box layout with accession tag plaque at top and motto banner at base.',
      typography: '19th-century slab serif with monospaced catalog numbering.',
      imageryIllustration: 'Detailed woodcut diagram of iconic ' + topic + ' artifacts.',
      colorDirection: 'Two-color palette: Deep iron gall black on parchment cream.',
      productSuitability: 'Excellent for wall posters, journal covers, and coffee mugs.',
      whyConceptWorks: 'Appeals to pride and intellect with witty institutional framing.',
      potentialRisk: 'Ensure small catalog text remains legible.'
    },
    {
      id: 'exp-3',
      conceptTitle: `${topic} Crest & Emblem`,
      coreIdea: `An authoritative collegiate seal celebrating the craft of the ${topic}.`,
      designMechanism: 'Genre Appropriation & Crest Emblem',
      composition: 'Circular university crest with laurel wreath border and ribbon banner.',
      typography: 'Condensed block serif set along circular arc track.',
      imageryIllustration: 'High-contrast woodblock engraving of central ' + topic + ' symbols.',
      colorDirection: 'Limited two-tone palette.',
      productSuitability: 'Ideal for left-chest apparel embroidery and metal drinkware.',
      whyConceptWorks: 'Instantly recognizable crest bestows prestige.',
      potentialRisk: 'Avoid generic university logo appearance.'
    }
  ];
}

function generateFallbackSynthesis(inspirations: any[], topic: string) {
  const refNames = (inspirations || []).map(i => i.name || 'Reference').join(', ');
  return [
    {
      id: 'syn-1',
      conceptTitle: `The Mythic ${topic}`,
      coreIdea: `A heroic visual synthesis combining transformation principles and formal classification for ${topic}.`,
      designMechanism: 'Heroic Transformation + Classification Grid',
      borrowsConceptually: (inspirations || []).reduce((acc: any, i: any) => {
        acc[i.name || 'Ref'] = 'Extracts structural composition and high-contrast linework principles';
        return acc;
      }, {}),
      composition: 'Symmetrical centered layout inside a double-ruled border with archival plaque tags.',
      typography: 'Classical slab serif headers with monospaced catalog numbers.',
      imageryIllustration: 'Engraved copperplate linework depicting ' + topic + ' surrounded by symbolic artifacts.',
      colorDirection: 'Monochrome iron-gall black on off-white parchment background.',
      productSuitability: 'Ideal for t-shirts, mugs, and posters.',
      whyConceptWorks: `Synthesizes the best visual mechanisms from ${refNames} into an original design.`,
      potentialRisk: 'Maintain legibility at small scale.'
    },
    {
      id: 'syn-2',
      conceptTitle: `${topic} Archival Codex`,
      coreIdea: `A multi-layered visual codex celebrating ${topic} as a rare historical treasure.`,
      designMechanism: 'Historical Reinterpretation + Definition',
      borrowsConceptually: (inspirations || []).reduce((acc: any, i: any) => {
        acc[i.name || 'Ref'] = 'Borrows formal specimen layout and two-color palette';
        return acc;
      }, {}),
      composition: 'Layered rectangular layout with accession stamp and ribbon banner at base.',
      typography: 'Serif display headers with calligraphic secondary captions.',
      imageryIllustration: 'Woodcut etching with fine cross-hatch shading.',
      colorDirection: 'Warm academic palette: Deep sepia and iron black on cream.',
      productSuitability: 'Great for posters, journal covers, and hoodies.',
      whyConceptWorks: 'Fuses institutional dignity with creative storytelling.',
      potentialRisk: 'Keep negative space balanced.'
    },
    {
      id: 'syn-3',
      conceptTitle: `${topic} Technical Blueprint`,
      coreIdea: `An analytical schematic diagram detailing the inner workings of the ${topic}.`,
      designMechanism: 'Technical Schematic + Definition',
      borrowsConceptually: (inspirations || []).reduce((acc: any, i: any) => {
        acc[i.name || 'Ref'] = 'Borrows precision linework and grid structure';
        return acc;
      }, {}),
      composition: 'Clean drafting grid with cross-section callouts and legend block.',
      typography: 'Monospaced technical drafting font.',
      imageryIllustration: 'Crisp vector blueprint linework.',
      colorDirection: 'Blueprint monochrome or high-contrast black/white.',
      productSuitability: 'Perfect for tech accessories, mugs, and apparel.',
      whyConceptWorks: 'Appeals to analytical minds and passion for detail.',
      potentialRisk: 'Keep line weights thick enough for screen printing.'
    },
    {
      id: 'syn-4',
      conceptTitle: `${topic} Heritage Seal`,
      coreIdea: `A circular collegiate heraldic seal celebrating the legacy of ${topic}.`,
      designMechanism: 'Genre Appropriation & Emblem Heraldry',
      borrowsConceptually: (inspirations || []).reduce((acc: any, i: any) => {
        acc[i.name || 'Ref'] = 'Borrows badge framing and motto ribbon banner';
        return acc;
      }, {}),
      composition: 'Circular badge with outer text ring and central emblem.',
      typography: 'Condensed block serif in circular arc.',
      imageryIllustration: 'High-contrast woodblock engraving of central ' + topic + ' motif.',
      colorDirection: 'Limited two-color palette.',
      productSuitability: 'Excellent for hoodies, water bottles, and left-chest embroidery.',
      whyConceptWorks: 'Instantly recognizable emblem layout.',
      potentialRisk: 'Avoid generic logo tropes.'
    },
    {
      id: 'syn-5',
      conceptTitle: `The ${topic} Vignette`,
      coreIdea: `An elegant vignette illustration depicting ${topic} in their element.`,
      designMechanism: 'Visual Metaphor & Vignette Framing',
      borrowsConceptually: (inspirations || []).reduce((acc: any, i: any) => {
        acc[i.name || 'Ref'] = 'Borrows atmospheric shading and paper grain texture';
        return acc;
      }, {}),
      composition: 'Soft vignette edges with centered character/tools.',
      typography: 'Delicate classical serif with wide letter-spacing.',
      imageryIllustration: 'Hand-drawn ink line art with subtle stippling.',
      colorDirection: 'Muted vintage monochromatic palette.',
      productSuitability: 'Beautiful on apparel backs, tote bags, and art prints.',
      whyConceptWorks: 'Creates an emotional, nostalgic connection.',
      potentialRisk: 'Vignette edges should fade smoothly.'
    }
  ];
}

function generateFallbackBrief(reqBody: any) {
  const concept = reqBody.selectedConcept || {};
  const idea = reqBody.imageIdea || reqBody.idea || {};
  const params = reqBody.structuredParameters || {};

  const composition = Array.isArray(params.compositions) && params.compositions.length > 0
    ? params.compositions.join(' + ') + (params.framings?.length ? ` (${params.framings.join(', ')})` : '')
    : concept.composition || 'Balanced central layout with framed border';

  const typography = Array.isArray(params.typographyFontCharacters) && params.typographyFontCharacters.length > 0
    ? `${params.typographyFontCharacters.join(', ')} typography used for ${params.typographyRoles?.join(', ') || 'headline labels'}`
    : concept.typographyDirection || 'Refined editorial typography';

  const illustration = Array.isArray(params.illustrationStyles) && params.illustrationStyles.length > 0
    ? params.illustrationStyles.join(', ')
    : concept.illustrationDirection || 'Vintage woodblock engraving and etching linework';

  return {
    subject: idea.subject || concept.conceptName || 'Artistic Gift Illustration',
    purpose: idea.intendedUse || 'High-quality standalone artwork and print graphic',
    composition,
    visualHierarchy: 'Primary focal subject centered with secondary typography framing the outer boundaries',
    typography,
    illustration,
    color: 'Muted ivory, deep indigo, warm ochre, and charcoal accent palette',
    texture: 'Subtle deckled paper grain with vintage ink stippling',
    eraReferenceLanguage: '19th-century botanical engraving and editorial publishing aesthetics',
    moodCharacter: idea.desiredMood || 'Scholarly, elegant, timeless, thoughtful',
    productPrintConsiderations: 'High contrast vector linework suitable for screenprinting, embroidery, or high-res paper prints',
    negativeSpace: 'Clean unprinted paper background with generous margins',
    keyElements: concept.keyVisualElements || ['Central subject artwork', 'Framing border', 'Editorial label typography'],
    optionalElements: ['Subtle corner flourishes', 'Aged seal emblem'],
    avoid: ['3D renders', 'glossy neon effects', 'photorealistic clutter', 'random decorative noise'],
    creativeRationale: 'Combines historical craftsmanship with clean modern composition for versatile, premium gift artwork.'
  };
}

function generateFallbackPrompt(reqBody: any) {
  const brief = reqBody.designBrief || {};
  const outputMode = reqBody.outputMode || 'Finished Artwork';

  const promptParts = [
    `A professional ${brief.illustration || 'vintage woodcut etching'} artwork of ${brief.subject || 'a refined graphic subject'}.`,
    `Composition: ${brief.composition || 'Balanced centered composition'}.`,
    `Visual Hierarchy: ${brief.visualHierarchy || 'Clear central focus'}.`,
    brief.typography ? `Typography: ${brief.typography}.` : '',
    `Color Palette: ${brief.color || 'Subtle muted ivory, dark indigo, warm ochre'}.`,
    `Texture & Finish: ${brief.texture || 'Clean paper grain texture'}.`,
    `Style & Era: ${brief.eraReferenceLanguage || 'Classic 19th-century editorial engraving'}.`,
    `Mood: ${brief.moodCharacter || 'Scholarly and elegant'}.`,
    outputMode === 'Finished Artwork' ? 'Rendered as flat isolated graphic artwork on a clean solid off-white background with NO physical t-shirt or product mockup.' : 'Clean product application display.'
  ].filter(Boolean).join(' ');

  return {
    finalPrompt: promptParts,
    negativePrompt: 'blurry, distorted, low quality, 3D render, glossy neon, physical t-shirt mockup, model wearing shirt, photographic realistic clutter, watermarks, bad anatomy',
    modelNotes: 'Works best in Midjourney v6 (--v 6.0), Google Flow, or Gemini image generation models. Set aspect ratio as needed (--ar 1:1 or --ar 4:5).'
  };
}

// ----------------------------------------------------
// WORKER FETCH HANDLER
// ----------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(request, env);
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle OPTIONS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Health Endpoint
    if (request.method === 'GET' && (path === '/health' || path === '/api/image-studio/health')) {
      return jsonResponse({
        status: 'ok',
        service: env.SERVICE_NAME || 'image-studio-api'
      }, 200, corsHeaders);
    }

    const apiKey = env.GEMINI_API_KEY || '';

    // POST /api/image-studio/explore-concepts
    if (request.method === 'POST' && path === '/api/image-studio/explore-concepts') {
      try {
        const reqBody = await request.json() as any;
        const { idea, productType, intendedUse, audience, subject, desiredMood, userNotes, constraints, model } = reqBody || {};

        const promptText = `
You are a world-class creative director, visual designer, and brand strategist for Science of Gifts.
Your task is to explore 5 GENUINELY DIFFERENT visual design concepts for the following image idea and visual direction choices:

IMAGE IDEA & STRUCTURED VISUAL SELECTIONS:
- Idea / Title: ${idea || 'Untitled Idea'}
- Product Type: ${productType || 'Unspecified'}
- Intended Output / Use: ${intendedUse || 'General Graphic / Print'}
- Target Audience: ${audience || 'General'}
- Core Subject: ${subject || idea}
- Desired Mood / Character: ${desiredMood || 'Not specified'}
- User Notes: ${userNotes || 'None'}
- Constraints: ${constraints || 'None'}

CRITICAL SYNTHESIS INSTRUCTIONS:
1. Synthesize the user's selected visual parameters (composition, typography, illustration style, color palette, era, mood, hierarchy) into coherent, sophisticated design proposals.
2. Do NOT output a robotic concatenation of selected keywords.
3. Generate EXACTLY 5 distinct, high-concept visual design directions.
4. Each concept must be fundamentally different in creative approach.
5. Return JSON in the specified schema.
`;

        try {
          const resObj = await callGeminiForWorker(apiKey, model, (modelToUse) => ({
            model: modelToUse,
            contents: promptText,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                description: 'List of 5 genuinely different visual design concepts',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    conceptName: { type: Type.STRING },
                    coreVisualIdea: { type: Type.STRING },
                    whyItWorks: { type: Type.STRING },
                    composition: { type: Type.STRING },
                    keyVisualElements: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    typographyDirection: { type: Type.STRING },
                    illustrationDirection: { type: Type.STRING },
                    overallCharacter: { type: Type.STRING },
                    possibleProductSuitability: { type: Type.STRING },
                    potentialRisks: { type: Type.STRING }
                  },
                  required: ['conceptName', 'coreVisualIdea', 'whyItWorks', 'composition', 'keyVisualElements', 'typographyDirection', 'illustrationDirection', 'overallCharacter', 'possibleProductSuitability', 'potentialRisks']
                }
              }
            }
          }));

          const concepts = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, concepts, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (apiError: any) {
          console.warn(`Gemini API call failed for model ${model || 'default'}; using local fallback generator:`, apiError?.message);
          const fallbackConcepts = generateFallbackConcepts(reqBody);
          return jsonResponse({
            success: true,
            concepts: fallbackConcepts,
            isFallback: true,
            modelUsed: 'Fallback Local Generator',
            modelError: `Requested model '${model || 'gemini-3.5-flash'}' failed: ${apiError?.message || 'API error'}`
          }, 200, corsHeaders);
        }
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message || 'Failed to process request' }, 500, corsHeaders);
      }
    }

    // POST /api/image-studio/analyze-reference
    if (request.method === 'POST' && path === '/api/image-studio/analyze-reference') {
      try {
        const reqBody = await request.json() as any;
        const { referenceName, referenceType, notes, imageDataBase64, mimeType, model } = reqBody || {};

        const systemPrompt = `
You are an expert visual archivist, design historian, and art director for Science of Gifts.
Analyze the provided visual reference for a persistent visual learning database.
Your objective is to extract UNDERLYING DESIGN PRINCIPLES, CREATIVE MECHANISMS, AND STRUCTURED VISUAL CHARACTERISTICS.

Provide concise, highly actionable design terms in JSON schema.
`;

        const contents: any[] = [];
        if (imageDataBase64) {
          contents.push({
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageDataBase64.replace(/^data:image\/\w+;base64,/, '')
            }
          });
        }

        contents.push({
          text: `Reference Name: ${referenceName || 'Uploaded Reference'}
Reference Type/Category: ${referenceType || 'Visual Reference'}
User Notes: ${notes || 'None'}

Please analyze this visual reference and return full persistent structured visual learning knowledge in JSON format.`
        });

        try {
          const resObj = await callGeminiForWorker(apiKey, model, (modelToUse) => ({
            model: modelToUse,
            contents,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  composition: { type: Type.STRING },
                  typography: { type: Type.STRING },
                  illustration: { type: Type.STRING },
                  color: { type: Type.STRING },
                  texture: { type: Type.STRING },
                  visualHierarchy: { type: Type.STRING },
                  eraCulturalCharacter: { type: Type.STRING },
                  moodCharacter: { type: Type.STRING },
                  productCharacteristics: { type: Type.STRING },
                  distinctiveCharacteristics: { type: Type.STRING },
                  visualCharacteristics: {
                    type: Type.OBJECT,
                    properties: {
                      compositionLayout: { type: Type.STRING },
                      compositionFraming: { type: Type.STRING },
                      typographyTypeCharacter: { type: Type.STRING },
                      illustrationMedium: { type: Type.STRING },
                      colorPalette: { type: Type.STRING },
                      textureSurfaceTreatment: { type: Type.STRING },
                      eraHistoricalReferences: { type: Type.STRING },
                      moodTone: { type: Type.STRING }
                    }
                  },
                  designPrinciples: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  creativeMechanisms: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  applicableContexts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: [
                  'composition', 'typography', 'illustration', 'color', 'texture',
                  'visualHierarchy', 'eraCulturalCharacter', 'moodCharacter', 'productCharacteristics',
                  'distinctiveCharacteristics', 'designPrinciples', 'creativeMechanisms', 'applicableContexts'
                ]
              }
            }
          }));

          const analysis = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, analysis, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (apiError: any) {
          console.warn(`Gemini API call failed for reference analysis model ${model || 'default'}; using local fallback generator:`, apiError?.message);
          const fallbackAnalysis = generateFallbackAnalysis(reqBody);
          return jsonResponse({
            success: true,
            analysis: fallbackAnalysis,
            isFallback: true,
            modelUsed: 'Fallback Local Generator',
            modelError: `Requested model '${model || 'gemini-3.5-flash'}' failed: ${apiError?.message || 'API error'}`
          }, 200, corsHeaders);
        }
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message || 'Failed to analyze reference' }, 500, corsHeaders);
      }
    }

    // POST /api/image-studio/explore-inspiration
    if (request.method === 'POST' && path === '/api/image-studio/explore-inspiration') {
      try {
        const reqBody = await request.json() as any;
        const { inspiration, topic, model } = reqBody || {};

        const promptText = `
You are a world-class creative director at Science of Gifts.
Analyze design principles and creative mechanisms from "${inspiration?.name || 'Reference'}" and apply them to NEW TOPIC: "${topic}".
Generate 3-5 original, high-concept visual directions in JSON format.
`;

        try {
          const resObj = await callGeminiForWorker(apiKey, model, (modelToUse) => ({
            model: modelToUse,
            contents: promptText,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    conceptTitle: { type: Type.STRING },
                    coreIdea: { type: Type.STRING },
                    designMechanism: { type: Type.STRING },
                    composition: { type: Type.STRING },
                    typography: { type: Type.STRING },
                    imageryIllustration: { type: Type.STRING },
                    colorDirection: { type: Type.STRING },
                    productSuitability: { type: Type.STRING },
                    whyConceptWorks: { type: Type.STRING },
                    potentialRisk: { type: Type.STRING }
                  },
                  required: ['conceptTitle', 'coreIdea', 'designMechanism', 'composition', 'typography', 'imageryIllustration', 'colorDirection', 'productSuitability', 'whyConceptWorks', 'potentialRisk']
                }
              }
            }
          }));

          const concepts = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, concepts, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (apiError: any) {
          console.warn(`Gemini API error; using fallback explore inspiration:`, apiError?.message);
          const fallbackConcepts = generateFallbackExplore(inspiration, topic);
          return jsonResponse({
            success: true,
            concepts: fallbackConcepts,
            isFallback: true,
            modelUsed: 'Fallback Local Generator',
            modelError: `Requested model '${model || 'gemini-3.5-flash'}' failed: ${apiError?.message || 'API error'}`
          }, 200, corsHeaders);
        }
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message || 'Failed to explore inspiration' }, 500, corsHeaders);
      }
    }

    // POST /api/image-studio/synthesize-inspirations
    if (request.method === 'POST' && path === '/api/image-studio/synthesize-inspirations') {
      try {
        const reqBody = await request.json() as any;
        const { inspirations, topic, model } = reqBody || {};

        const promptText = `
You are a master Creative Director & Design Strategist at Science of Gifts.
Synthesize multiple visual inspiration references into original design concepts for NEW TOPIC: "${topic}".
Generate EXACTLY 5 ORIGINAL visual design concepts. Return JSON schema.
`;

        try {
          const resObj = await callGeminiForWorker(apiKey, model, (modelToUse) => ({
            model: modelToUse,
            contents: promptText,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    conceptTitle: { type: Type.STRING },
                    coreIdea: { type: Type.STRING },
                    designMechanism: { type: Type.STRING },
                    borrowsConceptually: { type: Type.OBJECT },
                    composition: { type: Type.STRING },
                    typography: { type: Type.STRING },
                    imageryIllustration: { type: Type.STRING },
                    colorDirection: { type: Type.STRING },
                    productSuitability: { type: Type.STRING },
                    whyConceptWorks: { type: Type.STRING },
                    potentialRisk: { type: Type.STRING }
                  },
                  required: ['conceptTitle', 'coreIdea', 'designMechanism', 'borrowsConceptually', 'composition', 'typography', 'imageryIllustration', 'colorDirection', 'productSuitability', 'whyConceptWorks', 'potentialRisk']
                }
              }
            }
          }));

          const concepts = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, concepts, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (apiError: any) {
          console.warn(`Gemini API error; using fallback synthesis:`, apiError?.message);
          const fallbackConcepts = generateFallbackSynthesis(inspirations, topic);
          return jsonResponse({
            success: true,
            concepts: fallbackConcepts,
            isFallback: true,
            modelUsed: 'Fallback Local Generator',
            modelError: `Requested model '${model || 'gemini-3.5-flash'}' failed: ${apiError?.message || 'API error'}`
          }, 200, corsHeaders);
        }
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message || 'Failed to synthesize inspirations' }, 500, corsHeaders);
      }
    }

    // POST /api/image-studio/create-brief
    if (request.method === 'POST' && path === '/api/image-studio/create-brief') {
      try {
        const reqBody = await request.json() as any;
        const { imageIdea, selectedConcepts, creativeDirection, referenceAnalyses, selectedReferenceCharacteristics, visualDirection, outputMode, intendedOutput, model } = reqBody || {};

        const promptText = `
You are a senior Design Director at Science of Gifts.
Synthesize design decisions into a single, authoritative DESIGN BRIEF in JSON.
`;

        try {
          const resObj = await callGeminiForWorker(apiKey, model, (modelToUse) => ({
            model: modelToUse,
            contents: promptText,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  composition: { type: Type.STRING },
                  visualHierarchy: { type: Type.STRING },
                  typography: { type: Type.STRING },
                  illustration: { type: Type.STRING },
                  color: { type: Type.STRING },
                  texture: { type: Type.STRING },
                  eraReferenceLanguage: { type: Type.STRING },
                  moodCharacter: { type: Type.STRING },
                  productPrintConsiderations: { type: Type.STRING },
                  negativeSpace: { type: Type.STRING },
                  keyElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  optionalElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  avoid: { type: Type.ARRAY, items: { type: Type.STRING } },
                  creativeRationale: { type: Type.STRING }
                },
                required: [
                  'subject', 'purpose', 'composition', 'visualHierarchy', 'typography', 'illustration',
                  'color', 'texture', 'eraReferenceLanguage', 'moodCharacter', 'productPrintConsiderations',
                  'negativeSpace', 'keyElements', 'optionalElements', 'avoid', 'creativeRationale'
                ]
              }
            }
          }));

          const brief = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, brief, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (apiError: any) {
          console.warn(`Gemini API error; using fallback brief generator:`, apiError?.message);
          const fallbackBrief = generateFallbackBrief(reqBody);
          return jsonResponse({
            success: true,
            brief: fallbackBrief,
            isFallback: true,
            modelUsed: 'Fallback Local Generator',
            modelError: `Requested model '${model || 'gemini-3.5-flash'}' failed: ${apiError?.message || 'API error'}`
          }, 200, corsHeaders);
        }
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message || 'Failed to create design brief' }, 500, corsHeaders);
      }
    }

    // POST /api/image-studio/generate-prompt
    if (request.method === 'POST' && path === '/api/image-studio/generate-prompt') {
      try {
        const reqBody = await request.json() as any;
        const { designBrief, promptInstructions, visualCharacteristics, outputMode, intendedOutput, creativeDirection, model } = reqBody || {};

        const promptText = `
You are the master Image Prompt Translator for Science of Gifts.
Translate an approved DESIGN BRIEF into a pristine image-generation prompt package.
Return JSON schema with finalPrompt, negativePrompt, modelNotes.
`;

        try {
          const resObj = await callGeminiForWorker(apiKey, model, (modelToUse) => ({
            model: modelToUse,
            contents: promptText,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  finalPrompt: { type: Type.STRING },
                  negativePrompt: { type: Type.STRING },
                  modelNotes: { type: Type.STRING }
                },
                required: ['finalPrompt', 'negativePrompt', 'modelNotes']
              }
            }
          }));

          const result = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, ...result, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (apiError: any) {
          console.warn(`Gemini API error; using fallback prompt generator:`, apiError?.message);
          const fallbackResult = generateFallbackPrompt(reqBody);
          return jsonResponse({
            success: true,
            ...fallbackResult,
            isFallback: true,
            modelUsed: 'Fallback Local Generator',
            modelError: `Requested model '${model || 'gemini-3.5-flash'}' failed: ${apiError?.message || 'API error'}`
          }, 200, corsHeaders);
        }
      } catch (err: any) {
        return jsonResponse({ success: false, error: err?.message || 'Failed to generate final prompt' }, 500, corsHeaders);
      }
    }

    return jsonResponse({ error: 'Endpoint not found' }, 404, corsHeaders);
  }
};
