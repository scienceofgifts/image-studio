export type MainView = 'projects' | 'project-detail' | 'gallery' | 'inspiration' | 'profiles';

export type ProjectStatus = 'idea' | 'concepts' | 'inspiration' | 'direction' | 'brief' | 'prompt' | 'completed';

export type OutputMode = 'Finished Artwork' | 'Product Mockup';

export interface ImageIdea {
  idea: string;
  productType: string;
  intendedUse: string;
  audience: string;
  subject: string;
  desiredMood: string;
  userNotes: string;
  constraints: string;
}

export interface VisualConcept {
  id: string;
  conceptName: string;
  coreVisualIdea: string;
  whyItWorks: string;
  composition: string;
  keyVisualElements: string[];
  typographyDirection: string;
  illustrationDirection: string;
  overallCharacter: string;
  possibleProductSuitability: string;
  potentialRisks: string;
  isSaved?: boolean;
  modelUsed?: string;
}

export type ConceptRole = 'primary' | 'secondary' | 'incorporate' | 'avoid';

export interface DetailedVisualCharacteristics {
  compositionLayout?: string;
  compositionFraming?: string;
  compositionSymmetry?: string;
  compositionHierarchy?: string;
  compositionFocalPoint?: string;

  typographyTypeCharacter?: string;
  typographyHierarchy?: string;
  typographyPlacement?: string;
  typographyRelationshipToImagery?: string;

  illustrationMedium?: string;
  illustrationRenderingApproach?: string;
  illustrationSubjectTreatment?: string;

  colorPalette?: string;
  colorContrast?: string;

  textureSurfaceTreatment?: string;
  texturePrintCharacteristics?: string;

  eraHistoricalReferences?: string;
  eraCulturalLanguage?: string;

  moodEmotionalCharacter?: string;
  moodTone?: string;

  productApparentTarget?: string;
  productPrintSuitability?: string;
  productReadabilityScale?: string;
}

export interface InspirationAnalysisRecord {
  composition: string;
  typography: string;
  illustration: string;
  color: string;
  texture: string;
  visualHierarchy: string;
  eraCulturalCharacter: string;
  moodCharacter: string;
  productCharacteristics: string;
  distinctiveCharacteristics: string;

  visualCharacteristics?: DetailedVisualCharacteristics;
  designPrinciples: string[];
  creativeMechanisms: string[];
  applicableContexts: string[];
  modelUsed?: string;
}

export interface InspirationReference {
  id: string;
  name: string;
  type: string;
  imageDataUrl?: string;
  notes?: string;
  analysis?: InspirationAnalysisRecord;
  collection?: string;
  tags?: string[];
  favorite?: boolean;
  inVisualProfile?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SelectedCharacteristic {
  id: string;
  referenceId: string;
  referenceName: string;
  category: 'composition' | 'typography' | 'illustration' | 'color' | 'texture' | 'hierarchy' | 'era' | 'mood' | 'distinctive';
  text: string;
}

export interface StructuredVisualParameters {
  compositions: string[];
  framings: string[];
  customComposition?: string;

  typographyFontCharacters: string[];
  typographyRoles: string[];
  typographyCharacters: string[];
  customTypography?: string;

  illustrationStyles: string[];
  customIllustration?: string;

  colorPalettes: string[];
  customColorHex?: string;
  customColorNote?: string;

  textures: string[];
  customTexture?: string;

  eras: string[];
  customEra?: string;

  moods: string[];
  customMood?: string;

  hierarchyPrimary: string;
  hierarchySecondary: string[];
  hierarchyCustomNote?: string;
}

export interface StructuredVisualDirection {
  composition: string;
  typography: string;
  illustration: string;
  color: string;
  texture: string;
  era: string;
  mood: string;
  visualHierarchy: string;
  parameters?: StructuredVisualParameters;
}

export interface DesignBrief {
  subject: string;
  purpose: string;
  composition: string;
  visualHierarchy: string;
  typography: string;
  illustration: string;
  color: string;
  texture: string;
  eraReferenceLanguage: string;
  moodCharacter: string;
  productPrintConsiderations: string;
  negativeSpace: string;
  keyElements: string[];
  optionalElements: string[];
  avoid: string[];
  creativeRationale: string;
  modelUsed?: string;
}

export interface ImageProject {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  
  imageIdea: ImageIdea;
  outputMode: OutputMode;
  intendedOutput: string;

  visualConcepts: VisualConcept[];
  conceptSelections: Record<string, ConceptRole>; // conceptId -> ConceptRole
  creativeDirection: string;

  inspirationReferences: InspirationReference[];
  selectedReferenceCharacteristics: SelectedCharacteristic[];

  visualDirection: StructuredVisualDirection;
  designBrief?: DesignBrief;

  promptInstructions: string;
  finalPrompt?: string;
  negativePrompt?: string;
  modelNotes?: string;

  visualCharacteristics?: Record<string, string>;
}

export interface SavedConceptItem {
  id: string;
  concept: VisualConcept;
  sourceProjectId?: string;
  sourceProjectTitle?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

export interface VisualProfile {
  id: string;
  title: string;
  description: string;
  compositionPreference: string;
  typographyPreference: string;
  illustrationPreference: string;
  colorPreference: string;
  degreeOfMinimalism: string;
  avoidList: string[];
  isDefault?: boolean;
  createdAt: string;
}

export interface SynthesisConcept {
  id: string;
  conceptTitle: string;
  coreIdea: string;
  designMechanism: string;
  borrowsConceptually: Record<string, string>; // refTitle/id -> principle borrowed
  composition: string;
  typography: string;
  imageryIllustration: string;
  colorDirection: string;
  productSuitability: string;
  whyConceptWorks: string;
  potentialRisk: string;
  topic: string;
  sourceInspirationIds: string[];
  extractedPrinciplesUsed: string[];
  createdAt: string;
  modelUsed?: string;
}

export interface AggregateVisualProfile {
  id: string;
  title: string;
  description: string;
  preferredCompositions: string[];
  preferredTypography: string[];
  preferredIllustrationStyles: string[];
  preferredColors: string[];
  preferredTextures: string[];
  preferredEras: string[];
  preferredMechanisms: string[];
  preferredDesignPrinciples: string[];
  productPreferences: string[];
  contributingInspirationIds: string[];
  updatedAt: string;
}

export interface DirectionProfile {
  id: string;
  name: string;
  version?: number;
  visualDirection: StructuredVisualDirection;
  creativeDirection?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReferenceAnalysis = InspirationAnalysisRecord;
