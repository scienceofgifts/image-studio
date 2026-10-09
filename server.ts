import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '25mb' }));

// Shared Gemini AI instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = 'gemini-3.8-flash';

// Helper to clean JSON string from markdown code blocks
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// Health endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'image-studio-api' });
});
app.get('/api/image-studio/health', (req, res) => {
  res.json({ status: 'ok', service: 'image-studio-api' });
});

const PRIMARY_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-flash-latest'
];

/**
 * Execute Gemini API call with requested model or fallback model chain
 */
async function callGeminiWithFallback(paramsFn: (model: string) => any, requestedModel?: string): Promise<{ text: string; modelUsed: string }> {
  const primaryToTry = requestedModel || PRIMARY_MODEL;
  const modelsToTry = [primaryToTry, ...FALLBACK_MODELS.filter(m => m !== primaryToTry)];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const config = paramsFn(model);
      const response = await ai.models.generateContent(config);
      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

// ----------------------------------------------------
// SMART LOCAL FALLBACK GENERATORS (WHEN QUOTA IS EXHAUSTED)
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

// ----------------------------------------------------
// IMAGE STUDIO ENDPOINTS
// ----------------------------------------------------

/**
 * 1. Explore 5 Visual Concepts
 */
app.post('/api/image-studio/explore-concepts', async (req, res) => {
  try {
    const { idea, productType, intendedUse, audience, subject, desiredMood, userNotes, constraints, model } = req.body;

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
2. Do NOT output a robotic concatenation of selected keywords (e.g. "Use centered, framed, serif, display, academic, engraving..."). Instead, interpret how these choices work together into an actual artistic thesis.
3. Generate EXACTLY 5 distinct, high-concept visual design directions.
4. Each concept must be fundamentally different in creative approach (e.g. historical evolution, archival specimen, museum catalog entry, vintage university emblem, layered collage, technical schematic, botanical/engraving, etc.).
5. Each concept must be thoroughly fleshed out with actionable design parameters.

Return JSON in the specified schema.
`;

    try {
      const resObj = await callGeminiWithFallback((modelToUse) => ({
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
                conceptName: { type: Type.STRING, description: 'Creative, memorable concept title' },
                coreVisualIdea: { type: Type.STRING, description: '1-2 sentence core artistic thesis' },
                whyItWorks: { type: Type.STRING, description: 'Strategic design rationale and emotional appeal' },
                composition: { type: Type.STRING, description: 'Spatial arrangement, framing, layout structure' },
                keyVisualElements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3-5 key visual objects, symbols, or motifs present'
                },
                typographyDirection: { type: Type.STRING, description: 'Type style, hierarchy, font personality if text is included' },
                illustrationDirection: { type: Type.STRING, description: 'Art style, rendering technique, linework, medium' },
                overallCharacter: { type: Type.STRING, description: 'Emotional tone, era, mood (e.g. scholarly, nostalgic, irreverent)' },
                possibleProductSuitability: { type: Type.STRING, description: 'Why this works on T-shirts, mugs, posters, etc.' },
                potentialRisks: { type: Type.STRING, description: 'Design challenges to watch out for (e.g. line legibility at small scale)' }
              },
              required: ['conceptName', 'coreVisualIdea', 'whyItWorks', 'composition', 'keyVisualElements', 'typographyDirection', 'illustrationDirection', 'overallCharacter', 'possibleProductSuitability', 'potentialRisks']
            }
          }
        }
      }), model);

      const concepts = JSON.parse(cleanJsonString(resObj.text));
      return res.json({ success: true, concepts, modelUsed: resObj.modelUsed });
    } catch (apiError: any) {
      console.warn('Gemini API quota or network error; using smart local fallback generator:', apiError?.message);
      const fallbackConcepts = generateFallbackConcepts(req.body);
      return res.json({ success: true, concepts: fallbackConcepts, isFallback: true, modelUsed: 'Fallback Local Generator' });
    }
  } catch (error: any) {
    console.error('Error exploring concepts:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate visual concepts' });
  }
});

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

/**
 * 2. Analyze Inspiration Reference
 */
app.post('/api/image-studio/analyze-reference', async (req, res) => {
  try {
    const { referenceName, referenceType, notes, imageDataBase64, mimeType, model } = req.body;

    const systemPrompt = `
You are an expert visual archivist, design historian, and art director for Science of Gifts.
Analyze the provided visual reference for a persistent visual learning database.

Your objective is NOT to describe the image literally or create an image-copy prompt.
Your objective is to extract the UNDERLYING DESIGN PRINCIPLES, CREATIVE MECHANISMS, AND STRUCTURED VISUAL CHARACTERISTICS so the AI can reason about why this design works and apply its visual logic to entirely new subjects in future projects.

Evaluate & Extract:
1. COMPOSITION: layout, framing, symmetry, hierarchy, focal point
2. TYPOGRAPHY: character, hierarchy, placement, scale, relationship to imagery
3. ILLUSTRATION: medium, rendering approach, subject treatment, abstraction
4. COLOR: palette summary, contrast, saturation, dominant relationships
5. TEXTURE: surface treatment, print characteristics, paper grain, distress
6. VISUAL HIERARCHY: focal order, text vs image dominance
7. ERA / CULTURAL LANGUAGE: historical period, cultural design references
8. MOOD: emotional character, tone, attitude
9. PRODUCT CHARACTERISTICS: print suitability, scale, apparel/ceramic compatibility
10. DISTINCTIVE CHARACTERISTICS: unique defining stylistic traits
11. DESIGN PRINCIPLES: 3-6 strategic design rules that explain why this design succeeds (e.g. "Transform a familiar subject into an authentic classified museum artifact", "Use formal institutional tags to bestow dignity")
12. CREATIVE MECHANISMS: 1-4 creative mechanisms selected from: [Transformation, Parody, Visual Metaphor, Recontextualization, Historical Reinterpretation, Genre Appropriation, Exaggeration, Classification, Definition, Mashup, Personification, Contrast, Cultural Reference, Symbol Substitution, Role Reversal]
13. APPLICABLE CONTEXTS: gift, product, or subject contexts where this design logic applies

Provide concise, highly actionable design terms.
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
      const resObj = await callGeminiWithFallback((modelToUse) => ({
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
                items: { type: Type.STRING },
                description: '3-6 strategic design principles explaining why this works'
              },
              creativeMechanisms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '1-4 creative mechanisms (Transformation, Parody, Visual Metaphor, Recontextualization, Historical Reinterpretation, Genre Appropriation, Exaggeration, Classification, Definition, Mashup, Personification, Contrast, Cultural Reference, Symbol Substitution, Role Reversal)'
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
      }), model);

      const analysis = JSON.parse(cleanJsonString(resObj.text));
      return res.json({ success: true, analysis, modelUsed: resObj.modelUsed });
    } catch (apiError: any) {
      console.warn('Gemini API error; using smart fallback reference analysis:', apiError?.message);
      const fallbackAnalysis = generateFallbackAnalysis(req.body);
      return res.json({ success: true, analysis: fallbackAnalysis, isFallback: true, modelUsed: 'Fallback Local Generator' });
    }
  } catch (error: any) {
    console.error('Error analyzing reference:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to analyze reference image' });
  }
});

/**
 * 2b. Explore Single Inspiration ("Explore This")
 */
app.post('/api/image-studio/explore-inspiration', async (req, res) => {
  try {
    const { inspiration, topic, model } = req.body;

    const promptText = `
You are a world-class creative director at Science of Gifts.
Your task is to analyze the design principles and creative mechanisms from the visual inspiration "${inspiration?.name || 'Reference'}" and apply that underlying visual logic to the NEW SUBJECT/TOPIC: "${topic}".

INSPIRATION REFERENCE KNOWLEDGE:
- Reference Name: ${inspiration?.name}
- Category/Type: ${inspiration?.type}
- Design Principles: ${JSON.stringify(inspiration?.analysis?.designPrinciples || [])}
- Creative Mechanisms: ${JSON.stringify(inspiration?.analysis?.creativeMechanisms || [])}
- Composition: ${inspiration?.analysis?.composition}
- Typography: ${inspiration?.analysis?.typography}
- Illustration Style: ${inspiration?.analysis?.illustration}
- Color Palette: ${inspiration?.analysis?.color}
- Product Suitability: ${inspiration?.analysis?.productCharacteristics}

NEW TOPIC: "${topic}"

REASONING INSTRUCTIONS:
1. Do NOT simply substitute nouns in a description of the original image (e.g. if original is Lincoln, do NOT just say "Make Lincoln but a writer").
2. Extract the REUSABLE CREATIVE MECHANISM (e.g. superhero transformation, museum classification plaque, circular collegiate seal) and REINVENT it specifically for the new topic "${topic}".
3. Generate 3-5 original, high-concept visual directions.

Return JSON in the required schema.
`;

    try {
      const resObj = await callGeminiWithFallback((modelToUse) => ({
        model: modelToUse,
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'List of 3-5 original concepts exploring the inspiration logic for the new topic',
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
      }), model);

      const concepts = JSON.parse(cleanJsonString(resObj.text));
      return res.json({ success: true, concepts, modelUsed: resObj.modelUsed });
    } catch (apiError: any) {
      console.warn('Gemini API error; using smart fallback explore inspiration:', apiError?.message);
      const fallbackConcepts = generateFallbackExplore(inspiration, topic);
      return res.json({ success: true, concepts: fallbackConcepts, isFallback: true, modelUsed: 'Fallback Local Generator' });
    }
  } catch (error: any) {
    console.error('Error exploring inspiration:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to explore inspiration' });
  }
});

/**
 * 2c. Multi-Inspiration Synthesis
 */
app.post('/api/image-studio/synthesize-inspirations', async (req, res) => {
  try {
    const { inspirations, topic, model } = req.body;

    const promptText = `
You are a master Creative Director & Design Strategist at Science of Gifts.
Synthesize multiple visual inspiration references into original design concepts for the NEW TOPIC: "${topic}".

SELECTED INSPIRATIONS (${(inspirations || []).length}):
${(inspirations || []).map((i: any, idx: number) => `
REFERENCE ${idx + 1}: "${i.name}" (${i.type})
- Principles: ${JSON.stringify(i.analysis?.designPrinciples || [])}
- Mechanisms: ${JSON.stringify(i.analysis?.creativeMechanisms || [])}
- Composition: ${i.analysis?.composition}
- Typography: ${i.analysis?.typography}
- Illustration Style: ${i.analysis?.illustration}
- Color: ${i.analysis?.color}
`).join('\n')}

NEW TOPIC: "${topic}"

SYNTHESIS INSTRUCTIONS:
1. Reason across the selected references. Extract compatible design principles from each (e.g. Reference A contributes heroic transformation; Reference B contributes classification grid; Reference C contributes two-color limited palette).
2. Generate EXACTLY 5 ORIGINAL visual design concepts for "${topic}".
3. For each concept, explicitly state what it "borrows conceptually" from each selected reference in a dictionary mapping reference name to principle.
4. Ensure concepts are original designs informed by the references, avoiding literal reproduction of copyrighted images.

Return JSON in the required schema.
`;

    try {
      const resObj = await callGeminiWithFallback((modelToUse) => ({
        model: modelToUse,
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'List of 5 synthesized visual design concepts',
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                conceptTitle: { type: Type.STRING },
                coreIdea: { type: Type.STRING },
                designMechanism: { type: Type.STRING },
                borrowsConceptually: {
                  type: Type.OBJECT,
                  description: 'Map of inspiration name to what principle is borrowed'
                },
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
      }), model);

      const concepts = JSON.parse(cleanJsonString(resObj.text));
      return res.json({ success: true, concepts, modelUsed: resObj.modelUsed });
    } catch (apiError: any) {
      console.warn('Gemini API error; using smart fallback synthesis:', apiError?.message);
      const fallbackConcepts = generateFallbackSynthesis(inspirations, topic);
      return res.json({ success: true, concepts: fallbackConcepts, isFallback: true, modelUsed: 'Fallback Local Generator' });
    }
  } catch (error: any) {
    console.error('Error synthesizing inspirations:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to synthesize inspirations' });
  }
});

/**
 * 3. Create Design Brief
 */
app.post('/api/image-studio/create-brief', async (req, res) => {
  try {
    const {
      imageIdea,
      selectedConcepts,
      creativeDirection,
      referenceAnalyses,
      selectedReferenceCharacteristics,
      visualDirection,
      outputMode,
      intendedOutput,
      model
    } = req.body;

    const promptText = `
You are a senior Design Director at Science of Gifts.
Synthesize all design exploration decisions, concept choices, inspiration analyses, and creative direction into a single, authoritative, professional DESIGN BRIEF.

INPUT DECISIONS:
- Original Idea: ${JSON.stringify(imageIdea || {})}
- Selected Primary Concept: ${JSON.stringify(selectedConcepts?.primary || {})}
- Secondary Influences: ${JSON.stringify(selectedConcepts?.secondary || [])}
- User Creative Direction: "${creativeDirection || 'Follow selected concept faithfully.'}"
- Reference Analyses & Selected Characteristics: ${JSON.stringify(selectedReferenceCharacteristics || referenceAnalyses || [])}
- Structured Visual Direction: ${JSON.stringify(visualDirection || {})}
- Selected Output Mode: ${outputMode || 'Finished Artwork'}
- Intended Product Output: ${intendedOutput || 'Standalone Graphic Artwork'}

DESIGN BRIEF INSTRUCTIONS:
1. Develop an explicit, production-grade brief that an illustrator or prompt engineer can follow.
2. Account for physical product realities if intended output is a product (t-shirt, mug, poster, etc.): legibility at scale, contrast, negative space, print reproduction suitability.
3. If outputMode is "Finished Artwork", explicitly account for isolated graphic composition with flat or transparent backgrounds, no physical mockup frames, no models or staged photography.
4. Include clear "Avoid" exclusions and a "Creative Rationale" explaining why these choices achieve the goal.

Return JSON in the required schema.
`;

    try {
      const resObj = await callGeminiWithFallback((modelToUse) => ({
        model: modelToUse,
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING, description: 'Exact subject and core motif depicted' },
              purpose: { type: Type.STRING, description: 'What the visual design intends to communicate or achieve' },
              composition: { type: Type.STRING, description: 'Layout, framing, arrangement, symmetry/asymmetry' },
              visualHierarchy: { type: Type.STRING, description: 'Dominant focal point, secondary elements, tertiary details' },
              typography: { type: Type.STRING, description: 'Specific font personality, text content, placement, and hierarchy' },
              illustration: { type: Type.STRING, description: 'Rendering style, linework, technique, shading, detail level' },
              color: { type: Type.STRING, description: 'Specific color palette, dominant hues, contrast, accent colors' },
              texture: { type: Type.STRING, description: 'Surface finish, grain, distress, paper quality, ink feel' },
              eraReferenceLanguage: { type: Type.STRING, description: 'Historical or cultural aesthetic reference language' },
              moodCharacter: { type: Type.STRING, description: 'Emotional resonance, scholarly/playful tone' },
              productPrintConsiderations: { type: Type.STRING, description: 'Print legibility, vector cleanliness, product scale function' },
              negativeSpace: { type: Type.STRING, description: 'Breathing room and margin handling' },
              keyElements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Mandatory visual items that MUST appear'
              },
              optionalElements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Supporting visual items that MAY appear if space permits'
              },
              avoid: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific visual clichés, elements, or styles to explicitly AVOID'
              },
              creativeRationale: { type: Type.STRING, description: 'Strategic summary of why these choices work together' }
            },
            required: [
              'subject', 'purpose', 'composition', 'visualHierarchy', 'typography', 'illustration',
              'color', 'texture', 'eraReferenceLanguage', 'moodCharacter', 'productPrintConsiderations',
              'negativeSpace', 'keyElements', 'optionalElements', 'avoid', 'creativeRationale'
            ]
          }
        }
      }), model);

      const brief = JSON.parse(cleanJsonString(resObj.text));
      return res.json({ success: true, brief, modelUsed: resObj.modelUsed });
    } catch (apiError: any) {
      console.warn('Gemini API error; using smart fallback brief generator:', apiError?.message);
      const fallbackBrief = generateFallbackBrief(req.body);
      return res.json({ success: true, brief: fallbackBrief, isFallback: true, modelUsed: 'Fallback Local Generator' });
    }
  } catch (error: any) {
    console.error('Error creating design brief:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create design brief' });
  }
});

/**
 * 4. Generate Final Image Prompt
 */
app.post('/api/image-studio/generate-prompt', async (req, res) => {
  try {
    const {
      designBrief,
      promptInstructions,
      visualCharacteristics,
      outputMode,
      intendedOutput,
      creativeDirection,
      model
    } = req.body;

    const promptText = `
You are the master Image Prompt Translator for Science of Gifts.
Your task is to translate the approved, structured DESIGN BRIEF into a precise, highly effective image-generation prompt for advanced AI models (such as Google Flow, Gemini, ChatGPT, Midjourney, FLUX).

APPROVED DESIGN BRIEF:
${JSON.stringify(designBrief || {}, null, 2)}

USER PROMPT INSTRUCTIONS:
"${promptInstructions || 'Translate the approved design brief into a precise image-generation prompt. Strictly describe the actual subject, composition, visual hierarchy, typography, illustration style, color palette, and production requirements. Never substitute the user concept with generic stock scenes.'}"

REUSABLE VISUAL PREFERENCES / CHARACTERISTICS:
${JSON.stringify(visualCharacteristics || {})}

OUTPUT MODE: ${outputMode || 'Finished Artwork'}
INTENDED OUTPUT: ${intendedOutput || 'Standalone Graphic Artwork'}
USER CREATIVE DIRECTION: "${creativeDirection || ''}"

STRICT RULES FOR PROMPT GENERATION:
1. ACCURACY & FIDELITY: You MUST faithfully depict the user's actual subject and design brief details (e.g., history teacher museum specimen, Viking mythology, botanical catalog, etc.). NEVER substitute the user's concept with a generic gift box, luxury packaging, or unrelated stock scene.
2. CONCRETE VISUAL DESCRIPTIONS: Translate the design brief decisions into concrete, evocative visual instructions (composition, hierarchy, typography, art technique, color swatches, era, mood).
3. NO GENERIC FILLER: Absolutely BAN generic stock AI filler words and phrases such as "8k resolution", "masterpiece", "hyper-realistic", "stunning", "beautiful", "breathtaking", "highly detailed", "cinematic", "photorealistic", "award-winning", "luxury gift box", "satin ribbon", "studio lighting", "soft pastel background" unless explicitly required by the design brief.
4. ISOLATED ARTWORK FORMAT: If outputMode is "Finished Artwork" or intended output is artwork/t-shirt/poster/mug graphic, explicitly instruct the model to render flat, isolated finished artwork on a clean/neutral or transparent-style background, with NO physical product mockup, NO person wearing a shirt, NO staged photo background, and NO frame borders around the canvas unless part of the artwork.
5. NEGATIVE PROMPT: Provide a separate "negativePrompt" string explicitly excluding generic stock photography, mockups, and filler.

Return JSON in the specified schema.
`;

    try {
      const resObj = await callGeminiWithFallback((modelToUse) => ({
        model: modelToUse,
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              finalPrompt: { type: Type.STRING, description: 'The complete, clean text prompt ready to paste into an AI image generator' },
              negativePrompt: { type: Type.STRING, description: 'Negative prompt string or explicit exclusions' },
              modelNotes: { type: Type.STRING, description: 'Brief advice on best image models or settings for this prompt (e.g. Midjourney --v 6.0, Google Flow, Gemini)' }
            },
            required: ['finalPrompt', 'negativePrompt', 'modelNotes']
          }
        }
      }), model);

      const result = JSON.parse(cleanJsonString(resObj.text));
      return res.json({ success: true, ...result, modelUsed: resObj.modelUsed });
    } catch (apiError: any) {
      console.warn('Gemini API error; using smart fallback prompt generator:', apiError?.message);
      const fallbackResult = generateFallbackPrompt(req.body);
      return res.json({ success: true, ...fallbackResult, isFallback: true, modelUsed: 'Fallback Local Generator' });
    }
  } catch (error: any) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate final prompt' });
  }
});




// ----------------------------------------------------
// VITE / STATIC FILE HANDLING
// ----------------------------------------------------
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

function generateFallbackBrief(reqBody: any) {
  const concept = reqBody.selectedConcept || {};
  const idea = reqBody.idea || {};
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
    negativePrompt: 'blurry, distorted, low quality, 3D render, glossy neon, physical t-shirt mockup, model wearing shirt, photographic realistic clutter, luxury gift box, satin ribbon, 8k resolution, masterpiece, watermarks, bad anatomy',
    modelNotes: 'Works best in Midjourney v6 (--v 6.0), Google Flow, or Gemini image generation models. Set aspect ratio as needed (--ar 1:1 or --ar 4:5).'
  };
}
