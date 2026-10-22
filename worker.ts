import { GoogleGenAI, Type } from '@google/genai';

export interface Env {
  GEMINI_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  SERVICE_NAME?: string;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';

function getCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data: any, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
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
 * Executes a Gemini API request with strictly 'gemini-3.5-flash-lite' as default.
 * Throws explicit errors if API key is missing or model fails.
 */
async function callGemini(
  apiKey: string,
  requestedModel: string | undefined,
  paramsFn: (modelToUse: string) => any
): Promise<{ text: string; modelUsed: string }> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY environment secret is not configured.');
  }

  const modelToUse = (requestedModel && requestedModel.trim()) || DEFAULT_GEMINI_MODEL;
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const config = paramsFn(modelToUse);
  const response = await ai.models.generateContent(config);

  if (!response || !response.text) {
    throw new Error(`Gemini model '${modelToUse}' returned an empty response.`);
  }

  return {
    text: response.text,
    modelUsed: modelToUse,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(request);
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    // 1. Universal OPTIONS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 2. Health Check Endpoints
    if (request.method === 'GET' && (path === '/health' || path === '/api/image-studio/health')) {
      return jsonResponse({
        status: 'ok',
        service: env.SERVICE_NAME || 'science-of-gifts-image-studio',
      }, 200, corsHeaders);
    }

    // 3. API Routes Handling
    if (url.pathname.startsWith('/api/')) {
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

          const resObj = await callGemini(apiKey, model, (modelToUse) => ({
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
                  required: [
                    'conceptName', 'coreVisualIdea', 'whyItWorks', 'composition',
                    'keyVisualElements', 'typographyDirection', 'illustrationDirection',
                    'overallCharacter', 'possibleProductSuitability', 'potentialRisks'
                  ]
                }
              }
            }
          }));

          const concepts = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, concepts, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (err: any) {
          console.error('[Worker API] Error in explore-concepts:', err);
          return jsonResponse({ success: false, error: err?.message || 'Failed to explore visual concepts' }, 500, corsHeaders);
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

          const resObj = await callGemini(apiKey, model, (modelToUse) => ({
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
        } catch (err: any) {
          console.error('[Worker API] Error in analyze-reference:', err);
          return jsonResponse({ success: false, error: err?.message || 'Failed to analyze reference image' }, 500, corsHeaders);
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

          const resObj = await callGemini(apiKey, model, (modelToUse) => ({
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
                  required: [
                    'conceptTitle', 'coreIdea', 'designMechanism', 'composition',
                    'typography', 'imageryIllustration', 'colorDirection',
                    'productSuitability', 'whyConceptWorks', 'potentialRisk'
                  ]
                }
              }
            }
          }));

          const concepts = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, concepts, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (err: any) {
          console.error('[Worker API] Error in explore-inspiration:', err);
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

          const resObj = await callGemini(apiKey, model, (modelToUse) => ({
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
                  required: [
                    'conceptTitle', 'coreIdea', 'designMechanism', 'borrowsConceptually',
                    'composition', 'typography', 'imageryIllustration', 'colorDirection',
                    'productSuitability', 'whyConceptWorks', 'potentialRisk'
                  ]
                }
              }
            }
          }));

          const concepts = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, concepts, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (err: any) {
          console.error('[Worker API] Error in synthesize-inspirations:', err);
          return jsonResponse({ success: false, error: err?.message || 'Failed to synthesize inspirations' }, 500, corsHeaders);
        }
      }

      // POST /api/image-studio/create-brief
      if (request.method === 'POST' && path === '/api/image-studio/create-brief') {
        try {
          const reqBody = await request.json() as any;
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
          } = reqBody || {};

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

          const resObj = await callGemini(apiKey, model, (modelToUse) => ({
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
          }));

          const brief = JSON.parse(cleanJsonString(resObj.text));
          return jsonResponse({ success: true, brief, modelUsed: resObj.modelUsed }, 200, corsHeaders);
        } catch (err: any) {
          console.error('[Worker API] Error in create-brief:', err);
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
1. ACCURACY & FIDELITY: You MUST faithfully depict the user's actual subject and design brief details. NEVER substitute the user's concept with a generic gift box, luxury packaging, or unrelated stock scene.
2. CONCRETE VISUAL DESCRIPTIONS: Translate the design brief decisions into concrete, evocative visual instructions (composition, hierarchy, typography, art technique, color swatches, era, mood).
3. NO GENERIC FILLER: Absolutely BAN generic stock AI filler words and phrases such as "8k resolution", "masterpiece", "hyper-realistic", "stunning", "beautiful", "breathtaking", "highly detailed", "cinematic", "photorealistic", "award-winning", "luxury gift box", "satin ribbon", "studio lighting", "soft pastel background" unless explicitly required by the design brief.
4. ISOLATED ARTWORK FORMAT: If outputMode is "Finished Artwork" or intended output is artwork/t-shirt/poster/mug graphic, explicitly instruct the model to render flat, isolated finished artwork on a clean/neutral or transparent-style background, with NO physical product mockup, NO person wearing a shirt, NO staged photo background, and NO frame borders around the canvas unless part of the artwork.
5. NEGATIVE PROMPT: Provide a separate "negativePrompt" string explicitly excluding generic stock photography, mockups, and filler.

Return JSON in the specified schema.
`;

          const resObj = await callGemini(apiKey, model, (modelToUse) => ({
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
        } catch (err: any) {
          console.error('[Worker API] Error in generate-prompt:', err);
          return jsonResponse({ success: false, error: err?.message || 'Failed to generate final prompt' }, 500, corsHeaders);
        }
      }

      // POST /api/idea-explorer/generate
      if (request.method === 'POST' && (path === '/api/idea-explorer/generate' || path === '/idea-explorer/generate')) {
        try {
          const reqBody = await request.json() as any;
          const { topic, creativeDirection, refinements, excludedPremises, model } = reqBody || {};

          if (!topic || typeof topic !== 'string' || !topic.trim()) {
            return jsonResponse({ success: false, error: 'A valid exploration topic is required.' }, 400, corsHeaders);
          }

          const tonesStr = refinements?.tones?.length ? `Tone: ${refinements.tones.join(', ')}` : '';
          const aestheticsStr = refinements?.aesthetics?.length ? `Aesthetic: ${refinements.aesthetics.join(', ')}` : '';
          const audienceStr = refinements?.audience ? `Audience: ${refinements.audience}` : '';
          const intendedUseStr = refinements?.intendedUse ? `Intended Product/Use: ${refinements.intendedUse}` : '';
          const includeStr = refinements?.includeElements?.length ? `Must Include: ${refinements.includeElements.join(', ')}` : '';
          const excludeStr = refinements?.excludeElements?.length ? `Must Avoid/Exclude: ${refinements.excludeElements.join(', ')}` : '';
          const customInstStr = refinements?.customInstructions ? `Custom Constraints: ${refinements.customInstructions}` : '';
          const excludedPremisesStr = excludedPremises?.length ? `PREVIOUSLY EXPLORED CONCEPTS TO AVOID REPEATING:\n- ${excludedPremises.join('\n- ')}` : '';

          const promptText = `
You are a senior creative director and lead conceptual ideator for Science of Gifts.
Your objective is to generate EXACTLY 10 GENUINELY DISTINCT, ORIGINAL, AND COMPELLING creative gift and design concepts for the topic below.

EXPLORATION TOPIC:
"${topic.trim()}"

${creativeDirection ? `ACTIVE CREATIVE DIRECTION:\n"${creativeDirection.trim()}"\n` : ''}
${[tonesStr, aestheticsStr, audienceStr, intendedUseStr, includeStr, excludeStr, customInstStr].filter(Boolean).length > 0 ? `REFINEMENT CRITERIA:\n${[tonesStr, aestheticsStr, audienceStr, intendedUseStr, includeStr, excludeStr, customInstStr].filter(Boolean).join('\n')}\n` : ''}
${excludedPremisesStr ? `${excludedPremisesStr}\n` : ''}

CRITICAL DIVERSITY & CREATIVE EXCELLENCE INSTRUCTIONS:
1. Generate EXACTLY 10 ideas.
2. DIVERSITY OF THOUGHT: Explore genuinely different conceptual angles:
   - Clever visual metaphors and unexpected analogies.
   - Witty historical or thematic wordplay and typography-led statements.
   - Deconstructive or anatomical/specimen takes.
   - Recontextualization (placing the subject in an unexpected era, institution, or frame).
   - Quiet, sophisticated editorial tributes vs. bold irreverent statements.
3. NO SHALLOW REPETITION: Do NOT repeat the same basic punchline or layout with minor wording tweaks across multiple cards. Each idea must possess an independent conceptual premise.
4. COMMERCIAL & VISUAL VIABILITY: Each concept must have tangible visual potential suitable for artwork, apparel, drinkware, prints, or gift items.
5. Provide a short, catchy title, a 1-3 sentence description, a crisp core premise, execution suggestions, and relevant tags.

Return JSON in the specified array schema.
`;

          const resObj = await callGemini(apiKey, model, (modelToUse) => ({
            model: modelToUse,
            contents: promptText,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                description: 'List of exactly 10 distinct, original creative ideas',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    corePremise: { type: Type.STRING },
                    executionSuggestions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['title', 'description', 'corePremise']
                }
              }
            }
          }));

          let parsed: any[];
          try {
            const raw = JSON.parse(cleanJsonString(resObj.text));
            parsed = Array.isArray(raw) ? raw : (Array.isArray(raw?.ideas) ? raw.ideas : (Array.isArray(raw?.items) ? raw.items : []));
          } catch (jsonErr: any) {
            throw new Error(`Failed to parse AI output as JSON: ${jsonErr?.message || 'Invalid format'}`);
          }
          if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error('AI returned an invalid or empty list of ideas.');
          }

          const ideas = parsed.slice(0, 10).map((item: any, idx: number) => ({
            id: item.id || `idea-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            title: item.title || `Concept ${idx + 1}`,
            description: item.description || '',
            corePremise: item.corePremise || '',
            executionSuggestions: Array.isArray(item.executionSuggestions) ? item.executionSuggestions : [],
            tags: Array.isArray(item.tags) ? item.tags : []
          }));

          return jsonResponse({
            success: true,
            ideas,
            generationType: creativeDirection || Object.keys(refinements || {}).length > 0 ? 'refined' : 'initial',
            modelUsed: resObj.modelUsed
          }, 200, corsHeaders);
        } catch (err: any) {
          console.error('[Worker Idea Explorer] Error in generate:', err);
          return jsonResponse({ success: false, error: err?.message || 'Failed to generate ideas' }, 500, corsHeaders);
        }
      }

      // POST /api/idea-explorer/branch
      if (request.method === 'POST' && (path === '/api/idea-explorer/branch' || path === '/idea-explorer/branch')) {
        try {
          const reqBody = await request.json() as any;
          const { topic, parentIdeas, creativeDirection, refinements, excludedPremises, model } = reqBody || {};

          if (!topic || typeof topic !== 'string' || !topic.trim()) {
            return jsonResponse({ success: false, error: 'A valid exploration topic is required.' }, 400, corsHeaders);
          }

          if (!Array.isArray(parentIdeas) || parentIdeas.length === 0) {
            return jsonResponse({ success: false, error: 'At least one parent idea must be selected to branch.' }, 400, corsHeaders);
          }

          const parentSummaries = parentIdeas.map((p: any, i: number) => 
            `PARENT IDEA ${i + 1}: "${p.title}"\n- Core Premise: ${p.corePremise || p.description}\n- Details: ${p.description}`
          ).join('\n\n');

          const promptText = `
You are a senior creative director and conceptual branching strategist for Science of Gifts.
Your objective is to generate EXACTLY 10 NEW, ORIGINAL creative gift and design concepts BRANCHED FROM and INSPIRED BY the user's selected parent idea(s).

ORIGINAL TOPIC:
"${topic.trim()}"

SELECTED PARENT IDEAS TO BRANCH FROM:
${parentSummaries}

${creativeDirection ? `USER BRANCHING DIRECTIVE:\n"${creativeDirection.trim()}"\n` : 'USER BRANCHING DIRECTIVE:\nDevelop this creative direction further into fresh, unexpected variations and related concepts.\n'}
${excludedPremises?.length ? `PREVIOUSLY SEEN CONCEPTS TO AVOID REPEATING:\n- ${excludedPremises.join('\n- ')}\n` : ''}

BRANCHING INSTRUCTIONS:
1. Understand the UNDERLYING CREATIVE MECHANISM, tone, and visual logic that made the parent idea(s) promising.
2. BRANCH, DO NOT COPY: Generate 10 NEW sister concepts that explore that creative vein in distinct, unexpected ways. Do NOT merely restate or paraphrase the parent ideas.
3. If multiple parent ideas are selected, identify their shared creative spirit, synthesize their themes, or explore the intersection between them.
4. Provide a punchy title, a clear 1-3 sentence explanation, the central premise, execution suggestions, and descriptive tags.

Return JSON in the specified array schema.
`;

          const resObj = await callGemini(apiKey, model, (modelToUse) => ({
            model: modelToUse,
            contents: promptText,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                description: 'List of exactly 10 distinct, original creative ideas',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    corePremise: { type: Type.STRING },
                    executionSuggestions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['title', 'description', 'corePremise']
                }
              }
            }
          }));

          let parsed: any[];
          try {
            const raw = JSON.parse(cleanJsonString(resObj.text));
            parsed = Array.isArray(raw) ? raw : (Array.isArray(raw?.ideas) ? raw.ideas : (Array.isArray(raw?.items) ? raw.items : []));
          } catch (jsonErr: any) {
            throw new Error(`Failed to parse AI output as JSON: ${jsonErr?.message || 'Invalid format'}`);
          }
          if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error('AI returned an invalid or empty list of ideas.');
          }

          const parentIds = parentIdeas.map((p: any) => p.id).filter(Boolean);

          const ideas = parsed.slice(0, 10).map((item: any, idx: number) => ({
            id: item.id || `idea-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            title: item.title || `Branched Concept ${idx + 1}`,
            description: item.description || '',
            corePremise: item.corePremise || '',
            executionSuggestions: Array.isArray(item.executionSuggestions) ? item.executionSuggestions : [],
            tags: Array.isArray(item.tags) ? item.tags : [],
            parentIdeaIds: parentIds
          }));

          return jsonResponse({
            success: true,
            ideas,
            parentIdeaIds: parentIds,
            generationType: 'branched',
            modelUsed: resObj.modelUsed
          }, 200, corsHeaders);
        } catch (err: any) {
          console.error('[Worker Idea Explorer] Error in branch:', err);
          return jsonResponse({ success: false, error: err?.message || 'Failed to branch ideas' }, 500, corsHeaders);
        }
      }

      // Any unmatched /api/ route
      return jsonResponse({ success: false, error: `API endpoint '${path}' not found` }, 404, corsHeaders);
    }

    // 4. Delegate all static/frontend routes to Cloudflare Static Assets
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  }
};
