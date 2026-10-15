import { ImageProject, SavedConceptItem, InspirationReference, VisualProfile, SynthesisConcept, DirectionProfile, StructuredVisualDirection, StructuredVisualParameters } from '../types';

export const DEFAULT_PROMPT_INSTRUCTIONS = 
  "Translate the approved design brief into a precise, concrete image-generation prompt. Strictly describe the actual subject, composition, visual hierarchy, typography, illustration style, color palette, and production requirements specified in the brief. Never substitute the user's specific subject with generic stock scenes (such as gift boxes, generic packaging, or luxury product photos). Strictly prohibit generic filler phrases like '8k resolution', 'masterpiece', 'hyper-realistic', 'stunning', 'studio lighting', or arbitrary stock photography language unless explicitly required by the design brief.";

const STORAGE_KEYS = {
  IMAGE_PROJECTS: 'sog_image_projects_v2',
  SAVED_CONCEPTS: 'sog_saved_concepts_v2',
  INSPIRATION_LIBRARY: 'sog_inspiration_library_v2',
  VISUAL_PROFILES: 'sog_visual_profiles_v2',
  SYNTHESIS_CONCEPTS: 'sog_synthesis_concepts_v2',
  DIRECTION_PROFILES: 'sog_direction_profiles_v1'
};

// Seed sample initial image project
const SAMPLE_IMAGE_PROJECT: ImageProject = {
  id: 'proj-history-teacher-01',
  title: 'History Teacher Museum Specimen',
  status: 'brief',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date().toISOString(),
  imageIdea: {
    idea: 'History Teacher',
    productType: 'T-Shirt & Mug Graphic',
    intendedUse: 'Print-on-demand gift artwork',
    audience: 'High school & university history educators, history enthusiasts',
    subject: 'A celebratory visual tribute to history teachers and historical inquiry',
    desiredMood: 'Scholarly, nostalgic, witty, archival',
    userNotes: 'Should feel like a genuine historical artifact or museum entry rather than a cheap slogan tee.',
    constraints: 'High contrast for dark and light apparel, clean vector linework for print crispness.'
  },
  outputMode: 'Finished Artwork',
  intendedOutput: 'T-shirt & Mug Graphic Artwork',
  visualConcepts: [
    {
      id: 'concept-1',
      conceptName: 'Museum Catalog Entry',
      coreVisualIdea: 'A faux archival museum catalog specimen sheet defining "The History Educator" as a rare historical artifact.',
      whyItWorks: 'Clever meta-humor that treats the history teacher with comedic reverence inside a legit museum template.',
      composition: 'Formal rectangular specimen box with catalog number plaque at top and diagram in center.',
      keyVisualElements: ['Archival specimen classification tag', 'Magnifying glass focused on ancient map', 'Calligraphic accession stamp', 'Cross-section of historical artifacts'],
      typographyDirection: 'Authentic 19th-century typesetting with slab serifs and monospaced catalog numbers.',
      illustrationDirection: 'Victorian scientific diagram or lithograph illustration.',
      overallCharacter: 'Witty, academic, institutional',
      possibleProductSuitability: 'Ideal for coffee mugs, framed art prints, and notebook covers.',
      potentialRisks: 'Small catalog text must remain large enough to read when printed on apparel.'
    },
    {
      id: 'concept-2',
      conceptName: 'Academic Emblem & Crest',
      coreVisualIdea: 'A circular university seal or crest composed of iconic historical symbols from ancient to modern times.',
      whyItWorks: 'Instantly recognizable emblem layout that bestows prestige and institutional dignity.',
      composition: 'Symmetrical circular badge with ribbon banner wrapped around the lower perimeter.',
      keyVisualElements: ['Greek temple column', 'Spartan helmet & Roman wreath', 'Quill and inkpot', 'Latin motto ribbon banner'],
      typographyDirection: 'Bold condensed block serif inside circular arc track.',
      illustrationDirection: 'Woodcut print style with sharp black-and-white contrast.',
      overallCharacter: 'Authoritative, collegiate, honorable',
      possibleProductSuitability: 'Perfect for left-chest embroidery, hoodies, and metal water bottles.',
      potentialRisks: 'May look like a standard university logo if symbols aren\'t tailored.'
    },
    {
      id: 'concept-3',
      conceptName: 'Historical Evolution Timeline',
      coreVisualIdea: 'A layered visual progression showing the history teacher traversing major historical epochs.',
      whyItWorks: 'Taps into the teacher\'s role as a guide through time, balancing humor with historical reverence.',
      composition: 'Horizontal layered sequence or vertical stacked progression with arched framing.',
      keyVisualElements: ['Hourglass with swirling dust of eras', 'Stack of vintage leather-bound manuscripts', 'Feather quill and pocket watch', 'Silhouette of classic classroom globe'],
      typographyDirection: 'Classic Roman serif with wide letter-spacing for headers, paired with delicate italics.',
      illustrationDirection: 'Engraved copperplate linework combined with subtle stippling.',
      overallCharacter: 'Scholarly, archival, refined',
      possibleProductSuitability: 'Excellent for T-shirt backs, tote bags, and wide poster prints.',
      potentialRisks: 'Can become overly crowded if too many historical eras are crammed in.'
    }
  ],
  conceptSelections: {
    'concept-1': 'primary',
    'concept-2': 'secondary',
    'concept-3': 'incorporate'
  },
  creativeDirection: 'Use the museum catalog concept as the primary layout, but incorporate the woodcut linework from the emblem concept to make it feel like a genuine 1890s archival document.',
  inspirationReferences: [
    {
      id: 'ref-1',
      name: 'Victorian Botanical Catalog',
      type: 'Vintage Advertisement',
      notes: 'Love the two-color engraving and formal specimen border.',
      createdAt: new Date().toISOString(),
      inVisualProfile: true,
      analysis: {
        composition: 'Centered rectangular frame with formal engraved border line and specimen ID plaque.',
        typography: 'Engraved slab serif headers paired with condensed copperplate secondary text.',
        illustration: 'High-contrast copperplate etching with fine parallel hatch lines.',
        color: 'Two-color palette: Deep ivory background with aged iron-gall black ink.',
        texture: 'Subtle paper grain with natural ink bleed at line intersections.',
        visualHierarchy: 'Large central illustration dominates, framed by clean specimen label plaque at top and caption at bottom.',
        eraCulturalCharacter: 'Late 19th-century Victorian natural history museum archiving.',
        moodCharacter: 'Austerely scholarly, authentic, prestigious.',
        productCharacteristics: 'Ideal for flat vector apparel printing and ceramic glazes.',
        distinctiveCharacteristics: 'Crisp line density, formal catalog numbering, unboxed clean typographic layout.',
        visualCharacteristics: {
          compositionLayout: 'Centered rectangular specimen box',
          compositionFraming: 'Double-ruled border with top tag',
          typographyTypeCharacter: 'Slab serif & Monospaced accession numbers',
          illustrationMedium: 'Copperplate woodcut etching',
          colorPalette: 'Iron-gall black on warm ivory parchment',
          textureSurfaceTreatment: 'Subtle aged paper grain',
          eraHistoricalReferences: 'Victorian Natural History Museum (c. 1885)',
          moodTone: 'Scholarly, authoritative, quiet humor'
        },
        designPrinciples: [
          'Transform a ordinary subject into an authentic classified museum artifact.',
          'Use formal institutional plaques and accession tags to bestow dignity.',
          'Maintain high contrast two-color palette for maximum print crispness.',
          'Enclose focal elements inside clean double-ruled border frames.'
        ],
        creativeMechanisms: [
          'Classification & Definition',
          'Historical Reinterpretation',
          'Role Reversal & Heroic Archetype'
        ],
        applicableContexts: ['Educator gifts', 'Scientific artwork', 'Nostalgic apparel', 'Coffee mugs']
      }
    }
  ],
  selectedReferenceCharacteristics: [
    {
      id: 'char-1',
      referenceId: 'ref-1',
      referenceName: 'Victorian Botanical Catalog',
      category: 'illustration',
      text: 'High-contrast copperplate etching with fine parallel hatch lines'
    }
  ],
  visualDirection: {
    composition: 'Centered specimen plaque frame with formal border lines',
    typography: '19th-century slab serif with monospaced catalog numbering',
    illustration: 'Fine copperplate woodcut etching with cross-hatching',
    color: 'Monochrome deep iron black on warm off-white parchment canvas',
    texture: 'Authentic aged paper grain and slight ink impression',
    era: 'Victorian archival museum specimen (c. 1885)',
    mood: 'Scholarly, witty, honorable, nostalgic',
    visualHierarchy: 'Central specimen illustration leading to top accession tag and bottom Latin motto',
    parameters: {
      compositions: ['Centered', 'Balanced'],
      framings: ['Framed', 'Badge'],
      customComposition: 'Specimen plaque frame with formal border lines and accession labels',
      typographyFontCharacters: ['Slab Serif', 'Monospaced'],
      typographyRoles: ['Balanced'],
      typographyCharacters: ['Academic', 'Vintage'],
      customTypography: '19th-century specimen taxonomy labeling and monospaced catalog accession codes',
      illustrationStyles: ['Engraving', 'Etching'],
      customIllustration: 'Fine copperplate woodcut etching with cross-hatching',
      colorPalettes: ['Monochrome', 'Black + Cream'],
      customColorHex: '#1c1917',
      customColorNote: 'Deep iron gall black on warm off-white archival parchment canvas',
      textures: ['Aged Paper', 'Paper Grain'],
      customTexture: 'Authentic 19th-century aged rag paper grain and subtle letterpress plate impression',
      eras: ['Victorian', 'Archival'],
      customEra: 'Victorian archival museum specimen (c. 1885)',
      moods: ['Scholarly', 'Witty', 'Nostalgic', 'Refined'],
      customMood: 'Scholarly museum curiosity with dry intellectual wit',
      hierarchyPrimary: 'Central Object',
      hierarchySecondary: ['Supporting Typography', 'Decorative Elements'],
      hierarchyCustomNote: 'Central specimen illustration leading to accession tag and motto'
    }
  },
  directionProfileId: 'prof-victorian-specimen',
  designBrief: {
    subject: 'A standalone graphic tribute depicting the "History Educator" as a classified museum specimen (Accession No. 1892-HIST).',
    purpose: 'To create a sophisticated, witty gift graphic for history teachers that feels like an authentic 19th-century museum catalog entry.',
    composition: 'Symmetrical, centered specimen layout inside a thin double-ruled border. Accession plaque at top, central woodcut etching of crossed quills, hourglass, and globe, with caption plaque at base.',
    visualHierarchy: 'Primary focus on the central etched historical emblem; secondary focus on the top accession header tag; tertiary on the bottom motto banner.',
    typography: 'Classical slab serif with generous letter-spacing for headers, paired with monospaced archival accession numbers.',
    illustration: 'Detailed Victorian engraving and woodcut linework with meticulous cross-hatching and stippled shading.',
    color: 'Strict two-color palette: Deep iron black ink on neutral cream field.',
    texture: 'Subtle vintage parchment grain with light press-ink texture.',
    eraReferenceLanguage: 'Late 19th-century academic museum specimen catalog (c. 1880-1895).',
    moodCharacter: 'Scholarly, dignified, quietly witty.',
    productPrintConsiderations: 'Isolated flat artwork graphic on clean background. Clean high-contrast linework optimized for T-shirt screen printing and ceramic mug glaze.',
    negativeSpace: 'Balanced margins surrounding the border frame to ensure strong readability at product scale.',
    keyElements: ['Accession tag plaque "SPECIMEN: HISTORIA MAGISTRA VITAE"', 'Central woodcut etching of globe, hourglass, and leatherbound tome', 'Double-ruled Victorian border frame'],
    optionalElements: ['Small brass key motif', 'Calligraphic ink stamp'],
    avoid: ['Modern digital gradients', 'Gimmicky cartoon characters', 'Colorful neon hues', 'T-shirt mockups or human models in the artwork'],
    creativeRationale: 'Combines the academic authority of Victorian museum archiving with crisp, wearable print graphics that history educators will take pride in.'
  },
  promptInstructions: DEFAULT_PROMPT_INSTRUCTIONS,
  finalPrompt: 'A flat, isolated graphic artwork in the style of an authentic 1890s Victorian museum catalog specimen entry titled "SPECIMEN: THE HISTORY EDUCATOR". Centered symmetrical composition inside a delicate double-ruled border line. At the top, a formal plaque displays monospaced archival accession number "NO. 1892-HIST". The central focal element is a detailed copperplate woodcut engraving depicting an antique brass globe, an hourglass with flowing sands, and crossed feather quills over an open leather-bound manuscript. Rendered in crisp iron-black linework with fine cross-hatching on a clean, solid off-white background. Below the illustration sits an elegant ribbon banner bearing the Latin inscription "HISTORIA MAGISTRA VITAE". Flat vector artwork, high contrast, clean lines suitable for t-shirt screen printing. No physical product mockup, no human model, no drop shadows, no modern gradients.',
  negativePrompt: 'photograph, t-shirt mockup, model, mannequin, 3d render, modern gradients, colorful neon, cartoon, blurry, low resolution, drop shadow, frame border around photo',
  modelNotes: 'Recommended for Google Flow, Midjourney v6 (--ar 1:1 or 3:4), or Gemini image generation with flat vector artwork focus.'
};

const SAMPLE_SAVED_CONCEPT: SavedConceptItem = {
  id: 'sc-1',
  concept: SAMPLE_IMAGE_PROJECT.visualConcepts[0],
  sourceProjectId: SAMPLE_IMAGE_PROJECT.id,
  sourceProjectTitle: SAMPLE_IMAGE_PROJECT.title,
  tags: ['Archival', 'Museum', 'History', 'Victorian'],
  notes: 'Timeless museum catalog entry layout. Great for academic and educator gifts.',
  createdAt: new Date().toISOString()
};

const SAMPLE_VISUAL_PROFILE: VisualProfile = {
  id: 'vp-1',
  title: 'Victorian Archival Engraving',
  description: '19th-century scientific diagram and copperplate etching aesthetic.',
  compositionPreference: 'Centered symmetrical framing inside thin double-ruled border line.',
  typographyPreference: 'Classical slab serif paired with monospaced accession numbers.',
  illustrationPreference: 'Copperplate woodcut etching with fine cross-hatching and stippled shading.',
  colorPreference: 'Monochrome iron-gall black ink on warm off-white parchment.',
  degreeOfMinimalism: 'Refined editorial detail with generous margin breathing room.',
  avoidList: ['3D renders', 'Modern neon gradients', 'Gimmicky cartoons', 'Product mockups'],
  isDefault: true,
  createdAt: new Date().toISOString()
};

// ==========================================
// PERSISTENCE FUNCTIONS
// ==========================================

export function getImageProjects(): ImageProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMAGE_PROJECTS);
    if (!raw) {
      const initial = [SAMPLE_IMAGE_PROJECT];
      localStorage.setItem(STORAGE_KEYS.IMAGE_PROJECTS, JSON.stringify(initial));
      return initial;
    }
    const projects: ImageProject[] = JSON.parse(raw);
    if (!Array.isArray(projects)) return [SAMPLE_IMAGE_PROJECT];

    let hasMigration = false;
    const result = projects.map(proj => {
      if (proj.visualDirection && !proj.visualDirection.parameters) {
        hasMigration = true;
        return {
          ...proj,
          visualDirection: {
            ...proj.visualDirection,
            parameters: synthesizeParametersFromDirection(proj.visualDirection)
          }
        };
      }
      return proj;
    });

    if (hasMigration) {
      localStorage.setItem(STORAGE_KEYS.IMAGE_PROJECTS, JSON.stringify(result));
    }

    return result;
  } catch (e) {
    console.error('Failed to load image projects:', e);
    return [SAMPLE_IMAGE_PROJECT];
  }
}

export function saveImageProject(project: ImageProject): void {
  try {
    const projects = getImageProjects();
    const index = projects.findIndex(p => p.id === project.id);
    const updatedProject = { ...project, updatedAt: new Date().toISOString() };
    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }
    
    try {
      localStorage.setItem(STORAGE_KEYS.IMAGE_PROJECTS, JSON.stringify(projects));
    } catch (setItemError) {
      if (
        setItemError instanceof Error &&
        (setItemError.name === 'QuotaExceededError' ||
         setItemError.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
         setItemError.message.toLowerCase().includes('quota') ||
         setItemError.message.toLowerCase().includes('limit'))
      ) {
        console.warn('LocalStorage quota exceeded. Progressively pruning oldest project image reference data URLs...');
        let saved = false;

        // Loop through projects from oldest to newest
        for (let pIndex = projects.length - 1; pIndex >= 0; pIndex--) {
          const proj = projects[pIndex];
          if (proj.id === project.id) {
            continue; // Do not prune reference images of the project currently being edited and saved
          }
          if (proj.inspirationReferences) {
            // Find references with images in this project and prune them
            let prunedAny = false;
            for (let refIndex = proj.inspirationReferences.length - 1; refIndex >= 0; refIndex--) {
              const ref = proj.inspirationReferences[refIndex];
              if (ref.imageDataUrl) {
                console.log(`Pruning reference image data for project "${proj.title}" / ref "${ref.name}"`);
                ref.imageDataUrl = undefined;
                prunedAny = true;
              }
            }

            if (prunedAny) {
              try {
                localStorage.setItem(STORAGE_KEYS.IMAGE_PROJECTS, JSON.stringify(projects));
                saved = true;
                console.log('Successfully saved image projects after pruning old reference image.');
                break;
              } catch (innerError) {
                // Keep pruning other projects/references
              }
            }
          }
        }

        if (!saved) {
          // If still failing, try pruning old images from the global inspiration library!
          console.warn('Pruning project images did not suffice. Progressively pruning oldest global inspiration library images...');
          try {
            const library = getInspirationLibrary();
            for (let i = library.length - 1; i >= 0; i--) {
              if (library[i].imageDataUrl) {
                console.log(`Pruning global library image content to save space: ${library[i].name}`);
                library[i].imageDataUrl = undefined;
                try {
                  localStorage.setItem(STORAGE_KEYS.INSPIRATION_LIBRARY, JSON.stringify(library));
                  localStorage.setItem(STORAGE_KEYS.IMAGE_PROJECTS, JSON.stringify(projects));
                  saved = true;
                  console.log('Successfully saved image projects after pruning global library images.');
                  break;
                } catch (e) {
                  // Continue pruning if it still fails
                }
              }
            }
          } catch (libError) {
            console.error('Failed to prune global library images:', libError);
          }
        }

        if (!saved) {
          // If still failing, try deleting the oldest 2 projects completely
          console.warn('Individual image pruning inside projects did not suffice. Deleting oldest projects...');
          const prunedProjects = projects.slice(0, Math.max(1, projects.length - 2));
          try {
            localStorage.setItem(STORAGE_KEYS.IMAGE_PROJECTS, JSON.stringify(prunedProjects));
            console.log('Saved image projects after deleting oldest projects.');
            saved = true;
          } catch (extremeError) {
            console.error('Failed to save image projects even after extensive pruning:', extremeError);
          }
        }

        if (!saved) {
          throw new Error('Local Storage Full: Image references exceeded the 5MB browser quota. Please manually delete some old design references or projects to free up space.');
        }
      } else {
        throw setItemError;
      }
    }
  } catch (e) {
    console.error('Failed to save image project:', e);
    throw e;
  }
}

export function deleteImageProject(id: string): void {
  try {
    const projects = getImageProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.IMAGE_PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to delete image project:', e);
  }
}

// SAVED CONCEPTS LIBRARY

export function getSavedConcepts(): SavedConceptItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_CONCEPTS);
    if (!raw) {
      const initial = [SAMPLE_SAVED_CONCEPT];
      localStorage.setItem(STORAGE_KEYS.SAVED_CONCEPTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved concepts:', e);
    return [SAMPLE_SAVED_CONCEPT];
  }
}

export function saveConceptToGallery(item: SavedConceptItem): void {
  try {
    const concepts = getSavedConcepts();
    const index = concepts.findIndex(c => 
      (item.id && c.id === item.id) || 
      (item.concept?.id && c.concept?.id && c.concept.id === item.concept.id) ||
      (item.concept?.conceptName && c.concept?.conceptName && c.concept.conceptName === item.concept.conceptName)
    );
    if (index >= 0) {
      concepts[index] = item;
    } else {
      concepts.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_CONCEPTS, JSON.stringify(concepts));
  } catch (e) {
    console.error('Failed to save concept:', e);
    throw e;
  }
}

export function removeSavedConcept(id: string, name?: string): void {
  try {
    const concepts = getSavedConcepts().filter(c => {
      const matchId = id && (c.id === id || c.concept?.id === id);
      const matchName = name && c.concept?.conceptName === name;
      return !matchId && !matchName;
    });
    localStorage.setItem(STORAGE_KEYS.SAVED_CONCEPTS, JSON.stringify(concepts));
  } catch (e) {
    console.error('Failed to remove saved concept:', e);
    throw e;
  }
}

// INSPIRATION LIBRARY

export function getInspirationLibrary(): InspirationReference[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSPIRATION_LIBRARY);
    if (!raw) {
      const initial = SAMPLE_IMAGE_PROJECT.inspirationReferences;
      localStorage.setItem(STORAGE_KEYS.INSPIRATION_LIBRARY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load inspiration library:', e);
    return [];
  }
}

export function saveInspirationItem(item: InspirationReference): void {
  try {
    const library = getInspirationLibrary();
    const index = library.findIndex(i => i.id === item.id);
    if (index >= 0) {
      library[index] = item;
    } else {
      library.unshift(item);
    }
    
    try {
      localStorage.setItem(STORAGE_KEYS.INSPIRATION_LIBRARY, JSON.stringify(library));
    } catch (setItemError) {
      // Check if it's a quota exceeded error
      if (
        setItemError instanceof Error &&
        (setItemError.name === 'QuotaExceededError' ||
         setItemError.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
         setItemError.message.toLowerCase().includes('quota') ||
         setItemError.message.toLowerCase().includes('limit'))
      ) {
        console.warn('LocalStorage quota exceeded. Progressively pruning oldest inspiration image data URLs...');
        let saved = false;
        
        // Loop from oldest to newest, clearing imageDataUrl to reclaim space
        for (let i = library.length - 1; i >= 0; i--) {
          if (library[i].id === item.id) {
            continue; // Do not prune the reference currently being saved
          }
          if (library[i].imageDataUrl) {
            console.log(`Pruning image content for older reference to save space: ${library[i].name}`);
            library[i].imageDataUrl = undefined;
            
            try {
              localStorage.setItem(STORAGE_KEYS.INSPIRATION_LIBRARY, JSON.stringify(library));
              saved = true;
              console.log('Successfully saved inspiration library after pruning old image.');
              break;
            } catch (innerError) {
              // Continue pruning if it still fails
            }
          }
        }
        
        if (!saved) {
          // If still fails, try deleting the 3 oldest items entirely
          console.warn('Pruning individual images did not suffice. Deleting oldest references entirely...');
          const prunedLibrary = library.slice(0, Math.max(3, library.length - 3));
          try {
            localStorage.setItem(STORAGE_KEYS.INSPIRATION_LIBRARY, JSON.stringify(prunedLibrary));
            console.log('Saved inspiration library after pruning oldest references.');
          } catch (extremeError) {
            console.error('Failed to save inspiration library even after extensive pruning:', extremeError);
            throw extremeError;
          }
        }
      } else {
        throw setItemError;
      }
    }
  } catch (e) {
    console.error('Failed to save inspiration item:', e);
    throw e;
  }
}

export function deleteInspirationItem(id: string): void {
  try {
    const library = getInspirationLibrary().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INSPIRATION_LIBRARY, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to delete inspiration item:', e);
  }
}

export function toggleInspirationVisualProfile(id: string): boolean {
  try {
    const library = getInspirationLibrary();
    const item = library.find(i => i.id === id);
    if (!item) return false;
    item.inVisualProfile = !item.inVisualProfile;
    item.updatedAt = new Date().toISOString();
    saveInspirationItem(item);
    return item.inVisualProfile;
  } catch (e) {
    console.error('Failed to toggle visual profile:', e);
    return false;
  }
}

export function getAggregateVisualProfile(): {
  preferredCompositions: string[];
  preferredTypography: string[];
  preferredIllustrationStyles: string[];
  preferredColors: string[];
  preferredTextures: string[];
  preferredEras: string[];
  preferredMechanisms: string[];
  preferredDesignPrinciples: string[];
  productPreferences: string[];
  contributingInspirations: InspirationReference[];
} {
  const library = getInspirationLibrary().filter(i => i.inVisualProfile && i.analysis);

  const compositionsSet = new Set<string>();
  const typoSet = new Set<string>();
  const illSet = new Set<string>();
  const colorSet = new Set<string>();
  const textureSet = new Set<string>();
  const eraSet = new Set<string>();
  const mechanismSet = new Set<string>();
  const principlesSet = new Set<string>();
  const productSet = new Set<string>();

  library.forEach(item => {
    const a = item.analysis;
    if (!a) return;
    if (a.composition) compositionsSet.add(a.composition);
    if (a.typography) typoSet.add(a.typography);
    if (a.illustration) illSet.add(a.illustration);
    if (a.color) colorSet.add(a.color);
    if (a.texture) textureSet.add(a.texture);
    if (a.eraCulturalCharacter) eraSet.add(a.eraCulturalCharacter);
    if (a.productCharacteristics) productSet.add(a.productCharacteristics);

    (a.creativeMechanisms || []).forEach(m => mechanismSet.add(m));
    (a.designPrinciples || []).forEach(p => principlesSet.add(p));
  });

  return {
    preferredCompositions: Array.from(compositionsSet),
    preferredTypography: Array.from(typoSet),
    preferredIllustrationStyles: Array.from(illSet),
    preferredColors: Array.from(colorSet),
    preferredTextures: Array.from(textureSet),
    preferredEras: Array.from(eraSet),
    preferredMechanisms: Array.from(mechanismSet),
    preferredDesignPrinciples: Array.from(principlesSet),
    productPreferences: Array.from(productSet),
    contributingInspirations: library
  };
}

export function getVisualProfiles(): VisualProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISUAL_PROFILES);
    if (!raw) {
      const initial = [SAMPLE_VISUAL_PROFILE];
      localStorage.setItem(STORAGE_KEYS.VISUAL_PROFILES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load visual profiles:', e);
    return [SAMPLE_VISUAL_PROFILE];
  }
}

export function saveVisualProfile(profile: VisualProfile): void {
  try {
    const profiles = getVisualProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.unshift(profile);
    }
    localStorage.setItem(STORAGE_KEYS.VISUAL_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save visual profile:', e);
  }
}

export function deleteVisualProfile(id: string): void {
  try {
    const profiles = getVisualProfiles().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.VISUAL_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to delete visual profile:', e);
  }
}

// EXPORT & IMPORT BACKUP

export function exportAllData(): string {
  const data = {
    version: '2.0',
    app: 'Image Studio',
    exportDate: new Date().toISOString(),
    imageProjects: getImageProjects(),
    savedConcepts: getSavedConcepts(),
    inspirationLibrary: getInspirationLibrary(),
    visualProfiles: getVisualProfiles(),
    synthesisConcepts: getSynthesisConcepts(),
    directionProfiles: getDirectionProfiles()
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (Array.isArray(data.imageProjects)) {
      localStorage.setItem(STORAGE_KEYS.IMAGE_PROJECTS, JSON.stringify(data.imageProjects));
    }
    if (Array.isArray(data.savedConcepts)) {
      localStorage.setItem(STORAGE_KEYS.SAVED_CONCEPTS, JSON.stringify(data.savedConcepts));
    }
    if (Array.isArray(data.inspirationLibrary)) {
      localStorage.setItem(STORAGE_KEYS.INSPIRATION_LIBRARY, JSON.stringify(data.inspirationLibrary));
    }
    if (Array.isArray(data.visualProfiles)) {
      localStorage.setItem(STORAGE_KEYS.VISUAL_PROFILES, JSON.stringify(data.visualProfiles));
    }
    if (Array.isArray(data.synthesisConcepts)) {
      localStorage.setItem(STORAGE_KEYS.SYNTHESIS_CONCEPTS, JSON.stringify(data.synthesisConcepts));
    }
    if (Array.isArray(data.directionProfiles)) {
      localStorage.setItem(STORAGE_KEYS.DIRECTION_PROFILES, JSON.stringify(data.directionProfiles.map(ensureProfileParameters)));
    }
    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
}

// SYNTHESIS CONCEPTS STORAGE

export function getSynthesisConcepts(): SynthesisConcept[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNTHESIS_CONCEPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load synthesis concepts:', e);
    return [];
  }
}

export function saveSynthesisConcept(concept: SynthesisConcept): void {
  try {
    const concepts = getSynthesisConcepts();
    const index = concepts.findIndex(c => c.id === concept.id);
    if (index >= 0) {
      concepts[index] = concept;
    } else {
      concepts.unshift(concept);
    }
    localStorage.setItem(STORAGE_KEYS.SYNTHESIS_CONCEPTS, JSON.stringify(concepts));
  } catch (e) {
    console.error('Failed to save synthesis concept:', e);
  }
}

export function deleteSynthesisConcept(id: string): void {
  try {
    const concepts = getSynthesisConcepts().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.SYNTHESIS_CONCEPTS, JSON.stringify(concepts));
  } catch (e) {
    console.error('Failed to delete synthesis concept:', e);
  }
}

export function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined;
      }
      seen.add(value);
      if (value instanceof Element || value instanceof HTMLElement || (value as any)._reactName || (value as any).__reactFiber$) {
        return undefined;
      }
    }
    return value;
  });
}

const DEFAULT_DIRECTION_PROFILES: DirectionProfile[] = [
  {
    id: 'prof-victorian-specimen',
    name: 'Victorian Museum Specimen',
    version: 1,
    visualDirection: {
      composition: 'Centered, Framed',
      typography: 'Slab Serif, Monospaced, Role: Balanced, Editorial character, Formal character',
      illustration: 'Fine copperplate woodcut etching with cross-hatching',
      color: 'Monochrome deep iron black on warm off-white parchment canvas',
      texture: 'Authentic aged paper grain and slight ink impression',
      era: 'Victorian archival museum specimen (c. 1885)',
      mood: 'Scholarly, witty, honorable, nostalgic',
      visualHierarchy: 'Central specimen illustration leading to top accession tag and bottom Latin motto',
      parameters: {
        compositions: ['Centered', 'Balanced'],
        framings: ['Centered', 'Framed'],
        customComposition: 'Centered specimen plaque frame with formal border lines',
        typographyFontCharacters: ['Slab Serif', 'Monospaced'],
        typographyRoles: ['Balanced'],
        typographyCharacters: ['Editorial', 'Formal'],
        customTypography: '19th-century slab serif with monospaced catalog numbering',
        illustrationStyles: ['Etching', 'Engraving', 'Scientific Diagram'],
        customIllustration: 'Fine copperplate woodcut etching with cross-hatching',
        colorPalettes: ['Monochrome', 'Black + Cream'],
        customColorHex: '#1c1917',
        customColorNote: 'Monochrome deep iron black on warm off-white parchment canvas',
        textures: ['Aged Paper', 'Ink Texture', 'Paper Grain'],
        customTexture: 'Authentic aged paper grain and slight ink impression',
        eras: ['Victorian', 'Archival', 'Museum'],
        customEra: 'Victorian archival museum specimen (c. 1885)',
        moods: ['Scholarly', 'Nostalgic', 'Refined', 'Witty'],
        customMood: 'Scholarly, witty, honorable, nostalgic',
        hierarchyPrimary: 'Central Object',
        hierarchySecondary: ['Supporting Typography', 'Decorative Elements'],
        hierarchyCustomNote: 'Central specimen illustration leading to top accession tag and bottom Latin motto'
      }
    },
    creativeDirection: 'Ensure formal museum catalog layout with crisp two-color etching linework.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'prof-academic-crest',
    name: 'Classic Academic Crest',
    version: 1,
    visualDirection: {
      composition: 'Balanced, Badge Frame',
      typography: 'Serif, Condensed, Role: Typography-led, Academic character, Formal character',
      illustration: 'Woodcut print style with sharp black-and-white contrast',
      color: 'Cool Academic (Navy, Slate, White)',
      texture: 'Clean vector screen print',
      era: 'Archival collegiate classic',
      mood: 'Authoritative, collegiate, honorable',
      visualHierarchy: 'Primary focal crest emblem centered with curved banner',
      parameters: {
        compositions: ['Balanced'],
        framings: ['Badge', 'Centered'],
        customComposition: 'Symmetrical circular badge with ribbon banner',
        typographyFontCharacters: ['Serif', 'Condensed'],
        typographyRoles: ['Typography-led'],
        typographyCharacters: ['Academic', 'Formal'],
        customTypography: 'Bold condensed block serif inside circular arc',
        illustrationStyles: ['Woodcut', 'Line Art'],
        customIllustration: 'Woodcut print style with sharp black-and-white contrast',
        colorPalettes: ['Cool Academic', 'High Contrast'],
        customColorHex: '#1e3a8a',
        customColorNote: 'Navy, Slate, White with high contrast emblem accents',
        textures: ['Clean', 'Screen Print'],
        customTexture: 'Clean vector screen print with sharp badge edges',
        eras: ['Academic', 'Archival'],
        customEra: 'Archival collegiate classic',
        moods: ['Scholarly', 'Sophisticated', 'Serious'],
        customMood: 'Authoritative, collegiate, honorable',
        hierarchyPrimary: 'Symbol',
        hierarchySecondary: ['Supporting Typography', 'Decorative Elements'],
        hierarchyCustomNote: 'Primary focal crest emblem centered with curved banner'
      }
    },
    creativeDirection: 'Maintain clean vector lines suitable for apparel embroidery and badges.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'prof-vintage-patent',
    name: 'Vintage Scientific Patent',
    version: 1,
    visualDirection: {
      composition: 'Dense, Grid Frame, Framed Frame',
      typography: 'Monospaced, Sans Serif, Role: Balanced, Industrial character, Academic character',
      illustration: 'Scientific Diagram, Line Art',
      color: 'Monochrome, Low Contrast',
      texture: 'Paper Grain, Letterpress',
      era: 'Industrial, Scientific',
      mood: 'Scholarly, Experimental, Serious',
      visualHierarchy: 'Primary: Central Object, Secondary: Supporting Typography, Background',
      parameters: {
        compositions: ['Dense', 'Balanced'],
        framings: ['Grid', 'Framed'],
        customComposition: 'Exploded blueprint schematic layout with figure callouts',
        typographyFontCharacters: ['Monospaced', 'Sans Serif'],
        typographyRoles: ['Balanced'],
        typographyCharacters: ['Industrial', 'Academic'],
        customTypography: 'Technical patent labeling and dimension annotations',
        illustrationStyles: ['Scientific Diagram', 'Line Art'],
        customIllustration: 'Drafting schematics with dimension lines and cutaways',
        colorPalettes: ['Monochrome', 'Low Contrast'],
        customColorHex: '#334155',
        customColorNote: 'Technical drafting ink on off-white parchment',
        textures: ['Paper Grain', 'Letterpress'],
        customTexture: 'Architectural drafting paper texture',
        eras: ['Industrial', 'Scientific'],
        customEra: 'Late 19th-century patent bureau schematics',
        moods: ['Scholarly', 'Experimental', 'Serious'],
        customMood: 'Analytical inventor precision',
        hierarchyPrimary: 'Central Object',
        hierarchySecondary: ['Supporting Typography', 'Background'],
        hierarchyCustomNote: 'Technical figure in center with perimeter patent spec annotations'
      }
    },
    creativeDirection: 'Precise technical drafting aesthetic with numbered callouts and figure labels.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'prof-botanical-press',
    name: 'Botanical Field Press',
    version: 1,
    visualDirection: {
      composition: 'Minimal, Asymmetric Frame, Full Bleed Frame',
      typography: 'Serif, Handwritten, Role: Image-led, Vintage character, Editorial character',
      illustration: 'Botanical Illustration, Etching',
      color: 'Earth Tones, Muted Vintage',
      texture: 'Aged Paper, Rough, Paper Grain',
      era: 'Victorian, Museum',
      mood: 'Refined, Nostalgic, Scholarly',
      visualHierarchy: 'Primary: Illustration, Secondary: Supporting Typography, Decorative Elements',
      parameters: {
        compositions: ['Minimal'],
        framings: ['Asymmetric', 'Full Bleed'],
        customComposition: 'Herbarium specimen mount with pressed flora placement',
        typographyFontCharacters: ['Serif', 'Handwritten'],
        typographyRoles: ['Image-led'],
        typographyCharacters: ['Vintage', 'Editorial'],
        customTypography: 'Hand-inked Linnaean taxonomic classification cursive',
        illustrationStyles: ['Botanical Illustration', 'Etching'],
        customIllustration: 'Hand-tinted biological etching with anatomical details',
        colorPalettes: ['Earth Tones', 'Muted Vintage'],
        customColorHex: '#3f6212',
        customColorNote: 'Forest sage, dried sepia, and warm cream',
        textures: ['Aged Paper', 'Rough', 'Paper Grain'],
        customTexture: 'Heavy cotton rag paper with deckled edges',
        eras: ['Victorian', 'Museum'],
        customEra: '19th-century botanical exploration expedition',
        moods: ['Refined', 'Nostalgic', 'Scholarly'],
        customMood: 'Quiet naturalist contemplation',
        hierarchyPrimary: 'Illustration',
        hierarchySecondary: ['Supporting Typography', 'Decorative Elements'],
        hierarchyCustomNote: 'Organic specimen dominant with field notes at margin'
      }
    },
    creativeDirection: 'Authentic herbarium press look with naturalist taxonomic notes and dried botanical tones.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

function synthesizeParametersFromDirection(vd: Partial<StructuredVisualDirection>): StructuredVisualParameters {
  return {
    compositions: vd.composition ? vd.composition.split(', ').filter(Boolean) : ['Balanced'],
    framings: ['Centered'],
    customComposition: '',
    typographyFontCharacters: vd.typography ? vd.typography.split(', ').filter(Boolean) : ['Serif'],
    typographyRoles: ['Typography-led'],
    typographyCharacters: ['Editorial'],
    customTypography: '',
    illustrationStyles: vd.illustration ? vd.illustration.split(', ').filter(Boolean) : ['Engraving'],
    customIllustration: '',
    colorPalettes: vd.color ? vd.color.split(', ').filter(Boolean) : ['Monochrome'],
    customColorHex: '',
    customColorNote: '',
    textures: vd.texture ? vd.texture.split(', ').filter(Boolean) : ['Paper Grain'],
    customTexture: '',
    eras: vd.era ? vd.era.split(', ').filter(Boolean) : ['Victorian'],
    customEra: '',
    moods: vd.mood ? vd.mood.split(', ').filter(Boolean) : ['Scholarly'],
    customMood: '',
    hierarchyPrimary: 'Typography',
    hierarchySecondary: ['Supporting Illustration'],
    hierarchyCustomNote: ''
  };
}

export function ensureProfileParameters(profile: DirectionProfile): DirectionProfile {
  const cloned: DirectionProfile = JSON.parse(JSON.stringify(profile));
  if (!cloned.visualDirection) {
    cloned.visualDirection = {
      composition: 'Balanced Composition',
      typography: 'Serif Typography',
      illustration: 'Engraving Illustration',
      color: 'Monochrome',
      texture: 'Paper Grain',
      era: 'Victorian',
      mood: 'Scholarly',
      visualHierarchy: 'Primary: Typography, Secondary: Supporting Illustration'
    };
  }

  const defaultMatch = DEFAULT_DIRECTION_PROFILES.find(d => d.id === cloned.id);

  if (!cloned.visualDirection.parameters) {
    if (defaultMatch && defaultMatch.visualDirection.parameters) {
      cloned.visualDirection.parameters = JSON.parse(JSON.stringify(defaultMatch.visualDirection.parameters));
    } else {
      cloned.visualDirection.parameters = synthesizeParametersFromDirection(cloned.visualDirection);
    }
  } else {
    // If it's a default profile, ensure it has all structured fields populated
    if (defaultMatch && defaultMatch.visualDirection.parameters) {
      cloned.visualDirection.parameters = {
        ...JSON.parse(JSON.stringify(defaultMatch.visualDirection.parameters)),
        ...cloned.visualDirection.parameters
      };
    }

    const p = cloned.visualDirection.parameters;
    if (p) {
      if (!Array.isArray(p.compositions) || p.compositions.length === 0) p.compositions = ['Balanced'];
      if (!Array.isArray(p.framings) || p.framings.length === 0) p.framings = ['Centered'];
      if (!Array.isArray(p.typographyFontCharacters) || p.typographyFontCharacters.length === 0) p.typographyFontCharacters = ['Serif'];
      if (!Array.isArray(p.typographyRoles) || p.typographyRoles.length === 0) p.typographyRoles = ['Typography-led'];
      if (!Array.isArray(p.typographyCharacters) || p.typographyCharacters.length === 0) p.typographyCharacters = ['Editorial'];
      if (!Array.isArray(p.illustrationStyles) || p.illustrationStyles.length === 0) p.illustrationStyles = ['Engraving'];
      if (!Array.isArray(p.colorPalettes) || p.colorPalettes.length === 0) p.colorPalettes = ['Monochrome'];
      if (!Array.isArray(p.textures) || p.textures.length === 0) p.textures = ['Paper Grain'];
      if (!Array.isArray(p.eras) || p.eras.length === 0) p.eras = ['Victorian'];
      if (!Array.isArray(p.moods) || p.moods.length === 0) p.moods = ['Scholarly'];
      if (!p.hierarchyPrimary) p.hierarchyPrimary = 'Typography';
      if (!Array.isArray(p.hierarchySecondary) || p.hierarchySecondary.length === 0) p.hierarchySecondary = ['Supporting Illustration'];
    }
  }

  return cloned;
}

export function getDirectionProfiles(): DirectionProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIRECTION_PROFILES);
    if (!raw) {
      const clonedDefaults = JSON.parse(JSON.stringify(DEFAULT_DIRECTION_PROFILES));
      localStorage.setItem(STORAGE_KEYS.DIRECTION_PROFILES, JSON.stringify(clonedDefaults));
      return clonedDefaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all profiles are deep-cloned and normalized with complete parameters
      return parsed.map(ensureProfileParameters);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DIRECTION_PROFILES));
  } catch (e) {
    console.error('Failed to load direction profiles:', e);
    return JSON.parse(JSON.stringify(DEFAULT_DIRECTION_PROFILES));
  }
}

export function saveDirectionProfile(profile: DirectionProfile): void {
  try {
    const profiles = getDirectionProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    const sanitized = ensureProfileParameters(profile);
    const updatedProfile = { 
      ...JSON.parse(JSON.stringify(sanitized)), 
      updatedAt: new Date().toISOString() 
    };
    if (index >= 0) {
      profiles[index] = updatedProfile;
    } else {
      profiles.unshift(updatedProfile);
    }
    localStorage.setItem(STORAGE_KEYS.DIRECTION_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save direction profile:', e);
  }
}

export function deleteDirectionProfile(id: string): void {
  try {
    const profiles = getDirectionProfiles().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.DIRECTION_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to delete direction profile:', e);
  }
}
export const exportData = exportAllData;
export const importData = importAllData;
